import { NextFunction, Request, Response, Router } from "express";
import { userToken } from "../../utils/types/token";
import { authenticate, createToken } from "../../utils/token";
import { validateUser } from "./utils/userUtils";
import db, { databaseEventEmitter } from "../../db/db";
import Joi from "joi";
import { rateLimit } from "express-rate-limit";
import { API } from "netlocklib/dist/api";
import { LogEvent } from "netlocklib/dist/Events";
import { Beacon } from "netlocklib/dist/Beacon";
let router = Router({
    caseSensitive: true,
});

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-7",
    handler: (req, res) => {
        res.status(429).json({ status: "rate limit reached" });
    },
});
// Register User
interface registerRequest {
    password: string;
}
let registerSchema = Joi.object({
    password: Joi.string().required(),
});
/**
 * @swagger
 * /api/user/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 description: The user's password.
 *     responses:
 *       200:
 *         description: The user was successfully registered.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   description: The status message.
 *       400:
 *         description: Invalid request.
 *       429:
 *         description: Rate limit reached.
 */
router.post(
    "/register",
    limiter,
    async (req: Request, res: Response<API.SuccessResponse | API.ErrorResponse | API.ValidationError>, next: NextFunction) => {
        // Extract and validate the request body against the schema
        let body = req.body as registerRequest;
        let { error } = registerSchema.validate(body);
        if (error) {
            return res.status(400).json({ status: "error", message: "invalid input", error: error.details });
        }

        // Create a new user in the database
        let result = await db.createUser({
            ip: req.ip || "unknown",
            password: body.password,
        });

        // Error if unable to register user
        if (!result) return res.status(400).json({ status: "error", error: "unable to register user" });

        // Respond with success message
        return res.status(200).json({ status: "success", message: "created user" });
    }
);
//Password Management
interface resetPassRequest {
    current: string;
    newPassword: string;
}
let resetSchema = Joi.object({
    current: Joi.string().required(),
    password: Joi.string().required(),
});
/**
 * @swagger
 * /api/user/resetpass:
 *   post:
 *     summary: Reset a user's password
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - current
 *               - newPassword
 *             properties:
 *               current:
 *                 type: string
 *                 description: The user's current password.
 *               newPassword:
 *                 type: string
 *                 description: The new password for the user.
 *     responses:
 *       200:
 *         description: The password was successfully updated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   description: The status message.
 *       400:
 *         description: Invalid request or unable to change password.
 *       401:
 *         description: Unauthorized.
 */
router.post(
    "/resetpass",
    limiter,
    async (req: Request, res: Response<API.SuccessResponse | API.ErrorResponse | API.ValidationError>, next: NextFunction) => {
        // Extract and validate the request body against the schema
        let body = req.body as resetPassRequest;
        let { error } = resetSchema.validate(body);
        if (error) {
            return res.status(400).json({ status: "error", message: "invalid input", error: error.details });
        }

        // Authenticate the user with the current password
        let result = await db.login(body.current);
        if (!result) return res.status(401).json({ status: "error", error: "Unauthorized" });

        // Update the password in the database
        result = await db.setPassword(body.newPassword);
        if (!result) return res.status(400).json({ status: "error", error: "Unable to change password" });

        // Respond with success message
        return res.status(200).json({ status: "success", message: "updated" });
    }
);
// Data
// create target and log stream for real-time statuses
/**
 *  @swagger
 *  /api/user/stream:
 *    get:
 *      security:
 *        - bearerAuth: []
 *      summary: Stream real-time statuses of targets and logs
 *      tags:
 *        - Targets
 *      responses:
 *        200:
 *          description: Stream of target statuses.
 *          content:
 *            text/event-stream:
 *              schema:
 *                type: string
 *                example: |
 *                  event: target
 *                  data: {"id":"123","hostname":"example","os":"linux","active":true,"interfaces":[{"ip":"192.168.1.1","mac":"00:11:22:33:44:55","state":"up","timestamp":1625247600}],"users":[{"name":"user1","lastLogin":1625247600,"lastUpdate":1625247600,"loggedIn":true}],"apps":[{"name":"app1","running":true,"version":"1.0.0"}],"lastPing":1625247600,"dateAdded":1625247600}
 *                  event: log
 *                  data: { "description": "user created", "event": "userCreated", "loggedIn": false, "user": "Roscoe_Johnson", "message": "New User Roscoe_Johnson created", "urgent": false, "targetId": "0f5827e153481a1bbfc32d921757a1c9f35c983cdfddcc32a1bdd410a0afb0e1", "id": "d69129f2-05f1-4748-997d-bcc159746ddd", "timestamp": 1722614582488 }
 *        401:
 *          description: Unauthorized.
 */

router.get("/stream", authenticate, validateUser, async (req: Request, res: Response) => {
    // Set headers for Server-Sent Events (SSE)
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    // Listen for 'target' events and send them to the client
    databaseEventEmitter.on("target", (target) => {
        res.write(`event:targets\ndata: ${JSON.stringify(target)}\n\n`);
    });

    // Listen for 'logs' events and send them to the client
    databaseEventEmitter.on("logs", (data) => {
        res.write(`event:logs\ndata: ${JSON.stringify(data)}\n\n`);
    });
});

/**
 * @swagger
 * /api/user/data/all:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get Current logs and target data
 *     tags: [Targets]
 *     responses:
 *       200:
 *         description: Stream of target statuses.
 *         content:
 *           application/json:
 *             schema:
 *              $ref: '#/components/schemas/beaconData'
 *       401:
 *         description: Unauthorized.
 */
router.get("/data/all", authenticate, validateUser, async (req: Request, res: Response<API.TargetsAndLogsResponse | API.ErrorResponse>) => {
    // Retrieve all targets from the database
    let targets = await db.getAllTargets();

    // Retrieve all logs from the database
    let logs = await db.getAllLogs();

    // Error if unable to retrieve targets or logs
    if (!targets || !logs) return res.status(400).json({ status: "error", error: "unable to get info" });

    // Respond with the retrieved targets and logs
    return res.status(200).json({ targets, logs });
});
/**
 * @swagger
 * /api/user/targets/{target}:
 *   get:
 *     summary: Get a specific target by ID
 *     tags: [Targets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: target
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the target.
 *     responses:
 *       200:
 *         description: The target was successfully retrieved.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/beaconData'
 *       400:
 *         description: Unable to find target.
 *       401:
 *         description: Unauthorized.
 */
router.get("/targets/:target", authenticate, validateUser, async (req: Request, res: Response<API.ErrorResponse | Beacon.Data>) => {
    // Error if target parameter is missing
    if (!req.params.target) return res.status(400).json({ status: "error", error: "Unable to find target" });

    // Retrieve the beacon data from the database
    let target = await db.getBeacon(req.params.target);

    // Error if data is not found
    if (!target) return res.status(400).json({ status: "error", error: "Unable to find target" });

    // Retrieve the data associated with the target
    let data = await target.getData();

    // Respond with the retrieved data
    return res.status(200).json(data);
});

/**
 * @swagger
 * /api/user/targets/{target}:
 *   delete:
 *     summary: Get a specific target by ID
 *     tags: [Targets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: target
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the target.
 *     responses:
 *       200:
 *         description: The target was successfully deleted.
 *
 *       400:
 *         description: Unable to find target.
 *       401:
 *         description: Unauthorized.
 */
router.delete("/targets/:target", authenticate, validateUser, async (req: Request, res: Response<API.SuccessResponse | API.ErrorResponse>) => {
    // Error if target parameter is missing
    if (!req.params.target) return res.status(400).json({ status: "error", error: "No target selected" });

    // Retrieve the target data from the database
    let targetData = await db.getBeacon(req.params.target);

    // Error if data is not found
    if (!targetData) return res.status(400).json({ status: "error", error: "Unable to find target" });

    // Delete the target from the database
    await targetData.delTarget();

    // Respond with success message
    return res.status(200).json({ status: "success", message: "target deleted" });
});

// gets logs for target
router.get("/logs/:target", authenticate, validateUser, async (req: Request, res: Response<API.ErrorResponse | LogEvent.Log[]>) => {
    // Error if target parameter is missing
    if (!req.params.target) return res.status(400).json({ status: "error", error: "No target selected" });

    // Retrieve the target data from the database
    let targetData = await db.getBeacon(req.params.target);

    // Error if data is not found
    if (!targetData) return res.status(400).json({ status: "error", error: "Unable to find target" });

    // Retrieve the logs associated with the target
    let logs = await targetData.getLogs();

    // Respond with the retrieved logs
    return res.status(200).json(logs);
});

//Login
interface loginRequest {
    password: string;
}
let loginSchema = Joi.object({
    password: Joi.string().required(),
});
// gives user back a jwt with ip to make sure user cannot access system from a different ip address
/**
 * @swagger
 * /api/user/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 description: The user's password.
 *     responses:
 *       200:
 *         description: The user was successfully logged in.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: The JWT token for the user.
 *       400:
 *         description: Invalid request.
 *       401:
 *         description: Unauthorized.
 */
router.post("/login", async (req: Request, res: Response<API.ValidationError | API.TokenResponse | API.ErrorResponse>) => {
    // Extract and validate the request body against the schema
    let body = req.body as loginRequest;
    let { error } = loginSchema.validate(body);
    if (error) {
        return res.status(400).json({ status: "error", message: "Invalid request", error: error.details });
    }

    // Authenticate the user with the provided password
    let validLogin = await db.login(body.password);
    if (!validLogin) return res.status(401).json({ status: "error", error: "unauthorized" });

    // Create a user token with the login details
    let userTok: userToken = {
        dateAdded: new Date().toISOString(),
        id: "user",
        ip: req.ip || "unknown",
        isBeacon: false,
        agent: req.headers["user-agent"] || "unknown",
    };

    // Generate a signed JWT token and send it in the response
    let signedJwt = await createToken(userTok);
    res.status(200).json({ token: signedJwt });
});

export { router as UserRouter };

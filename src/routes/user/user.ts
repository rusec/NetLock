import express, { NextFunction, Request, Response, Router } from "express";
import { AuthenticatedRequest, beaconToken, userToken } from "../../utils/types/token";
import crypto from "crypto";
import { log } from "../../utils/output/debug";
import { authenticate, createToken } from "../../utils/token";
import { validateUser } from "./utils/userUtils";
import db, { databaseEventEmitter } from "../../db/db";
import Joi from "joi";
import { rateLimit } from "express-rate-limit";
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
router.post("/register", limiter, async (req: Request, res: Response, next: NextFunction) => {
    let body = req.body as registerRequest;

    let { error } = registerSchema.validate(body);
    if (error) {
        return res.status(400).json({ status: "Invalid request", error: error.details });
    }

    let result = await db.createUser({
        ip: req.ip || "unknown",
        password: body.password,
    });
    if (!result) return res.status(400).json({ status: "unable to register user" });
    return res.status(200).json({ status: "succuss" });
});
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
router.post("/resetpass", limiter, async (req: Request, res: Response, next: NextFunction) => {
    let body = req.body as resetPassRequest;

    let { error } = resetSchema.validate(body);
    if (error) {
        return res.status(400).json({ status: "Invalid request", error: error.details });
    }

    let result = await db.login(body.current);
    if (!result) return res.status(401).json({ status: "Unauthorized" });

    result = await db.setPassword(body.newPassword);
    if (!result) return res.status(400).json({ status: "Unable to change password" });
    return res.status(200).json({ status: "updated" });
});
// Data
// create target stream for real-time statuses
/**
 * @swagger
 * /api/user/targets/stream:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Stream real-time statuses of targets
 *     tags: [Targets]
 *     responses:
 *       200:
 *         description: Stream of target statuses.
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 *               example: |
 *                 data: {"id":"123","hostname":"example","os":"linux","active":true,"interfaces":[{"ip":"192.168.1.1","mac":"00:11:22:33:44:55","state":"up","timestamp":1625247600}],"users":[{"name":"user1","lastLogin":1625247600,"lastUpdate":1625247600,"loggedIn":true}],"apps":[{"name":"app1","running":true,"version":"1.0.0"}],"lastPing":1625247600,"dateAdded":1625247600}
 *       401:
 *         description: Unauthorized.
 */
router.get("/targets/stream", authenticate, validateUser, async (req: Request, res: Response) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();
    let data = await db.getAllTargets();

    for (let i = 0; i < data.length; i++) {
        const target = data[i];
        res.write(`data: ${JSON.stringify(target)}\n\n`);
    }

    databaseEventEmitter.on("target", (target) => {
        res.write(`data: ${JSON.stringify(target)}\n\n`);
    });
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
 *               $ref: '#/components/schemas/Target'
 *       400:
 *         description: Unable to find target.
 *       401:
 *         description: Unauthorized.
 */
router.get("/targets/:target", authenticate, validateUser, async (req: Request, res: Response) => {
    if (!req.params.target) return res.status(400).json({ status: "unable to find target" });
    let targetData = await db.getTarget(req.params.target);
    if (!targetData) return res.status(400).json({ status: "unable to find target" });
    return res.status(200).json(targetData.data);
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
router.delete("/targets/:target", authenticate, validateUser, async (req: Request, res: Response) => {
    if (!req.params.target) return res.status(400).json({ status: "unable to find target" });
    let targetData = await db.getTarget(req.params.target);
    if (!targetData) return res.status(400).json({ status: "unable to find target" });
    await targetData.delTarget();
    return res.status(200).json({ status: "target deleted" });
});

// gets all logs for targets and streams any new logs
router.get("/logs/stream", authenticate, validateUser, async (req: Request, res: Response) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();
    let data = await db.getAllLogs();

    for (let i = 0; i < data.length; i++) {
        const log = data[i];
        res.write(`data: ${JSON.stringify(log)}\n\n`);
    }

    databaseEventEmitter.on("logs", (data) => {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    });
});
// gets logs for target
router.get("/logs/:target", authenticate, validateUser, async (req: Request, res: Response) => {
    if (!req.params.target) return res.status(400).json({ status: "unable to find target" });
    let targetData = await db.getTarget(req.params.target);
    if (!targetData) return res.status(400).json({ status: "unable to find target" });
    let logs = await targetData.getLogs();
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
router.post("/login", async (req: Request, res: Response) => {
    let body = req.body as loginRequest;

    let { error } = loginSchema.validate(body);
    if (error) {
        return res.status(400).json({ status: "Invalid request", error: error.details });
    }

    let validLogin = await db.login(body.password);
    if (!validLogin) return res.status(401).json({ status: "unauthorized" });

    let userTok: userToken = {
        dateAdded: new Date().toISOString(),
        id: "user",
        ip: req.ip || "unknown",
        isBeacon: false,
    };

    let signedJwt = await createToken(userTok);
    res.status(200).json({ token: signedJwt });
});

export { router as UserRouter };

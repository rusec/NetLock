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
router.get("/targets/:target", authenticate, validateUser, async (req: Request, res: Response) => {
    if (!req.params.target) return res.status(400).json({ status: "unable to find target" });
    let targetData = await db.getTarget(req.params.target);
    if (!targetData) return res.status(400).json({ status: "unable to find target" });
    return res.status(200).json(targetData.data);
});
// gets all logs for targets and streams any new logs
router.get("/logs/stream", authenticate, validateUser, (req: Request, res: Response) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

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

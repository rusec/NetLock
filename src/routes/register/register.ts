import express, { NextFunction, Request, Response, Router } from "express";
import { isBeacon } from "../../utils/auth";
import { initTarget, target, targetApp, targetInterface, targetRequest, targetUser } from "../../utils/types/target";
import { beaconToken } from "../../utils/types/token";
import db from "../../db/db";
import { createToken } from "../../utils/token";
import Joi from "joi";
let router = Router({
    caseSensitive: true,
});
interface registerRequest {
    hostname: string;
    os: string;
    interfaces: targetInterface[];
    users: targetUser[];
    apps: targetApp[];
}
const targetUserSchema = Joi.object({
    name: Joi.string().required(),
});

const targetAppSchema = Joi.object({
    name: Joi.string().required(),
    version: Joi.string().required(),
});

const targetInterfaceSchema = Joi.object({
    ip: Joi.string().ip().required(),
    mac: Joi.string().required(),
    state: Joi.string().valid("down", "up").required(),
});

const targetSchema = Joi.object({
    hostname: Joi.string().required(),
    os: Joi.string().required(),
    active: Joi.boolean().required(),
    interfaces: Joi.array().items(targetInterfaceSchema).required(),
    users: Joi.array().items(targetUserSchema).required(),
    apps: Joi.array().items(targetAppSchema).required(),
});
/**
 * @swagger
 * /register:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Register a beacon
 *     tags: [Targets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - hostname
 *               - os
 *               - interfaces
 *               - users
 *               - apps
 *             properties:
 *               hostname:
 *                 type: string
 *                 description: The hostname of the beacon.
 *               os:
 *                 type: string
 *                 description: The operating system of the beacon.
 *               interfaces:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     ip:
 *                       type: string
 *                       description: The IP address of the interface.
 *                     mac:
 *                       type: string
 *                       description: The MAC address of the interface.
 *                     state:
 *                       type: string
 *                       description: The state of the interface.
 *                       enum: [down, up]
 *               users:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: The name of the user.
 *               apps:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: The name of the app.
 *                     version:
 *                       type: string
 *                       description: The version of the app.
 *     responses:
 *       200:
 *         description: The beacon was successfully registered.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: The JWT token for the beacon.
 *       400:
 *         description: Invalid request or unable to register beacon.
 *       401:
 *         description: Unauthorized. The request does not include the correct authorization header.
 */

router.post("/register", isBeacon, async (req: Request, res: Response, next: NextFunction) => {
    let body = req.body as registerRequest;

    const { error } = targetSchema.validate(body);
    if (error) {
        return res.status(400).json({ status: "Invalid request", error: error.details });
    }

    let target: initTarget = {
        active: true,
        interfaces: body.interfaces,
        hostname: body.hostname,
        apps: body.apps,
        lastPing: new Date().getTime(),
        os: body.os,
        users: body.users,
        id: undefined,
        dateAdded: new Date().getTime(),
    };
    let checkID = await db.makeTargetId(target);
    let checkForAlreadyRequested = await db.getTarget(checkID);
    if (checkForAlreadyRequested) return res.status(400).json({ status: "Beacon already registered" });
    let id = await db.createTarget(target);
    let checkForTarget = await db.getTarget(id);
    if (!id || !checkForTarget) return res.status(400).json({ status: "Unable to register beacon" });
    let beaconTok: beaconToken = {
        id: id,
        dateAdded: new Date().toISOString(),
        ip: req.ip || "unknown",
        isBeacon: true,
    };

    let token = await createToken(beaconTok);
    res.status(200).json({ token: token });
    //request checks
});

export { router as BeaconRegisterRouter };

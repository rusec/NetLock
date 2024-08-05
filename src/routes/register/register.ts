import { NextFunction, Request, Response, Router } from "express";
import { isBeacon } from "../../utils/auth";
import { initTarget, targetRequest, targetRequestSchema } from "netlocklib/dist/Target";
import { beaconToken } from "../../utils/types/token";
import db from "../../db/db";
import { createToken } from "../../utils/token";
import { API } from "netlocklib/dist/api";
import { Beacon, schemas } from "netlocklib/dist/Beacon";
let router = Router({
    caseSensitive: true,
});
/**
 * @swagger
 * /api/beacon/register:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Register a beacon
 *     tags: [Beacons]
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

router.post(
    "/register",
    isBeacon,
    async (req: Request, res: Response<API.ErrorResponse | API.ValidationError | API.TokenResponse>, next: NextFunction) => {
        let body = req.body as Beacon.Init;
        const { error } = schemas.initSchema.validate(body);
        if (error) {
            return res.status(400).json({ status: "error", message: "Invalid request", error: error.details });
        }

        let target: Beacon.Init = {
            hostname: body.hostname,
            os: body.os,
            hardware: body.hardware,
        };
        let checkID = await db.makeTargetId(target);
        let checkForAlreadyRequested = await db.getBeacon(checkID);
        if (checkForAlreadyRequested) return res.status(400).json({ status: "error", error: "Beacon already registered" });
        let id = await db.createTarget(target);
        let checkForTarget = await db.getBeacon(id);
        if (!id || !checkForTarget) return res.status(400).json({ status: "error", error: "Unable to register beacon" });
        let beaconTok: beaconToken = {
            id: id,
            dateAdded: new Date().toISOString(),
            ip: req.ip || "unknown",
            isBeacon: true,
        };

        let token = await createToken(beaconTok);
        res.status(200).json({ token: token });
        //request checks
    }
);

export { router as BeaconRegisterRouter };

import express, { NextFunction, Request, Response, Router } from "express";
import { AuthenticatedRequest, beaconToken } from "../../utils/types/token";
import crypto from "crypto";
import { log } from "../../utils/output/debug";
import { authenticate } from "../../utils/token";
import { isBeacon } from "../../utils/auth";
import { eventSchema, targetEvent } from "../types/Events";
let router = Router({
    caseSensitive: true,
});
/**
 * @swagger
 * components:
 *   schemas:
 *     TargetInterface:
 *       type: object
 *       properties:
 *         ip:
 *           type: string
 *           description: The IP address of the target interface.
 *         mac:
 *           type: string
 *           description: The MAC address of the target interface.
 *         state:
 *           type: string
 *           description: The state of the target interface.
 *           enum: [down, up]
 *         timestamp:
 *           type: integer
 *           description: The timestamp of the target interface.
 *     TargetUser:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the user.
 *         lastLogin:
 *           type: integer
 *           description: The last login time of the user.
 *         lastUpdate:
 *           type: integer
 *           description: The last update time of the user.
 *         loggedIn:
 *           type: boolean
 *           description: Whether the user is logged in.
 *     TargetApp:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the app.
 *         running:
 *           type: boolean
 *           description: Whether the app is running.
 *         version:
 *           type: string
 *           description: The version of the app.
 *     Target:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The ID of the target.
 *         hostname:
 *           type: string
 *           description: The hostname of the target.
 *         os:
 *           type: string
 *           description: The operating system of the target.
 *         active:
 *           type: boolean
 *           description: Whether the target is active.
 *         interfaces:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TargetInterface'
 *           description: The interfaces of the target.
 *         users:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TargetUser'
 *           description: The users of the target.
 *         apps:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TargetApp'
 *           description: The apps of the target.
 *         lastPing:
 *           type: integer
 *           description: The last ping time of the target.
 *         dateAdded:
 *           type: integer
 *           description: The date the target was added.
 */

//endpoint to parse out beacon events and creates a targetLogEvent and updates target info in database
router.post("/event", authenticate, isBeacon, (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    let body = req.body as targetEvent;
    let { error } = eventSchema.validate(body);
    if (error) {
        return res.status(400).json({ status: "Invalid request", error: error.details });
    }
});

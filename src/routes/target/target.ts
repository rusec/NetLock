import express, { NextFunction, Request, Response, Router } from "express";
import { AuthenticatedRequest, beaconToken } from "../../utils/types/token";
import crypto from "crypto";
import { log } from "../../utils/output/debug";
import { authenticate } from "../../utils/token";
import { isBeacon } from "../../utils/auth";
import {
    eventSchema,
    LogEvent,
    targetConfigEditEvent,
    targetEvent,
    targetFileEvent,
    targetNetworkEvent,
    targetProcessEvent,
    targetRegEditEvent,
    targetSystemEvent,
    targetUserEvent,
} from "../types/Events";
import db from "../../db/db";
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
router.post("/event", authenticate, isBeacon, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    let body = req.body as targetEvent;
    let { error } = eventSchema.validate(body);
    if (error) {
        return res.status(400).json({ status: "Invalid request", error: error.details });
    }
    if (!req.client) return res.status(400).json({ status: "Invalid request" });

    let target = await db.getTarget(req.client.id);

    if (!target) return res.status(400).json({ status: "Target Not Found" });
    let result: boolean | undefined = false;
    switch (body.event) {
        case "fileAccessed": {
            let data = body as targetFileEvent;

            let message = `File ${data.file} Accessed By ${data.user}`;
            let log: LogEvent = { ...data, message: message, urgent: false };
            await target.addLog(log);
            result = true;
            break;
        }

        case "fileCreated": {
            let data = body as targetFileEvent;

            let message = `File ${data.file} Created By ${data.user}`;
            let log: LogEvent = { ...data, message: message, urgent: false };
            await target.addLog(log);
            result = true;

            break;
        }
        case "fileDeleted": {
            let data = body as targetFileEvent;

            let message = `File ${data.file} Deleted By ${data.user}`;
            let log: LogEvent = { ...data, message: message, urgent: false };
            await target.addLog(log);
            result = true;

            break;
        }
        case "filePermission": {
            let data = body as targetFileEvent;
            let message = `File ${data.file} Permissions By ${data.user} | ${data.permissions}`;
            let log: LogEvent = { ...data, message: message, urgent: false };
            await target.addLog(log);
            result = true;

            break;
        }
        case "config": {
            let data = body as targetConfigEditEvent;
            let message = `Config ${data.file} changed By ${data.user}`;
            let log: LogEvent = { ...data, message: message, urgent: false };
            await target.addLog(log);
            break;
        }
        case "interfaceDown": {
            let data = body as targetNetworkEvent;
            let message = `Interface ${data.mac} Down`;
            let log: LogEvent = { ...data, message: message, urgent: false };
            result = await target.updateInterfaceStat(data.mac, "down");

            await target.addLog(log);

            break;
        }
        case "interfaceUp": {
            let data = body as targetNetworkEvent;
            let message = `Interface ${data.mac} Up`;
            let log: LogEvent = { ...data, message: message, urgent: false };
            result = await target.updateInterfaceStat(data.mac, "up");

            await target.addLog(log);
            break;
        }
        case "interfaceIpChange": {
            let data = body as targetNetworkEvent;
            let message = `Interface ${data.mac} Ip change ${data.ip}`;
            let log: LogEvent = { ...data, message: message, urgent: false };
            result = await target.updateInterfaceIP(data.mac, data.ip);
            await target.addLog(log);
            break;
        }
        case "interfaceCreated": {
            let data = body as targetNetworkEvent;
            let message = `Interface ${data.mac} ${data.ip} Created`;
            let log: LogEvent = { ...data, message: message, urgent: false };
            result = await target.addInterface(data.mac, data.ip, data.state);
            await target.addLog(log);
            break;
        }
        case "kernel": {
            let data = body as targetSystemEvent;
            let message = `Kernel ${data.systemfile} ${data.description}`;
            let log: LogEvent = { ...data, message: message, urgent: false };
            await target.addLog(log);
            result = true;
            break;
        }
        case "processCreated": {
            let data = body as targetProcessEvent;
            let message = `Process ${data.name} ${data.pid} Created`;
            let log: LogEvent = { ...data, message: message, urgent: false };
            result = await target.updateApp(data.name, true);
            await target.addLog(log);
            break;
        }
        case "processEnded": {
            let data = body as targetProcessEvent;
            let message = `Process ${data.name} ${data.pid} Ended`;
            let log: LogEvent = { ...data, message: message, urgent: false };
            result = await target.updateApp(data.name, false);
            await target.addLog(log);
            break;
        }
        case "regEdit": {
            let data = body as targetRegEditEvent;
            let message = `Reg Edit ${data.key} ${data.value}`;
            let log: LogEvent = { ...data, message: message, urgent: false };
            await target.addLog(log);
            result = true;
            break;
        }
        case "userCreated": {
            let data = body as targetUserEvent;
            let message = `New User ${data.user} created`;
            let log: LogEvent = { ...data, message: message, urgent: false };
            result = await target.addUser(data.user, { loggedIn: data.loggedIn });
            await target.addLog(log);
            break;
        }
        case "userDeleted": {
            let data = body as targetUserEvent;
            let message = `User ${data.user} deleted`;
            let log: LogEvent = { ...data, message: message, urgent: false };
            // Need target delete user
            await target.addLog(log);
            break;
        }
        case "userGroupChange": {
            let data = body as targetUserEvent;
            let message = `User ${data.user} group changed`;
            let log: LogEvent = { ...data, message: message, urgent: false };
            await target.addLog(log);
            result = true;
            break;
        }
        case "userLoggedIn": {
            let data = body as targetUserEvent;
            let message = `User ${data.user} Logged in`;
            let log: LogEvent = { ...data, message: message, urgent: false };
            result = await target.updateUser(data.user, { loggedIn: true, lastLogin: new Date().getTime() });
            await target.addLog(log);
            break;
        }
        case "userLoggedOut": {
            let data = body as targetUserEvent;
            let message = `User ${data.user} Logged in`;
            let log: LogEvent = { ...data, message: message, urgent: false };
            // Need target delete user
            result = await target.updateUser(data.user, { loggedIn: false });
            await target.addLog(log);
            break;
        }
        default:
            break;
    }
    if (!result) return res.status(400).json({ status: "failed" });
    return res.status(200).json({ status: "success" });
});

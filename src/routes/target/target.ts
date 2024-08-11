import express, { NextFunction, Response, Router, Request } from "express";
import { AuthenticatedRequest, beaconToken } from "../../utils/types/token";
import { authenticate, createToken } from "../../utils/token";
import { isBeacon } from "../../utils/auth";
import db from "../../db/db";
import {
    Event,
    FileEvent,
    KernelEvent,
    LogEvent,
    NetworkInterfaceEvent,
    PortEvent,
    ProcessEvent,
    RegEditEvent,
    UserEvent,
    eventSchema,
} from "netlocklib/dist/Events";
import { API } from "netlocklib/dist/api";
import { Beacon, schemas } from "netlocklib/dist/Beacon";
import { applicationSchema, initRequestSchema, networkInterfaceSchema, ServiceSchema } from "netlocklib/dist/Beacon/schemas";
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
        // Extract and validate the request body against the schema
        let body = req.body as Beacon.Init;
        const { error } = schemas.initSchema.validate(body);
        if (error) {
            return res.status(400).json({ status: "error", message: "Invalid request", error: error.details });
        }

        // Create a target object from the request body
        let target: Beacon.Init = {
            hostname: body.hostname,
            os: body.os,
            hardware: body.hardware,
        };

        // Generate a unique ID for the target and check if it already exists
        let checkID = await db.makeTargetId(target);
        let checkForAlreadyRequested = await db.getBeacon(checkID);
        if (checkForAlreadyRequested) {
            return res.status(400).json({ status: "error", error: "Beacon already registered" });
        }

        // Create a new target in the database
        let id = await db.createTarget(target);
        let checkForTarget = await db.getBeacon(id);
        if (!id || !checkForTarget) {
            return res.status(400).json({ status: "error", error: "Unable to register beacon" });
        }

        // Create a beacon token with the target ID and other details
        let beaconTok: beaconToken = {
            id: id,
            dateAdded: new Date().toISOString(),
            ip: req.ip || "unknown",
            isBeacon: true,
        };

        // Generate a token for the beacon and send it in the response
        let token = await createToken(beaconTok);
        res.status(200).json({ token: token });
    }
);
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
router.post(
    "/add/service",
    authenticate,
    isBeacon,
    async (
        req: AuthenticatedRequest,
        res: Response<API.DbTargetErrorResponse | API.ValidationError | API.SuccessResponse | API.ErrorResponse>,
        next: NextFunction
    ) => {
        // Extract and validate the request body against the schema
        let body = req.body as Beacon.service;
        let { error } = ServiceSchema.validate(body);
        if (error) {
            return res.status(400).json({ status: "error", message: "Invalid request", error: error.details });
        }

        // Error if client is unknown
        if (!req.client) return res.status(400).json({ status: "error", error: "Invalid request" });

        // Retrieve the beacon data from the database
        let target = await db.getBeacon(req.client.id);

        // Error if data is not found
        if (!target) return res.status(400).json({ status: "error", error: "Target Not Found" });

        // Add the application process to the target
        await target.addPortService(body);

        // Respond with success message
        return res.status(200).json({ status: "success", message: "Beacon Added Application" });
    }
);
router.post(
    "/add/app",
    authenticate,
    isBeacon,
    async (
        req: AuthenticatedRequest,
        res: Response<API.DbTargetErrorResponse | API.ValidationError | API.SuccessResponse | API.ErrorResponse>,
        next: NextFunction
    ) => {
        // Extract and validate the request body against the schema
        let body = req.body as Beacon.application;
        let { error } = applicationSchema.validate(body);
        if (error) {
            return res.status(400).json({ status: "error", message: "Invalid request", error: error.details });
        }

        // Error if client is unknown
        if (!req.client) return res.status(400).json({ status: "error", error: "Invalid request" });

        // Retrieve the beacon data from the database
        let target = await db.getBeacon(req.client.id);

        // Error if data is not found
        if (!target) return res.status(400).json({ status: "error", error: "Target Not Found" });

        // Add the application process to the target
        await target.addProcess(body);

        // Respond with success message
        return res.status(200).json({ status: "success", message: "Beacon Added Application" });
    }
);
router.post(
    "/add/interface",
    authenticate,
    isBeacon,
    async (
        req: AuthenticatedRequest,
        res: Response<API.DbTargetErrorResponse | API.ValidationError | API.SuccessResponse | API.ErrorResponse>,
        next: NextFunction
    ) => {
        // Extract and validate the request body against the schema
        let body = req.body as Beacon.networkInterface;
        let { error } = networkInterfaceSchema.validate(body);
        if (error) {
            return res.status(400).json({ status: "error", message: "Invalid request", error: error.details });
        }

        // Error if client is unknown
        if (!req.client) return res.status(400).json({ status: "error", error: "Invalid request" });

        // Retrieve the beacon data from the database
        let target = await db.getBeacon(req.client.id);

        // Error if data is not found
        if (!target) return res.status(400).json({ status: "error", error: "Target Not Found" });

        // Add the interface to the target
        await target.addInterface(body);

        // Respond with success message

        return res.status(200).json({ status: "success", message: "Beacon Added Network Interface" });
    }
);
router.post(
    "/add/user",
    authenticate,
    isBeacon,
    async (
        req: AuthenticatedRequest,
        res: Response<API.DbTargetErrorResponse | API.ValidationError | API.SuccessResponse | API.ErrorResponse>,
        next: NextFunction
    ) => {
        // Extract and validate the request body against the schema
        let body = req.body as Beacon.user;
        let { error } = networkInterfaceSchema.validate(body);
        if (error) {
            return res.status(400).json({ status: "error", message: "Invalid request", error: error.details });
        }

        // Error if client is unknown
        if (!req.client) return res.status(400).json({ status: "error", error: "Invalid request" });

        // Retrieve the beacon data from the database
        let target = await db.getBeacon(req.client.id);

        // Error if data is not found
        if (!target) return res.status(400).json({ status: "error", error: "Target Not Found" });

        // Add the interface to the target
        await target.addUser(body.name, body.loggedIn);

        // Respond with success message
        return res.status(200).json({ status: "success", message: "Beacon Added User" });
    }
);
router.post(
    "/init",
    authenticate,
    isBeacon,
    async (
        req: AuthenticatedRequest,
        res: Response<API.DbTargetErrorResponse | API.ValidationError | API.SuccessResponse | API.ErrorResponse>,
        next: NextFunction
    ) => {
        // Extract and validate the request body against the schema
        let body = req.body as Beacon.initReq;
        let { error } = initRequestSchema.validate(body);
        if (error) {
            return res.status(400).json({ status: "error", message: "Invalid request", error: error.details });
        }

        // Error if client is unknown
        if (!req.client) return res.status(400).json({ status: "error", error: "Invalid request" });

        // Retrieve the beacon data from the database
        let target = await db.getBeacon(req.client.id);

        // Error if data is not found
        if (!target) return res.status(400).json({ status: "error", error: "Target Not Found" });

        // Add network interfaces to the target
        for (let i = 0; i < body.networkInterfaces.length; i++) {
            const iface = body.networkInterfaces[i];
            await target.addInterface(iface);
        }

        // Add applications to the target
        for (let i = 0; i < body.apps.length; i++) {
            const apps = body.apps[i];
            await target.addProcess(apps);
        }

        // Add users to the target
        for (let i = 0; i < body.users.length; i++) {
            const user = body.users[i];
            await target.addUser(user.name, user.loggedIn);
        }

        // Respond with success message
        return res.status(200).json({ status: "success", message: "Beacon init complete" });
    }
);

/**
 * @swagger
 * /api/beacon/event:
 *  post:
 *    summary: Handle various events
 *    tags:
 *      - Beacons
 *    security:
 *      - bearerAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              event:
 *                type: string
 *                description: Type of event
 *                enum: [fileAccessed, fileCreated, fileDeleted, filePermission, config, interfaceDown, interfaceUp, interfaceIpChange, interfaceCreated, interfaceDeleted, kernel, processCreated, processEnded, regEdit, userCreated, userDeleted, userGroupChange, userLoggedIn, userLoggedOut]
 *              file:
 *                type: string
 *                description: File related to the event
 *              user:
 *                type: string
 *                description: User related to the event
 *              permissions:
 *                type: string
 *                description: Permissions related to the event
 *              mac:
 *                type: string
 *                description: MAC address related to the event
 *              ip:
 *                type: string
 *                description: IP address related to the event
 *              pid:
 *                type: integer
 *                description: Process ID related to the event
 *              name:
 *                type: string
 *                description: Name related to the event
 *              key:
 *                type: string
 *                description: Registry key related to the event
 *              value:
 *                type: string
 *                description: Registry value related to the event
 *              description:
 *                type: string
 *                description: Description related to the event
 *              loggedIn:
 *                type: boolean
 *                description: User login status
 *            required:
 *              - event
 *    responses:
 *      '200':
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: string
 *                  example: success
 *      '400':
 *        description: Invalid request
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: string
 *                  example: Invalid request
 *                error:
 *                  type: string
 *                  example: Error details
 */
//endpoint to parse out beacon events and creates a targetLogEvent and updates target info in database
router.post(
    "/event",
    authenticate,
    isBeacon,
    async (
        req: AuthenticatedRequest,
        res: Response<API.DbTargetErrorResponse | API.ValidationError | API.SuccessResponse | API.ErrorResponse>,
        next: NextFunction
    ) => {
        // Extract and validate the request body against the schema
        let body = req.body as Event;
        let { error } = eventSchema.validate(body);
        if (error) {
            return res.status(400).json({ status: "error", message: "Invalid request", error: error.details });
        }
        // Error if client is unknown
        if (!req.client) return res.status(400).json({ status: "error", error: "Invalid request" });

        // Retrieve the beacon data from the database
        let target = await db.getBeacon(req.client.id);
        // Error if data is not found
        if (!target) return res.status(400).json({ status: "error", error: "Target Not Found" });

        let result: boolean | API.DbTargetError = false;

        // Branch out based on which event has been send
        switch (body.event) {
            case "fileAccessed": {
                // Extract body as Event
                let data = body as FileEvent.event;

                /**
                 * Set message which will appear on frontend
                 */
                let message = `File ${data.file} Accessed By ${data.user}`;

                /**
                 * Create a BeaconEvent with the message and set if its urgent or not
                 *
                 * To be implemented: reading urgent list from database to see if some events were sent as urgent
                 */

                let log: LogEvent.BeaconEvent = { ...data, message: message, urgent: false };

                // Add the event to the target
                await target.addLog(log);

                // set the result as true to identify that the Log has been processed
                result = true;
                break;
            }

            case "fileCreated": {
                let data = body as FileEvent.event;

                let message = `File ${data.file} Created By ${data.user}`;

                let log: LogEvent.BeaconEvent = { ...data, message: message, urgent: false };

                // Add the event to the target
                await target.addLog(log);
                result = true;

                break;
            }
            case "fileDeleted": {
                let data = body as FileEvent.event;

                let message = `File ${data.file} Deleted By ${data.user}`;
                let log: LogEvent.BeaconEvent = { ...data, message: message, urgent: false };
                await target.addLog(log);
                result = true;

                break;
            }
            case "filePermission": {
                let data = body as FileEvent.event;
                let message = `File ${data.file} Permissions By ${data.user} | ${data.permissions}`;
                let log: LogEvent.BeaconEvent = { ...data, message: message, urgent: false };
                await target.addLog(log);
                result = true;

                break;
            }
            case "config": {
                let data = body as KernelEvent.event;
                let message = `Config ${data.file} changed By ${data.user}`;
                let log: LogEvent.BeaconEvent = { ...data, message: message, urgent: false };
                await target.addLog(log);
                break;
            }
            case "interfaceDown": {
                let data = body as NetworkInterfaceEvent.event;
                let message = `Interface ${data.mac} Down`;
                let log: LogEvent.BeaconEvent = { ...data, message: message, urgent: false };
                result = await target.updateInterfaceStat(data.mac, "down");

                await target.addLog(log);

                break;
            }
            case "interfaceUp": {
                let data = body as NetworkInterfaceEvent.event;
                let message = `Interface ${data.mac} Up`;
                let log: LogEvent.BeaconEvent = { ...data, message: message, urgent: false };
                result = await target.updateInterfaceStat(data.mac, "up");

                await target.addLog(log);
                break;
            }
            case "interfaceIpChange": {
                let data = body as NetworkInterfaceEvent.event;

                // Error if Ip or Subnet is not set
                if (!data.ip || !data.subnet)
                    return res.status(400).json({ status: "error", error: "Invalid request for Ip change missing ip or subnet" });
                let message = `Interface ${data.mac} Ip${data.version} change ${data.ip}`;
                let log: LogEvent.BeaconEvent = { ...data, message: message, urgent: false };

                // Update the ip using mac address of the interface
                result =
                    data.version == "4"
                        ? await target.updateInterfaceIPv4(data.mac, data.ip, data.subnet)
                        : await target.updateInterfaceIPv6(data.mac, data.ip, data.subnet);
                await target.addLog(log);
                break;
            }

            case "interfaceCreated": {
                let data = body as NetworkInterfaceEvent.event;
                let message = `Interface ${data.mac} ${data.ip} Created`;
                let log: LogEvent.BeaconEvent = { ...data, message: message, urgent: false };
                result = await target.addInterface(data.descriptor);
                await target.addLog(log);
                break;
            }
            case "interfaceDeleted": {
                let data = body as NetworkInterfaceEvent.event;
                let message = `Interface ${data.mac} ${data.ip} Deleted`;
                let log: LogEvent.BeaconEvent = { ...data, message: message, urgent: false };
                result = await target.removeInterface(data.mac);
                await target.addLog(log);
                break;
            }
            case "kernel": {
                let data = body as KernelEvent.event;
                let message = `Kernel ${data.file} ${data.description}`;
                let log: LogEvent.BeaconEvent = { ...data, message: message, urgent: false };
                await target.addLog(log);
                result = true;
                break;
            }
            case "processCreated": {
                let data = body as ProcessEvent.event;
                let message = `Process ${data.name} ${data.pid} Created`;
                let log: LogEvent.BeaconEvent = { ...data, message: message, urgent: false };
                result = await target.processCreated(data.descriptor);
                await target.addLog(log);
                break;
            }
            case "processEnded": {
                let data = body as ProcessEvent.event;
                let message = `Process ${data.name} ${data.pid} Ended`;
                let log: LogEvent.BeaconEvent = { ...data, message: message, urgent: false };
                result = await target.processEnded(data.name);
                await target.addLog(log);
                break;
            }
            case "regEdit": {
                let data = body as RegEditEvent.event;
                let message = `Reg Edit ${data.key} ${data.value}`;
                let log: LogEvent.BeaconEvent = { ...data, message: message, urgent: false };
                await target.addLog(log);
                result = true;
                break;
            }
            case "userCreated": {
                let data = body as UserEvent.event;
                let message = `New User ${data.user} created`;
                let log: LogEvent.BeaconEvent = { ...data, message: message, urgent: false };
                result = await target.addUser(data.user);
                await target.addLog(log);
                break;
            }
            case "userLoggedIn": {
                let data = body as UserEvent.event;
                let message = `User logged in ${data.user}`;
                let log: LogEvent.BeaconEvent = { ...data, message: message, urgent: false };
                result = await target.updateUser(data.user, data.userLogin);
                await target.addLog(log);
                break;
            }
            case "userLoggedOut": {
                let data = body as UserEvent.event;
                let message = `User logged out ${data.user}`;
                let log: LogEvent.BeaconEvent = { ...data, message: message, urgent: false };
                result = await target.userLogout(data.user);
                await target.addLog(log);
                break;
            }

            case "userDeleted": {
                let data = body as UserEvent.event;
                let message = `User ${data.user} deleted`;
                let log: LogEvent.BeaconEvent = { ...data, message: message, urgent: false };
                result = await target.removeUser(data.user);
                await target.addLog(log);
                break;
            }
            //Not implemented
            case "userGroupChange": {
                let data = body as UserEvent.event;
                let message = `User ${data.user} group changed`;
                let log: LogEvent.BeaconEvent = { ...data, message: message, urgent: false };
                await target.addLog(log);
                result = true;
                break;
            }
            case "portClosed": {
                let data = body as PortEvent.event;
                let message = `Port closed ${data.port} with service ${data.serviceName}`;
                let log: LogEvent.BeaconEvent = { ...data, message: message, urgent: false };
                result = await target.delPortService(data.port.toString());
                await target.addLog(log);
                break;
            }
            case "portOpened": {
                let data = body as PortEvent.event;
                let message = `Port opened ${data.port} with service ${data.serviceName}`;
                let log: LogEvent.BeaconEvent = { ...data, message: message, urgent: false };
                result = await target.addPortService(data.portInfo);
                await target.addLog(log);
                break;
            }
            case "portServiceChanged": {
                let data = body as PortEvent.event;
                let message = `Port ${data.port} service changed to ${data.serviceName}`;
                let log: LogEvent.BeaconEvent = { ...data, message: message, urgent: false };
                if (!data.portInfo.service) return res.status(400).json({ status: "error", error: `Unable to change service to unknown` });
                result = await target.servicePortChange(data.portInfo.service, data.port.toString());
                await target.addLog(log);
                break;
            }
            default:
                return res.status(400).json({ status: "error", error: `Unknown Event ${body.event}` });
                break;
        }
        if (result instanceof API.DbTargetError) return res.status(400).json(result.toJson());
        return res.status(200).json({ status: "success", message: `event${body.event} Logged` });
    }
);
router.delete("/", authenticate, isBeacon, async (req: AuthenticatedRequest, res: Response<API.ErrorResponse | API.SuccessResponse>) => {
    // Error if client is unknown
    if (!req.client) return res.status(400).json({ status: "error", error: "Invalid request" });

    // Retrieve the beacon data from the database
    let target = await db.getBeacon(req.client.id);

    // Error if data is not found
    if (!target) return res.status(400).json({ status: "error", error: "Target Not Found" });

    // Delete the target from the database
    let result = await target.delTarget();
    if (!result) return res.status(400).json({ status: "error", error: "Unable to delete" });

    // Respond with success message
    return res.status(200).json({ status: "success", message: `Deleted ${req.client.id}` });
});

export { router as BeaconRouter };

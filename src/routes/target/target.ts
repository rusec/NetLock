import { NextFunction, Response, Router } from "express";
import { AuthenticatedRequest } from "../../utils/types/token";
import { authenticate } from "../../utils/token";
import { isBeacon } from "../../utils/auth";
import db from "../../db/db";
import { Event, FileEvent, KernelEvent, LogEvent, NetworkEvent, ProcessEvent, RegEditEvent, UserEvent, eventSchema } from "netlocklib/dist/Events";
import { API } from "netlocklib/dist/api";
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
        let body = req.body as Event;
        let { error } = eventSchema.validate(body);
        if (error) {
            return res.status(400).json({ status: "error", message: "Invalid request", error: error.details });
        }
        if (!req.client) return res.status(400).json({ status: "error", error: "Invalid request" });

        let target = await db.getTarget(req.client.id);

        if (!target) return res.status(400).json({ status: "error", error: "Target Not Found" });
        let result: boolean | API.DbTargetError = false;
        switch (body.event) {
            case "fileAccessed": {
                let data = body as FileEvent.event;

                let message = `File ${data.file} Accessed By ${data.user}`;
                let log: LogEvent.BeaconEvent = { ...data, message: message, urgent: false };
                await target.addLog(log);
                result = true;
                break;
            }

            case "fileCreated": {
                let data = body as FileEvent.event;

                let message = `File ${data.file} Created By ${data.user}`;
                let log: LogEvent.BeaconEvent = { ...data, message: message, urgent: false };
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
                let data = body as NetworkEvent.event;
                let message = `Interface ${data.mac} Down`;
                let log: LogEvent.BeaconEvent = { ...data, message: message, urgent: false };
                result = await target.updateInterfaceStat(data.mac, "down");

                await target.addLog(log);

                break;
            }
            case "interfaceUp": {
                let data = body as NetworkEvent.event;
                let message = `Interface ${data.mac} Up`;
                let log: LogEvent.BeaconEvent = { ...data, message: message, urgent: false };
                result = await target.updateInterfaceStat(data.mac, "up");

                await target.addLog(log);
                break;
            }
            case "interfaceIpChange": {
                let data = body as NetworkEvent.event;
                let message = `Interface ${data.mac} Ip change ${data.ip}`;
                let log: LogEvent.BeaconEvent = { ...data, message: message, urgent: false };
                result = await target.updateInterfaceIP(data.mac, data.ip);
                await target.addLog(log);
                break;
            }
            case "interfaceCreated": {
                let data = body as NetworkEvent.event;
                let message = `Interface ${data.mac} ${data.ip} Created`;
                let log: LogEvent.BeaconEvent = { ...data, message: message, urgent: false };
                result = await target.addInterface(data.mac, data.ip, data.state);
                await target.addLog(log);
                break;
            }
            case "interfaceDeleted": {
                let data = body as NetworkEvent.event;
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
                result = await target.processEnded(data.descriptor);
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
                result = await target.addUser(data.user, { loggedIn: data.loggedIn });
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
            case "userGroupChange": {
                let data = body as UserEvent.event;
                let message = `User ${data.user} group changed`;
                let log: LogEvent.BeaconEvent = { ...data, message: message, urgent: false };
                await target.addLog(log);
                result = true;
                break;
            }
            case "userLoggedIn": {
                let data = body as UserEvent.event;
                let message = `User ${data.user} Logged in`;
                let log: LogEvent.BeaconEvent = { ...data, message: message, urgent: false };
                result = await target.updateUser(data.user, { loggedIn: true, lastLogin: new Date().getTime() });
                await target.addLog(log);
                break;
            }
            case "userLoggedOut": {
                let data = body as UserEvent.event;
                let message = `User ${data.user} Logged in`;
                let log: LogEvent.BeaconEvent = { ...data, message: message, urgent: false };
                result = await target.updateUser(data.user, { loggedIn: false });
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
    if (!req.client) return res.status(400).json({ status: "error", error: "Invalid request" });

    let target = await db.getTarget(req.client.id);

    if (!target) return res.status(400).json({ status: "error", error: "Target Not Found" });
    let result = await target.delTarget();
    if (!result) return res.status(400).json({ status: "error", error: `Unable to delete` });

    return res.status(200).json({ status: "success", message: `Deleted ${req.client.id}` });
});
export { router as BeaconEventRouter };

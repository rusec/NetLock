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

// SCHEMAS FOR BEACONS
// Beacon INIT
/**
 * @swagger
 * components:
 *   schemas:
 *     BeaconInit:
 *       type: object
 *       properties:
 *         os:
 *           type: object
 *           properties:
 *             platform:
 *               type: string
 *               description: The platform of the operating system.
 *             distro:
 *               type: string
 *               description: The distribution of the operating system.
 *             kernel:
 *               type: string
 *               description: The kernel version of the operating system.
 *             arch:
 *               type: string
 *               description: The architecture of the operating system.
 *             release:
 *               type: string
 *               description: The release version of the operating system.
 *             codename:
 *               type: string
 *               description: The codename of the operating system.
 *             fqdn:
 *               type: string
 *               description: The fully qualified domain name.
 *             hypervisor:
 *               type: boolean
 *               description: Indicates if a hypervisor is present.
 *               nullable: true
 *             uefi:
 *               type: boolean
 *               description: Indicates if UEFI is supported.
 *               nullable: true
 *             logofile:
 *               type: string
 *               description: The logo file associated with the operating system.
 *             build:
 *               type: string
 *               description: The build version of the operating system.
 *             servicepack:
 *               type: string
 *               description: The service pack version of the operating system.
 *         hardware:
 *           type: object
 *           properties:
 *             cpu:
 *               type: string
 *               description: The CPU information.
 *             mem:
 *               type: string
 *               description: The memory information.
 *         hostname:
 *           type: string
 *           description: The hostname of the system.
 */

// Service
/**
 * @swagger
 * components:
 *   schemas:
 *     port:
 *       type: object
 *       properties:
 *         protocol:
 *           type: string
 *           description: The protocol used by the port (e.g., TCP, UDP).
 *         localAddress:
 *           type: string
 *           description: The local address of the port.
 *         localPort:
 *           type: string
 *           description: The local port number.
 *         peerAddress:
 *           type: string
 *           description: The peer address if available.
 *           nullable: true
 *         peerPort:
 *           type: string
 *           description: The peer port number if available.
 *           nullable: true
 *         state:
 *           type: string
 *           description: The current state of the port.
 *         pid:
 *           type: integer
 *           description: The process ID associated with the port.
 *         process:
 *           type: string
 *           description: The name of the process associated with the port.
 *           nullable: true
 *         additionalProperties:
 *           type: object
 *           description: Allows for additional properties not explicitly defined.
 *     service:
 *       type: object
 *       properties:
 *         service:
 *           $ref: '#/components/schemas/applicationSpawn'
 *           description: The application spawn associated with the service.
 *           nullable: true
 *         port:
 *           $ref: '#/components/schemas/port'
 *           description: The port information related to the service.
 *     applicationSpawn:
 *       type: object
 *       properties:
 *         pid:
 *           type: integer
 *           description: The process ID of the application.
 *         parentPid:
 *           type: integer
 *           description: The parent process ID if available.
 *           nullable: true
 *         name:
 *           type: string
 *           description: The name of the application.
 *         cpu:
 *           type: number
 *           format: float
 *           description: The CPU usage of the application in percentage.
 *           nullable: true
 *         priority:
 *           type: integer
 *           description: The priority of the application.
 *           nullable: true
 *         started:
 *           type: string
 *           format: date-time
 *           description: The start time of the application.
 *           nullable: true
 *         state:
 *           type: string
 *           description: The current state of the application.
 *           nullable: true
 *         tty:
 *           type: string
 *           description: The terminal type associated with the application.
 *           nullable: true
 *         user:
 *           type: string
 *           description: The user running the application.
 *           nullable: true
 *         command:
 *           type: string
 *           description: The command used to start the application.
 *           nullable: true
 *         params:
 *           type: string
 *           description: Parameters used for starting the application.
 *           nullable: true
 *         path:
 *           type: string
 *           description: The path of the application executable.
 *           nullable: true
 *         additionalProperties:
 *           type: object
 *           description: Allows for additional properties not explicitly defined.
 */

// Application
/**
 * @swagger
 * components:
 *   schemas:
 *     application:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the application.
 *         running:
 *           type: boolean
 *           description: Indicates whether the application is currently running.
 *         spawns:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/applicationSpawn'
 *           description: List of application spawns associated with this application.
 */

// Network Interface

/**
 * @swagger
 * components:
 *   schemas:
 *     networkInterface:
 *       type: object
 *       properties:
 *         iface:
 *           type: string
 *           description: The identifier of the network interface.
 *         ifaceName:
 *           type: string
 *           description: The name of the network interface.
 *         default:
 *           type: boolean
 *           description: Indicates if this interface is the default interface.
 *         ip4:
 *           type: string
 *           description: The IPv4 address assigned to the interface.
 *         ip4subnet:
 *           type: string
 *           description: The subnet mask for the IPv4 address.
 *         ip6:
 *           type: string
 *           description: The IPv6 address assigned to the interface.
 *         ip6subnet:
 *           type: string
 *           description: The subnet mask for the IPv6 address.
 *         mac:
 *           type: string
 *           description: The MAC address of the network interface.
 *         state:
 *           type: string
 *           enum:
 *             - up
 *             - down
 *           description: The state of the network interface.
 *         type:
 *           type: string
 *           description: The type of the network interface (e.g., ethernet, wifi).
 *           nullable: true
 *         speed:
 *           type: number
 *           format: float
 *           description: The speed of the network interface in Mbps.
 *           nullable: true
 *         virtual:
 *           type: boolean
 *           description: Indicates if the network interface is virtual.
 *           nullable: true
 *         dhcp:
 *           type: boolean
 *           description: Indicates if the interface uses DHCP for IP address assignment.
 *           nullable: true
 *         additionalProperties:
 *           type: object
 *           description: Allows for additional properties not explicitly defined.
 */

// Users

/**
 * @swagger
 * components:
 *   schemas:
 *     userLogin:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the user who logged in.
 *         tty:
 *           type: string
 *           description: The terminal type used for login.
 *           nullable: true
 *         date:
 *           type: integer
 *           description: The timestamp of the login event (Unix epoch time).
 *         ip:
 *           type: string
 *           description: The IP address from which the user logged in.
 *           nullable: true
 *         command:
 *           type: string
 *           description: The command executed by the user at login.
 *           nullable: true
 *         additionalProperties:
 *           type: object
 *           description: Allows for additional properties not explicitly defined.
 *     user:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the user.
 *         loggedIn:
 *           type: boolean
 *           description: Indicates whether the user is currently logged in.
 *         lastUpdate:
 *           type: integer
 *           description: The timestamp of the last update (Unix epoch time).
 *         logins:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/userLogin'
 *           description: Array of login records associated with the user.
 *         additionalProperties:
 *           type: object
 *           description: Allows for additional properties not explicitly defined.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     beaconData:
 *       type: object
 *       properties:
 *         id:
 *          type: string
 *          description: id used to identify beacon
 *         dateAdded:
 *          type: number
 *          description: date which beacon was added
 *         lastPing:
 *          type: number
 *          description: date which beacon was pinged
 *         apps:
 *           type: array
 *           items:
 *            $ref: '#/components/schemas/application'
 *           description: List of applications on the beacon.
 *         users:
 *           type: array
 *           items:
 *            $ref:'#/components/schemas/user'
 *           description: List of Users on the beacon.
 *         networkInterfaces:
 *           type: array
 *           items:
 *            $ref:'#/components/schemas/networkInterface'
 *           description: List of network interfaces on the beacon.
 *         services:
 *           type: array
 *           items:
 *            $ref:'#/components/schemas/service'
 *           description: List of network interfaces on the beacon.
 */

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
 *             $ref: '#/components/schemas/BeaconInit'
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
 *                   description: The JWT token for the beacon. To be used for all beacon requests
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
 * /api/beacon/add/service:
 *   post:
 *     summary: Add a service to a beacon.
 *     description: Adds a new service to a specific beacon. This endpoint requires authentication and authorization. Used for initial request to limit json size.
 *     tags:
 *       - Beacons
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/service'
 *           examples:
 *             example:
 *               value:
 *                 service:
 *                   pid: 1234
 *                   parentPid: 5678
 *                   name: my-service
 *                   cpu: 15.5
 *                   priority: 10
 *                   started: '2024-08-28T12:34:56Z'
 *                   state: running
 *                   tty: tty1
 *                   user: user1
 *                   command: /usr/bin/my-service
 *                   params: --verbose
 *                   path: /usr/bin/my-service
 *                 port:
 *                   protocol: TCP
 *                   localAddress: 192.168.1.2
 *                   localPort: '8080'
 *                   peerAddress: 192.168.1.3
 *                   peerPort: '9090'
 *                   state: LISTEN
 *                   pid: 1234
 *                   process: my-service
 *     responses:
 *       '200':
 *         description: Successfully added the application process to the beacon.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Beacon Added Application
 *       '400':
 *         description: Bad request due to invalid input or client errors.
 *         content:
 *           application/json:
 *             schema:

 *               examples:
 *                 invalidRequest:
 *                   value:
 *                     status: error
 *                     message: Invalid request
 *                     error: [details about validation error]
 *                 targetNotFound:
 *                   value:
 *                     status: error
 *                     error: Target Not Found
 *       '401':
 *         description: Unauthorized access. Authentication or authorization failed.
 *         content:
 *           application/json:
 *             schema:
 *             examples:
 *               unauthorized:
 *                 value:
 *                   status: error
 *                   error: Unauthorized
 *       '500':
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *             examples:
 *               serverError:
 *                 value:
 *                   status: error
 *                   error: Internal Server Error
 *     security:
 *       - bearerAuth: []
 *     x-auth-required: true
 *     x-auth-roles:
 *       - beacon
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
/**
 * @swagger
 * /api/beacon/add/app:
 *   post:
 *     summary: Add an application to a beacon.
 *     description: Adds a new application to a specific beacon. This endpoint requires authentication and authorization. Used for initial request to limit json size.
 *     tags:
 *       - Beacons
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/application'
 *           examples:
 *             example:
 *               value:
 *                 name: my-app
 *                 running: true
 *                 spawns:
 *                   - pid: 1234
 *                     parentPid: 5678
 *                     name: my-app-instance
 *                     cpu: 12.5
 *                     priority: 5
 *                     started: '2024-08-28T12:34:56Z'
 *                     state: running
 *                     tty: tty1
 *                     user: user1
 *                     command: /usr/bin/my-app
 *                     params: --verbose
 *                     path: /usr/bin/my-app
 *     responses:
 *       '200':
 *         description: Successfully added the application to the beacon.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Beacon Added Application
 *       '400':
 *         description: Bad request due to invalid input or client errors.
 *         content:
 *           application/json:
 *             schema:
 *               examples:
 *                 invalidRequest:
 *                   value:
 *                     status: error
 *                     message: Invalid request
 *                     error: [details about validation error]
 *                 targetNotFound:
 *                   value:
 *                     status: error
 *                     error: Target Not Found
 *       '401':
 *         description: Unauthorized access. Authentication or authorization failed.
 *         content:
 *           application/json:
 *             schema:
 *             examples:
 *               unauthorized:
 *                 value:
 *                   status: error
 *                   error: Unauthorized
 *       '500':
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *             examples:
 *               serverError:
 *                 value:
 *                   status: error
 *                   error: Internal Server Error
 *     security:
 *       - bearerAuth: []
 *     x-auth-required: true
 *     x-auth-roles:
 *       - beacon
 */

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
/**
 * @swagger
 * /api/beacon/add/interface:
 *   post:
 *     summary: Add a network interface to a beacon.
 *     description: Adds a new network interface to a specific beacon. This endpoint requires authentication and authorization. Used for initial request to limit json size.
 *     tags:
 *       - Beacons
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/networkInterface'
 *           examples:
 *             example:
 *               value:
 *                 iface: eth0
 *                 ifaceName: Ethernet0
 *                 default: true
 *                 ip4: 192.168.1.2
 *                 ip4subnet: 255.255.255.0
 *                 ip6: 2001:db8::1
 *                 ip6subnet: 64
 *                 mac: 00:1A:2B:3C:4D:5E
 *                 state: up
 *                 type: ethernet
 *                 speed: 1000
 *                 virtual: false
 *                 dhcp: true
 *     responses:
 *       '200':
 *         description: Successfully added the network interface to the beacon.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Beacon Added Network Interface
 *       '400':
 *         description: Bad request due to invalid input or client errors.
 *         content:
 *           application/json:
 *             schema:

 *               examples:
 *                 invalidRequest:
 *                   value:
 *                     status: error
 *                     message: Invalid request
 *                     error: [details about validation error]
 *                 targetNotFound:
 *                   value:
 *                     status: error
 *                     error: Target Not Found
 *       '401':
 *         description: Unauthorized access. Authentication or authorization failed.
 *         content:
 *           application/json:
 *             schema:
 *             examples:
 *               unauthorized:
 *                 value:
 *                   status: error
 *                   error: Unauthorized
 *       '500':
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *             examples:
 *               serverError:
 *                 value:
 *                   status: error
 *                   error: Internal Server Error
 *     security:
 *       - bearerAuth: []
 *     x-auth-required: true
 *     x-auth-roles:
 *       - beacon
 */

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
/**
 * @swagger
 * /api/beacon/add/user:
 *   post:
 *     summary: Add a user to a beacon.
 *     description: Adds a new user to a specific beacon. This endpoint requires authentication and authorization. Used for initial request to limit json size.
 *     tags:
 *       - Beacons
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/user'
 *           examples:
 *             example:
 *               value:
 *                 name: john_doe
 *                 loggedIn: true
 *                 lastUpdate: 1693238400
 *                 logins:
 *                   - name: john_doe
 *                     tty: tty1
 *                     date: 1693238400
 *                     ip: 192.168.1.1
 *                     command: login
 *     responses:
 *       '200':
 *         description: Successfully added the user to the beacon.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Beacon Added User
 *       '400':
 *         description: Bad request due to invalid input or client errors.
 *         content:
 *           application/json:
 *             schema:

 *               examples:
 *                 invalidRequest:
 *                   value:
 *                     status: error
 *                     message: Invalid request
 *                     error: [details about validation error]
 *                 targetNotFound:
 *                   value:
 *                     status: error
 *                     error: Target Not Found
 *       '401':
 *         description: Unauthorized access. Authentication or authorization failed.
 *         content:
 *           application/json:
 *             schema:
 *             examples:
 *               unauthorized:
 *                 value:
 *                   status: error
 *                   error: Unauthorized
 *       '500':
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *             examples:
 *               serverError:
 *                 value:
 *                   status: error
 *                   error: Internal Server Error
 *     security:
 *       - bearerAuth: []
 *     x-auth-required: true
 *     x-auth-roles:
 *       - beacon
 */

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
 *                description: Type of event. Please check Typescript definitions
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
/**
 * @swagger
 * /api/beacon/:
 *   delete:
 *     summary: Delete a beacon.
 *     description: Deletes a beacon from the database based on the client's ID. This endpoint requires authentication and authorization.
 *     tags:
 *       - Beacons
 *     responses:
 *       '200':
 *         description: Successfully deleted the beacon.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Deleted {clientId}
 *       '400':
 *         description: Bad request due to invalid input or client errors.
 *         content:
 *           application/json:
 *             schema:
 *             examples:
 *               invalidRequest:
 *                 value:
 *                   status: error
 *                   error: Invalid request
 *               targetNotFound:
 *                 value:
 *                   status: error
 *                   error: Target Not Found
 *               deleteFailed:
 *                 value:
 *                   status: error
 *                   error: Unable to delete
 *       '401':
 *         description: Unauthorized access. Authentication or authorization failed.
 *         content:
 *           application/json:
 *             schema:
 *             examples:
 *               unauthorized:
 *                 value:
 *                   status: error
 *                   error: Unauthorized
 *       '500':
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *             examples:
 *               serverError:
 *                 value:
 *                   status: error
 *                   error: Internal Server Error
 *     security:
 *       - bearerAuth: []
 *     x-auth-required: true
 *     x-auth-roles:
 *       - beacon
 */

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

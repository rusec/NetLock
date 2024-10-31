import { NextFunction, Response } from "express";
import { isBeacon } from "../../../../middleware/auth";
import { authenticate } from "../../../../middleware/token";
import { AuthenticatedRequest } from "../../../../utils/types/token";
import { API } from "netlocklib/dist/api";
import { Event, eventSchema, FileEvent, KernelEvent, LogEvent, NetworkInterfaceEvent, PortEvent, ProcessEvent, RegEditEvent, UserEvent } from "netlocklib/dist/Events";
import db from "../../../../db/db";

export const POST = [
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
]
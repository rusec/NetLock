import { NextFunction, Response } from "express";
import { isBeacon } from "../../../middleware/auth";
import { authenticate } from "../../../middleware/token";
import { AuthenticatedRequest } from "../../../utils/types/token";
import { API } from "netlocklib/dist/api";
import db from "../../../db/db";
import { initRequestSchema } from "netlocklib/dist/Beacon/schemas";
import { Beacon } from "netlocklib/dist/Beacon";


export const POST = [
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
]

export const DELETE = [
    authenticate, isBeacon, async (req: AuthenticatedRequest, res: Response<API.ErrorResponse | API.SuccessResponse>) => {
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
    }
]
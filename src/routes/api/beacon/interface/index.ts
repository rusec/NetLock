import { NextFunction, Response } from "express";
import { isBeacon } from "../../../../middleware/auth";
import { authenticate } from "../../../../middleware/token";
import { AuthenticatedRequest } from "../../../../utils/types/token";
import { API } from "netlocklib/dist/api";
import { Beacon } from "netlocklib/dist/Beacon";
import { networkInterfaceSchema } from "netlocklib/dist/Beacon/schemas";
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
]
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
        
        // Respond with success message
        return res.status(200).json({ status: "success", message: "Beacon Connected" });
    }
]
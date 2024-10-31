import { Request, Response } from "express";
import { authenticate } from "../../../../middleware/token";
import { validateUser } from "../../../../middleware/userUtils";
import { API } from "netlocklib/dist/api";
import db from "../../../../db/db";

export const DELETE = [ authenticate, validateUser, async (req: Request, res: Response<API.SuccessResponse | API.ErrorResponse>) => {
    // Error if target parameter is missing
    if (!req.params.beacon) return res.status(400).json({ status: "error", error: "No target selected" });

    // Retrieve the target data from the database
    let targetData = await db.getBeacon(req.params.beacon);

    // Error if data is not found
    if (!targetData) return res.status(400).json({ status: "error", error: "Unable to find target" });

    // Delete the target from the database
    await targetData.delTarget();

    // Respond with success message
    return res.status(200).json({ status: "success", message: "target deleted" });
}]
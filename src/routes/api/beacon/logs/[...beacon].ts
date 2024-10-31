import { Request, Response } from "express";
import { authenticate } from "../../../../middleware/token";
import { validateUser } from "../../../../middleware/userUtils";
import { API } from "netlocklib/dist/api";
import { LogEvent } from "netlocklib/dist/Events";
import db from "../../../../db/db";

export const GET = [authenticate, validateUser, async (req: Request, res: Response<API.ErrorResponse | LogEvent.Log[]>) => {
    // Error if target parameter is missing
    if (!req.params.beacon) return res.status(400).json({ status: "error", error: "No target selected" });

    // Retrieve the target data from the database
    let targetData = await db.getBeacon(req.params.target);

    // Error if data is not found
    if (!targetData) return res.status(400).json({ status: "error", error: "Unable to find target" });

    // Retrieve the logs associated with the target
    let logs = await targetData.getLogs();

    // Respond with the retrieved logs
    return res.status(200).json(logs);
}]
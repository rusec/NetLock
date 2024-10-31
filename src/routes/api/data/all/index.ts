import { Request, Response } from "express";
import { authenticate } from "../../../../middleware/token";
import { validateUser } from "../../../../middleware/userUtils";
import { API } from "netlocklib/dist/api";
import db from "../../../../db/db";

export const GET = [authenticate, validateUser, async (req: Request, res: Response<API.TargetsAndLogsResponse | API.ErrorResponse>) => {
    // Retrieve all targets from the database
    let targets = await db.getAllTargets();

    // Retrieve all logs from the database
    let logs = await db.getAllLogs();

    // Error if unable to retrieve targets or logs
    if (!targets || !logs) return res.status(400).json({ status: "error", error: "unable to get info" });

    // Respond with the retrieved targets and logs
    return res.status(200).json({ targets, logs });
}]
import { Request, Response } from "express";
import { authenticate } from "../../../../middleware/token";
import { validateUser } from "../../../../middleware/userUtils";
import { API } from "netlocklib/dist/api";
import { Beacon } from "netlocklib/dist/Beacon";
import db from "../../../../db/db";

export const GET = [authenticate, validateUser, async (req: Request, res: Response<API.ErrorResponse | Beacon.Data>) => {
    // Error if target parameter is missing
    if (!req.params.beacon) return res.status(400).json({ status: "error", error: "Unable to find target" });

    // Retrieve the beacon data from the database
    let target = await db.getBeacon(req.params.target);

    // Error if data is not found
    if (!target) return res.status(400).json({ status: "error", error: "Unable to find target" });

    // Retrieve the data associated with the target
    let data = await target.getData();

    // Respond with the retrieved data
    return res.status(200).json(data);
}]
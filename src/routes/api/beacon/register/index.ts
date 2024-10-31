import { API } from "netlocklib/dist/api";
import { isBeacon } from "../../../../middleware/auth";
import { Beacon, schemas } from "netlocklib/dist/Beacon";
import { NextFunction, Response,Request } from "express";
import db from "../../../../db/db";
import { beaconToken } from "../../../../utils/types/token";
import { createToken } from "../../../../middleware/token";

export const POST = [isBeacon, async (req: Request, res: Response<API.ErrorResponse | API.ValidationError | API.TokenResponse>, next: NextFunction) => {
    // Extract and validate the request body against the schema
    let body = req.body as unknown as Beacon.Init;
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
}]
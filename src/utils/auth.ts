import { NextFunction, Request, Response } from "express";
import crypto from "crypto";
let beaconKey = "MindoverMatter";

function isBeacon(req: Request, res: Response, next: NextFunction) {
    if (!req.headers.authorization) return res.status(401);
    if (crypto.timingSafeEqual(Buffer.from(req.headers.authorization), Buffer.from(beaconKey))) next();
    return res.status(401);
}
export { isBeacon };

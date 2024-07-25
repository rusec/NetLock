import { NextFunction, Request, Response } from "express";
import crypto from "crypto";
let beaconKey = "MindoverMatter";

function isBeacon(req: Request, res: Response, next: NextFunction) {
    if (!req.headers.authorization) return res.status(401).json({ status: "unauthorized" });
    if (crypto.timingSafeEqual(Buffer.from(req.headers.authorization), Buffer.from(beaconKey))) return next();
    return res.status(401).json({ status: "unauthorized" });
}
export { isBeacon };

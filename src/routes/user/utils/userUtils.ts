import { NextFunction, Request, Response } from "express";
import { AuthenticatedRequest, beaconToken } from "../../../utils/types/token";
import crypto from "crypto";
import { log } from "../../../utils/output/debug";
function validateUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    if (!req.client) return res.status(401).json({ status: "Unauthorized" });
    if (!req.ip || !crypto.timingSafeEqual(Buffer.from(req.ip), Buffer.from((req.client as beaconToken).ip))) {
        log(`Ip for user does not match WANTED ${req.client.ip} GOT ${req.ip}, user token used from different ip from registered`, "error");

        return res.status(400).json({ status: "Invalid Ip" });
    }

    next();
}

export { validateUser };
import { NextFunction, Request, Response } from "express";
import { AuthenticatedRequest, beaconToken, userToken } from "../utils/types/token";
import crypto from "crypto";
import { log } from "../utils/output/debug";
function validateUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    // Error if client is unknown
    if (!req.client) return res.status(401).json({ status: "Unauthorized" });

    // Validate the IP address
    if (
        !req.ip ||
        Buffer.from(req.ip).length != Buffer.from((req.client as beaconToken).ip).length ||
        !crypto.timingSafeEqual(Buffer.from(req.ip), Buffer.from((req.client as beaconToken).ip))
    ) {
        log(`IP for user does not match. WANTED: ${req.client.ip}, GOT: ${req.ip}. User token used from different IP than registered.`, "error");
        return res.status(400).json({ status: "Invalid IP" });
    }

    // Validate the User-Agent header
    if (!req.headers["user-agent"] || !crypto.timingSafeEqual(Buffer.from(req.headers["user-agent"]), Buffer.from((req.client as userToken).agent))) {
        log(
            `User Agent for user does not match. WANTED: ${(req.client as userToken).agent}, GOT: ${
                req.headers["user-agent"]
            }. User token used from different User-Agent than registered.`,
            "error"
        );
        return res.status(400).json({ status: "Invalid User-Agent" });
    }

    // Proceed to the next middleware or route handler
    next();
}

export { validateUser };

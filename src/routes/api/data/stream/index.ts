import { Request, Response } from "express";
import { authenticate } from "../../../../middleware/token";
import { validateUser } from "../../../../middleware/userUtils";
import { databaseEventEmitter } from "../../../../db/db";

export const GET = [authenticate, validateUser, async (req: Request, res: Response) => {
    // Set headers for Server-Sent Events (SSE)
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    // Listen for 'target' events and send them to the client
    databaseEventEmitter.on("target", (target) => {
        res.write(`event:targets\ndata: ${JSON.stringify(target)}\n\n`);
    });

    // Listen for 'logs' events and send them to the client
    databaseEventEmitter.on("logs", (data) => {
        res.write(`event:logs\ndata: ${JSON.stringify(data)}\n\n`);
    });
}]
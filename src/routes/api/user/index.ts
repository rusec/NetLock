import { NextFunction, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import Joi from "joi";
import { API } from "netlocklib/dist/api";
import db from "../../../db/db";

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-7",
    handler: (req, res) => {
        res.status(429).json({ status: "rate limit reached" });
    },
});

interface registerRequest {
    password: string;
}
let registerSchema = Joi.object({
    password: Joi.string().required(),
});

export const POST = [
    limiter,
    async (req: Request, res: Response<API.SuccessResponse | API.ErrorResponse | API.ValidationError>, next: NextFunction) => {
        // Extract and validate the request body against the schema
        let body = req.body as registerRequest;
        let { error } = registerSchema.validate(body);
        if (error) {
            return res.status(400).json({ status: "error", message: "invalid input", error: error.details });
        }

        // Create a new user in the database
        let result = await db.createUser({
            ip: req.ip || "unknown",
            password: body.password,
        });

        // Error if unable to register user
        if (!result) return res.status(400).json({ status: "error", error: "unable to register user" });

        // Respond with success message
        return res.status(200).json({ status: "success", message: "created user" });
    }
]
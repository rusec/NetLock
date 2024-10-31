import { NextFunction, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import Joi from "joi";
import { API } from "netlocklib/dist/api";
import db from "../../../../db/db";

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-7",
    handler: (req, res) => {
        res.status(429).json({ status: "rate limit reached" });
    },
});


//Password Management
interface resetPassRequest {
    current: string;
    newPassword: string;
}
let resetSchema = Joi.object({
    current: Joi.string().required(),
    password: Joi.string().required(),
});
export const POST = [ limiter,
    async (req: Request, res: Response<API.SuccessResponse | API.ErrorResponse | API.ValidationError>, next: NextFunction) => {
        // Extract and validate the request body against the schema
        let body = req.body as resetPassRequest;
        let { error } = resetSchema.validate(body);
        if (error) {
            return res.status(400).json({ status: "error", message: "invalid input", error: error.details });
        }

        // Authenticate the user with the current password
        let result = await db.login(body.current);
        if (!result) return res.status(401).json({ status: "error", error: "Unauthorized" });

        // Update the password in the database
        result = await db.setPassword(body.newPassword);
        if (!result) return res.status(400).json({ status: "error", error: "Unable to change password" });

        // Respond with success message
        return res.status(200).json({ status: "success", message: "updated" });
    }]
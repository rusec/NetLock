import { Request, Response } from "express";
import { API } from "netlocklib/dist/api";
import { userToken } from "../../../utils/types/token";
import { createToken } from "../../../middleware/token";
import db from "../../../db/db";
import Joi from "joi";

interface loginRequest {
    password: string;
}
let loginSchema = Joi.object({
    password: Joi.string().required(),
});


export const POST =  async (req: Request, res: Response<API.ValidationError | API.TokenResponse | API.ErrorResponse>) => {
    // Extract and validate the request body against the schema
    let body = req.body as loginRequest;
    let { error } = loginSchema.validate(body);
    if (error) {
        return res.status(400).json({ status: "error", message: "Invalid request", error: error.details });
    }

    // Authenticate the user with the provided password
    let validLogin = await db.login(body.password);
    if (!validLogin) return res.status(401).json({ status: "error", error: "unauthorized" });

    // Create a user token with the login details
    let userTok: userToken = {
        dateAdded: new Date().toISOString(),
        id: "user",
        ip: req.ip || "unknown",
        isBeacon: false,
        agent: req.headers["user-agent"] || "unknown",
    };

    // Generate a signed JWT token and send it in the response
    let signedJwt = await createToken(userTok);
    res.status(200).json({ token: signedJwt });
}
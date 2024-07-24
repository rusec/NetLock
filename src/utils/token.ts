import express, { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { AuthenticatedRequest, beaconToken, tokenInfo, userToken } from "./types/token";
const secret = "secretKey";

let tokenUtils = {
    sign: function (obj: string | object | Buffer, secret: string) {
        return jwt.sign(obj, secret);
    },

    verify: function (token: string, secret: jwt.Secret | jwt.GetPublicKeyOrSecret) {
        return new Promise(function (resolve, reject) {
            jwt.verify(token, secret, function (err, decode) {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(decode);
            });
        });
    },
};

async function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    if (!req.headers.authorization && !req.query.token) return res.status(401).json({ status: "unauthorized" });
    const token = (req.headers.authorization as string) || (req.query.token as string);
    try {
        let client = (await tokenUtils.verify(token, secret)) as beaconToken | userToken;

        // implement client from Token
        req.client = client;
        next();
    } catch (error) {
        return res.status(400).json({ status: "Bad Request" });
    }
}

async function createToken(obj: string | object) {
    return tokenUtils.sign(obj, secret);
}

export { authenticate, createToken };

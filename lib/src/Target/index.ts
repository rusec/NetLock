import Joi from "joi";

export interface targetUser {
    name: string;
    lastLogin: number;
    lastUpdate: number;
    loggedIn: boolean;
}
export interface targetApp {
    name: string;
    running: boolean;
    version: string;
    pids: string[];
    instances: number;
}
export interface targetInterface {
    ip: string;
    mac: string;
    state: "down" | "up";
}
export interface targetRequest {
    hostname: string;
    os: string;
    active: boolean;
    interfaces: Array<targetInterface>;
    users: Array<targetUser>;
    apps: Array<targetApp>;
}
export interface initTarget {
    hostname: string;
    os: string;
    active: boolean;
    interfaces: Array<targetInterface>;
    users: Array<targetUser>;
    apps: Array<targetApp>;
    lastPing: number;
    dateAdded: number;
}
export interface target extends initTarget {
    id: string;
}

export const targetUserSchema = Joi.object({
    name: Joi.string().required(),
    lastLogin: Joi.number(),
    lastUpdate: Joi.number(),
    loggedIn: Joi.boolean(),
});

export const targetAppSchema = Joi.object({
    name: Joi.string().required(),
    running: Joi.boolean(),
    version: Joi.string().required(),
    pids: Joi.array().items(Joi.string()),
    instances: Joi.number(),
});

export const targetInterfaceSchema = Joi.object({
    ip: Joi.string().ip().required(),
    mac: Joi.string().required(),
    state: Joi.string().valid("down", "up").required(),
});

export const targetRequestSchema = Joi.object({
    hostname: Joi.string().required(),
    os: Joi.string().required(),
    active: Joi.boolean().required(),
    interfaces: Joi.array().items(targetInterfaceSchema).required(),
    users: Joi.array().items(targetUserSchema).required(),
    apps: Joi.array().items(targetAppSchema).required(),
});

export const targetSchema = Joi.object({
    id: Joi.string().required(),
    hostname: Joi.string().required(),
    os: Joi.string().required(),
    active: Joi.boolean().required(),
    interfaces: Joi.array().items(targetInterfaceSchema).required(),
    users: Joi.array().items(targetUserSchema).required(),
    apps: Joi.array().items(targetAppSchema).required(),
    lastPing: Joi.number().required(),
    dateAdded: Joi.number().required(),
});

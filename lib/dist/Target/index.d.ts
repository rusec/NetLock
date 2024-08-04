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
export declare const targetUserSchema: Joi.ObjectSchema<any>;
export declare const targetAppSchema: Joi.ObjectSchema<any>;
export declare const targetInterfaceSchema: Joi.ObjectSchema<any>;
export declare const targetRequestSchema: Joi.ObjectSchema<any>;
export declare const targetSchema: Joi.ObjectSchema<any>;
//# sourceMappingURL=index.d.ts.map
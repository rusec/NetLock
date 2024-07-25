import { Request } from "express";
export interface OSevent {
    name: string;
    timestamp: number;
}
export interface processCreationEvent extends OSevent {
    name: string;
    location: string;
}
export interface regEditChangeEvent extends OSevent {
    path: string;
    value: string;
}
export interface fileAccessedEvent extends OSevent {
    path: string;
    user: string;
}
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
}
export interface targetInterface {
    ip: string;
    mac: string;
    state: "down" | "up";
    timestamp: number;
}
export interface target {
    id: string;
    hostname: string;
    os: string;
    active: boolean;
    interfaces: Array<targetInterface>;
    users: Array<targetUser>;
    apps: Array<targetApp>;
    lastPing: number;
    dateAdded: number;
}

export interface initTarget extends target {
    id: undefined;
}
export interface targetRequest extends Request {
    target: target;
}

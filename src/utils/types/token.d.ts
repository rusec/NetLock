import { Request } from "express";
import { targetUser } from "./target";

export interface tokenInfo {
    isBeacon: boolean;
}

export interface beaconToken extends tokenInfo {
    id: string;
    dateAdded: string;
    ip: string;
}
export interface userToken extends tokenInfo {
    id: string;
    dateAdded: string;
    ip: string;
}

export interface AuthenticatedRequest extends Request {
    client?: beaconToken | userToken;
}

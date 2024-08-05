import axios from "axios";
import { target, targetRequest } from "../Target";
import { Event, LogEvent } from "../Events";
import { ValidationErrorItem } from "joi";
import { Beacon } from "../Beacon";

export namespace API {
    export class DbTargetError extends Error {
        hostname: string;
        constructor(hostname: string, message: string) {
            super(message);
            this.hostname = hostname;
        }
        toJson(): DbTargetErrorResponse {
            return {
                status: "error",
                hostname: this.hostname,
                message: this.message,
            };
        }
    }
    export interface ErrorResponse {
        status: "error";
        error: string;
    }
    export interface ValidationError {
        status: "error";
        message: string;
        error: ValidationErrorItem | ValidationErrorItem[];
    }
    export interface DbTargetErrorResponse {
        status: "error";
        hostname: string;
        message: string;
    }
    export interface SuccessResponse {
        status: "success";
        message: string;
    }
    export interface TargetsAndLogsResponse {
        targets: Beacon.Data[];
        logs: LogEvent.Log[];
    }
    export interface StatusResponse {
        status: string;
    }
    export interface TokenResponse {
        token: string;
    }
}

class Api {
    url: string;
    constructor(url: string) {
        this.url = url;
    }
    endpoint(endpoint: string) {
        return this.url + endpoint;
    }
    async deleteTarget(token: string) {
        try {
            let result = await axios.delete<API.SuccessResponse | API.ErrorResponse>(this.endpoint("/api/beacon/"), {
                headers: {
                    Authorization: token,
                },
            });
            return result.data;
        } catch (error) {
            let e = error as any;
            if (e.response?.data) throw new Error(`API Error: ${JSON.stringify(e.response.data, null, 4)}`);
            throw e;
        }
    }
    async requestToken(key: string, info: Beacon.Init) {
        try {
            let { data } = await axios.post<API.TokenResponse>(this.endpoint("/api/beacon/register"), info, {
                headers: {
                    Authorization: key,
                },
            });

            return data.token;
        } catch (error) {
            let e = error as any;
            if (e.response?.data) throw new Error(`API Error: ${JSON.stringify(e.response.data, null, 4)}`);
            throw e;
        }
    }
    async postEvent(event: Event, token: string) {
        try {
            let result = await axios.post<API.DbTargetErrorResponse | API.ValidationError | API.SuccessResponse | API.ErrorResponse>(
                this.endpoint("/api/beacon/event"),
                event,
                {
                    headers: {
                        Authorization: token,
                    },
                }
            );
            return result.data;
        } catch (error) {
            let e = error as any;
            if (e.response?.data) throw new Error(`API Error: ${JSON.stringify(e.response.data, null, 4)}`);
            throw e;
        }
    }
}
export default Api;

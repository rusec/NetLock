import axios from "axios";
import { targetRequest } from "../Target";
import { Event } from "../Events";

export namespace API {
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
    async requestToken(key: string, info: targetRequest) {
        try {
            let result = await axios.post<API.TokenResponse>(this.endpoint("/api/beacon/register"), info, {
                headers: {
                    Authorization: key,
                },
            });

            return result.data.token;
        } catch (error) {
            let e = error as any;
            if (e.response?.data) throw new Error(`API Error: ${JSON.stringify(e.response.data)}`);
            throw e;
        }
    }
    async postEvent(event: Event, token: string) {
        try {
            let result = await axios.post<API.StatusResponse>(this.endpoint("/api/beacon/event"), event, {
                headers: {
                    Authorization: token,
                },
            });
            return result.data;
        } catch (error) {
            let e = error as any;
            if (e.response?.data) throw new Error(`API Error: ${JSON.stringify(e.response.data)}`);
            throw e;
        }
    }
}
export default Api;

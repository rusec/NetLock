import axios from "axios";
import { targetRequest } from "../Target";
import { Event } from "../Events";

export interface ApiStatusResponse {
    status: string;
}
interface ApiTokenResponse {
    token: string;
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
        let result = await axios.post<ApiTokenResponse>(this.endpoint("/api/beacon/register"), info, {
            headers: {
                Authorization: key,
            },
        });

        return result.data.token;
    }
    async postEvent(event: Event, token: string) {
        let result = await axios.post<ApiStatusResponse>(this.endpoint("/api/beacon/event"), event, {
            headers: {
                Authorization: token,
            },
        });
        return result.data;
    }
}
export default Api;

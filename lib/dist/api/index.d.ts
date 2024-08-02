import { targetRequest } from "../Target";
import { Event } from "../Events";
export declare namespace API {
    interface StatusResponse {
        status: string;
    }
    interface TokenResponse {
        token: string;
    }
}
declare class Api {
    url: string;
    constructor(url: string);
    endpoint(endpoint: string): string;
    requestToken(key: string, info: targetRequest): Promise<string>;
    postEvent(event: Event, token: string): Promise<API.StatusResponse>;
}
export default Api;
//# sourceMappingURL=index.d.ts.map
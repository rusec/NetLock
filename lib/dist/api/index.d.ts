import { targetRequest } from "../Target";
import { Event } from "../Events";
export interface ApiStatusResponse {
    status: string;
}
declare class Api {
    url: string;
    constructor(url: string);
    endpoint(endpoint: string): string;
    requestToken(key: string, info: targetRequest): Promise<string>;
    postEvent(event: Event, token: string): Promise<ApiStatusResponse>;
}
export default Api;
//# sourceMappingURL=index.d.ts.map
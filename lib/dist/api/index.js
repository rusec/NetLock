"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
class Api {
    url;
    constructor(url) {
        this.url = url;
    }
    endpoint(endpoint) {
        return this.url + endpoint;
    }
    async requestToken(key, info) {
        try {
            let result = await axios_1.default.post(this.endpoint("/api/beacon/register"), info, {
                headers: {
                    Authorization: key,
                },
            });
            return result.data.token;
        }
        catch (error) {
            let e = error;
            if (e.response?.data)
                throw new Error(`API Error: ${JSON.stringify(e.response.data)}`);
            throw e;
        }
    }
    async postEvent(event, token) {
        try {
            let result = await axios_1.default.post(this.endpoint("/api/beacon/event"), event, {
                headers: {
                    Authorization: token,
                },
            });
            return result.data;
        }
        catch (error) {
            let e = error;
            if (e.response?.data)
                throw new Error(`API Error: ${JSON.stringify(e.response.data)}`);
            throw e;
        }
    }
}
exports.default = Api;

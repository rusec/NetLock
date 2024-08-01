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
        let result = await axios_1.default.post(this.endpoint("/api/beacon/register"), info, {
            headers: {
                Authorization: key,
            },
        });
        return result.data.token;
    }
    async postEvent(event, token) {
        let result = await axios_1.default.post(this.endpoint("/api/beacon/event"), event, {
            headers: {
                Authorization: token,
            },
        });
        return result.data;
    }
}
exports.default = Api;

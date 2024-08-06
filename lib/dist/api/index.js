"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.API = void 0;
const axios_1 = __importDefault(require("axios"));
var API;
(function (API) {
    class DbTargetError extends Error {
        hostname;
        constructor(hostname, message) {
            super(message);
            this.hostname = hostname;
        }
        toJson() {
            return {
                status: "error",
                hostname: this.hostname,
                message: this.message,
            };
        }
    }
    API.DbTargetError = DbTargetError;
})(API || (exports.API = API = {}));
class Api {
    url;
    constructor(url) {
        this.url = url;
    }
    endpoint(endpoint) {
        return this.url + endpoint;
    }
    async addUser(user, token) {
        try {
            let result = await axios_1.default.post(this.endpoint("/api/beacon/add/user"), user, {
                headers: {
                    Authorization: token,
                },
            });
            return result.data;
        }
        catch (error) {
            let e = error;
            if (e.response?.data)
                throw new Error(`API Error: ${JSON.stringify(e.response.data, null, 4)}`);
            throw e;
        }
    }
    async addProcess(process, token) {
        try {
            let result = await axios_1.default.post(this.endpoint("/api/beacon/add/app"), process, {
                headers: {
                    Authorization: token,
                },
            });
            return result.data;
        }
        catch (error) {
            let e = error;
            if (e.response?.data)
                throw new Error(`API Error: ${JSON.stringify(e.response.data, null, 4)}`);
            throw e;
        }
    }
    async addInterface(iface, token) {
        try {
            let result = await axios_1.default.post(this.endpoint("/api/beacon/add/interface"), iface, {
                headers: {
                    Authorization: token,
                },
            });
            return result.data;
        }
        catch (error) {
            let e = error;
            if (e.response?.data)
                throw new Error(`API Error: ${JSON.stringify(e.response.data, null, 4)}`);
            throw e;
        }
    }
    async deleteTarget(token) {
        try {
            let result = await axios_1.default.delete(this.endpoint("/api/beacon/"), {
                headers: {
                    Authorization: token,
                },
            });
            return result.data;
        }
        catch (error) {
            let e = error;
            if (e.response?.data)
                throw new Error(`API Error: ${JSON.stringify(e.response.data, null, 4)}`);
            throw e;
        }
    }
    async requestToken(key, info) {
        try {
            let { data } = await axios_1.default.post(this.endpoint("/api/beacon/register"), info, {
                headers: {
                    Authorization: key,
                },
            });
            return data.token;
        }
        catch (error) {
            let e = error;
            if (e.response?.data)
                throw new Error(`API Error: ${JSON.stringify(e.response.data, null, 4)}`);
            throw e;
        }
    }
    async initRequest(init, token) {
        try {
            let { data } = await axios_1.default.post(this.endpoint("/api/beacon/init"), init, {
                headers: {
                    Authorization: token,
                },
            });
            return data;
        }
        catch (error) {
            let e = error;
            if (e.response?.data)
                throw new Error(`API Error: ${JSON.stringify(e.response.data, null, 4)}`);
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
                throw new Error(`API Error: ${JSON.stringify(e.response.data, null, 4)}`);
            throw e;
        }
    }
}
exports.default = Api;

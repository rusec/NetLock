"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.targetSchema = exports.targetRequestSchema = exports.targetInterfaceSchema = exports.targetAppSchema = exports.targetUserSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.targetUserSchema = joi_1.default.object({
    name: joi_1.default.string().required(),
    lastLogin: joi_1.default.number(),
    lastUpdate: joi_1.default.number(),
    loggedIn: joi_1.default.boolean(),
});
exports.targetAppSchema = joi_1.default.object({
    name: joi_1.default.string().required(),
    running: joi_1.default.boolean(),
    version: joi_1.default.string().required(),
});
exports.targetInterfaceSchema = joi_1.default.object({
    ip: joi_1.default.string().ip().required(),
    mac: joi_1.default.string().required(),
    state: joi_1.default.string().valid("down", "up").required(),
});
exports.targetRequestSchema = joi_1.default.object({
    hostname: joi_1.default.string().required(),
    os: joi_1.default.string().required(),
    active: joi_1.default.boolean().required(),
    interfaces: joi_1.default.array().items(exports.targetInterfaceSchema).required(),
    users: joi_1.default.array().items(exports.targetUserSchema).required(),
    apps: joi_1.default.array().items(exports.targetAppSchema).required(),
});
exports.targetSchema = joi_1.default.object({
    id: joi_1.default.string().required(),
    hostname: joi_1.default.string().required(),
    os: joi_1.default.string().required(),
    active: joi_1.default.boolean().required(),
    interfaces: joi_1.default.array().items(exports.targetInterfaceSchema).required(),
    users: joi_1.default.array().items(exports.targetUserSchema).required(),
    apps: joi_1.default.array().items(exports.targetAppSchema).required(),
    lastPing: joi_1.default.number().required(),
    dateAdded: joi_1.default.number().required(),
});

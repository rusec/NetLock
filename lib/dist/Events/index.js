"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventSchema = exports.UserEvent = exports.NetworkEvent = exports.KernelEvent = exports.RegEditEvent = exports.ProcessEvent = exports.FileEvent = void 0;
const joi_1 = __importDefault(require("joi"));
const schemas_1 = require("../Beacon/schemas");
var FileEvent;
(function (FileEvent) {
    let Types;
    (function (Types) {
        Types["FileAccessed"] = "fileAccessed";
        Types["FileCreated"] = "fileCreated";
        Types["FileDeleted"] = "fileDeleted";
        Types["FilePermission"] = "filePermission";
    })(Types = FileEvent.Types || (FileEvent.Types = {}));
    FileEvent.fileEventSchema = joi_1.default.object({
        event: joi_1.default.string().valid(FileEvent.Types.FileAccessed, FileEvent.Types.FileCreated, FileEvent.Types.FileDeleted, FileEvent.Types.FilePermission),
        user: joi_1.default.string().allow(null),
        description: joi_1.default.string(),
        file: joi_1.default.string(),
        permissions: joi_1.default.string(),
        path: joi_1.default.string(),
    });
})(FileEvent || (exports.FileEvent = FileEvent = {}));
var ProcessEvent;
(function (ProcessEvent) {
    let Types;
    (function (Types) {
        Types["ProcessCreated"] = "processCreated";
        Types["ProcessEnded"] = "processEnded";
    })(Types = ProcessEvent.Types || (ProcessEvent.Types = {}));
    ProcessEvent.processEventSchema = joi_1.default.object({
        event: joi_1.default.string().valid(ProcessEvent.Types.ProcessCreated, ProcessEvent.Types.ProcessEnded).required(),
        user: joi_1.default.string().allow(null),
        description: joi_1.default.string(),
        pid: joi_1.default.string().required(),
        name: joi_1.default.string().required(),
        descriptor: schemas_1.applicationSpawnSchema,
    });
})(ProcessEvent || (exports.ProcessEvent = ProcessEvent = {}));
var RegEditEvent;
(function (RegEditEvent) {
    let Types;
    (function (Types) {
        Types["RegEdit"] = "regEdit";
    })(Types = RegEditEvent.Types || (RegEditEvent.Types = {}));
    RegEditEvent.regEditEventSchema = joi_1.default.object({
        event: joi_1.default.string().valid(RegEditEvent.Types.RegEdit),
        user: joi_1.default.string().allow(null),
        description: joi_1.default.string(),
        key: joi_1.default.string(),
        value: joi_1.default.string(),
    });
})(RegEditEvent || (exports.RegEditEvent = RegEditEvent = {}));
var KernelEvent;
(function (KernelEvent) {
    let Types;
    (function (Types) {
        Types["Kernel"] = "kernel";
        Types["Config"] = "config";
    })(Types = KernelEvent.Types || (KernelEvent.Types = {}));
    KernelEvent.kernelEventSchema = joi_1.default.object({
        event: joi_1.default.string().valid(KernelEvent.Types.Kernel, KernelEvent.Types.Config),
        user: joi_1.default.string().allow(null),
        description: joi_1.default.string(),
        file: joi_1.default.string(),
        path: joi_1.default.string(),
    });
})(KernelEvent || (exports.KernelEvent = KernelEvent = {}));
var NetworkEvent;
(function (NetworkEvent) {
    let Types;
    (function (Types) {
        Types["InterfaceDown"] = "interfaceDown";
        Types["InterfaceUp"] = "interfaceUp";
        Types["InterfaceCreated"] = "interfaceCreated";
        Types["InterfaceDeleted"] = "interfaceDeleted";
        Types["InterfaceIpChange"] = "interfaceIpChange";
    })(Types = NetworkEvent.Types || (NetworkEvent.Types = {}));
    NetworkEvent.networkEventSchema = joi_1.default.object({
        event: joi_1.default.string().valid(NetworkEvent.Types.InterfaceDown, NetworkEvent.Types.InterfaceUp, NetworkEvent.Types.InterfaceCreated, NetworkEvent.Types.InterfaceDeleted, NetworkEvent.Types.InterfaceIpChange),
        user: joi_1.default.string().allow(null),
        description: joi_1.default.string(),
        mac: joi_1.default.string(),
        version: joi_1.default.string().valid("4", "6"),
        state: joi_1.default.string().valid("up", "down"),
        ip: joi_1.default.string().ip(),
        subnet: joi_1.default.string(),
        descriptor: schemas_1.networkInterfaceSchema,
    });
})(NetworkEvent || (exports.NetworkEvent = NetworkEvent = {}));
var UserEvent;
(function (UserEvent) {
    let Types;
    (function (Types) {
        Types["UserLoggedIn"] = "userLoggedIn";
        Types["UserLoggedOut"] = "userLoggedOut";
        Types["UserCreated"] = "userCreated";
        Types["UserDeleted"] = "userDeleted";
        Types["UserGroupChange"] = "userGroupChange";
    })(Types = UserEvent.Types || (UserEvent.Types = {}));
    UserEvent.userEventSchema = joi_1.default.object({
        event: joi_1.default.string().valid(UserEvent.Types.UserLoggedIn, UserEvent.Types.UserLoggedOut, UserEvent.Types.UserCreated, UserEvent.Types.UserDeleted, UserEvent.Types.UserGroupChange),
        user: joi_1.default.string(),
        description: joi_1.default.string(),
        loggedIn: joi_1.default.boolean(),
        userLogin: schemas_1.userLoginSchema,
    });
})(UserEvent || (exports.UserEvent = UserEvent = {}));
exports.eventSchema = joi_1.default.alternatives().try(ProcessEvent.processEventSchema, UserEvent.userEventSchema, NetworkEvent.networkEventSchema, RegEditEvent.regEditEventSchema, FileEvent.fileEventSchema, KernelEvent.kernelEventSchema);

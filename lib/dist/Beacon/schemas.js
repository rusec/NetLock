"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initRequestSchema = exports.applicationSchema = exports.ServiceSchema = exports.portSchema = exports.applicationSpawnSchema = exports.userSchema = exports.userLoginSchema = exports.networkInterfaceSchema = exports.initSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.initSchema = joi_1.default.object({
    os: joi_1.default.object({
        platform: joi_1.default.string().required(),
        distro: joi_1.default.string().allow("").optional(),
        release: joi_1.default.string().allow("").optional(),
        codename: joi_1.default.string().allow("").optional(),
        kernel: joi_1.default.string().allow("").optional(),
        arch: joi_1.default.string().allow("").optional(),
        hostname: joi_1.default.string().allow("").optional(),
        fqdn: joi_1.default.string().allow("").optional(),
        codepage: joi_1.default.string().allow("").optional(),
        logofile: joi_1.default.string().allow("").optional(),
        serial: joi_1.default.string().allow("").optional(),
        build: joi_1.default.string().allow("").optional(),
        servicepack: joi_1.default.string().allow("").optional(),
        uefi: joi_1.default.boolean().allow(null).optional(),
        hypervisor: joi_1.default.boolean().optional(),
        remoteSession: joi_1.default.boolean().optional(),
    })
        .required()
        .keys()
        .unknown(true),
    hardware: joi_1.default.object({
        cpu: joi_1.default.string().required(),
        mem: joi_1.default.string().required(),
    })
        .required()
        .keys()
        .unknown(true),
    hostname: joi_1.default.string().required(),
});
exports.networkInterfaceSchema = joi_1.default.object({
    iface: joi_1.default.string().optional(),
    ifaceName: joi_1.default.string().optional(),
    default: joi_1.default.boolean().optional(),
    state: joi_1.default.string().valid("up", "down").optional(),
    ip4: joi_1.default.string()
        .ip({ version: ["ipv4"] })
        .required(),
    ip4subnet: joi_1.default.string().optional(),
    ip6: joi_1.default.string()
        .ip({ version: ["ipv6"] })
        .optional(),
    ip6subnet: joi_1.default.string().optional(),
    mac: joi_1.default.string().required(),
    internal: joi_1.default.boolean().optional(),
    virtual: joi_1.default.boolean().optional(),
    operstate: joi_1.default.string().optional(),
    type: joi_1.default.string().optional(),
    duplex: joi_1.default.string().optional(),
    mtu: joi_1.default.number().allow(null).optional(),
    speed: joi_1.default.number().allow(null).optional(),
    dhcp: joi_1.default.boolean().optional(),
    dnsSuffix: joi_1.default.string().optional(),
    ieee8021xAuth: joi_1.default.string().optional(),
    ieee8021xState: joi_1.default.string().optional(),
    carrierChanges: joi_1.default.number().optional(),
})
    .keys()
    .unknown(true);
exports.userLoginSchema = joi_1.default.object({
    name: joi_1.default.string().required(),
    tty: joi_1.default.string().optional(),
    date: joi_1.default.number().required(),
    ip: joi_1.default.string()
        .ip({ version: ["ipv4"] })
        .optional(),
    command: joi_1.default.string().optional(),
})
    .keys()
    .unknown(true);
exports.userSchema = joi_1.default.object({
    name: joi_1.default.string().required(),
    loggedIn: joi_1.default.boolean().required(),
    lastUpdate: joi_1.default.number().required(),
    logins: joi_1.default.array().items(exports.userLoginSchema).required(),
});
exports.applicationSpawnSchema = joi_1.default.object({
    pid: joi_1.default.number().required(),
    parentPid: joi_1.default.number().optional(),
    name: joi_1.default.string().required(),
    cpu: joi_1.default.number().optional(),
    cpuu: joi_1.default.number().optional(),
    cpus: joi_1.default.number().optional(),
    mem: joi_1.default.number().optional(),
    priority: joi_1.default.number().optional(),
    memVsz: joi_1.default.number().optional(),
    memRss: joi_1.default.number().optional(),
    nice: joi_1.default.number().optional(),
    started: joi_1.default.string().allow("").optional(),
    state: joi_1.default.string().allow("").optional(),
    tty: joi_1.default.string().allow("").optional(),
    user: joi_1.default.string().allow("").optional(),
    command: joi_1.default.string().allow("").optional(),
    params: joi_1.default.string().allow("").optional(),
    path: joi_1.default.string().allow("").optional(),
})
    .keys()
    .unknown(true);
exports.portSchema = joi_1.default.object({
    protocol: joi_1.default.string(),
    localAddress: joi_1.default.string()
        .ip({ version: ["ipv4", "ipv6"] })
        .required(),
    localPort: joi_1.default.string().required(),
    peerAddress: joi_1.default.string()
        .ip({ version: ["ipv4", "ipv6"] })
        .optional(),
    peerPort: joi_1.default.string().optional(),
    state: joi_1.default.string(),
    pid: joi_1.default.number().optional(),
    process: joi_1.default.string().allow(""),
})
    .keys()
    .unknown(true);
exports.ServiceSchema = joi_1.default.object({
    port: exports.portSchema,
    service: exports.applicationSpawnSchema.optional(),
});
exports.applicationSchema = joi_1.default.object({
    name: joi_1.default.string().required(),
    running: joi_1.default.boolean().required(),
    spawns: joi_1.default.array().items(exports.applicationSpawnSchema).required(),
});
exports.initRequestSchema = joi_1.default.object({
    apps: joi_1.default.array().items(exports.applicationSchema).required(),
    users: joi_1.default.array().items(exports.userSchema).required(),
    networkInterfaces: joi_1.default.array().items(exports.networkInterfaceSchema).required(),
});

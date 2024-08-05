import Joi from "joi";

export const initSchema = Joi.object({
    os: Joi.object({
        platform: Joi.string().required(),
        distro: Joi.string().allow("").optional(),
        release: Joi.string().allow("").optional(),
        codename: Joi.string().allow("").optional(),
        kernel: Joi.string().allow("").optional(),
        arch: Joi.string().allow("").optional(),
        hostname: Joi.string().allow("").optional(),
        fqdn: Joi.string().allow("").optional(),
        codepage: Joi.string().allow("").optional(),
        logofile: Joi.string().allow("").optional(),
        serial: Joi.string().allow("").optional(),
        build: Joi.string().allow("").optional(),
        servicepack: Joi.string().allow("").optional(),
        uefi: Joi.boolean().allow(null).optional(),
        hypervisor: Joi.boolean().optional(),
        remoteSession: Joi.boolean().optional(),
    })
        .required()
        .keys()
        .unknown(true),
    hardware: Joi.object({
        cpu: Joi.string().required(),
        mem: Joi.string().required(),
    })
        .required()
        .keys()
        .unknown(true),
    hostname: Joi.string().required(),
});
export const networkInterfaceSchema = Joi.object({
    iface: Joi.string().optional(),
    ifaceName: Joi.string().optional(),
    default: Joi.boolean().optional(),
    state: Joi.string().valid("up", "down").optional(),
    ip4: Joi.string()
        .ip({ version: ["ipv4"] })
        .required(),
    ip4subnet: Joi.string().optional(),
    ip6: Joi.string()
        .ip({ version: ["ipv6"] })
        .optional(),
    ip6subnet: Joi.string().optional(),
    mac: Joi.string().required(),
    internal: Joi.boolean().optional(),
    virtual: Joi.boolean().optional(),
    operstate: Joi.string().optional(),
    type: Joi.string().optional(),
    duplex: Joi.string().optional(),
    mtu: Joi.number().allow(null).optional(),
    speed: Joi.number().allow(null).optional(),
    dhcp: Joi.boolean().optional(),
    dnsSuffix: Joi.string().optional(),
    ieee8021xAuth: Joi.string().optional(),
    ieee8021xState: Joi.string().optional(),
    carrierChanges: Joi.number().optional(),
})
    .keys()
    .unknown(true);
export const userLoginSchema = Joi.object({
    name: Joi.string().required(),
    tty: Joi.string().optional(),
    date: Joi.number().required(),
    ip: Joi.string()
        .ip({ version: ["ipv4"] })
        .optional(),
    command: Joi.string().optional(),
})
    .keys()
    .unknown(true);
export const userSchema = Joi.object({
    name: Joi.string().required(),
    loggedIn: Joi.boolean().required(),
    lastUpdate: Joi.number().required(),
    logins: Joi.array().items(userLoginSchema).required(),
});
export const applicationSpawnSchema = Joi.object({
    pid: Joi.number().required(),
    parentPid: Joi.number().optional(),
    name: Joi.string().required(),
    cpu: Joi.number().optional(),
    cpuu: Joi.number().optional(),
    cpus: Joi.number().optional(),
    mem: Joi.number().optional(),
    priority: Joi.number().optional(),
    memVsz: Joi.number().optional(),
    memRss: Joi.number().optional(),
    nice: Joi.number().optional(),
    started: Joi.string().allow("").optional(),
    state: Joi.string().allow("").optional(),
    tty: Joi.string().allow("").optional(),
    user: Joi.string().allow("").optional(),
    command: Joi.string().allow("").optional(),
    params: Joi.string().allow("").optional(),
    path: Joi.string().allow("").optional(),
})
    .keys()
    .unknown(true);
export const applicationSchema = Joi.object({
    name: Joi.string().required(),
    running: Joi.boolean().required(),
    spawns: Joi.array().items(applicationSpawnSchema).required(),
});

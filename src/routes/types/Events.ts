import Joi from "joi";

type fileEventType = "fileAccessed" | "fileCreated" | "fileDeleted" | "filePermission";

type processEventType = "processCreated" | "processEnded";

type systemEventType = "regEdit" | "kernel" | "config" | "interfaceUp" | "interfaceDown" | "interfaceIpChange";

type userEventType = "userLoggedIn" | "userLoggedOut" | "userCreated" | "userDeleted" | "userGroupChange";

export type event = processEventType | fileEventType | systemEventType | userEventType;

export interface targetEvent {
    event: event;
    user: string | undefined;
    timestamp: number;
    description: string;
}
export interface targetProcessEvent extends targetEvent {
    pid: string;
    name: string;
}
export interface targetUserEvent extends targetEvent {
    user: string;
    loggedIn: string;
}
export interface targetNetworkEvent extends targetEvent {
    mac: string;
    state: "up" | "down";
    ip: string;
}
export interface targetRegEditEvent extends targetEvent {
    key: string;
    value: string;
}
// Any /etc file config change
export interface targetConfigEditEvent extends targetEvent {
    file: string;
    path: string;
}
export interface targetFileEvent extends targetEvent {
    file: string;
    // Linux style for easier reading
    permissions: string;
    path: string;
}

export interface targetSystemEvent extends targetEvent {
    systemfile: string;
}

export interface targetLogEvent extends targetEvent {
    message: string;
    id: string;
}

const fileEventType = Joi.string().valid("fileAccessed", "fileCreated", "fileDeleted", "filePermission");
const processEventType = Joi.string().valid("processCreated", "processEnded");
const systemEventType = Joi.string().valid("regEdit", "kernel", "config", "interfaceUp", "interfaceDown", "interfaceIpChange");
const userEventType = Joi.string().valid("userLoggedIn", "userLoggedOut", "userCreated", "userDeleted", "userGroupChange");

const event = Joi.alternatives().try(fileEventType, processEventType, systemEventType, userEventType);

const targetEventSchema = Joi.object({
    event: event.required(),
    user: Joi.string().allow(null),
    timestamp: Joi.number().required(),
    description: Joi.string().required(),
});

const targetProcessEventSchema = targetEventSchema.keys({
    pid: Joi.string().required(),
    name: Joi.string().required(),
});

const targetUserEventSchema = targetEventSchema.keys({
    user: Joi.string().required(),
    loggedIn: Joi.string().required(),
});

const targetNetworkEventSchema = targetEventSchema.keys({
    mac: Joi.string().required(),
    state: Joi.string().valid("up", "down").required(),
    ip: Joi.string().required(),
});

const targetRegEditEventSchema = targetEventSchema.keys({
    key: Joi.string().required(),
    value: Joi.string().required(),
});
const targetConfigEditEventSchema = targetEventSchema.keys({
    file: Joi.string().required(),
    path: Joi.string().required(),
});

const targetFileEventSchema = targetEventSchema.keys({
    file: Joi.string().required(),
    path: Joi.string().required(),
});

const targetSystemEventSchema = targetEventSchema.keys({
    systemfile: Joi.string().required(),
});
const eventSchema = Joi.alternatives().try(
    targetProcessEventSchema,
    targetUserEventSchema,
    targetNetworkEventSchema,
    targetRegEditEventSchema,
    targetFileEventSchema,
    targetSystemEventSchema,
    targetConfigEditEventSchema
);
export { eventSchema };

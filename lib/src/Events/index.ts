import Joi from "joi";
import { ProcessInfo } from "../Beacon";
export interface Event {
    event: FileEvent.Types | ProcessEvent.Types | NetworkEvent.Types | KernelEvent.Types | RegEditEvent.Types | UserEvent.Types;
    user?: string | undefined;
    description: string;
}
export type EventTypes = FileEvent.Types | ProcessEvent.Types | NetworkEvent.Types | KernelEvent.Types | RegEditEvent.Types | UserEvent.Types;
export namespace FileEvent {
    export enum Types {
        FileAccessed = "fileAccessed",
        FileCreated = "fileCreated",
        FileDeleted = "fileDeleted",
        FilePermission = "filePermission",
    }

    export interface event extends Event {
        event: Types;
        file: string;
        permissions: string;
        path: string;
    }
    export interface document extends event {
        timestamp: number;
    }

    export const fileEventSchema = Joi.object({
        event: Joi.string().valid(
            FileEvent.Types.FileAccessed,
            FileEvent.Types.FileCreated,
            FileEvent.Types.FileDeleted,
            FileEvent.Types.FilePermission
        ),
        user: Joi.string().allow(null),
        description: Joi.string(),
        file: Joi.string(),
        permissions: Joi.string(),
        path: Joi.string(),
    });
}
export namespace ProcessEvent {
    export enum Types {
        ProcessCreated = "processCreated",
        ProcessEnded = "processEnded",
    }
    export interface event extends Event {
        event: Types;
        pid: string;
        name: string;
        descriptor: ProcessInfo.Info;
    }
    export interface document extends event {
        timestamp: number;
    }
    const processDescriptorSchema = Joi.object({
        pid: Joi.number().required(),
        name: Joi.string().required(),
        ppid: Joi.number(),
        cmd: Joi.string(),
        cpu: Joi.number(),
        memory: Joi.number(),
        uid: Joi.number(),
    });

    export const processEventSchema = Joi.object({
        event: Joi.string().valid(ProcessEvent.Types.ProcessCreated, ProcessEvent.Types.ProcessEnded).required(),
        user: Joi.string().allow(null),
        description: Joi.string(),
        pid: Joi.string().required(),
        name: Joi.string().required(),
        descriptor: processDescriptorSchema,
    });
}
export namespace RegEditEvent {
    export enum Types {
        RegEdit = "regEdit",
    }
    export interface event extends Event {
        event: Types;
        key: string;
        value: string;
    }
    export interface document extends event {
        timestamp: number;
    }
    export const regEditEventSchema = Joi.object({
        event: Joi.string().valid(RegEditEvent.Types.RegEdit),
        user: Joi.string().allow(null),
        description: Joi.string(),
        key: Joi.string(),
        value: Joi.string(),
    });
}
export namespace KernelEvent {
    export enum Types {
        Kernel = "kernel",
        Config = "config",
    }
    export interface event extends Event {
        event: Types;
        file: string;
        path: string;
    }
    export interface document extends event {
        timestamp: number;
    }
    export const kernelEventSchema = Joi.object({
        event: Joi.string().valid(KernelEvent.Types.Kernel, KernelEvent.Types.Config),
        user: Joi.string().allow(null),
        description: Joi.string(),
        file: Joi.string(),
        path: Joi.string(),
    });
}
export namespace NetworkEvent {
    export enum Types {
        InterfaceDown = "interfaceDown",
        InterfaceUp = "interfaceUp",
        InterfaceCreated = "interfaceCreated",
        InterfaceDeleted = "interfaceDeleted",
        InterfaceIpChange = "interfaceIpChange",
    }
    export interface event extends Event {
        event: Types;
        mac: string;
        state: "up" | "down";
        ip: string;
    }
    export interface document extends event {
        timestamp: number;
    }
    export const networkEventSchema = Joi.object({
        event: Joi.string().valid(
            NetworkEvent.Types.InterfaceDown,
            NetworkEvent.Types.InterfaceUp,
            NetworkEvent.Types.InterfaceCreated,
            NetworkEvent.Types.InterfaceDeleted,
            NetworkEvent.Types.InterfaceIpChange
        ),
        user: Joi.string().allow(null),
        description: Joi.string(),
        mac: Joi.string(),
        state: Joi.string().valid("up", "down"),
        ip: Joi.string(),
    });
}
export namespace UserEvent {
    export enum Types {
        UserLoggedIn = "userLoggedIn",
        UserLoggedOut = "userLoggedOut",
        UserCreated = "userCreated",
        UserDeleted = "userDeleted",
        UserGroupChange = "userGroupChange",
    }
    export interface event extends Event {
        event: Types;
        loggedIn: boolean;
        user: string;
    }
    export interface document extends event {
        timestamp: number;
    }
    export const userEventSchema = Joi.object({
        event: Joi.string().valid(
            UserEvent.Types.UserLoggedIn,
            UserEvent.Types.UserLoggedOut,
            UserEvent.Types.UserCreated,
            UserEvent.Types.UserDeleted,
            UserEvent.Types.UserGroupChange
        ),
        user: Joi.string(),
        description: Joi.string(),
        loggedIn: Joi.boolean(),
    });
}
export namespace LogEvent {
    export interface Log extends Event {
        message: string;
        id: string;
        targetId: string;
        // logs the event as urgent and needs to be looked at
        urgent: boolean;
        timestamp: number;
    }
    export interface BeaconEvent extends Event {
        message: string;
        urgent: boolean;
    }
}
export const eventSchema = Joi.alternatives().try(
    ProcessEvent.processEventSchema,
    UserEvent.userEventSchema,
    NetworkEvent.networkEventSchema,
    RegEditEvent.regEditEventSchema,
    FileEvent.fileEventSchema,
    KernelEvent.kernelEventSchema
);

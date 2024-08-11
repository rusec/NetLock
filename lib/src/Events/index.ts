import Joi from "joi";
import { Beacon } from "../Beacon";
import { applicationSpawnSchema, networkInterfaceSchema, ServiceSchema, userLoginSchema } from "../Beacon/schemas";

export interface Event {
    event:
        | FileEvent.Types
        | ProcessEvent.Types
        | NetworkInterfaceEvent.Types
        | KernelEvent.Types
        | RegEditEvent.Types
        | UserEvent.Types
        | PortEvent.Types;
    user?: string | undefined;
    description: string;
}
export type EventTypes =
    | FileEvent.Types
    | ProcessEvent.Types
    | NetworkInterfaceEvent.Types
    | KernelEvent.Types
    | RegEditEvent.Types
    | UserEvent.Types
    | PortEvent.Types;
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
        descriptor: Beacon.applicationSpawn;
    }
    export interface document extends event {
        timestamp: number;
    }

    export const processEventSchema = Joi.object({
        event: Joi.string().valid(ProcessEvent.Types.ProcessCreated, ProcessEvent.Types.ProcessEnded).required(),
        user: Joi.string().allow(null),
        description: Joi.string(),
        pid: Joi.string().required(),
        name: Joi.string().required(),
        descriptor: applicationSpawnSchema,
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
export namespace PortEvent {
    export enum Types {
        PortClosed = "portClosed",
        PortOpened = "portOpened",
        PortServiceChange = "portServiceChanged",
    }
    export interface event extends Event {
        event: Types;
        serviceName: string;
        port: number;
        portInfo: Beacon.service;
    }
    export const portEventSchema = Joi.object({
        event: Joi.string().valid(PortEvent.Types.PortClosed, PortEvent.Types.PortOpened, PortEvent.Types.PortServiceChange),
        serviceName: Joi.string().allow(""),
        portNumber: Joi.number(),
        portInfo: ServiceSchema,
        service: Joi.string().allow(""),
    });
}

export namespace NetworkInterfaceEvent {
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
        ip?: string;
        version?: "4" | "6";
        subnet?: string;
        descriptor: Beacon.networkInterface;
    }
    export interface document extends event {
        timestamp: number;
    }
    export const networkEventSchema = Joi.object({
        event: Joi.string().valid(
            NetworkInterfaceEvent.Types.InterfaceDown,
            NetworkInterfaceEvent.Types.InterfaceUp,
            NetworkInterfaceEvent.Types.InterfaceCreated,
            NetworkInterfaceEvent.Types.InterfaceDeleted,
            NetworkInterfaceEvent.Types.InterfaceIpChange
        ),
        user: Joi.string().allow(null),
        description: Joi.string(),
        mac: Joi.string(),
        version: Joi.string().valid("4", "6"),
        state: Joi.string().valid("up", "down"),
        ip: Joi.string().ip(),
        subnet: Joi.string(),
        descriptor: networkInterfaceSchema,
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
        userLogin: Beacon.userLogin;
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
        userLogin: userLoginSchema,
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
    NetworkInterfaceEvent.networkEventSchema,
    RegEditEvent.regEditEventSchema,
    FileEvent.fileEventSchema,
    KernelEvent.kernelEventSchema,
    PortEvent.portEventSchema
);

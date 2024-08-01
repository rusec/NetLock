import Joi from "joi";
export interface Event {
    event: FileEvent.Types | ProcessEvent.Types | NetworkEvent.Types | KernelEvent.Types | RegEditEvent.Types | UserEvent.Types;
    user: string | undefined;
    description: string;
}
export type EventTypes = FileEvent.Types | ProcessEvent.Types | NetworkEvent.Types | KernelEvent.Types | RegEditEvent.Types | UserEvent.Types;
export declare namespace FileEvent {
    enum Types {
        FileAccessed = "fileAccessed",
        FileCreated = "fileCreated",
        FileDeleted = "fileDeleted",
        FilePermission = "filePermission"
    }
    interface event extends Event {
        event: Types;
        file: string;
        permissions: string;
        path: string;
    }
    interface document extends event {
        timestamp: number;
    }
    const fileEventSchema: Joi.ObjectSchema<any>;
}
export declare namespace ProcessEvent {
    enum Types {
        ProcessCreated = "processCreated",
        ProcessEnded = "processEnded"
    }
    interface event extends Event {
        event: Types;
        pid: string;
        name: string;
    }
    interface document extends event {
        timestamp: number;
    }
    const processEventSchema: Joi.ObjectSchema<any>;
}
export declare namespace RegEditEvent {
    enum Types {
        RegEdit = "regEdit"
    }
    interface event extends Event {
        event: Types;
        key: string;
        value: string;
    }
    interface document extends event {
        timestamp: number;
    }
    const regEditEventSchema: Joi.ObjectSchema<any>;
}
export declare namespace KernelEvent {
    enum Types {
        Kernel = "kernel",
        Config = "config"
    }
    interface event extends Event {
        event: Types;
        file: string;
        path: string;
    }
    interface document extends event {
        timestamp: number;
    }
    const kernelEventSchema: Joi.ObjectSchema<any>;
}
export declare namespace NetworkEvent {
    enum Types {
        InterfaceDown = "interfaceDown",
        InterfaceUp = "interfaceUp",
        InterfaceCreated = "interfaceCreated",
        InterfaceDeleted = "interfaceDeleted",
        InterfaceIpChange = "interfaceIpChange"
    }
    interface event extends Event {
        event: Types;
        mac: string;
        state: "up" | "down";
        ip: string;
    }
    interface document extends event {
        timestamp: number;
    }
    const networkEventSchema: Joi.ObjectSchema<any>;
}
export declare namespace UserEvent {
    enum Types {
        UserLoggedIn = "userLoggedIn",
        UserLoggedOut = "userLoggedOut",
        UserCreated = "userCreated",
        UserDeleted = "userDeleted",
        UserGroupChange = "userGroupChange"
    }
    interface event extends Event {
        event: Types;
        loggedIn: boolean;
        user: string;
    }
    interface document extends event {
        timestamp: number;
    }
    const userEventSchema: Joi.ObjectSchema<any>;
}
export declare namespace LogEvent {
    interface Log extends Event {
        message: string;
        id: string;
        targetId: string;
        urgent: boolean;
        timestamp: number;
    }
    interface BeaconEvent extends Event {
        message: string;
        urgent: boolean;
    }
}
export declare const eventSchema: Joi.AlternativesSchema<any>;
//# sourceMappingURL=index.d.ts.map
import React, { createContext, useContext, useState, useEffect, Dispatch, SetStateAction } from "react";
import { useAuth } from "./AuthProvider";
import { alert } from "../components/models/Alert";
import { EventTypes, LogEvent, FileEvent, ProcessEvent, RegEditEvent, KernelEvent, NetworkEvent, UserEvent } from "netlocklib/dist/Events";

// type fileEventType = "fileAccessed" | "fileCreated" | "fileDeleted" | "filePermission";

// type processEventType = "processCreated" | "processEnded";

// type systemEventType =
//     | "regEdit"
//     | "kernel"
//     | "config"
//     | "interfaceCreated"
//     | "interfaceDeleted"
//     | "interfaceUp"
//     | "interfaceDown"
//     | "interfaceIpChange";

// type userEventType = "userLoggedIn" | "userLoggedOut" | "userCreated" | "userDeleted" | "userGroupChange";

// export type event = processEventType | fileEventType | systemEventType | userEventType;

// export interface targetEvent {
//     event: event;
//     user: string | undefined;
//     timestamp: number;
//     description: string;
// }
// export interface targetLogEvent extends targetEvent {
//     message: string;
//     id: string;
//     targetId: string;
//     urgent: boolean;
// }
interface LogContext {
    logs: LogEvent.Log[];
    lastUpdatedID: LogEvent.Log | undefined;
    allEventTypes: EventTypes[];
    getLogBy: (options: { id?: string | string[]; event?: EventTypes | EventTypes[] }) => LogEvent.Log[];
}

// Create a Context object
const LogStreamContext = createContext<LogContext>({
    logs: [],
    lastUpdatedID: undefined,
    allEventTypes: [],
    getLogBy: (options: { id?: string | string[]; event?: EventTypes | EventTypes[] }) => [],
});

// Create a custom hook that allows easy access to the Context
export const useLogStream = () => {
    return useContext(LogStreamContext);
};
type Props = {
    setAlert: Dispatch<SetStateAction<alert | false>>;
    children: any;
};

// Create a Provider component
export const LogStreamProvider = ({ setAlert, children }: Props) => {
    const { token } = useAuth(); // get the token from useAuth
    const [logs, setLogs] = useState<LogEvent.Log[]>([]);
    const [lastUpdatedID, setLastUpdatedID] = useState<LogEvent.Log>();
    // Create an array of all event types
    const allEventTypes: EventTypes[] = [
        FileEvent.Types.FileAccessed,
        FileEvent.Types.FileCreated,
        FileEvent.Types.FileDeleted,
        FileEvent.Types.FilePermission,
        ProcessEvent.Types.ProcessCreated,
        ProcessEvent.Types.ProcessEnded,
        RegEditEvent.Types.RegEdit,
        KernelEvent.Types.Config,
        KernelEvent.Types.Kernel,
        NetworkEvent.Types.InterfaceCreated,
        NetworkEvent.Types.InterfaceDeleted,
        NetworkEvent.Types.InterfaceDown,
        NetworkEvent.Types.InterfaceIpChange,
        NetworkEvent.Types.InterfaceUp,
        UserEvent.Types.UserCreated,
        UserEvent.Types.UserDeleted,
        UserEvent.Types.UserGroupChange,
        UserEvent.Types.UserLoggedIn,
        UserEvent.Types.UserLoggedOut,
    ];
    useEffect(() => {
        const source = new EventSource("/api/user/logs/stream" + `?token=${token}`);

        source.onmessage = function (event) {
            const log: LogEvent.Log = JSON.parse(event.data);
            //might want to add host name to logs
            if (log.urgent) setAlert({ type: "warning", message: log.message, time: 3000 });
            setLogs((prevLogs) => {
                let newState = [...prevLogs];

                newState.push(log);

                return newState.sort((a, b) => a.timestamp - b.timestamp);
            });

            setLastUpdatedID(() => log);
        };

        return () => {
            source.close();
        };
    }, [token]);

    const getLogBy = (options: { id?: string | string[]; event?: EventTypes | EventTypes[] }): LogEvent.Log[] => {
        const { id, event } = options;
        let filteredLogs = logs;

        if (id) {
            if (Array.isArray(id)) filteredLogs = filteredLogs.filter((log) => id.includes(log.targetId));
            else filteredLogs = filteredLogs.filter((log) => log.targetId === id);
        }

        if (event) {
            if (Array.isArray(event)) filteredLogs = filteredLogs.filter((log) => event.includes(log.event));
            else filteredLogs = filteredLogs.filter((log) => log.event === event);
        }

        return filteredLogs;
    };
    const value = { logs, lastUpdatedID, getLogBy, allEventTypes };

    return <LogStreamContext.Provider value={value}>{children}</LogStreamContext.Provider>;
};

import React, { createContext, useContext, useState, useEffect, Dispatch, SetStateAction } from "react";
import { useAuth } from "./AuthProvider";
import { alert } from "../components/models/Alert";

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
export interface targetLogEvent extends targetEvent {
    message: string;
    id: string;
    targetId: string;
    urgent: boolean;
}
interface LogContext {
    logs: targetLogEvent[];
    lastUpdatedID: targetLogEvent | undefined;
    allEventTypes: event[];
    getLogBy: (options: { id?: string | string[]; event?: event | event[] }) => targetLogEvent[];
}

// Create a Context object
const LogStreamContext = createContext<LogContext>({
    logs: [],
    lastUpdatedID: undefined,
    allEventTypes: [],
    getLogBy: (options: { id?: string | string[]; event?: event | event[] }) => [],
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
    const [logs, setLogs] = useState<targetLogEvent[]>([]);
    const [lastUpdatedID, setLastUpdatedID] = useState<targetLogEvent>();
    // Create an array of all event types
    const allEventTypes: event[] = [
        "fileAccessed",
        "fileCreated",
        "fileDeleted",
        "filePermission",
        "processCreated",
        "processEnded",
        "regEdit",
        "kernel",
        "config",
        "interfaceUp",
        "interfaceDown",
        "interfaceIpChange",
        "userLoggedIn",
        "userLoggedOut",
        "userCreated",
        "userDeleted",
        "userGroupChange",
    ];
    useEffect(() => {
        const source = new EventSource("/api/user/logs/stream" + `?token=${token}`);

        source.onmessage = function (event) {
            const log: targetLogEvent = JSON.parse(event.data);
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

    const getLogBy = (options: { id?: string | string[]; event?: event | event[] }): targetLogEvent[] => {
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

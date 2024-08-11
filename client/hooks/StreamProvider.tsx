import React, { createContext, useContext, useState, useEffect, SetStateAction, Dispatch } from "react";
import { useAuth } from "./AuthProvider";
import {
    EventTypes,
    FileEvent,
    KernelEvent,
    LogEvent,
    NetworkInterfaceEvent,
    PortEvent,
    ProcessEvent,
    RegEditEvent,
    UserEvent,
} from "netlocklib/dist/Events";
import { alert } from "../components/models/Alert";
import { Beacon } from "netlocklib/dist/Beacon";

interface StreamContext {
    targets: Beacon.Data[];
    lastTargetUpdatedID: string;
    deleteTargetAction: (data: string) => Promise<void>;
    getTargetsByIdAndName: () => {
        name: string;
        id: string;
    }[];
    getTargetNameByID: (id: string) => string;
    logs: LogEvent.Log[];
    lastLogUpdatedID: LogEvent.Log | undefined;
    allEventTypes: EventTypes[];
    getLogBy: (options: { id?: string | string[]; event?: EventTypes | EventTypes[] }) => LogEvent.Log[];
}

// Create a Context object
const StreamContext = createContext<StreamContext>({
    targets: [],
    lastTargetUpdatedID: "",
    deleteTargetAction: async (data: string) => {},
    getTargetsByIdAndName: () => [],
    getTargetNameByID: (id: string) => "",
    logs: [],
    lastLogUpdatedID: undefined,
    allEventTypes: [],
    getLogBy: (options: { id?: string | string[]; event?: EventTypes | EventTypes[] }) => [],
});

// Create a custom hook that allows easy access to the Context
export const useStream = () => {
    return useContext(StreamContext);
};
type Props = {
    setAlert: Dispatch<SetStateAction<alert | false>>;
    setLoading: Dispatch<SetStateAction<boolean>>;
    children: any;
};

// Create a Provider component
export const StreamProvider = ({ setAlert, setLoading, children }: Props) => {
    const { token } = useAuth(); // get the token from useAuth
    const [targets, setTargets] = useState<Beacon.Data[]>([]);
    const [lastTargetUpdatedID, setLastTargetUpdatedID] = useState<string>("");
    const [logs, setLogs] = useState<LogEvent.Log[]>([]);
    const [lastLogUpdatedID, setLastLogUpdatedID] = useState<LogEvent.Log>();
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
        NetworkInterfaceEvent.Types.InterfaceCreated,
        NetworkInterfaceEvent.Types.InterfaceDeleted,
        NetworkInterfaceEvent.Types.InterfaceDown,
        NetworkInterfaceEvent.Types.InterfaceIpChange,
        NetworkInterfaceEvent.Types.InterfaceUp,
        PortEvent.Types.PortClosed,
        PortEvent.Types.PortOpened,
        PortEvent.Types.PortServiceChange,
        UserEvent.Types.UserCreated,
        UserEvent.Types.UserDeleted,
        UserEvent.Types.UserGroupChange,
        UserEvent.Types.UserLoggedIn,
        UserEvent.Types.UserLoggedOut,
    ];
    const getTargetNameByID = (id: string) => {
        const t = targets.find((v) => v.id === id);
        if (!t) return "not found";
        return t.hostname;
    };
    const deleteTargetAction = async (data: string) => {
        try {
            const response = await fetch("/api/user/targets/" + data, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    authorization: token,
                },
            });
            const res = await response.json();
            if (response.ok) {
                window.location.reload();
                return;
            }
            throw new Error(res.message);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        const source = new EventSource("/api/user/stream" + `?token=${token}`);
        const init = async () => {
            setLoading(true);
            const results = await fetch("/api/user/data/all", {
                headers: {
                    authorization: token,
                },
                method: "GET",
            });
            let { targets, logs } = await results.json();
            setTargets(targets);
            setLogs(logs);
            setLoading(false);
        };

        source.addEventListener("targets", (event) => {
            const target = JSON.parse(event.data);
            setTargets((prevTargets) => {
                let newState = [...prevTargets];
                let index = newState.findIndex((t) => t.id === target.id);

                if (index !== -1) {
                    newState[index] = target;
                } else {
                    newState.push(target);
                }

                return newState.sort((a, b) => a.hostname.localeCompare(b?.hostname, undefined, { sensitivity: "base" }));
            });
            setLastTargetUpdatedID(() => target.id);
        });
        source.addEventListener("logs", (event) => {
            const log: LogEvent.Log = JSON.parse(event.data);
            //might want to add host name to logs
            if (log.urgent) setAlert({ type: "warning", message: log.message, time: 3000 });
            setLogs((prevLogs) => {
                let newState = [...prevLogs];

                newState.push(log);

                return newState.sort((a, b) => a.timestamp - b.timestamp);
            });

            setLastLogUpdatedID(() => log);
        });
        init();
        return () => {
            source.close();
        };
    }, [token]); // add token as a dependency
    const getTargetsByIdAndName = () => {
        return targets.map((t) => {
            return { name: t.hostname, id: t.id };
        });
    };

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
    const value = {
        targets,
        lastTargetUpdatedID,
        deleteTargetAction,
        getTargetsByIdAndName,
        getTargetNameByID,
        logs,
        lastLogUpdatedID,
        getLogBy,
        allEventTypes,
    };

    return <StreamContext.Provider value={value}>{children}</StreamContext.Provider>;
};

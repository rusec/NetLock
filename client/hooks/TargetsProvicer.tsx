import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthProvider";
import { target } from "../components/Dashboard";

interface TargetContext {
    targets: target[];
    lastUpdatedID: string;
    deleteTargetAction: (data: string) => Promise<void>;
    getTargetsByIdAndName: () => {
        name: string;
        id: string;
    }[];
    getTargetNameByID: (id: string) => string;
}

// Create a Context object
const TargetStreamContext = createContext<TargetContext>({
    targets: [],
    lastUpdatedID: "",
    deleteTargetAction: async (data: string) => {},
    getTargetsByIdAndName: () => [],
    getTargetNameByID: (id: string) => "",
});

// Create a custom hook that allows easy access to the Context
export const useTargetStream = () => {
    return useContext(TargetStreamContext);
};

// Create a Provider component
export const TargetStreamProvider = ({ children }: any) => {
    const { token } = useAuth(); // get the token from useAuth
    const [targets, setTargets] = useState<target[]>([]);
    const [lastUpdatedID, setLastUpdatedID] = useState<string>("");
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
        const source = new EventSource("/api/user/targets/stream" + `?token=${token}`);

        source.onmessage = function (event) {
            const target = JSON.parse(event.data);
            setTargets((prevTargets) => {
                let newState = [...prevTargets];
                let index = newState.findIndex((t) => t.id === target.id);

                if (index !== -1) {
                    newState[index] = target;
                } else {
                    newState.push(target);
                }

                return newState.sort((a, b) => a.hostname.localeCompare(b.hostname, undefined, { sensitivity: "base" }));
            });
            setLastUpdatedID(() => target.id);
        };

        return () => {
            source.close();
        };
    }, [token]); // add token as a dependency
    const getTargetsByIdAndName = () => {
        return targets.map((t) => {
            return { name: t.hostname, id: t.id };
        });
    };
    const value = { targets, lastUpdatedID, deleteTargetAction, getTargetsByIdAndName, getTargetNameByID };

    return <TargetStreamContext.Provider value={value}>{children}</TargetStreamContext.Provider>;
};

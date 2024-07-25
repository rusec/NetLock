import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthProvider";
import { target } from "../components/Dashboard";

interface TargetContext {
    targets: target[];
    lastUpdatedID: string;
}

// Create a Context object
const TargetStreamContext = createContext<TargetContext>({
    targets: [],
    lastUpdatedID: "",
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

                return newState;
            });
            setLastUpdatedID(target.id);
        };

        return () => {
            source.close();
        };
    }, [token]); // add token as a dependency

    const value = { targets, lastUpdatedID };

    return <TargetStreamContext.Provider value={value}>{children}</TargetStreamContext.Provider>;
};
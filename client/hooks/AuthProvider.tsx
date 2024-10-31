import React, { useContext, createContext, useState } from "react";
import { useNavigate } from "react-router-dom";

interface AuthObject {
    token: string;
    loginAction: (input: { password: string }) => Promise<void>;
    registerAction: (input: { password: string }) => Promise<void>;
    logOut: () => void;
    resetPassword: (input: { current: string; password: string }) => Promise<void>;
}
const AuthContext: React.Context<AuthObject> = createContext({
    token: "",
    loginAction: async (d) => {},
    registerAction: async (d) => {},
    resetPassword: async (d) => {},
    logOut: () => {},
});

const AuthProvider = ({ children }: any) => {
    const [token, setToken] = useState(localStorage.getItem("site") || "");
    const navigate = useNavigate();

    const loginAction = async (data: { password: string }) => {
        try {
            const response = await fetch("/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            const res = await response.json();
            if (res.token) {
                setToken(res.token);
                localStorage.setItem("site", res.token);
                navigate("/dashboard");
                return;
            }
            throw new Error(res.message);
        } catch (err) {
            console.error(err);
        }
    };

    const logOut = () => {
        setToken("");
        localStorage.removeItem("site");
        navigate("/login");
    };
    const registerAction = async (data: { password: string }) => {
        try {
            const response = await fetch("/api/user", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            const res = await response.json();
            if (res.status) {
                navigate("/login");
                return;
            }
            throw new Error(res.message);
        } catch (err) {
            console.error(err);
        }
    };
    const resetPassword = async (data: { current: string; password: string }) => {
        try {
            const response = await fetch("/api/user/resetpass", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            const res = await response.json();
            if (res.token) {
                setToken(res.token);
                localStorage.setItem("site", res.token);
                navigate("/dashboard");
                return;
            }
            throw new Error(res.message);
        } catch (err) {
            console.error(err);
        }
    };
    return <AuthContext.Provider value={{ token, loginAction, registerAction, resetPassword, logOut }}>{children}</AuthContext.Provider>;
};

export default AuthProvider;

export const useAuth = () => {
    return useContext(AuthContext);
};

import React, { ChangeEvent, useState } from "react";
import { useAuth } from "../hooks/AuthProvider";

const Register = () => {
    const [input, setInput] = useState({
        password: "",
    });
    const auth = useAuth();
    const handleSubmitEvent = (e: ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (input.password !== "") {
            //dispatch action from hooks
            auth.registerAction(input);
            return;
        }
        alert("please provide a valid input");
    };

    const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
        if (e == null) return;
        const { name, value } = e.target;
        setInput((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <form onSubmit={handleSubmitEvent} className="max-w-md mx-auto p-4">
            <div className="text-2xl font-semibold mb-4">Register</div>

            <div className="mb-4">
                <label htmlFor="password" className="sr-only">
                    Password:
                </label>
                <input
                    type="password"
                    id="password"
                    placeholder="Password"
                    name="password"
                    onChange={handleInput}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                />
                <div className="text-sm text-gray-500 mt-1">Your password should be more than 6 characters.</div>
            </div>

            <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-300">
                Submit
            </button>
        </form>
    );
};

export default Register;

import React, { ChangeEvent, EventHandler, useState } from "react";
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
        <form onSubmit={handleSubmitEvent}>
            <div className="title">Register</div>

            <div className="form_control">
                {/* <label htmlFor="password">Password:</label> */}
                <input
                    type="password"
                    id="password"
                    placeholder="Password"
                    name="password"
                    aria-describedby="user-password"
                    aria-invalid="false"
                    onChange={handleInput}
                />
                <div id="user-password" className="sr-only">
                    your password should be more than 6 character
                </div>
            </div>
            <button className="btn-submit">Submit</button>
        </form>
    );
};

export default Register;

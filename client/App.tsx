import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import AuthProvider, { useAuth } from "./hooks/AuthProvider";
import PrivateRoute from "./router/route";
import React from "react";
import Register from "./components/Register";
import "./styles/index.css";
function App() {
    return (
        <div className="App">
            <Router>
                <AuthProvider>
                    <Routes>
                        <Route element={<PrivateRoute />}>
                            <Route path="/" element={<Dashboard />}></Route>
                        </Route>

                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        <Route element={<PrivateRoute />}>
                            <Route path="/dashboard" element={<Dashboard />} />
                        </Route>

                        {/* Other routes */}
                    </Routes>
                </AuthProvider>
            </Router>
        </div>
    );
}

export default App;

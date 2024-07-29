import React from "react";
import { target } from "../Dashboard";
import { convertDateToHumanReadable } from "../../utils/time";

type Props = { target: target };

export default function Target({ target }: Props) {
    return (
        <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-semibold mb-2">{target.hostname}</h2>
            <p className="text-gray-600 mb-1">Operating System: {target.os}</p>
            <p className="text-gray-600 mb-1">Active: {target.active ? "Yes" : "No"}</p>
            <p className="text-gray-600 mb-1">Last Ping: {convertDateToHumanReadable(target.lastPing)}</p>
            <p className="text-gray-600 mb-1">Date added: {convertDateToHumanReadable(target.dateAdded)}</p>

            <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Interfaces</h3>
                <ul className="list-disc list-inside">
                    {target.interfaces.map((iface) => (
                        <li key={iface.ip}>
                            {iface.ip} ({iface.state})
                        </li>
                    ))}
                </ul>
            </div>

            <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Users</h3>
                <ul className="list-disc list-inside">
                    {target.users.map((user) => (
                        <li key={user.name}>
                            {user.name} (Last Login: {convertDateToHumanReadable(user.lastLogin)})
                        </li>
                    ))}
                </ul>
            </div>
            <div className="dropdown dropdown-hover">
                <div tabIndex={0} role="button" className="btn m-1">
                    Apps
                </div>
                <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
                    {target.apps.map((app) => (
                        <li key={app.name}>
                            <p>
                                {app.name} {app.running ? "Running" : "Inactive"}
                            </p>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Add similar sections for displaying apps, lastPing, etc. */}
        </div>
    );
}

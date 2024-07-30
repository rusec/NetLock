import React from "react";
import { target } from "../Dashboard";
import { convertDateToHumanReadable } from "../../utils/time";

type Props = { target: target };

export default function Target({ target }: Props) {
    return (
        <div className="bg-white p-4 rounded shadow-md w-full md:w-1/2 lg:w-1/3 xl:w-1/4">
            <h2 className="text-lg font-semibold mb-2">{target.hostname}</h2>
            <p className="text-gray-600 mb-4">{target.os}</p>
            <p className="text-gray-600 mb-4">Date Added: {convertDateToHumanReadable(target.dateAdded)}</p>
            <p className="text-gray-600 mb-4">Last Updated: {convertDateToHumanReadable(target.lastPing)}</p>
            <div className="flex flex-wrap gap-2 flex-col">
                <div>
                    <span className="mr-1">Interfaces:</span>

                    <div className="flex items-center gap-2 flex-wrap">
                        {target.interfaces.map((inter) => (
                            <span
                                key={inter.mac}
                                className={`px-2 py-1 rounded ${inter.state == "up" ? "bg-green-200 text-green-800" : "bg-gray-200 text-gray-600"}`}
                            >
                                {inter.ip} {inter.mac}
                            </span>
                        ))}
                    </div>
                </div>
                {/* Users */}

                <div>
                    <span className="mr-1">Users:</span>

                    <div className="flex items-center gap-2 flex-wrap">
                        {target.users.map((user) => (
                            <span
                                key={user.name}
                                className={`px-2 py-1 rounded ${user.loggedIn ? "bg-green-200 text-green-800" : "bg-gray-200 text-gray-600"}`}
                                title={`${user.loggedIn ? "Logged in" : "Logged out"}`}
                            >
                                {user.name}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Apps */}
                <div>
                    <span className="mr-1">Apps:</span>
                    <div className="flex items-center gap-2 flex-wrap">
                        {target.apps.map((app) => (
                            <span
                                key={app.name}
                                className={`px-2 py-1 rounded ${app.running ? "bg-blue-200 text-blue-800" : "bg-gray-200 text-gray-600"}`}
                                title={`Version: ${app.version}`}
                            >
                                {app.name}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

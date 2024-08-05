import React from "react";
import { convertDateToHumanReadable } from "../../utils/time";
import { useStream } from "../../hooks/StreamProvider";
import { Beacon } from "netlocklib/dist/Beacon";

type Props = { target: Beacon.Data; fillContainer: boolean };

export default function Target({ target, fillContainer }: Props) {
    const { deleteTargetAction } = useStream();

    return (
        <div className={"bg-neutral p-4 rounded shadow-md w-full relative " + (fillContainer ? "" : "md:w-1/2 lg:w-1/3 xl:w-1/4")}>
            <button className="btn btn-xs btn-warning right-3 bottom-3 absolute" onClick={() => deleteTargetAction(target.id)}>
                Delete
            </button>
            <h2 className="text-lg font-semibold mb-2">{target.hostname}</h2>
            <p className="neutral-content mb-4">
                {target.os.platform} {target.os.release} {target.os.distro}
            </p>
            <p className="neutral-content mb-4">Date Added: {convertDateToHumanReadable(target.dateAdded)}</p>
            <p className="neutral-content mb-4">Last Updated: {convertDateToHumanReadable(target.lastPing)}</p>
            <div className="flex flex-wrap gap-2 flex-col">
                <div>
                    <span className="mr-1">Interfaces:</span>

                    <div className="flex items-center gap-2 flex-wrap">
                        {target.networkInterfaces.map((inter) => (
                            <span
                                key={inter.mac}
                                className={`px-2 py-1 rounded ${inter.state == "up" ? "bg-green-200 text-green-800" : "bg-gray-200 text-gray-600"}`}
                                title={`${JSON.stringify(inter, null, 4)}`}
                            >
                                {inter.ip4} {inter.mac}
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
                                title={`${app.running ? "running" : "stopped"}`}
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

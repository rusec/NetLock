import React, { useEffect, useState } from "react";
import { event, targetLogEvent, useLogStream } from "../../hooks/LogsProvider";
import { useTargetStream } from "../../hooks/TargetsProvicer";

type Props = {};

const targetId = "ba066a29bd5dc07c63a9ac630a72462ec67c492a3805eed727e0e443e214caab";

const fakeLogs: targetLogEvent[] = [
    {
        event: "fileCreated",
        user: "admin",
        timestamp: 1678923400,
        description: "A new confidential document ('ProjectX_Report.docx') was created in the secure folder.",
        message: "File created successfully.",
        id: "log1",
        targetId,
        argent: false,
    },
    {
        event: "processCreated",
        user: "user123",
        timestamp: 1678923500,
        description: "The critical system process 'kernel32.exe' was launched.",
        message: "Process started.",
        id: "log2",
        targetId,
        argent: true,
    },
    {
        event: "userLoggedIn",
        user: "john_doe",
        timestamp: 1678923600,
        description: "User 'john_doe' successfully logged in to the system.",
        message: "User logged in.",
        id: "log3",
        targetId,
        argent: false,
    },
    {
        event: "fileAccessed",
        user: "developer",
        timestamp: 1678923700,
        description: "The configuration file ('app_settings.json') was accessed for updates.",
        message: "File accessed.",
        id: "log4",
        targetId,
        argent: false,
    },
    {
        event: "config",
        user: "sysadmin",
        timestamp: 1678923800,
        description: "System configuration settings were modified to enhance security.",
        message: "System configuration updated.",
        id: "log5",
        targetId,
        argent: true,
    },
    {
        event: "fileCreated",
        user: "admin",
        timestamp: 1678923400,
        description: "A new confidential document ('ProjectX_Report.docx') was created in the secure folder.",
        message: "File created successfully.",
        id: "log1",
        targetId,
        argent: false,
    },
    {
        event: "processCreated",
        user: "user123",
        timestamp: 1678923500,
        description: "The critical system process 'kernel32.exe' was launched.",
        message: "Process started.",
        id: "log2",
        targetId,
        argent: true,
    },
    {
        event: "userLoggedIn",
        user: "john_doe",
        timestamp: 1678923600,
        description: "User 'john_doe' successfully logged in to the system.",
        message: "User logged in.",
        id: "log3",
        targetId,
        argent: false,
    },
    {
        event: "fileAccessed",
        user: "developer",
        timestamp: 1678923700,
        description: "The configuration file ('app_settings.json') was accessed for updates.",
        message: "File accessed.",
        id: "log4",
        targetId,
        argent: false,
    },
    {
        event: "config",
        user: "sysadmin",
        timestamp: 1678923800,
        description: "System configuration settings were modified to enhance security.",
        message: "System configuration updated.",
        id: "log5",
        targetId,
        argent: true,
    },
    {
        event: "fileCreated",
        user: "admin",
        timestamp: 1678923400,
        description: "A new confidential document ('ProjectX_Report.docx') was created in the secure folder.",
        message: "File created successfully.",
        id: "log1",
        targetId,
        argent: false,
    },
    {
        event: "processCreated",
        user: "user123",
        timestamp: 1678923500,
        description: "The critical system process 'kernel32.exe' was launched.",
        message: "Process started.",
        id: "log2",
        targetId,
        argent: true,
    },
    {
        event: "userLoggedIn",
        user: "john_doe",
        timestamp: 1678923600,
        description: "User 'john_doe' successfully logged in to the system.",
        message: "User logged in.",
        id: "log3",
        targetId,
        argent: false,
    },
    {
        event: "fileAccessed",
        user: "developer",
        timestamp: 1678923700,
        description: "The configuration file ('app_settings.json') was accessed for updates.",
        message: "File accessed.",
        id: "log4",
        targetId,
        argent: false,
    },
    {
        event: "config",
        user: "sysadmin",
        timestamp: 1678923800,
        description: "System configuration settings were modified to enhance security.",
        message: "System configuration updated.",
        id: "log5",
        targetId,
        argent: true,
    },
];

function Logs({}: Props) {
    const { logs, lastUpdatedID, allEventTypes } = useLogStream();
    const { getTargetsByIdAndName, getTargetNameByID } = useTargetStream();

    const [TargetSelected, setTargetSelected] = useState<string>("");
    const [EventSelected, setEventSelected] = useState<string>("");
    const processLogs = (): targetLogEvent[] => {
        let filteredLogs = logs;

        if (TargetSelected != "") {
            if (Array.isArray(TargetSelected)) filteredLogs = filteredLogs.filter((log) => TargetSelected.includes(log.targetId));
            else filteredLogs = filteredLogs.filter((log) => log.targetId === TargetSelected);
        }

        if (EventSelected != "") {
            if (Array.isArray(EventSelected)) filteredLogs = filteredLogs.filter((log) => EventSelected.includes(log.event));
            else filteredLogs = filteredLogs.filter((log) => log.event === EventSelected);
        }

        return filteredLogs;
    };

    return (
        <div className="pr-7 px-7 pb-7">
            <div className="p-2 bg-base-300 flex">
                <div className="p-2">
                    <div className="flex">
                        <div className="menu-title">Logs</div>
                        <div className="ml-auto">
                            <div className="dropdown dropdown-end">
                                <div tabIndex={0} role="button" className="btn m-1">
                                    Filter Event
                                </div>
                                <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
                                    <li>
                                        <a onClick={() => setEventSelected("")}>All</a>
                                    </li>
                                    {allEventTypes.map((v) => (
                                        <li>
                                            <a onClick={() => setEventSelected(v)}>{v}</a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="dropdown dropdown-end">
                                <div tabIndex={0} role="button" className="btn m-1">
                                    Filter Target
                                </div>
                                <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
                                    <li>
                                        <a onClick={() => setTargetSelected("")}>All</a>
                                    </li>
                                    {getTargetsByIdAndName().map((v) => (
                                        <li>
                                            <a onClick={() => setTargetSelected(v.id)}>{v.name}</a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="table">
                            {/* head */}
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>Date</th>
                                    <th>Event</th>
                                    <th>Target</th>
                                    <th>Message</th>
                                    <th>Argent</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* row 1 */}
                                {processLogs().map((log, index) => (
                                    <tr>
                                        <th>{index}</th>
                                        <td>{log.timestamp}</td>
                                        <td>{log.event.toUpperCase()}</td>
                                        <td>{getTargetNameByID(log.targetId)}</td>
                                        <td>{log.message}</td>
                                        <td>{log.argent ? "Yes" : "No"}</td>
                                    </tr>
                                ))}
                                {/* <tr>
                                    <th>1</th>
                                    <td>Cy Ganderton</td>
                                    <td>Quality Control Specialist</td>
                                    <td>Blue</td>
                                </tr>
                                <tr>
                                    <th>2</th>
                                    <td>Hart Hagerty</td>
                                    <td>Desktop Support Technician</td>
                                    <td>Purple</td>
                                </tr>
                                <tr>
                                    <th>3</th>
                                    <td>Brice Swyre</td>
                                    <td>Tax Accountant</td>
                                    <td>Red</td>
                                </tr> */}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Logs;

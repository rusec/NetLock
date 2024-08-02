import React, { useEffect, useState } from "react";
import { useStream } from "../../hooks/StreamProvider";
import { LogEvent } from "netlocklib/dist/Events";
import { convertDateToHumanReadable } from "../../utils/time";

type Props = {};

function Logs({}: Props) {
    const { logs, lastLogUpdatedID, allEventTypes, getTargetsByIdAndName, getTargetNameByID } = useStream();

    const [TargetSelected, setTargetSelected] = useState<string>("");
    const [EventSelected, setEventSelected] = useState<string>("");
    const [DateUp, setDateUp] = useState<boolean>(false);
    const [DisplayedLogs, setDisplayedLogs] = useState(logs);
    useEffect(() => {
        let filteredLogs = logs;

        if (TargetSelected != "") {
            if (Array.isArray(TargetSelected)) filteredLogs = filteredLogs.filter((log) => TargetSelected.includes(log.targetId));
            else filteredLogs = filteredLogs.filter((log) => log.targetId === TargetSelected);
        }

        if (EventSelected != "") {
            if (Array.isArray(EventSelected)) filteredLogs = filteredLogs.filter((log) => EventSelected.includes(log.event));
            else filteredLogs = filteredLogs.filter((log) => log.event === EventSelected);
        }

        filteredLogs.sort((a, b) => (DateUp ? a.timestamp - b.timestamp : b.timestamp - a.timestamp));
        setDisplayedLogs(filteredLogs);
    }, [DateUp, logs, TargetSelected, EventSelected]);

    const parseStats = () => {
        const amountOfUrgent = logs.reduce((prev, v) => (v.urgent ? prev + 1 : prev), 0);
        return { amountOfUrgent: amountOfUrgent };
    };
    const info = parseStats();
    const [selectedLogIndex, setSelectedLogIndex] = useState(null);

    const handleRowClick = (index) => {
        setSelectedLogIndex(selectedLogIndex === index ? null : index);
    };
    return (
        <div className="pr-7 px-7 pb-7">
            <div className="p-2 bg-base-300 flex">
                <div className="p-2 w-1/2">
                    <div className="flex relative">
                        <div className="card-title">Logs</div>
                        <div className="ml-auto">
                            <div
                                onClick={() => {
                                    setDateUp(!DateUp);
                                }}
                                role="button"
                                className="btn m-1"
                            >
                                {DateUp ? "Recent" : "Old"}
                            </div>
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
                    <div className="overflow-x-auto overflow-y-auto max-h-lvh">
                        <table className="table w-full">
                            <thead>
                                <tr className="bg-primary text-white">
                                    <th></th>
                                    <th>Date</th>
                                    <th>Event</th>
                                    <th>Target</th>
                                    <th>Message</th>
                                    <th>Urgent</th>
                                </tr>
                            </thead>
                            <tbody>
                                {DisplayedLogs.map((log, index) => (
                                    <>
                                        <tr
                                            key={index}
                                            className="hover:bg-neutral hover:text-white cursor-pointer"
                                            onClick={() => handleRowClick(index)}
                                        >
                                            <th>{index + 1}</th>
                                            <td>{convertDateToHumanReadable(log.timestamp)}</td>
                                            <td>{log.event.toUpperCase()}</td>
                                            <td>{getTargetNameByID(log.targetId)}</td>
                                            <td>{log.message}</td>
                                            <td>{log.urgent ? "Yes" : "No"}</td>
                                        </tr>
                                        {selectedLogIndex === index && (
                                            <tr key={`${index}-details`} className="bg-gray-100">
                                                <td colSpan={6}>
                                                    <pre className="whitespace-pre-wrap p-4">{JSON.stringify(log, null, 2)}</pre>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="p-4">
                    <div className="stats-container flex flex-wrap gap-4 justify-center p-4 ">
                        <div className="stats shadow">
                            <div className="stat">
                                <div className="stat-title">Logs</div>
                                <div className="stat-value">{logs.length}</div>
                                <div className="stat-desc">amount of Logs</div>
                            </div>
                        </div>
                        <div className="stats shadow">
                            <div className="stat">
                                <div className="stat-title">Urgent</div>
                                <div className="stat-value">{info.amountOfUrgent}</div>
                                <div className="stat-desc">amount of urgent logs</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Logs;

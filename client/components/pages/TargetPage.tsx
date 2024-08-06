import React from "react";
import { useStream } from "../../hooks/StreamProvider";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import NotFound from "./NotFound";
import { convertDateToHumanReadable } from "../../utils/time";
import AppTable from "../Target/AppTable";
import UsersTable from "../Target/UserTable";
import InterfaceTable from "../Target/InterfaceTable";
import LogsTable from "../Target/LogsTable";

type Props = {};

export default function TargetPage({}: Props) {
    const { targets, lastTargetUpdatedID, deleteTargetAction, logs } = useStream();
    let [searchParams, setSearchParams] = useSearchParams();
    const id = searchParams.get("id");
    const target = targets.find((t) => t.id == id);
    const navigate = useNavigate();
    if (!target) {
        return <NotFound message="Target Not found" />;
    }

    return (
        <div className={"bg-neutral p-4 rounded shadow-md w-full relative"}>
            <button className="btn btn-xs btn-warning right-3 top-3 absolute z-10" onClick={() => deleteTargetAction(target.id)}>
                Delete
            </button>
            <h2
                className="text-lg font-semibold mb-2 cursor-pointer hover:text-white"
                title={JSON.stringify({ ...target, apps: undefined, users: undefined, networkInterfaces: undefined }, null, 4)}
            >
                {target.hostname}
            </h2>
            <p className="neutral-content mb-4">
                {target.os.platform} {target.os.release} {target.os.distro}
            </p>
            <p className="neutral-content mb-4">Date Added: {convertDateToHumanReadable(target.dateAdded)}</p>
            <p className="neutral-content mb-4">Last Updated: {convertDateToHumanReadable(target.lastPing)}</p>
            <div className="flex flex-wrap gap-4 flex-col">
                <LogsTable targetId={target.id} />

                <InterfaceTable ifaces={target.networkInterfaces} />

                {/* Users */}
                <UsersTable users={target.users} />

                {/* Apps */}
                <AppTable apps={target.apps} />
            </div>
        </div>
    );
}

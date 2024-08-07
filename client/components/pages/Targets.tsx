import React from "react";
import { useStream } from "../../hooks/StreamProvider";
import Target from "../Target/Target";

type Props = {};

function Targets({}: Props) {
    const { targets, lastTargetUpdatedID, deleteTargetAction } = useStream();
    const lastUpdatedTarget = targets.find((v) => v.id == lastTargetUpdatedID) || false;
    return (
        <div className="p-7 flex flex-wrap gap-3 justify-center bg-base-200 rounded w-full relative">
            {targets && targets.map((target) => <Target fillContainer={false} target={target} key={target.id} />)}
        </div>
    );
}

export default Targets;

import React from "react";
import { useStream } from "../../hooks/StreamProvider";
import { convertDateToHumanReadable } from "../../utils/time";
import Target from "../Target/Target";

type Props = {};

function Targets({}: Props) {
    const { targets, lastTargetUpdatedID, deleteTargetAction } = useStream();
    const lastUpdatedTarget = targets.find((v) => v.id == lastTargetUpdatedID) || false;
    return (
        <div className="p-7 flex flex-wrap gap-3 justify-center">
            {targets && targets.map((target) => <Target fillContainer={false} target={target} />)}
        </div>
    );
}

export default Targets;

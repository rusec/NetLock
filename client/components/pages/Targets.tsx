import React from "react";
import { useTargetStream } from "../../hooks/TargetsProvicer";
import { convertDateToHumanReadable } from "../../utils/time";
import Target from "../Target/Target";

type Props = {};

function Targets({}: Props) {
    const { targets, lastUpdatedID, deleteTargetAction } = useTargetStream();
    const lastUpdatedTarget = targets.find((v) => v.id == lastUpdatedID) || false;
    return (
        <div className="p-7 flex flex-wrap gap-3 justify-center">
            {targets && targets.map((target) => <Target fillContainer={false} target={target} />)}
        </div>
    );
}

export default Targets;

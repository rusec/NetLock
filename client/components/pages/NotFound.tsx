import React from "react";

type Props = {
    message: string;
};

function NotFound({ message }: Props) {
    return (
        <div className="p-7 flex flex-wrap gap-3 justify-center bg-base-200 rounded w-full relative">
            <h3>Not Found: {message}</h3>
        </div>
    );
}

export default NotFound;

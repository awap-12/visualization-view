import React, { useCallback, useEffect, useState } from "react";
import "../../styles/labels.css";

// TODO: use context? but data is too less. Need discussion.
function Label({ id, data, onClick }) {
    const [state, setState] = useState(true);
    const { key, label, color } = data;

    useEffect(() => {
        onClick(id, key, state);
    }, [onClick, id, key, state]);

    return (
        <div className="label">
            <button style={{ backgroundColor: state ? color : "gray" }}
                    onClick={() => setState(!state)} />
            <p>{label}</p>
        </div>
    );
}

function LabelGroup({ typeConfig, callback }) {
    const [data, setData] = useState([]);

    const handleState = useCallback((id, key, state, temp = data) => {
        temp.splice(id, 1, { key: key, state: state });
        setData(temp);
        callback(temp);
    }, [data, callback]);

    return(
        <div className="labels">
            {typeConfig?.map((data, id) =>
                <Label key={`label-${id}`} id={id} data={data} onClick={handleState} />
            )}
        </div>
    );
}

export default LabelGroup;

import React, { useEffect, useState } from "react";
import "../styles/labels.css";

// TODO: use context? but data is too less. Need discussion.
function Label({ index, data, callback }) {
    const [state, setState] = useState(true);
    const { raw, text, color } = data;

    useEffect(() => callback(index, raw, state), [callback, index, state]);

    return (
        <div className="label">
            <button onClick={() => setState(!state)} style={{ backgroundColor: state ? color : "gray" }} />
            <p>{text}</p>
        </div>
    );
}

function LabelGroup({ type, callback }) {
    const [data, setData] = useState([]);

    function handleState(id, raw, value) {
        let temp = data;
        temp.splice(id, 1, { key: raw, state: value });
        setData(temp);
        callback(temp);
    }

    return(
        <div className="labels">
            {type.map((data, index) => (
                <Label key={index} index={index} data={data} callback={handleState} />
            ))}
        </div>
    );
}

export default LabelGroup;

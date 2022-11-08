import React, { useRef } from "react";
import "../styles/labels.css";

function LabelGroup({ type }) {
    function handleState(event) {
        const button = event.target;
        button.style.backgroundColor = "gray";
    }

    return(
        <div className="labels">
            {type.map(({ text, color }, index) => (
                <div className="label" key={index}>
                  <button onClick={handleState} style={{backgroundColor: color}}/>
                  <p>{text}</p>
                </div>
            ))}
        </div>
    );
}

export default LabelGroup;

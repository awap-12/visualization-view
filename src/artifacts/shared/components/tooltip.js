import React, { useEffect, useRef, useState } from "react";
import { select } from "d3-selection";

//const context = document.createElement("canvas").getContext("2d");
const FORCE_WRAP = 350;

function Tooltip(props) {
    const [visibility, setVisibility] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [rect, setRect] = useState({ width: 0, height: 0});
    const textsRef = useRef(null);

    useEffect(() => {
        setVisibility(props.visible);
    }, [props.visible]);

    useEffect(() => {
        setPosition(props.position);
    }, [props.position]);

    useEffect(() => {
        const container = select(textsRef.current);
        container.text(null);
        if (props.content?.length > 0) {
            let width = 0, height = 0, temp = 0;
            for (const text of props.content) {
                const element = container.append("text");
                let words = text.split(/\s+/).reverse(), word, line = [], lineNumber = 0;
                let tspan = element.append("tspan").attr("dy", 0);
                while ((word = words.pop())) {
                    line.push(word);
                    tspan.text(line.join(" "));
                    if ((temp = tspan.node().getComputedTextLength())/** context.measureText(tspan.text()).width) */ > FORCE_WRAP) {
                        line.pop();
                        tspan.text(line.join(" "));
                        line = [word];
                        tspan = element.append("tspan")
                            .attr("x", 0) // x
                            .attr("y", `${++lineNumber * 1.1}`) // y
                            .attr("dy", `${height + lineNumber}em`)
                            .text(word);
                        temp = FORCE_WRAP;
                    }
                }
                element.attr("y", `${height}em`);
                width = Math.max(width, temp);
                height += (lineNumber + 1) * 1.1;
            }
        }
        setRect(textsRef.current.getBoundingClientRect());
    }, [props.content]);

    return(
        <g visibility={visibility ? "visible" : "hidden"} transform={`translate(${position.x}, ${position.y})`} style={{fontSize: "small"}}>
            <circle r={2.5} fill="black" />
            <rect x={(rect.width + 10) / -2} width={rect.width + 10} y={6} height={rect.height} rx={3} fill="rgba(0, 0, 0, 0.60)" />
            <g ref={textsRef} transform={`translate(${0}, ${20})`} fill="white" textAnchor="middle" />
        </g>
    );
}

export default Tooltip;

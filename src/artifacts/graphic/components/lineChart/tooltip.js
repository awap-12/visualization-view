import React, { useEffect, useRef, useState } from "react";
import { select } from "d3-selection";

//const context = document.createElement("canvas").getContext("2d");
const FORCE_WRAP = 350, MIN_OFFSET = -(2 ** 32);

/**
 * @param {number} x The x of tooltip position
 * @param {number} y The y of tooltip position
 * @param {boolean} visible The visibility of tooltip
 * @param {[string]} content The contents to display
 * @return {JSX.Element}
 */
function Tooltip({ x = MIN_OFFSET, y = MIN_OFFSET, visible = false, content } = {}) {
    const [rect, setRect] = useState({ width: 0, height: 0});
    const textsRef = useRef(null);

    useEffect(() => {
        const container = select(textsRef.current);
        container.text(null);
        if (content?.length > 0) {
            let width = 0, height = 0, temp = 0;
            for (const text of content) {
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
    }, [content]);

    return(
        <g visibility={visible ? "visible" : "hidden"}
           transform={`translate(${x}, ${y})`}
           style={{ fontSize: "small" }}>
          <circle r={2.5}
                  fill="black" />
          <rect x={(rect.width + 10) / -2}
                y={6}
                width={rect.width + 10}
                height={rect.height}
                rx={3}
                fill="rgba(0, 0, 0, 0.60)" />
          <g ref={textsRef}
             transform={`translate(${0}, ${20})`}
             fill="white"
             textAnchor="middle" />
        </g>
    );
}

export default Tooltip;

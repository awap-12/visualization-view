import React, { useEffect, useRef, useState } from "react";
import { select } from "d3-selection";

const MIN_OFFSET = -(2 ** 32), FORCE_WRAP = 350, MARGIN_SCALE = { width: 1.06, height: 1.03 };

/**
 * This component should use under <svg>
 * @deprecated use svg to make popup style component is slow and silly
 * @param {{x:number,y:number}} position The tooltip position
 * @param {boolean} visible The visibility of tooltip
 * @param {[string]} content The contents to display
 * @return {JSX.Element}
 */
export function Tooltip({ position = {}, visible = false, content } = {}) {
    const [rect, setRect] = useState({ width: 0, height: 0 });
    const textsRef = useRef(null);

    const { x = MIN_OFFSET, y = MIN_OFFSET } = position;

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
                    if ((temp = tspan.node().getComputedTextLength()) > FORCE_WRAP) {
                        line.pop();
                        tspan.text(line.join(" "));
                        line = [word];
                        tspan = element.append("tspan")
                            .attr("x", 0)
                            .attr("y", `${++lineNumber * 1.1}`)
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
          <g transform={`translate(0, ${20})`}>
            <rect x={rect.width * MARGIN_SCALE.width / -2}
                  y={20 * 1.2 / -2}
                  width={rect.width * MARGIN_SCALE.width}
                  height={rect.height * MARGIN_SCALE.height}
                  rx={3}
                  fill="rgba(0, 0, 0, 0.60)" />
            <g ref={textsRef}
               fill="white"
               textAnchor="middle" />
          </g>
        </g>
    );
}

export default Tooltip;

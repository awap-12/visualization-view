import React, { useEffect, useRef, useState } from "react";
import { axisBottom, axisLeft, axisRight, axisTop } from "d3-axis";
import { select } from "d3-selection";
import { sum } from "d3-array";

/**
 * A format function of Display axis
 * @param {function} scale The scalar for axis
 * @param {"top"|"bottom"|"left"|"right"} orient The title orientation
 * @param {number} offset The offset of axis
 * @param {{x:number,y:number,r:number,text:string}} [title] The title position
 * @param {[function]} [calls] Callback
 * @return {JSX.Element}
 */
function Axis({ scale, orient, offset, title, calls }) {
    const [contentMatrix, setContentMatrix] = useState(null);
    const [titleMatrix, setTitleMatrix] = useState(null);
    const axisRef = useRef();

    useEffect(() => {
        if (axisRef.current) {
            const axis = select(axisRef.current);

            let [func, content] = {
                top:    [axisTop,    { x: 0, y: offset }],
                bottom: [axisBottom, { x: 0, y: offset }],
                left:   [axisLeft,   { x: offset, y: 0 }],
                right:  [axisRight,  { x: offset, y: 0 }],
            }[orient];

            axis.call(func(scale));

            setContentMatrix(content);

            if (!!title?.text)
                setTitleMatrix({
                    ...{
                        top:    { x: sum(scale.range()) / 2, y: -30, r: 0,   ...title },
                        bottom: { x: sum(scale.range()) / 2, y: 30,  r: 0,   ...title },
                        left:   { x: -30, y: sum(scale.range()) / 2, r: 270, ...title },
                        right:  { x: 30, y: sum(scale.range()) / 2,  r: 90,  ...title }
                    }[orient],
                    anchor: "x" in title || "y" in title ? "start" : "middle"
                });

            if (Array.isArray(calls))
                calls.forEach(func => axis.call(func));
        }
    }, [scale, orient, offset, title, calls]);

    return (
        <g ref={axisRef}
           transform={!!contentMatrix ? `translate(${contentMatrix.x},${contentMatrix.y})` : null}>
            {!!titleMatrix ? (
                <text textAnchor={titleMatrix.anchor}
                      transform={`translate(${titleMatrix.x},${titleMatrix.y}) rotate(${titleMatrix.r})`}
                      fill="black">
                    {titleMatrix.text}
                </text>
            ) : null}
        </g>
    );
}

export default Axis;

import React, { useEffect, useRef } from "react";
import { select } from "d3-selection";
import { range, extent, group, map, max, least, InternSet } from "d3-array";
import { scaleLinear, scaleTime } from "d3-scale";
import { axisLeft, axisBottom } from "d3-axis";
import { line as Line, curveLinear } from "d3-shape";
import { pointer } from "d3-selection";

const margin = { top: 80, right: 60, bottom: 80, left: 60 };
const width = 600 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

function LineChart({
    data,                       // data source
    defined,                    // for gaps in data
    width = 640,        // outer width, in pixels
    height = 400,       // outer height, in pixels
    margin = {
        top: 20,                // top margin, in pixels
        right: 30,              // right margin, in pixels
        bottom: 30,             // bottom margin, in pixels
        left: 40                // left margin, in pixels
    },
    color = "currentColor", // stroke color of line, as a constant or a function of *z*
    strokeLinecap,              // stroke line cap of line
    strokeLinejoin,             // stroke line join of line
    strokeWidth = 1.5,  // stroke width of line
    strokeOpacity,              // stroke opacity of line
    mixBlendMode = "multiply", // blend mode of lines
    options                 // option data
}) {
    const { top: marginTop, right: marginRight, bottom: marginBottom, left: marginLeft } = margin;
    const { x, y, type, xLabel, yLabel, xFormat, yFormat, voronoi } = options;
    const graphRef = useRef(null);

    useEffect(() => {
        if (data && graphRef.current) {
            const svg = select(graphRef.current);

            /** Compute values */
            const X = map(data, x);
            const Y = map(data, y);
            const Z = map(data, type);
            const O = map(data, value => value);
            const D = map(data, defined ?? ((d, i) => !isNaN(X[i]) && !isNaN(Y[i])));

            /** Compute default domains */
            const xDomain = extent(X).map(data => new Date(data));
            const yDomain = [0, max(Y, data => typeof data === "string" ? +data : data)];
            const zDomain = new InternSet(Z);

            /** Omit any data not present in the z-domain. */
            const I = range(X.length).filter(i => zDomain.has(Z[i]));

            /** Construct scales and axes */
            const xScale = scaleTime(xDomain, [marginLeft, width - marginRight]);
            const yScale = scaleLinear(yDomain, [height - marginBottom, marginTop]);
            const xAxis = axisBottom(xScale).ticks(width / 80).tickSizeOuter(0);
            const yAxis = axisLeft(yScale).ticks(height / 60, yFormat);

            /** Construct a line generator */
            const line = Line().defined(i => D[i]).curve(curveLinear).x(i => xScale(X[i])).y(i => yScale(Y[i]));

            svg.attr("width", width)
                .attr("height", height)
                .attr("viewBox", [0, 0, width, height])
                .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
                .style("-webkit-tap-highlight-color", "transparent")
                .on("pointerenter", pointerentered)
                .on("pointermove", pointermoved)
                .on("pointerleave", pointerleft)
                .on("touchstart", event => event.preventDefault());

            svg.append("g")
                .attr("transform", `translate(0,${height - marginBottom})`)
                .call(xAxis);

            const path = svg.append("g")
                .attr("fill", "none")
                .attr("stroke", typeof color === "string" ? color : null)
                .attr("stroke-linecap", strokeLinecap)
                .attr("stroke-linejoin", strokeLinejoin)
                .attr("stroke-width", strokeWidth)
                .attr("stroke-opacity", strokeOpacity)
                .selectAll("path")
                .data(group(I, i => Z[i]))
                .join("path")
                .style("mix-blend-mode", mixBlendMode)
                .attr("stroke", typeof color === "function" ? ([z]) => color(z) : null)
                .attr("d", ([, I]) => line(I));

            const dot = svg.append("g")
                .attr("display", "none");

            dot.append("circle")
                .attr("r", 2.5);

            dot.append("text")
                .attr("font-family", "sans-serif")
                .attr("font-size", 10)
                .attr("text-anchor", "middle")
                .attr("y", -8);

            function pointermoved(event) {
                const [xm, ym] = pointer(event);
                const i = least(I, i => Math.hypot(xScale(X[i]) - xm, yScale(Y[i]) - ym)); // closest point
                path.style("stroke", ([z]) => Z[i] === z ? null : "#ddd").filter(([z]) => Z[i] === z).raise();
                dot.attr("transform", `translate(${xScale(X[i])},${yScale(Y[i])})`);
                //if (T) dot.select("text").text(T[i]);
                svg.property("value", O[i]).dispatch("input", {bubbles: true});
            }

            function pointerentered() {
                path.style("mix-blend-mode", null).style("stroke", "#ddd");
                dot.attr("display", null);
            }

            function pointerleft() {
                path.style("mix-blend-mode", mixBlendMode).style("stroke", null);
                dot.attr("display", "none");
                svg.node().value = null;
                svg.dispatch("input", {bubbles: true});
            }
        }
    }, [data]);

    return(
        <svg ref={graphRef}></svg>
    );
}

export default LineChart;

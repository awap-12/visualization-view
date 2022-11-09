import React, { useEffect, useRef, useState } from "react";
import { select } from "d3-selection";
import { range, extent, group, map, least, InternSet } from "d3-array";
import { scaleLinear, scaleTime } from "d3-scale";
import { axisLeft, axisBottom } from "d3-axis";
import { line as Line, curveLinear } from "d3-shape";
import { pointer } from "d3-selection";
import { zoom } from "d3-zoom";
import Resizer from "./resizer";
import LabelGroup from "./labelGroup";

const hash = window.btoa(`LineChart-${Date.now()}`);

function LineChart({
    data,                               // data source
    tip,                                // tip source
    width = 960,                // outer width, in pixels
    height = 600,               // outer height, in pixels
    margin = {
        top: 20,                        // top margin, in pixels
        right: 30,                      // right margin, in pixels
        bottom: 30,                     // bottom margin, in pixels
        left: 40                        // left margin, in pixels
    },
    color = "currentColor",
    strokeLinecap = "round",      // stroke line cap of the line
    strokeLinejoin = "round",     // stroke line join of the line
    strokeWidth = 1.5,
    strokeOpacity = 1,           // stroke opacity of line
    mixBlendMode = "multiply",
    options                              // option data
}) {
    const { top: marginTop, right: marginRight, bottom: marginBottom, left: marginLeft } = margin;
    const { x, y, type, /* xLabel, yLabel, xFormat, yFormat */ } = options;
    const [currentZoomState, setCurrentZoomState] = useState();
    const [typeList, setTypeList] = useState([]);
    const [linePath, setLinePath] = useState();
    const chartRef = useRef(null);
    const svgRef = useRef(null);
    const dimensions = Resizer(chartRef);

    useEffect(() => {
        if (data && svgRef.current) {
            const { width: posX, height: posY } = dimensions || chartRef.current.getBoundingClientRect();
            const svg = select(svgRef.current);
            const svgHandle = svg.select(".dot");
            const svgContent = svg.select(".content");

            /** Compute values and domain */
            const xSet = map(data, x);
            const ySet = map(data, y);
            const typeSet = map(data, type);
            const dataSet = map(data, value => value);
            const definedSet = map(data, (v, i) => !isNaN(xSet[i]) && !isNaN(ySet[i])); // clean NaN ySet
            const xDomain = extent(xSet);
            const yDomain = extent(ySet);//[, max(ySet, data => typeof data === "string" ? +data : data)];
            const typeDomain = new InternSet(typeSet);

            /** Fetch tooltip */
            const tooltip = !!tip ? map(data, ({ type }) => tip(type)) : typeDomain;

            /** Omit any data not present in the z-domain. */
            const safe = range(xSet.length).filter(i => typeDomain.has(typeSet[i]));

            /** Construct scales and axes */
            const xScale = scaleTime(xDomain, [marginLeft, width - marginRight]);
            const yScale = scaleLinear(yDomain, [height - marginBottom, marginTop]);
            const xAxis = axisBottom(xScale);
            const yAxis = axisLeft(yScale);
            if (currentZoomState) xScale.domain(currentZoomState.rescaleX(xScale).domain());

            /** Construct a line generator */
            const line = Line().defined(i => definedSet[i])
                .curve(curveLinear)
                .x(i => xScale(xSet[i]))
                .y(i => yScale(ySet[i]));

            svg.attr("width", width).attr("height", height)
                .attr("viewBox", [0, 0, width, height])
                .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
                .style("-webkit-tap-highlight-color", "transparent")
                .on("pointerenter", pointerentered)
                .on("pointermove", pointermoved)
                .on("pointerleave", pointerleft)
                .on("touchstart", event => event.preventDefault());

            // build axis
            svg.select(".x-axis").attr("transform", `translate(0,${height - marginBottom})`).call(xAxis);
            svg.select(".y-axis").attr("transform", `translate(${marginLeft}, 0)`).call(yAxis)
                .call(g => g.select(".domain").remove()); // not require ugly line

            setLinePath(svgContent
                 .attr("fill", "none")
                 .attr("stroke", typeof color === "string" ? color : null)
                 .attr("stroke-linecap", strokeLinecap)
                 .attr("stroke-linejoin", strokeLinejoin)
                 .attr("stroke-width", strokeWidth)
                 .attr("stroke-opacity", strokeOpacity)
                .selectAll("path")
                .data(group(safe, i => typeSet[i]))
                .join("path")
                 .style("mix-blend-mode", mixBlendMode)
                 .attr("stroke", typeof color === "function" ? ([z]) => color(z) : null)
                 .attr("d", ([v, i]) => line(i)));

            /** mouse action */
            function pointermoved(event) {
                const [xm, ym] = pointer(event);
                const i = least(safe, i => Math.hypot(xScale(xSet[i]) - xm, yScale(ySet[i]) - ym)); // closest point
                linePath.style("stroke", ([z]) => typeSet[i] === z ? null : typeof color === "function" ? `${color(z)}50` : "#ddd").filter(([z]) => typeSet[i] === z).raise();
                svgHandle.attr("transform", `translate(${xScale(xSet[i])}, ${yScale(ySet[i])})`);
                svgHandle.select("text").text(tooltip[i]);
                svg.property("value", dataSet[i]).dispatch("input", { bubbles: true });
            }
            function pointerentered() {
                linePath.style("mix-blend-mode", null).style("stroke", "#ddd");
                svgHandle.attr("display", null);
            }
            function pointerleft() {
                linePath.style("mix-blend-mode", mixBlendMode).style("stroke", null);
                svgHandle.attr("display", "none");
                svg.node().value = null;
                svg.dispatch("input", { bubbles: true });
            }

            /** Zoom */
            svg.call(zoom().scaleExtent([0.5, 5]).translateExtent([[0, 0], [posX, posY]]).on("zoom", event => setCurrentZoomState(event.transform)));

            setTypeList(Array.from(typeDomain.keys()).map(item => ({
                raw: item,
                text: tip(item),
                color: typeof color === "function" ? color(item) : color }
            )));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentZoomState, data, dimensions]);

    function handleLabels(data) {
        linePath.each(function([name]) {
            for (const { key, state } of data) {
                if (key === name) select(this).attr("display", state ? null : "none");
            }
        });
    }

    return(
        <div ref={chartRef} style={{ width, height, marginBottom: "2rem" }}>
          <LabelGroup type={typeList} callback={handleLabels}></LabelGroup>
          <svg ref={svgRef}>
            <defs>
              <clipPath id={hash}>
                <rect x={marginLeft} y={marginTop}
                      width={width - marginRight - marginLeft}
                      height={height - marginBottom - marginTop} />
              </clipPath>
            </defs>
            <g className="content" clipPath={`url(#${hash})`} />
            <g className="dot">
              <circle r={2.5} fill="black" />
              <text className="tip" fontSize={10} textAnchor="middle" y={-8} />
            </g>
            <g className="x-axis" />
            <g className="y-axis" />
          </svg>
        </div>
    );
}

export default LineChart;

import React, { useEffect, useRef, useState } from "react";
import { range, extent, group, map, least, sum, InternSet } from "d3-array";
import { axisTop, axisBottom, axisLeft, axisRight } from "d3-axis";
import { line as Line, curveLinear } from "d3-shape";
import { scaleLinear, scaleTime } from "d3-scale";
import { select, pointer } from "d3-selection";
import { zoom } from "d3-zoom";
import Resizer from "./resizer";
import LabelGroup from "./labelGroup";

const hash = window.btoa(`LineChart-${Date.now()}`);

/**
 * Handle {@link data} by handle function
 * @param {any} source
 * @param {[[function,function,any[]]]} handler
 * @return {[[],[]]}
 */
export function formatInfo(source, handler) {
    return handler.map(([ func, type, range ]) => {
        const dataSet = map(source, func), domain = extent(dataSet);
        return [dataSet, type(domain, range)];
    });
}

/**
 * Build an axis
 * @param {Selection} parent
 * @param {function} scale
 * @param {"top"|"bottom"|"left"|"right"} orient
 * @param {number} pos
 * @param {{x:number,y:number,r:number}} [title]
 * @param {[function]} calls
 */
export function formatAxis(parent, scale, orient, pos, title, calls) {
    let [p, f, x, y, t] = {
        top:    [parent.select(".top-axis"), axisTop, 0, pos, { x: sum(scale.range()) / 2, y: -30, r: 0 }],
        bottom: [parent.select(".bottom-axis"), axisBottom, 0, pos, { x: sum(scale.range()) / 2, y: 30, r: 0 }],
        left:   [parent.select(".left-axis"), axisLeft, pos, 0, { x: -30, y: sum(scale.range()) / 2, r: 270 }],
        right:  [parent.select(".right-axis"), axisRight, pos, 0, { x: 30, y: sum(scale.range()) / 2, r: 90 }],
    }[orient];
    if (!!title?.pos) [t.x, t.y] = title.pos;
    if (!!title?.rot) [t.r] = title.rot;

    let axis = p.attr("transform", `translate(${x}, ${y})`).call(f(scale));

    if (!!title?.text)
        axis.select(".label")
            .attr("text-anchor", "pos" in title ? "start": "middle")
            .attr("transform", `translate(${t.x},${t.y}) rotate(${t.r})`)
            .text(title.text);

    if (Array.isArray(calls)) calls.forEach(func => axis.call(func));

    return axis;
}

/**
 * Format a line
 * @param {any} source
 * @param {[[],[]]} dataSet
 * @param {function} [defined]
 * @return {Line}
 */
export function formatLine(source, dataSet, defined) {
    const [[xSet, xScale], [ySet, yScale]] = dataSet;
    const definedSet = map(source, !!defined ? defined : (v, i) => dataSet.filter(([ value ]) => isNaN(value[i]))?.length === 0);
    return Line().defined(i => definedSet[i]).curve(curveLinear).x(i => xScale(xSet[i])).y(i => yScale(ySet[i]));
}

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
    const { x, y, type, xType, yType, axis } = options;
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
            const infos = formatInfo(data, [
                [x, xType ?? scaleTime, [marginLeft, width - marginRight]],
                [y, yType ?? scaleLinear, [height - marginBottom, marginTop]]
            ]);
            const [[xSet, xScale], [ySet, yScale]] = infos;
            if (currentZoomState) xScale.domain(currentZoomState.rescaleX(xScale).domain());
            const typeSet = map(data, type), dataSet = map(data, value => value);
            const typeDomain = new InternSet(typeSet);

            /** Fetch tooltip */
            const tooltip = !!tip ? map(data, (value => tip(type(value)))) : typeSet;

            /** Omit any data not present in the z-domain. */
            const safe = range(xSet.length).filter(i => typeDomain.has(typeSet[i]));

            /** Construct a line generator */
            // TODO: defined function should be filter data
            const line = formatLine(data, infos);

            svg.attr("width", width).attr("height", height)
                .attr("viewBox", [0, 0, width, height])
                .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
                .style("-webkit-tap-highlight-color", "transparent")
                .on("pointerenter", pointerentered)
                .on("pointermove", pointermoved)
                .on("pointerleave", pointerleft)
                .on("touchstart", event => event.preventDefault());

            /** Construct axis */
            if (!!axis) axis.forEach(({ scale, orient, label, call }) => {
                const [targetScale, targetPos, targetCall] = {
                    top:    [scale, marginTop, call],
                    bottom: [xScale, height - marginBottom, call],
                    left:   [yScale, marginLeft, call ?? [g => g.select(".domain").remove()]],
                    right:  [scale, width - marginRight, call ?? [g => g.select(".domain").remove()]],
                }[orient];
                formatAxis(svg, targetScale, orient, targetPos, label, targetCall);
            });

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
                 .attr("d", ([, i]) => line(i)));

            /** mouse action */
            function pointermoved(event) {
                const [xm, ym] = pointer(event);
                const i = least(safe, i => Math.hypot(xScale(xSet[i]) - xm, yScale(ySet[i]) - ym)); // closest point
                linePath?.style("stroke", ([z]) => typeSet[i] === z ? null : typeof color === "function" ? `${color(z)}50` : "#ddd").filter(([z]) => typeSet[i] === z).raise();
                svgHandle.attr("transform", `translate(${xScale(xSet[i])}, ${yScale(ySet[i])})`);
                svgHandle.select("text").text(tooltip[i]);
                svg.property("value", dataSet[i]).dispatch("input", { bubbles: true });
            }
            function pointerentered() {
                linePath?.style("mix-blend-mode", null).style("stroke", "#ddd");
                svgHandle.attr("display", null);
            }
            function pointerleft() {
                linePath?.style("mix-blend-mode", mixBlendMode).style("stroke", null);
                svgHandle.attr("display", "none");
                svg.node().value = null;
                svg.dispatch("input", { bubbles: true });
            }

            /** Zoom */
            svg.call(zoom().scaleExtent([0.9, 50]).translateExtent([[0, 0], [posX, posY]]).on("zoom", event => {
                setCurrentZoomState(event.transform)
            }));

            setTypeList(Array.from(typeDomain.keys()).map(item => ({
                raw: item, text: !!tip ? tip(item) : item,
                color: typeof color === "function" ? color(item) : color
            })));
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
            <g className="top-axis"><text className="label" fill="black" /></g>
            <g className="bottom-axis"><text className="label" fill="black" /></g>
            <g className="left-axis"><text className="label" fill="black" /></g>
            <g className="right-axis"><text className="label" fill="black" /></g>
          </svg>
        </div>
    );
}

export default LineChart;

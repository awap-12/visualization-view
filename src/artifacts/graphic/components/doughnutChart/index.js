import React, { useEffect, useRef } from "react";
import { arc as Arc } from "d3-shape";
import { scaleOrdinal } from "d3-scale";
import { hierarchy, partition } from "d3-hierarchy"
import { interpolate, quantize } from "d3-interpolate";
import { interpolateRainbow } from "d3-scale-chromatic";
import { select } from "d3-selection";

import styles from "graphic/styles/doughnut.module.css";

const context = document.createElement("canvas").getContext("2d");

export function formatPartition(data) {
    // 1. create the hierarchy, define the root element
    const root = hierarchy(data)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value);
    // 2. create the partition layout
    return partition().size([2 * Math.PI, root.height + 1])(root);
}

export function formatColor(data) {
    // todo: other style?
    return scaleOrdinal(quantize(interpolateRainbow, data.children.length + 1));
}

export function formatArc(radius) {
    return Arc().startAngle(d => d.x0)
                .endAngle(d => d.x1)
                .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
                .padRadius(radius * 1.5)
                .innerRadius(d => d.y0 * radius)
                .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1))
}

function formatText(element, maxWidth, lineHeight = 1.1, unit = "em") {
    let words = element.text().split(/\s+/).reverse(), word, line = [], lineNumber = 0;

    // styling parameters
    const x = element.attr("x"), y = element.attr("y");

    // clear element text
    element.text(null);

    // append first tspan element (to fill as we build the lines)
    let tspan = element.append("tspan")
        .attr("x", x)
        .attr("y", y)
        .attr("dy", 0);

    // loop through all words and make new lines when we exceed our max_width
    while ((word = words.pop())) {
        line.push(word);
        tspan.text(line.join(" "));
        if (context.measureText(tspan.text()).width > maxWidth) {
            line.pop();
            tspan.text(line.join(" "));
            line = [word];
            tspan = element.append("tspan")
                .attr("x", 0) // x
                .attr("y", ++lineNumber * lineHeight) // y
                .attr("dy", `${lineNumber * lineHeight}${unit}`)
                .text(word);
        }
    }
}

/**
 * A DoughnutChart
 * @param {object} source data source
 * @param width
 * @param height
 * @param radius
 * @return {JSX.Element}
 */
function DoughnutChart({ source, width = 640, height = 640, radius = width / 6 }) {
    const svgRef = useRef(null);

    useEffect(() => {
        if (source && svgRef.current) {
            const root = formatPartition(source).each(d => d.current = d); // copy
            const svg = select(svgRef.current);
            const container = svg.select(".container");

            const color = formatColor(source);
            const arc = formatArc(radius);

            const path = container.select(".path")
                .selectAll("path")
                .data(root.descendants().slice(1))
                .join("path")
                 .attr("fill", d => { while (d.depth > 1) d = d.parent; return color(d.data.name); })
                 .attr("fill-opacity", d => arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0)
                 .attr("pointer-events", d => arcVisible(d.current) ? "auto" : "none")
                 .attr("d", d => arc(d.current));
            path.filter(d => "children" in d)
                .style("cursor", "pointer")
                .on("click", clicked);

            const label = container.select(".label")
                .style("user-select", "none")
                .selectAll("text")
                .data(root.descendants().slice(1))
                .join("text")
                 .attr("dy", "0.35em")
                 .attr("fill-opacity", d => +labelVisible(d.current))
                 .attr("transform", d => labelTransform(d.current))
                 .text(d => d.data.name);
            container.selectAll("text")
                .each(function() { formatText(select(this), 100) });

            const parent = container.select(".parent")
                .datum(root)
                 .attr("r", radius)
                 .attr("fill", "none")
                 .attr("pointer-events", "all")
                .on("click", clicked);

            function clicked(event, p) {
                parent.datum(p.parent || root);

                root.each(d => d.target = {
                    x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
                    x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
                    y0: Math.max(0, d.y0 - p.depth),
                    y1: Math.max(0, d.y1 - p.depth)
                });

                const t = container.transition().duration(750);

                // Transition the data on all arcs, even the ones that aren’t visible,
                // so that if this transition is interrupted, entering arcs will start
                // the next transition from the desired position.
                path.transition(t)
                    .tween("data", d => {
                        const i = interpolate(d.current, d.target);
                        return t => d.current = i(t);
                    })
                    .filter(function(d) {
                        return +this.getAttribute("fill-opacity") || arcVisible(d.target);
                    })
                    .attr("fill-opacity", d => arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0)
                    .attr("pointer-events", d => arcVisible(d.target) ? "auto" : "none")
                    .attrTween("d", d => () => arc(d.current));

                label.filter(function(d) {
                        return +this.getAttribute("fill-opacity") || labelVisible(d.target);
                    })
                    .transition(t)
                    .attr("fill-opacity", d => +labelVisible(d.target))
                    .attrTween("transform", d => () => labelTransform(d.current));
            }

            function arcVisible(d) {
                return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
            }

            function labelVisible(d) {
                return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
            }

            function labelTransform(d) {
                const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
                const y = (d.y0 + d.y1) / 2 * radius;
                return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
            }
        }
    });

    return (
        <svg ref={svgRef}
             className={styles.svg}
             width={width}
             height={height}
             viewBox={`0 0 ${width} ${height}`}>
          <g className="container"
             transform={`translate(${width / 2},${width / 2})`}>
            <g className="path" />
            <g className="label"
               pointerEvents="none"
               textAnchor="middle" />
            <circle className="parent" />
          </g>
        </svg>
    );
}

export default DoughnutChart;

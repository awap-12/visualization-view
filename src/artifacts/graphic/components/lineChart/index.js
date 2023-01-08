import React, { useCallback, useEffect, useRef, useState } from "react";
import { extent, group, InternSet, least, map, range } from "d3-array";
import { curveLinear, line as Line } from "d3-shape";
import { pointer, select } from "d3-selection";
import { zoom } from "d3-zoom";
import { useResizer } from "shared";
import LabelGroup from "./label";
import Axis from "./axis";
import Tooltip from "./tooltip";

/**
 * A LineChart builder, props should have the same data structure as line callback
 * @param {string} id The uuid for line chart
 * @param {number} width The outer width of line chart, in pixels
 * @param {number} height The outer height of line chart, in pixels
 * @param {{top:number,right:number,bottom:number,left:number}} margin The margin of line chart, in pixels
 * @param {LineOptions} stroke The stroke settings
 * @param {[object]} source The data source. e.g. {type, x, y}[]
 * @param {function} defined The gap of data display
 * @param {[[function,function,[number,number],[{orient:string,offset:number,title?:object,calls?:[function]}]]]} dataDescHandler A wrapper for [Data analyzer, Type of scalar, Range of data type in chart, Axes data]
 * @param {[[func:function,config?:function]]} typeDescHandler A wrapper for [Type analyzer, Type info formatting callback]
 * @param {object} options
 * @return {JSX.Element}
 */
function LineChart({ id, width, height, margin, stroke, source, defined, dataDescHandler, typeDescHandler, ...options } = {}) {
    const [currentZoomState, setCurrentZoomState] = useState(null);
    const [tooltipDesc, setTooltipDesc] = useState({});
    const [dataDesc, setDataDesc] = useState(null);
    const [typeDesc, setTypeDesc] = useState(null);
    const [lineDesc, setLineDesc] = useState(null);
    const [axisDesc, setAxisDesc] = useState(null);
    const tooltipRenderLock = useRef({ onExecute: false });
    const tooltipRef = useRef(null);
    const contentRef = useRef(null);
    const chartRef = useRef(null);
    const svgRef = useRef(null);
    const dimensions = useResizer(chartRef);

    useEffect(() => {
        const { width, height } = dimensions || chartRef.current.getBoundingClientRect();
        select(svgRef.current).call(zoom()
            .scaleExtent([0.9, 50])
            .translateExtent([[0, 0], [width, height]])
            .on("zoom", event => {
                setCurrentZoomState(event.transform);
            }));
    }, [dimensions]);

    useEffect(() => {
        const result = dataDescHandler.map(([func, type, range, axes]) => {
            const dataSet = map(source, func), domain = extent(dataSet), scale = type(domain, range);
            return {
                data: { dataSet, domain, scale },
                axis: axes.map(({ orient, title, calls }) => {
                    const [targetOffset, targetCalls] = {
                        top:    [margin.top, calls],
                        bottom: [height - margin.bottom, calls],
                        left:   [margin.left, calls ?? [g => g.select(".domain").remove()]],
                        right:  [width - margin.right, calls ?? [g => g.select(".domain").remove()]]
                    }[orient];
                    return { scale, orient, offset: targetOffset, title, calls: targetCalls };
                }),
            };
        });
        setDataDesc(result.map(({ data }, index) => {
            if (!currentZoomState) return data;
            switch (index) {
                case 0:
                    const { scale } = data;
                    scale.domain(currentZoomState.rescaleX(scale).domain());
                    return data;
                default: return data;
            }
        }));
        setAxisDesc(result.map(({ axis }) => axis).flat());
    }, [dataDescHandler, source, width, height, margin, currentZoomState]);

    useEffect(() => {
        setTypeDesc(typeDescHandler.map(([func, config]) => {
            const dataSet = map(source, func), types = new InternSet(dataSet), keys = Array.from(types.keys());
            return { dataSet, types, config: keys.map(key => ({ key: key, ...config(key) })) };
        }));
    }, [typeDescHandler, source]);

    useEffect(() => {
        if (!!dataDesc && !!typeDesc && !!lineDesc) {
            const [{ dataSet: xSet, scale: xScale }, { dataSet: ySet, scale: yScale }] = dataDesc;
            const [{ display: displaySet, colorMap }] = lineDesc;
            const [{ dataSet: typeSet, types }] = typeDesc;
            const content = select(contentRef.current);

            /** Remove all unknown type from the source */
            const safeDataSet = range(xSet.length).filter(i => types.has(typeSet[i]));

            const definedSet = map(source, defined ?? (() => true));

            const lineGenerator = Line()
                .defined(i => definedSet[i])
                .curve(curveLinear)
                .x(i => xScale(xSet[i]))
                .y(i => yScale(ySet[i]));

            content.selectAll("path")
                .data(group(safeDataSet, i => typeSet[i]))
                .join("path")
                .style("mix-blend-mode", stroke.mixBlendMode)
                .attr("stroke", ([type]) => colorMap[type])
                .attr("d", ([, i]) => lineGenerator(i))
                .each(function([type]) {
                    select(this).attr("visibility", displaySet.has(type) ? "visible" : "hidden");
                });
        }
    }, [dataDesc, typeDesc, lineDesc, stroke.mixBlendMode, source, defined]);

    function pointerEntered() {
        if (tooltipRenderLock.current.onExecute) {
            setTooltipDesc({ ...tooltipDesc, visible: true });
        }
    }

    function pointerMoved(event) {
        if (!tooltipRenderLock.current.onExecute) {
            tooltipRenderLock.current = {
                onExecute: true,
                timer: setTimeout(() => tooltipRenderLock.current = { onExecute: false }, 100)
            };

            const [{ dataSet: xSet, scale: xScale }, { dataSet: ySet, scale: yScale }] = dataDesc;
            const [{ display: displaySet, labelMap }] = lineDesc;
            const [{ dataSet: typeSet }] = typeDesc;
            const [xm, ym] = pointer(event);
            const i = least(range(xSet.length).filter(i => displaySet.has(typeSet[i])),
                i => Math.hypot(xScale(xSet[i]) - xm, yScale(ySet[i]) - ym)); // closest point

            const point = svgRef.current.createSVGPoint();
            [point.x, point.y] = [xScale(xSet[i]), yScale(ySet[i])];

            setTooltipDesc({
                ...tooltipDesc,
                visible: true,
                position: point.matrixTransform(svgRef.current.getScreenCTM()),
                content: [`type: ${labelMap[typeSet[i]]}`, `year: ${xSet[i]}`, `data: ${ySet[i]}`]
            });
        }
    }

    function pointerLeft() {
        tooltipRenderLock.current = { onExecute: false };
        setTooltipDesc({ ...tooltipDesc, visible: false });
    }

    return(
        <div ref={chartRef}
             className={{...options.className}}
             style={{
                 marginBottom: "2rem",
                 ...options.style
             }}>
          <LabelGroup typeConfig={(typeDesc ?? [])[0]?.config}
                      callback={useCallback(data => {
                          const [{ config: typeConfig }] = typeDesc;

                          setLineDesc([{
                              dataSet: data,
                              display: new Set(data.map(({ key, state }) => state ? key : undefined)),
                              labelMap: typeConfig.reduce((pre, { key, label }) => ({ ...pre, [key]: label }), {}),
                              colorMap: typeConfig.reduce((pre, { key, color }) => ({ ...pre, [key]: color }), {})
                          }]);
                      }, [typeDesc])} />
          <Tooltip ref={tooltipRef}
                   position={tooltipDesc?.position}
                   visible={tooltipDesc?.visible}
                   content={tooltipDesc?.content} />
          <svg ref={svgRef}
               width={width}
               height={height}
               viewBox={`0 0 ${width} ${height}`}
               style={{ maxWidth: "100%", height: "auto" }}
               onPointerEnter={pointerEntered}
               onPointerMove={pointerMoved}
               onPointerLeave={pointerLeft}
               onTouchStart={event => event.preventDefault()}>
            <defs>
              <clipPath id={id}>
                <rect x={margin.left} y={margin.top}
                      width={width - margin.right - margin.left}
                      height={height - margin.bottom - margin.top} />
              </clipPath>
            </defs>
            <g ref={contentRef}
               clipPath={`url(#${id})`}
               strokeLinecap={stroke.linecap}
               strokeLinejoin={stroke.linejoin}
               strokeWidth={stroke.width}
               strokeOpacity={stroke.opacity}
               fill="none" />
            {axisDesc?.map((props, index) =>
                <Axis key={`axis-${index}`} {...props} />
            )}
          </svg>
        </div>
    );
}

export default LineChart;

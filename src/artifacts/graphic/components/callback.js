import { useCallback, useContext } from "react";
import { scaleLinear, scaleTime } from "d3-scale";
import { GraphicContext } from "./context";
import generateUUID from "./utils/uuid";

function useGraphicCallback() {
    const { options: globalOptions = { line: {}, doughnut: {} }, dispatch } = useContext(GraphicContext);

    return {
        line: useCallback((action, { id, source, config, axes, x, y, type, xKey, yKey, xType, yType, ...options }) => {
            if ([source, xKey, yKey, type].some(value => !value))
                throw new Error(`Require params ${[{source}, {xKey}, {yKey}, {type}]
                    .filter(value => !Object.values(value)[0])
                    .map(value => Object.keys(value)[0])
                    .join(", ")}`);

            const CHART_TYPE = "line"
            const {
                width = 960,
                height = 600,
                marginTop = 20,
                marginRight = 30,
                marginBottom = 30,
                marginLeft = 40,
                margin = {
                    top: marginTop,
                    right: marginRight,
                    bottom: marginBottom,
                    left: marginLeft
                },
                color = "currentColor",
                strokeLinecap = "round",
                strokeLinejoin = "round",
                strokeWidth = 1.5,
                strokeOpacity = 1,
                mixBlendMode = "multiply",
                stroke = {
                    linecap: strokeLinecap,
                    linejoin: strokeLinejoin,
                    width: strokeWidth,
                    opacity: strokeOpacity,
                    mixBlendMode: mixBlendMode
                },
                content
            } = { ...globalOptions[CHART_TYPE], ...options };

            dispatch({
                type: action,
                payload: {
                    id: id ?? generateUUID(),
                    type: CHART_TYPE,
                    width: width,
                    height: height,
                    margin: margin,
                    stroke: stroke,
                    source: source,
                    defined: () => true,
                    dataDescHandler: [
                        [x ?? (value => value[xKey]), xType ?? scaleTime,   [margin.left, width - margin.right],  [{ orient: "bottom" }] ],
                        [y ?? (value => value[yKey]), yType ?? scaleLinear, [height - margin.bottom, margin.top], [{ orient: "left" }]   ]
                    ],
                    typeDescHandler: [
                        [type, key => ({ label: key, color: color, ...config(key) })]
                    ],
                    tipDescHandler: [
                        [xKey ?? "time", yKey ?? "data"], content
                    ]
                }
            });
        }, [globalOptions, dispatch]),
        doughnut: useCallback((action, { id, source, ...options }) => {
            const CHART_TYPE = "doughnut"
            const {
                width = 600,
                height = 600
            } = { ...globalOptions[CHART_TYPE], ...options };

            dispatch({
                type: action,
                payload: {
                    id: id ?? generateUUID(),
                    type: CHART_TYPE,
                    width: width,
                    height: height,
                    source: source
                }
            });
        }, [globalOptions, dispatch])
    };
}

export default useGraphicCallback

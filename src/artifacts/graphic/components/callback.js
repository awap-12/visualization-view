import { useCallback, useContext } from "react";
import { scaleLinear, scaleTime } from "d3-scale";
import { GraphicContext } from "./context";

const UUID_SIZE = 16;

/**
 * Generate a group of random bytes
 * @param {number} size
 * @return {Uint8Array}
 */
function generateRandomBytes(size) {
    const buffer = new Uint8Array(size);
    for (let i = 0; i < size; ++i)
        buffer[i] = Math.random() * 0xff | 0;
    return buffer;
}

/**
 * Generate UUID base on [RFC 4122]{@link https://www.rfc-editor.org/rfc/rfc4122.txt}
 * @param {number} size
 * @return {string}
 */
function generateUUID(size = UUID_SIZE) {
    const data = generateRandomBytes(size);
    // mark as random - RFC 4122 § 4.4
    data[6] = (data[6] & 0x4f) | 0x40;
    data[8] = (data[8] & 0xbf) | 0x80;
    let result = '';
    for (let offset = 0; offset < size; ++offset) {
        const byte = data[offset];
        if (offset === 4 || offset === 6 || offset === 8) result += "-";
        if (byte < 16) result += "0";
        result += byte.toString(16).toLowerCase();
    }
    return result;
}

function useGraphicCallback() {
    const { options: globalOptions = { line: {}, doughnut: {} }, dispatch } = useContext(GraphicContext);

    return {
        line: useCallback((action, { id, source, config, axes, x, y, type, xType, yType, ...options }) => {
            if ([source, x, y, type].some(value => !value))
                throw new Error(`Require params ${[{source}, {x}, {y}, {type}]
                    .filter(value => !Object.values(value)[0])
                    .map(value => Object.keys(value)[0])
                    .join(", ")}`);

            const CHART_TYPE = "line"
            const {
                width = 960,
                height = 600,
                marginTop = 20,
                marginRight = 80,
                marginBottom = 60,
                marginLeft = 80,
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
                        [x, xType ?? scaleTime,   [margin.left, width - margin.right],  [{ orient: "bottom" }] ],
                        [y, yType ?? scaleLinear, [height - margin.bottom, margin.top], [{ orient: "left" }]   ]
                    ],
                    typeDescHandler: [
                        [type, key => ({ label: key, color: color, ...config(key) })]
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

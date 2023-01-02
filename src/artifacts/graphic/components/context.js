import React, { createContext, useReducer } from "react";

/**
 * @typedef {object} ChartData
 * @property {string} id chart id
 * @property {array} source grouped data from source
 * @property {[]} dataSet
 * @property {[]} typeSet
 */

/**
 * @typedef {object} ChartsOptions
 * @property {{width:number,height:number,margin:{top:number,right:number,bottom:number,left:number}}&LineOptions} line
 * @property {{width:number,height:number}} doughnut
 */

/**
 * The default state of charts context
 * @type {{charts:ChartData[],options:ChartsOptions}}
 */
const initialState = {
    options: {
        "line": {
            width: 960,
            height: 600,
            margin: { top: 20, right: 80, bottom: 60, left: 80 },
            color: "currentColor",
            stroke: {
                linecap: "round",
                linejoin: "round",
                width: 1.5,
                opacity: 1,
                mixBlendMode: "multiply"
            }
        },
        "doughnut": {
            width: 600,
            height: 600
        }
    },
    charts: []
};

/**
 * content reducer for charts.
 * @param {{charts:ChartData[],options:ChartsOptions}} state
 * @param {"post"|"put"|"delete"} type
 * @param {ChartData|string} payload
 * @return {{charts:ChartData[], options:ChartsOptions}}
 */
function reducer(state, { type, payload }) {
    switch (type) {
        case "post":
            return { ...state, charts: [...state.charts, payload] };
        case "put":
            const index = state.charts.findIndex(({ id }) => id === payload.id);
            if (index < 0) throw new RangeError("not valid record");
            return { ...state, charts: state.charts.splice(index, 1, payload) };
        case "delete":
            return { ...state, charts: state.charts.filter(chart => chart.id !== payload) };
        default:
            return state;
    }
}

export const GraphicContext = createContext({ ...initialState, dispatch: () => null });

/**
 * Graphic context provider.
 * @param {JSX.Element} children
 * @param {ChartsOptions} options
 * @return {JSX.Element}
 */
function GraphicProvider({ children, options = {} }) {
    const [state, dispatch] = useReducer(reducer, { ...initialState, options });

    return (
        <GraphicContext.Provider value={{ ...state, dispatch }}>
            {children}
        </GraphicContext.Provider>
    );
}

export default GraphicProvider;

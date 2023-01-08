import React, { createContext, useReducer } from "react";

/**
 * options includes:
 * - global setup for timeouts dataset
 * @type {{alerts: *[], options: {}}}
 */
const initialState = {
    options: {
        timeouts: 1500
    },
    alerts: []
};

function reducer(state, { type, payload }) {
    switch (type) {
        case "post":
            return { ...state, alerts: [...state.alerts, payload] };
        case "delete":
            return { ...state, alerts: state.alerts.filter(alert => alert.id !== payload) };
        default:
            return state;
    }
}

export const AlertContext = createContext({ ...initialState, dispatch: () => null });

function AlertProvider({ children, options = {} }) {
    const [state, dispatch] = useReducer(reducer, { ...initialState, options });

    return (
        <AlertContext.Provider value={{ ...state, dispatch }}>
          {children}
        </AlertContext.Provider>
    );
}

export default AlertProvider;

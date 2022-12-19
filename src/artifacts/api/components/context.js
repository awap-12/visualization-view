import React, { createContext, useReducer } from "react";

const initialState = { options: {}, alerts: [] };

/**
 *
 * @param state
 * @param type
 * @param {{id:string}|string} payload when post {id, ...data}, when delete id is enough
 * @return *
 */
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

export const ApiContext = createContext({ ...initialState, dispatch: () => null });

function ApiProvider({ children, options = {} }) {
    const [state, dispatch] = useReducer(reducer, { ...initialState, options });

    return (
        <ApiContext.Provider value={{ ...state, dispatch }}>
            {children}
        </ApiContext.Provider>
    );
}

export default ApiProvider;

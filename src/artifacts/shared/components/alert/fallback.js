import { useCallback, useContext } from "react";
import { AlertContext } from "./context";

/**
 * Error fallback alert hook.
 * @param {"toast"|"modal"} category
 * @return {{success,warning}}
 */
function useAlertFallback(category = "toast") {
    const { dispatch } = useContext(AlertContext);

    const formatId = () => window.btoa(`API-${Date.now()}`).slice(0, -1);

    // use options to override `category`
    return {
        success: useCallback((message, options) => {
            dispatch({
                type: "post",
                payload: {
                    id: formatId(),
                    type: "success",
                    category: category,
                    timeout: 1000,
                    message: message,
                    ...options
                }
            });
        }, [category, dispatch]),
        warning: useCallback((message, options) => {
            dispatch({
                type: "post",
                payload: {
                    id: formatId(),
                    type: "warning",
                    category: category,
                    timeout: 1500,
                    message: message,
                    ...options
                }
            });
        }, [category, dispatch]),
        info: useCallback((message, options) => {
            dispatch({
                type: "post",
                payload: {
                    id: formatId(),
                    type: "info",
                    category: category,
                    timeout: 1000,
                    message: message,
                    ...options
                }
            });
        }, [category, dispatch]),
        danger: useCallback((message, options) => {
            dispatch({
                type: "post",
                payload: {
                    id: formatId(),
                    type: "error",
                    category: category,
                    timeout: 2000,
                    message: message,
                    ...options
                }
            });
        }, [category, dispatch])
    }
}

export default useAlertFallback;

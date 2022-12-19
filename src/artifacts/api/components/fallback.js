import { useCallback, useContext } from "react";
import { ApiContext } from "./context";

function useFallback() {
    const { dispatch } = useContext(ApiContext);

    return {
        success: useCallback((message, options) => {
            dispatch({
                type: "post",
                payload: {
                    id: window.btoa(`API-${Date.now()}`),
                    type: "success",
                    timeout: 1000,
                    message: message,
                    ...options
                }
            });
        }, [dispatch]),
        warning: useCallback((message, options) => {
            dispatch({
                type: "post",
                payload: {
                    id: window.btoa(`API-${Date.now()}`),
                    type: "warning",
                    timeout: 1500,
                    message: message,
                    ...options
                }
            });
        }, [dispatch])
    }
}

export default useFallback;

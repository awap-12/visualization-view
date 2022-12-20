import { useCallback, useContext } from "react";
import { ApiContext } from "./context";

function useFallback() {
    const { dispatch } = useContext(ApiContext);

    return {
        toast: {
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
        },
        modal: {
            // todo: sweet alert like alert.
        }
    }
}

export default useFallback;

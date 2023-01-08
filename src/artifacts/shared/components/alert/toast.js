import React, { useContext, useEffect, useState, useRef } from "react";
import { AlertContext } from "./context";
import { Alert } from "react-bootstrap";

function ToastAlert({ id, timeout, type, message }) {
    const { dispatch, options } = useContext(AlertContext);
    const [show, setShow] = useState(true);
    const timeoutTimer = useRef();
    const deleteTimer = useRef();

    useEffect(() => {
        const timer = timeoutTimer.current;

        let temp = !!options.timeouts && type in options.timeouts
            ? options.timeouts[type]
            : timeout;

        if (typeof temp !== "undefined") {
            clearTimeout(timer);
            timeoutTimer.current = setTimeout(() => setShow(false), +temp);
        }

        return () => clearTimeout(timer);
    }, [options, type, timeout]);

    useEffect(() => {
        const timer = deleteTimer.current;
        clearTimeout(timer);

        if (show === false)
            deleteTimer.current = setTimeout(() => {
                dispatch({ type: "delete", payload: id });
            }, 2000); // animation should sync to css

        return () => clearTimeout(timer);
    }, [show, dispatch, id])

    return (
        <Alert show={show} variant={type} dismissible={true} onClose={() => setShow(false)}>
          {message}
        </Alert>
    );
}

export default ToastAlert;

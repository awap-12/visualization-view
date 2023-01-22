import React, { useContext, useEffect, useState, useRef } from "react";
import { AlertContext } from "./context";

import styles from "shared/styles/alert/toast.module.css";

function ToastAlert({ className, id, timeout, type, message } = {}) {
    const { dispatch, options } = useContext(AlertContext);
    const [show, setShow] = useState(true);
    const timeoutTimer = useRef();
    const deleteTimer = useRef();

    useEffect(() => {
        const timer = timeoutTimer.current;

        let temp = timeout ?? (!!options.timeouts && type in options.timeouts
            ? options.timeouts[type] : options.timeouts);

        if (!!temp && temp > 0) {
            clearTimeout(timer);
            timeoutTimer.current = setTimeout(() => {
                setShow(false);
            }, temp);
        }

        return () => clearTimeout(timer);
    }, [options, type, timeout]);

    useEffect(() => {
        const timer = deleteTimer.current;
        clearTimeout(timer);

        if (show === false)
            deleteTimer.current = setTimeout(() => {
                dispatch({ type: "delete", payload: id });
            }, 200); // animation should sync to css

        return () => clearTimeout(timer);
    }, [show, dispatch, id])

    return (
        <div className={[styles.alert, className].filter(Boolean).join(" ")}
             style={{
                 marginTop: show ? 0 : -10000,
                 ...{
                     success: {
                         backgroundColor: "#d1e6dc",
                         color: "#146c43",
                         borderColor: "#a3cfbb"
                     },
                     warning: {
                         backgroundColor: "#fff3cd",
                         color: "#997404",
                         borderColor: "#ffe69c"
                     }
                 }[type]
             }}>
          <button onClick={() => setShow(false)} />
          {message}
        </div>
    );
}

export default ToastAlert;

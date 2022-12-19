import React, { useContext, useEffect, useState, useRef } from "react";
import {Alert, Stack} from "react-bootstrap";
import { ApiContext } from "./context";
//import Icon from "./icon";
import "../styles/holder/toast.css";
import "../styles/holder.css";

function ToastAlert({ id, timeout, type, message }) {
    const { dispatch, options } = useContext(ApiContext);
    const [show, setShow] = useState(true);
    const timeoutTimer = useRef();
    const deleteTimer = useRef();

    useEffect(() => {
        const timer = timeoutTimer.current;

        let temp = !!options.timeouts && type in options.timeouts
            ? options.timeouts[type]
            : timeout;

        if (typeof temp !== "undefined") {
            window.clearTimeout(timer);
            timeoutTimer.current = window.setTimeout(() => {
                setShow(false);
            }, +temp);
        }

        return () => window.clearTimeout(timer);
    }, [options, type, timeout]);

    useEffect(() => {
        const timer = deleteTimer.current;
        window.clearTimeout(timer);

        if (show === false)
            deleteTimer.current = window.setTimeout(() => {
                dispatch({ type: "delete", payload: id });
            }, 2000);

        return () => window.clearTimeout(timer);
    }, [show, dispatch, id])

    return (
        <Alert show={show} variant={type} dismissible={true} onClose={() => setShow(false)}>
            {message}
        </Alert>
    );
}

function ToastAlertHolder() {
    const { alerts } = useContext(ApiContext);

    return (
        <div className="toast-alert-holder">
          <Stack className="col-md-5 mx-auto">
              {alerts.map(({ id, timeout, type, message }) => (
                  <ToastAlert key={id} id={id} timeout={timeout} type={type} message={message}/>
              ))}
          </Stack>
        </div>
    );
}

function Holder() {
    return <ToastAlertHolder />;
}

export default Holder;

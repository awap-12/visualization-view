import React, { useContext, useEffect, useState, useRef } from "react";
import { Container, Row, Col } from "../layout";
import { Button } from "react-bootstrap";
import { AlertContext } from "./context";

import styles from "shared/styles/alert/modal.module.css";
import Icon from "../icon";

function Overlay({ show, onClick, onKeyDown, children }) {
    return !!show ?
        <div className={styles.overlay}
             onClick={event => onClick(event)}>
          <Container className={styles.container}
                     onClick={event => event.stopPropagation()}
                     onKeyDown={event => onKeyDown(event)}
                     tabIndex={0}>
              {children}
          </Container>
        </div> :
        <Container className={styles.container}
                   onKeyDown={event => onKeyDown(event)}
                   tabIndex={0}>
            {children}
        </Container>;
}

function ModalAlert({
    id, type, title = type.replace(/^\w/, letter => letter.toUpperCase()),
    children, buttons = {},
    hideOverlay = false,
    allowEscape = true,
    closeOnClickOutside = true
}) {
    const { dispatch } = useContext(AlertContext);
    const [show, setShow] = useState(true);
    const deleteTimer = useRef();

    useEffect(() => {
        const timer = deleteTimer.current;
        clearTimeout(timer);

        if (show === false)
            deleteTimer.current = setTimeout(() => {
                dispatch({ type: "delete", payload: id });
            }, 1000); // animation should sync to css

        return () => clearTimeout(timer);
    }, [show, dispatch, id]);

    // close modal with key operation
    function onKeyDown(event) {
        if (event.key === "Escape" && allowEscape) {
            event.stopPropagation(); // block bubble here
            setShow(false);
        }
    }

    // close modal operation
    function onClickOutside() {
        if (closeOnClickOutside) setShow(false);
    }

    return !!show ?
        <Overlay show={!hideOverlay} onClick={onClickOutside} onKeyDown={onKeyDown}>
          <Row justify="center">
            <Col>
              <Icon type={type} />
            </Col>
          </Row>
          <Row justify="center" className={styles.header}>
            <Col>
              <h2>{title}</h2>
            </Col>
          </Row>
          <Row justify="center" className={styles.content}>
            <Col>
                {children}
            </Col>
          </Row>
          <Row justify="center" className={styles.footer}>
              {Object.entries({ ...{
                      cancel: {
                          text: "Cancel",
                          visible: false,
                          onClick: () => setShow(false)
                      },
                      confirm: {
                          text: "OK",
                          visible: true,
                          onClick: () => setShow(false)
                      }
                  }, ...buttons }).map(([type, { text, visible, ...other }]) => (
                  !!visible ?
                      <Col key={type}>
                        <Button {...other} variant="primary">
                            {text}
                        </Button>
                      </Col> : null
              ))}
          </Row>
        </Overlay> : null;
}

export default ModalAlert;

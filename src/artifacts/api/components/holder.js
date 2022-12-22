import React, { useContext, useEffect, useState } from "react";
import { Col, Row, Stack } from "react-bootstrap";
import { AlertContext, ToastAlert, ModalAlert } from "./alert";

import "api/styles/holder/toast.css";
import "api/styles/holder/modal.css";

function InfoContextHolder() {
    const [alertGrouped, setAlertGrouped] = useState({});
    const { alerts } = useContext(AlertContext);

    useEffect(() => {
        setAlertGrouped(alerts.reduce((pre, cur) => {
            (pre[cur.category] ??= []).push(cur);
            return pre;
        }, {}));
    }, [alerts]);

    // TODO: replace by Array.prototype.group or Array.prototype.groupToMap.
    return (
        <>
          <div className="modal-alert-holder">
              {alertGrouped["modal"]?.map((props, index) => !Boolean(index) ? (
                  <ModalAlert key={props.id} {...props}>
                      {props.message}
                  </ModalAlert>
              ) : null)}
          </div>
          <div className="toast-alert-holder">
            <Stack className="col-md-5 mx-auto">
                {alertGrouped["toast"]?.map(props => (
                    <Row key={props.id}>
                      <Col>
                        <ToastAlert {...props} />
                      </Col>
                    </Row>
                ))}
            </Stack>
          </div>
        </>
    );
}

export default InfoContextHolder;

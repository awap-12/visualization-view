import React, { useContext, useEffect, useState } from "react";
import { AlertContext, ToastAlert, ModalAlert } from "./alert";
import { Col, Row } from "shared";

import toastStyles from "shared/styles/holder/toast.module.css";
import modalStyles from "shared/styles/holder/modal.module.css";

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
          <div className={modalStyles.holder}>
            {alertGrouped["modal"]?.map((props, index) => !Boolean(index)
                ? <ModalAlert key={props.id} {...props}>{props.message}</ModalAlert>
                : null)}
          </div>
          <div className={toastStyles.holder}>
            {alertGrouped["toast"]?.map(props => (
                <Row key={props.id}>
                  <Col>
                    <ToastAlert {...props} />
                  </Col>
                </Row>
            ))}
          </div>
        </>
    );
}

export default InfoContextHolder;

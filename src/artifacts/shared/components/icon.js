import React from "react";
import errorStyles from "shared/styles/icon/error.module.css";
import infoStyles from "shared/styles/icon/info.module.css";
import warningStyles from "shared/styles/icon/warning.module.css";
import successStyles from "shared/styles/icon/success.module.css";
import customStyles from "shared/styles/icon/custom.module.css";
import styles from "shared/styles/icon.module.css";

function Icon({ type, src }) {
    switch (type) {
        case "error":
            return (
                <div className={[styles.icon, errorStyles.icon].join(" ")}>
                  <div className={errorStyles.xMark}>
                    <span className={[errorStyles.line, errorStyles.lineLeft].join(" ")} />
                    <span className={[errorStyles.line, errorStyles.lineRight].join(" ")} />
                  </div>
                </div>
            );
        case "warning":
            return (
                <div className={[styles.icon, warningStyles.icon].join(" ")}>
                  <span className={warningStyles.body}>
                    <span className={warningStyles.dot} />
                  </span>
                </div>
            );
        case "info":
            return (
                <div className={[styles.icon, infoStyles.icon].join(" ")} />
            );
        case "success":
            return (
                <div className={[styles.icon, successStyles.icon].join(" ")}>
                  <span className={[successStyles.line, successStyles.lineLong].join(" ")} />
                  <span className={[successStyles.line, successStyles.lineTip].join(" ")} />
                  <div className={successStyles.ring} />
                  <div className={successStyles.hideCorners} />
                </div>
            );
        case "custom":
            return (
                <div className={[styles.icon, customStyles.icon].join(" ")}>
                  <img src={src} alt="Icon" />
                </div>
            );
        default:
            return null;
    }
}

export default Icon;

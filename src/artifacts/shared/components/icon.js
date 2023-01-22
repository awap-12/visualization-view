import React from "react";
import errorStyles from "shared/styles/icon/error.module.css";
import infoStyles from "shared/styles/icon/info.module.css";
import warningStyles from "shared/styles/icon/warning.module.css";
import successStyles from "shared/styles/icon/success.module.css";
import customStyles from "shared/styles/icon/custom.module.css";
import styles from "shared/styles/icon.module.css";

function Icon({ type, src }) {
    return({
        error:
            <div className={[styles.icon, errorStyles.icon].join(" ")}>
              <div className={errorStyles.xMark}>
                <span className={[errorStyles.line, errorStyles.lineLeft].join(" ")} />
                <span className={[errorStyles.line, errorStyles.lineRight].join(" ")} />
              </div>
            </div>,
        warning:
            <div className={[styles.icon, warningStyles.icon].join(" ")}>
              <span className={warningStyles.body}>
                <span className={warningStyles.dot} />
              </span>
            </div>,
        info:
            <div className={[styles.icon, infoStyles.icon].join(" ")} />,
        success:
            <div className={[styles.icon, successStyles.icon].join(" ")}>
              <span className={[successStyles.line, successStyles.lineLong].join(" ")} />
              <span className={[successStyles.line, successStyles.lineTip].join(" ")} />
              <div className={successStyles.ring} />
              <div className={successStyles.hideCorners} />
            </div>,
        custom:
            <div className={[styles.icon, customStyles.icon].join(" ")}>
              <img src={src} alt="Icon" />
            </div>
    }[type] ?? null);
}

export default Icon;

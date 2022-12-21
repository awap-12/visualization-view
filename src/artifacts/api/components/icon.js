import React, { useState, useEffect } from "react";
import "api/styles/icon/error.css";
import "api/styles/icon/info.css";
import "api/styles/icon/warning.css";
import "api/styles/icon/success.css";
import "api/styles/icon.css";

const ICON_NAME = "alert-icon";

function Icon({ type, src }) {
    const [iconClass, setIconClass] = useState('')

    useEffect(() => {
        setIconClass(`${ICON_NAME}--${type}`);
    }, [type]);

    return !!type ? (
        <div className={`${ICON_NAME} ${iconClass}`}>
            {
                {
                    error:
                        <div className={`${iconClass}__x-mark`}>
                          <span className={`${iconClass}__line ${iconClass}__line--left`} />
                          <span className={`${iconClass}__line ${iconClass}__line--right`} />
                        </div>,
                    warning:
                        <span className={`${iconClass}__body`}>
                          <span className={`${iconClass}__dot`} />
                        </span>,
                    success:
                        <>
                          <span className={`${iconClass}__line ${iconClass}__line--long`} />
                          <span className={`${iconClass}__line ${iconClass}__line--tip`} />
                          <div className={`${iconClass}__ring`} />
                          <div className={`${iconClass}__hide-corners`} />
                        </>,
                    custom:
                        <img src={src}  alt="Icon" />
                }[type] ?? null
            }
        </div>
    ) : null;
}

export default Icon;

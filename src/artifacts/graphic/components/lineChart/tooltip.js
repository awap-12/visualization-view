import React, { forwardRef, useEffect, useRef, useState } from "react";

import styles from "graphic/styles/tooltip.module.css";

const MIN_OFFSET = -(2 ** 32);

const Tooltip = forwardRef(function Tooltip({ position = null, visible = false, content }, ref) {
    const [visibility, setVisibility] = useState(visible);
    const displayTimer = useRef();

    useEffect(() => {
        const timer = displayTimer.current;
        clearTimeout(timer);

        if (visible === false)
            displayTimer.current = setTimeout(() => {
                setVisibility(visible);
            }, 200);
        else setVisibility(visible);

        return () => clearTimeout(timer);
    }, [visible]);

    return (
        <div ref={ref}
             className={styles.container}
             style={{
                 display: visibility ? "flex" : "none",
                 opacity: +visible,
                 left: `${position?.x ?? MIN_OFFSET}px`,
                 top: `${position?.y ?? MIN_OFFSET}px`
             }}>
          <div className={styles.content}>
              {content?.map((text, key) => <p key={key}>{text}</p>)}
          </div>
        </div>
    );
});

export default Tooltip;

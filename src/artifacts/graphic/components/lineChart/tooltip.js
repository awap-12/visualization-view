import React, { forwardRef, useEffect, useRef, useState } from "react";

import styles from "graphic/styles/tooltip.module.css";

const MIN_OFFSET = -(2 ** 16);

const Tooltip = forwardRef(function Tooltip({ position = null, visible = false, content }, ref) {
    const [visibility, setVisibility] = useState(visible);
    const [location, setLocation] = useState({ x: MIN_OFFSET, y: MIN_OFFSET });
    const displayTimer = useRef();

    useEffect(() => {
        const x = position?.x ?? MIN_OFFSET, y = position?.y ?? MIN_OFFSET;
        setLocation({
            x: x === 0 ? MIN_OFFSET: x,
            y: y === 0 ? MIN_OFFSET : y
        });
    }, [position]);

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
                 left: `${location.x}px`,
                 top: `${location.y}px`
             }}>
          <div className={styles.content}>
            {content?.map((text, key) => <p key={key}>{text}</p>)}
          </div>
        </div>
    );
});

export default Tooltip;

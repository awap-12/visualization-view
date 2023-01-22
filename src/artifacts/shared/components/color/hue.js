/** @jsxImportSource @emotion/react */
import React, { useRef, useState } from "react";

import styles from "shared/styles/color/hue.module.css";

function calculateChange(event, direction, hsl, container) {
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const x = typeof event.pageX === "number" ? event.pageX : event.touches[0].pageX;
    const y = typeof event.pageY === "number" ? event.pageY : event.touches[0].pageY;
    const left = x - (container.getBoundingClientRect().left + window.scrollX);
    const top = y - (container.getBoundingClientRect().top + window.scrollY);

    let h;

    if (direction === "vertical") {
        if (top < 0) h = 359;
        else if (top > containerHeight) h = 0;
        else {
            const percent = -((top * 100) / containerHeight) + 100;
            h = ((360 * percent) / 100);
        }

        if (hsl.h !== h) return { h, s: hsl.s, l: hsl.l, a: hsl.a, source: "hsl" };
    } else {
        if (left < 0) h = 0;
        else if (left > containerWidth) h = 359;
        else {
            const percent = (left * 100) / containerWidth;
            h = ((360 * percent) / 100);
        }

        if (hsl.h !== h) return { h, s: hsl.s, l: hsl.l, a: hsl.a, source: "hsl" };
    }

    return { h: hsl.h, s: hsl.s, l: hsl.l, a: hsl.a, source: "prev" };
}

export function SliderPointer({ direction }) {
    return (
        <div className={[styles.pointerDefault, direction === "vertical" ? styles.pointerVertical : undefined].join(" ")} />
    );
}

export function HuePicker({
    width = "316px",
    height = "16px",
    onChange,
    hsl = { h: 0 },
    direction = "horizontal",
    pointer: Pointer = SliderPointer,
    style: moreStyle = {}
}) {
    const containerRef = useRef();

    function handleChange(event) {
        const change = calculateChange(event, direction, hsl, containerRef.current);
        if (typeof onChange === "function" && !!change)
            onChange({ a: 1, h: change.h, l: 0.5, s: 1 }, event);
    }

    function handleMouseDown(event) {
        event.preventDefault();
        handleChange(event);
        window.addEventListener("mousemove", handleChange);
        window.addEventListener("mouseup", handleMouseUp);
    }

    function handleMouseUp() {
        window.removeEventListener("mousemove", handleChange);
        window.removeEventListener("mouseup", handleMouseUp);
    }

    return (
        <div css={{
                 position: "relative",
                 width,
                 height,
                 ...moreStyle
             }}>
          <div className={styles.hue}>
            <div ref={containerRef}
                 className={[
                     styles.container,
                     direction === "vertical" ? styles.hueVertical : styles.hueHorizontal
                 ].join(" ")}
                 onMouseDown={handleMouseDown}
                 onTouchMove={handleChange}
                 onTouchStart={handleChange}>
              <div style={{
                       position: "absolute",
                       ...(direction === "vertical"
                           ? { left: 0, top: `${ -((hsl.h * 100) / 360) + 100 }%` }
                           : { left: `${(hsl.h * 100) / 360}%` })
                   }}>
                  {!!Pointer
                      ? <Pointer direction={direction} />
                      : <div className={styles.slider} />}
              </div>
            </div>
          </div>
        </div>
    )
}

function Hue({ onChange, ...props }) {
    const [hsl, setHsl] = useState();

    return (
        <HuePicker hsl={hsl}
                   onChange={data => {
                       setHsl(data);
                       if (typeof onChange === "function")
                           onChange(data);
                   }}
                   {...props} />
    );
}

export default Hue;

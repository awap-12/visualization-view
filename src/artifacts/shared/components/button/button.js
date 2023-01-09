/** @jsxImportSource @emotion/react */
import React, { forwardRef, useCallback, useEffect, useState } from "react";
import { hexToRgb, rgbToHsl } from "../utils/color";

const THRESHOLD = 55;

const Button = forwardRef(function Button({ children, component: Component = "button", style: moreStyle = {},
    size = "md", color = "#fff", disabled, outline, onClick, ...addition }, ref) {
    const [disableColor, setDisableColor] = useState({ color, bisection: "#212529" });
    const [activeColor, setActiveColor] = useState({ color, bisection: "#212529" });
    const [hoverColor, setHoverColor] = useState({ color, bisection: "#212529" });
    const [baseColor, setBaseColor] = useState({ color, bisection: "#212529" });

    useEffect(() => {
        const [hue, saturation, lightness] = rgbToHsl(...hexToRgb(color));
        let h = hue * 360, s = saturation * 100, l;
        /**
         * ┌─────────────────────────────────────────┐
         * │ luminance                               │
         * │     │/////////////////////              │
         * │     │////////////////                   │
         * │ [1  │////  selectable                   │
         * │  ,  │////     data                      │
         * │  0] │////////////////                   │
         * │     │/////////////////////              │
         * │     └───────────────────── saturation   │
         * │               [0, 1]                    │
         * └─────────────────────────────────────────┘
         */
        switch (true) {
            case lightness < 0.25:
                l = 0; break;
            case lightness > 0.75:
                l = 100; break;
            default:
                // const safeSaturation = 8 * ((lightness - 0.5) ** 2) + 0.28/* move upwards 0.28 */;
                l = l * 100
                break;
        }

        const colorPrefab = [{
            func: setBaseColor,
            color: `hsl(${h}, ${s}%, ${l}%)`,
            bisection: `hsl(${h}, ${s}%, ${l < THRESHOLD ? 100 : 0}%)`
        }, {
            func: setActiveColor,
            color: `hsl(${h}, ${s}%, ${l < THRESHOLD ? 100 : 0}%)`,
            bisection: `hsl(${h}, ${s}%, ${l}%)`
        }, {
            func: setHoverColor,
            color: `hsl(${h}, ${s}%, ${l < THRESHOLD ? 100 : 0}%)`,
            bisection: `hsl(${h}, ${s}%, ${l}%)`
        }, {
            func: setDisableColor,
            color: `hsl(${h}, ${s}%, ${l}%)`,
            bisection: `hsl(${h}, ${s}%, ${l < THRESHOLD ? 100 : 0}%)`
        }];

        for (const { func, color, bisection } of colorPrefab)
            func(outline
                ? { backgroundColor: bisection, color: color }
                : { backgroundColor: color, color: bisection }
            );

    }, [color, outline]);

    return (
        <Component ref={ref}
                   css={{
                       display: "inline-block",
                       textAlign: "center",
                       textDecoration: "none",
                       verticalAlign: "middle",
                       cursor: "pointer",
                       userSelect: "none",
                       transition:
                           "color .15s ease-in-out," +
                           "background-color .15s ease-in-out," +
                           "border-color .15s ease-in-out," +
                           "box-shadow .15s ease-in-out",
                       ...{
                           sm: {
                               borderRadius: "0.25rem",
                               padding: "0.25rem 0.5rem",
                               fontSize: "0.875rem"
                           },
                           md: {
                               borderRadius: "0.375rem",
                               padding: "0.375rem 0.75rem",
                               fontSize: "1rem"
                           },
                           lg: {
                               borderRadius: "0.5rem",
                               padding: "0.5rem 1rem",
                               fontSize: "1.25rem"
                           }
                       }[size],
                       ...baseColor,
                       "&:active": {
                           ...activeColor
                       },
                       "&:hover": {
                           ...hoverColor
                       },
                       "&:disabled": {
                           ...disableColor
                       },
                       ...moreStyle
                   }}
                   onClick={useCallback(event => {
                       if (disabled) {
                           event.preventDefault();
                           return;
                       }
                       if (onClick) {
                           onClick(event);
                       }
                   }, [onClick, disabled])}
                   {...addition}>
          {children}
        </Component>
    );
});

export default Button;

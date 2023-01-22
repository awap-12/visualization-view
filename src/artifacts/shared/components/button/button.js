/** @jsxImportSource @emotion/react */
import React, { forwardRef, useCallback, useEffect, useState } from "react";
import { hexToRgb, rgbToHwb } from "../utils/color";

const normalizeHwb = (h, s, l) => `hwb(${~~h}deg ${~~(s * 100)}% ${~~(l * 100)}%)`;

/**
 * Planing:
 * HSV/BWH  [70,10],[47,18],[25,25],[18,47],[10,70] y = 702.82x^-0.99
 * HSL      [50,80],[50,65],[50,50],[49,36],[50,20] y = 14.9x + 5.5 a bit faster
 *
 * Deprecate:
 * Consider using hsl color space do filtering for better looking.
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
 * Alternate:
 * Use hwb color space for handling color gradient easily.
 * ┌─────────────────────────────────────────┐
 * │ whiteness                               │
 * │     │/x/                                │
 * │     │//////                             │
 * │     │/////////                          │
 * │ [1  │////////////                       │
 * │  ,  │/ selectable //                    │
 * │  0] │/    data   //////                 │
 * │     │///////////////////x/              │
 * │     └───────────────────── blackness    │
 * │               [0, 1]                    │
 * └─────────────────────────────────────────┘
 * and here do a basis: y = -x + 80 <=> x = -y + 80
 */
function calculateColor(base, outline) {
    const [r, g, b] = hexToRgb(base), hwb = rgbToHwb(r, g, b), [hue, whiteness, blackness] = hwb;

    const level1Hwb = normalizeHwb(...[hue, whiteness, blackness]);
    // TODO: we search down to top and left to right finally to white
    // let horizontalStep = whiteness + 0.17, verticalStep = blackness - 0.1;
    const level2Hwb = normalizeHwb(...[hue, (whiteness + 0.17) % 1, blackness]);
    const level3Hwb = normalizeHwb(...[hue, (whiteness + 0.22) % 1, blackness]);

    // r, g, b to gray scale -> which under screen gamma threshold 186 (better looking compare to w3c rules)
    const highContrastBisection = (r * 0.299 + g * 0.587 + b * 0.114) > 186 ? "#000" : "#fff";

    /**
     * ┌─────────────────────────────────────────┐
     * │ whiteness                               │
     * │     │                                   │
     * │     │   ///////////////                 │
     * │     │   ///////////////                 │
     * │ [1  │   ///////////////                 │
     * │  ,  │   ///////////////                 │
     * │  0] │   ///////////////                 │
     * │     │                                   │
     * │     └───────────────────── blackness    │
     * │               [0, 1]                    │
     * └─────────────────────────────────────────┘
     * Remove too white or too black
     */
    function filterSpecial(fallback, opposite = true) {
        switch (true) {
            case whiteness > 0.98 && blackness < 0.02:
                return opposite ? "#000" : "#fff";
            case blackness > 0.98 && whiteness < 0.02:
                return opposite ? "#fff" : "#000";
            default:
                return fallback;
        }
    }

    return {
        base: outline
            ? {
                backgroundColor: filterSpecial("#fff"),
                color: level1Hwb,
                borderColor: level1Hwb
            } : {
                backgroundColor: level1Hwb,
                color: highContrastBisection,
                borderColor: filterSpecial(level1Hwb)
            },
        active: outline
            ? {
                backgroundColor: level3Hwb,
                color: highContrastBisection,
                borderColor: level3Hwb
            } : {
                backgroundColor: filterSpecial(level3Hwb),
                color: filterSpecial(highContrastBisection, false),
                borderColor: filterSpecial(level3Hwb)
            },
        hover: outline
            ? {
                backgroundColor: level1Hwb,
                color: highContrastBisection,
                borderColor: filterSpecial(level1Hwb)
            } : {
                backgroundColor: filterSpecial(level2Hwb),
                color: filterSpecial(highContrastBisection, false),
                borderColor: filterSpecial(level2Hwb)
            },
        disable: outline // add a white mask
            ? {
                backgroundColor: "#fff",
                color: normalizeHwb(...[hue, 0.65, 0.12]),
                borderColor: normalizeHwb(...[hue, 0.65, 0.12])
            } : {
                backgroundColor: normalizeHwb(...[hue, 0.65, 0.12]),
                color: "#fff",
                borderColor: normalizeHwb(...[hue, 0.65, 0.12])
            }
    }
}

const Button = forwardRef(function Button({ children, component: Component = "button", style: moreStyle = {},
    size = "md", color = "#fff", disabled, outline, onClick, ...addition }, ref) {
    const [{ base, hover, active, disable }, setColor] = useState(() => calculateColor(color, outline));

    useEffect(() => {
        setColor(calculateColor(color, outline));
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
                       borderWidth: "1px",
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
                       ...base,
                       "&:active": {
                           ...active
                       },
                       "&:hover": {
                           ...hover
                       },
                       "&:disabled": {
                           cursor: "default",
                           ...disable
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
                   {...{disabled, ...addition}}>
          {children}
        </Component>
    );
});

export default Button;

/** @jsxImportSource @emotion/react */
import React, { forwardRef, useContext, useEffect, useState } from "react";
import { BreakpointContext } from "./context";
import { GutterWidthContext } from "./row";

const Col = forwardRef(function Col({ children, component: Component = "div", style: moreStyle = {},
    xs = null, sm = null, md = null, lg = null, xl = null, xxl = null, push, pull, offset, order,
    width: forceWidth = null, ...addition }, ref) {
    const { breakpoint, config: { breakpoints, gridColumns } } = useContext(BreakpointContext);
    const gutterWidth = useContext(GutterWidthContext);
    const [styleSheet, setStyleSheet] = useState({});

    useEffect(() => {
        const styles = {
            flexBasis: "100%",
            flexGrow: 0,
            flexShrink: 0,
            maxWidth: "100%",
            marginLeft: "0%",
            right: "auto",
            left: "auto"
        };
        let widths = { xs, sm, md, lg, xl, xxl }, allocator = 0;
        const maxIndex = breakpoints.findIndex(width => width.key === breakpoint);

        function getWidth(width) {
            return typeof width === "number" ?
                `${(100 / gridColumns) * Math.max(0, Math.min(gridColumns, width))}%`
                : undefined;
        }

        for (const { key } of breakpoints)
            if (allocator <= maxIndex) {
                const currentWidth = getWidth(widths[key]);
                const isSizedToContent = widths[key] === "content";

                allocator++;

                styles.flexBasis = (isSizedToContent ? "auto" : (currentWidth ?? styles.flexBasis));
                styles.width = styles.flexBasis;
                styles.maxWidth = currentWidth ?? styles.maxWidth;
                styles.marginLeft = getWidth((offset ?? {})[key]) ?? styles.marginLeft;
                styles.right = getWidth((pull ?? {})[key]) ?? styles.right;
                styles.left = getWidth((push ?? {})[key]) ?? styles.left;
                if (!!order && order[key]) styles.order = order[key];
            }

        if (Object.values(widths).every(width => !width)) {
            styles.flexBasis = 0;
            styles.flexGrow = 1;
        }

        if (forceWidth) {
            styles.flexBasis = styles.flexGrow = styles.flexShrink = "unset";
            styles.width = forceWidth;
        }

        setStyleSheet(styles);
    }, [breakpoints, breakpoint, gridColumns, xs, sm, md, lg, xl, xxl, push, pull, offset, order, forceWidth]);

    return (
        <Component ref={ref}
                   css={{
                       position: "relative",
                       boxSizing: "border-box",
                       paddingLeft: gutterWidth / 2,
                       paddingRight: gutterWidth / 2,
                       minHeight: 1,
                       ...moreStyle
                   }}
                   style={styleSheet}
                   {...addition}>
            {children}
        </Component>
    );
});

export default Col;

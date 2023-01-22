/** @jsxImportSource @emotion/react */
import React, { forwardRef, useContext, useEffect, useState } from "react";
import { BreakpointContext } from "./context";

const Container = forwardRef(function Container({ children, component: Component = "div", style: moreStyle = {},
    fluid = false, xs = false, sm = false, md = false, lg = false, xl = false, xxl = false, ...addition }, ref) {
    const { breakpoint, config: { gutterWidth, container } } = useContext(BreakpointContext);
    const [maxWidth, setMaxWidth] = useState("100%");

    useEffect(() => {
        let options = { xs, sm, md, lg, xl, xxl }, maxWidth = "100%";
        if (!fluid || !Object.values(options).every(item => !item)) {
            for (const { key, width } of container)
                if (breakpoint === key && !!width && !options[breakpoint])
                    maxWidth = width;
            setMaxWidth(maxWidth);
        }
    }, [breakpoint, container, fluid, xs, sm, md, lg, xl, xxl]);

    return (
        <Component ref={ref}
                   css={{
                       boxSizing: "border-box",
                       position: "relative",
                       marginLeft: "auto",
                       marginRight: "auto",
                       paddingLeft: gutterWidth / 2,
                       paddingRight: gutterWidth / 2,
                       ...moreStyle
                   }}
                   style={{
                       maxWidth: maxWidth
                   }}
                   {...addition}>
          {children}
        </Component>
    );
});

export default Container;

/** @jsxImportSource @emotion/react */
import React, { createContext, forwardRef, useContext, useEffect, useState } from "react";
import { BreakpointContext } from "./context";

export const GutterWidthContext = createContext(null);

const Row = forwardRef(function Row({ children, component: Component = "div", style: moreStyle = {},
    direction = "row", align = "normal", justify = "start", wrap = "wrap", nogutter = false,
    gutterWidth: overrideGutterWidth = null, ...addition }, ref) {
    const { config: { gutterWidth: globalGutterWidth } } = useContext(BreakpointContext);
    const [gutterWidth, setGutterWidth] = useState(null);

    useEffect(() => {
        switch (true) {
            case nogutter:
                setGutterWidth(0);
                break;
            case typeof overrideGutterWidth === "number":
                setGutterWidth(overrideGutterWidth);
                break;
            default:
                setGutterWidth(globalGutterWidth);
                break;
        }
    }, [nogutter, overrideGutterWidth, globalGutterWidth]);

    return (
        <Component ref={ref}
                   css={{
                       marginLeft: -gutterWidth / 2,
                       marginRight: -gutterWidth / 2,
                       display: "flex",
                       flexGrow: 0,
                       flexShrink: 0
                   }}
                   style={{
                       alignItems: { start: "flex-start", end: "flex-end" }[align] ?? align,
                       justifyContent: { start: "flex-start", end: "flex-end", between: "space-between", around: "space-around" }[justify] ?? justify,
                       flexDirection: { columnReverse: "column-reverse", rowReverse: "row-reverse" }[direction] ?? direction,
                       flexWrap: { reverse: "wrap-reverse" }[wrap] ?? wrap
                   }}
                   {...addition}>
          <GutterWidthContext.Provider value={gutterWidth}>
              {children}
          </GutterWidthContext.Provider>
        </Component>
    );
});

export default Row;

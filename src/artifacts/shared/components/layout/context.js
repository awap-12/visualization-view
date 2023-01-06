import React, { createContext, useCallback, useEffect, useRef, useState } from "react";

const defaultOptions = {
    breakpoints: [
        { key: "xs",  media: 0    },
        { key: "sm",  media: 576  },
        { key: "md",  media: 768  },
        { key: "lg",  media: 992  },
        { key: "xl",  media: 1200 },
        { key: "xxl", media: 1400 }
    ],
    defaultBreakpoint: "xxl",
    container: [
        { key: "xs",  width: 0    },
        { key: "sm",  width: 540  },
        { key: "md",  width: 720  },
        { key: "lg",  width: 960  },
        { key: "xl",  width: 1140 },
        { key: "xxl", width: 1320 }
    ],
    gutterWidth: 30,
    gridColumns: 12
};

function getRect(ref, {
    width = ref?.current?.clientWidth || window?.innerWidth,
    height = ref?.current?.clientHeight || window?.innerHeight
} = {}) {
    return !!width && !!height ? { width, height } : null;
}

export const BreakpointContext = createContext({});

function BreakpointProvider({ children, wrapped = false, options, fallback }) {
    const [breakpoint, setBreakpoint] = useState(defaultOptions.defaultBreakpoint);
    const [config, setConfig] = useState(defaultOptions);
    const [rect, setRect] = useState(null);
    const breakpointRef = useRef();

    const greaterThan = useCallback(key =>
        `@media (min-width: ${config.breakpoints.find(breakpoint => breakpoint.key === key).media}px)`, [config]);
    const lessThan = useCallback(key =>
        `@media (max-width: ${config.breakpoints.find(breakpoint => breakpoint.key === key).media}px)`, [config]);

    useEffect(() => {
        setRect(getRect(breakpointRef));
    }, []);

    useEffect(() => {
        const {
            breakpoints, container, gutterWidth,
            gridColumns, defaultBreakpoint,
            maxBreakpoint
        } = { ...defaultOptions, ...options };

        setConfig({
            breakpoints, container, gutterWidth,
            gridColumns, defaultBreakpoint,
            maxBreakpoint
        });
    }, [options]);

    useEffect(() => {
        const handleWindowResized = () => setRect(getRect(breakpointRef));

        window.addEventListener("resize", handleWindowResized, false);

        return () => {
            window.removeEventListener("resize", handleWindowResized, false);
        };
    }, [breakpointRef]);

    useEffect(() => {
        const { breakpoints, defaultBreakpoint } = config;
        let breakpointResult = defaultBreakpoint;
        if (rect?.width) {
            for (const { key, media } of breakpoints) {
                if (rect.width >= media)
                    breakpointResult = key;
            }
        } else if (fallback) {
            breakpointResult = fallback;
        }
        setBreakpoint(breakpointResult);
    }, [rect, config, fallback]);

    return (
        <BreakpointContext.Provider value={{ breakpoint, config, greaterThan, lessThan }}>
            {wrapped
                ? <div ref={breakpointRef}>{children}</div>
                : children}
        </BreakpointContext.Provider>
    );
}

export default BreakpointProvider;

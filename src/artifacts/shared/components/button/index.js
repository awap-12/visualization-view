import React, { forwardRef } from "react";

const Button = forwardRef(function Button({ children, component: Component = "button", style: moreStyle = {},
    size, ...addition }, ref) {


    return (
        <Component ref={ref}
                   css={{
                       ...moreStyle
                   }}
                   {...addition}>
            {children}
        </Component>
    );
});

export default Button;

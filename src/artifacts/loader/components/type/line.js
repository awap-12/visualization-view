import React, { useState } from "react";

function LineStrategy({ children, handle,  }) {
    const [chartData, setChartData] = useState(null);

    return (
        <div>{children}</div>
    );
}

export default LineStrategy;

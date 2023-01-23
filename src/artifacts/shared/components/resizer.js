import { useEffect, useState } from "react";

function useResizer(ref) {
    const [dimensions, setDimensions] = useState();

    useEffect(() => {
        const observeTarget = ref.current;
        const resizeObserver = new ResizeObserver(entries => {
            entries.forEach(entry => {
                setDimensions(({ width: prevWidth, height: prevHeight } = {}) => {
                    const { width, height } = entry.contentRect;
                    const [rWidth, rHeight] = [Math.round(width), Math.round(height)];
                    console.log(rWidth, rHeight);
                    return {
                        width: prevWidth !== rWidth ? rWidth : prevWidth,
                        height: prevHeight !== rHeight ? rHeight : prevHeight
                    }
                });
            });
        });
        resizeObserver.observe(observeTarget);
        return () => resizeObserver.unobserve(observeTarget);
    }, [ref]);

    return dimensions;
}

export default useResizer;

import {useEffect, useState} from "react";
import { ascending } from "d3-array"
import { csv } from "d3-fetch";

function useFetchStrategyLoader({ src, dataMapper }) {
    const [chartData, setChartData] = useState(null);

    // file selector
    useEffect(() => {
        let cache = [], jobs = [];
        void (async () => {
            Object.entries(src).forEach(([key, path]) => {
                jobs.push(csv(path, data => {
                    //const []
                    return {
                        type: key,
                        //...Object.entries([])
                    }
                }))
            });
        });
    }, [src]);

    return chartData;
}

export default useFetchStrategyLoader;

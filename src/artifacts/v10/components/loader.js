import React, { useEffect, useState } from "react";
import { descending } from "d3-array"
import { csv } from "d3-fetch";

//region TODO: Move to React context and replace with correct api
import human from "../fixtures/HumanEvolutionAndActivities.csv";

/**
 * When handling import could use Promise.all([import])
 * @example
 *
 * const dataGroup = await Promise.all([
 *     import("../balabala1"), import("../balabala2"), ......
 * ]).then([GlobalAnnual, ......] => { GlobalAnnual, ...... });
 *
 */
const handlePath = () => ({ human });
const handleData = data => data.sort((a, b) => descending(a.year, b.year));

//endregion

function Loader() {
    const [chartData, setChartData] = useState(null);

    useEffect(() => {
        let cache = [], jobs = [];
        void (async () => {
            // csv use fetch https://developer.mozilla.org/docs/Web/API/fetch
            Object.entries(handlePath()).forEach(([, path]) => {
                jobs.push(csv(path, data => {
                    return {
                        year: data["year"],
                        event: data["event"]
                    }
                }));
            });
            Promise.all(jobs).then(value => {
                cache = value;
                console.log(handleData(cache)[0])
                setChartData(handleData(cache));
            });
        })();
    }, []);

    return !!chartData ?
        (
            <p>{JSON.stringify(chartData[0])}</p>
        ) : <h1>Loading...</h1>;
}

export default Loader;

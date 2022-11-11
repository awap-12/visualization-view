import React, { useEffect, useState } from "react";
import { scaleLinear } from "d3-scale";
import { ascending } from "d3-array"
import { csv } from "d3-fetch";
import { LineChart } from "shared";

//region TODO: Move to React context and replace with correct api
import co2composite from "../fixtures/co2composite.csv";

/**
 * When handling import could use Promise.all([import])
 * @example
 *
 * const dataGroup = await Promise.all([
 *     import("../balabala1"), import("../balabala2"), ......
 * ]).then([GlobalAnnual, ......] => { GlobalAnnual, ...... });
 *
 */
const handlePath = () => ({ co2composite });
const handleData = data => data.sort((a, b) => ascending(a.year, b.year));

//endregion

function Loader() {
    const [chartData, setChartData] = useState(null);

    useEffect(() => {
        let cache = [], jobs = [];
        void (async () => {
            // csv use fetch https://developer.mozilla.org/docs/Web/API/fetch
            Object.entries(handlePath()).forEach(([key, path]) => {
                jobs.push(csv(path, data => {
                    console.log(data)
                    return {
                        type: key,
                        year: +data["age_gas_calBP"],
                        ppm: +data["co2_ppm"],
                    }
                }));
            });
            Promise.all(jobs).then(value => {
                cache = value.reduce((pre, cur) => pre.concat(cur));
                console.log(cache);
                setChartData(handleData(cache));
            });
        })();
    }, []);

    return !!chartData ?
        (
            <LineChart data={chartData}
                       color={type => {
                           switch (type) {
                               case "co2composite":     return "#0000ff";
                               default:                 return "#000000";
                           }
                       }}
                       tip={type => {
                           switch (type) {
                               case "co2composite":     return "Antarctic Ice Cores Revised 800KYr CO2 Data";
                               default:                 throw new Error("Invalid data");
                           }
                       }}
                       options={{
                           x: value => value["year"],
                           y: value => value["ppm"],
                           type: value => value["type"],
                           xType: scaleLinear,
                           yType: scaleLinear,
                           axis: [
                               { orient: "left" },
                               { orient: "bottom" }
                           ]
                       }}>
            </LineChart>
        ) : <h1>Loading...</h1>;
}

export default Loader;

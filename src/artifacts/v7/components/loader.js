import React, { useEffect, useState } from "react";
import { extent, map, ascending } from "d3-array"
import { scaleLinear } from "d3-scale";
import { csv } from "d3-fetch";
import { LineChart } from "shared";

//region TODO: Move to React context and replace with correct api
import co2 from "../fixtures/carbon-dioxide.csv";
import temperature from "../fixtures/antarctic-temperature.csv";

/**
 * When handling import could use Promise.all([import])
 * @example
 *
 * const dataGroup = await Promise.all([
 *     import("../balabala1"), import("../balabala2"), ......
 * ]).then([GlobalAnnual, ......] => { GlobalAnnual, ...... });
 *
 */
const handlePath = () => ({ co2, temperature });
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
                    return {
                        type: key,
                        year: +data["Time (yr BP)"],
                        ppm: +data["Carbon dioxide (ppm)"],
                        temperature: +data["Antarctic temperature"]
                    }
                }));
            });
            Promise.all(jobs).then(value => {
                const [co2, temperature] = value;
                for (let i = 0; i < Math.min(...value.map(group => group.length)); i++)
                    cache[i] = { ...co2[i], temperature: temperature[i]["temperature"] };
                setChartData(handleData(cache));
            });
        })();
    }, []);

    return !!chartData ?
        (
            <LineChart data={chartData}
                       color={type => {
                           switch (type) {
                               case "co2":              return "#0000ff";
                               default:                 return "#000000";
                           }
                       }}
                       tip={type => {
                           switch (type) {
                               case "co2":              return "Antarctic Ice Cores Revised 800KYr CO2 Data";
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
                               { orient: "bottom" },
                               {
                                   orient: "right",
                                   scale: scaleLinear(extent(map(chartData, value => value["temperature"])), [570, 20]),
                                   call: [
                                       g => g.select(".domain").remove()
                                   ]
                               }
                           ]
                       }}>
            </LineChart>
        ) : <h1>Loading...</h1>;
}

export default Loader;

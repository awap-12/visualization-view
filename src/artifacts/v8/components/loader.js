import React, { useEffect, useState } from "react";
import { extent, map, ascending } from "d3-array"
import { scaleLinear } from "d3-scale";
import { csv } from "d3-fetch";
import { LineChart } from "shared";

//region TODO: Move to React context and replace with correct api
import co2 from "../fixtures/national-carbon-emissions.csv";

/**
 * When handling import could use Promise.all([import])
 * @example
 *
 * const dataGroup = await Promise.all([
 *     import("../balabala1"), import("../balabala2"), ......
 * ]).then([GlobalAnnual, ......] => { GlobalAnnual, ...... });
 *
 */
const handlePath = () => ({ co2 });
const handleData = data => data.sort((a, b) => ascending(a.year, b.year));

//endregion

function Loader() {
    const [chartData, setChartData] = useState(null);
    const [colorMap, setColorMap] = useState(null);

    useEffect(() => {
        let cache = [], jobs = [];
        void (async () => {
            // csv use fetch https://developer.mozilla.org/docs/Web/API/fetch
            Object.values(handlePath()).forEach(path => {
                jobs.push(csv(path, data => {
                    const [, ...keys] = Object.keys(data), result = [];
                    keys.forEach(key  => {
                        result.push({
                            type: key,
                            year: `${+data["Year"]}`,
                            value: +data[key] * 3.664
                        });
                    });
                    return result;
                }));
            });
            Promise.all(jobs).then(value => {
                cache = value.flat(2);
                console.log(cache);
                setColorMap(value[0][0].map((data, index) => ({
                    type: data["type"], color: makeColor(index, value[0][0].length)
                })).reduce((obj, item) => ({ ...obj, [item["type"]]: item["color"] }), {}));
                setChartData(handleData(cache));
            });
        })();
    }, []);

    return !!chartData ?
        (
            <LineChart data={chartData}
                       color={type => {
                           return `hsl(${colorMap[type]}, 100%, 50%)`;
                       }}
                       options={{
                           x: value => new Date(value["year"]),
                           y: value => value["value"],
                           type: value => value["type"],
                           axis: [
                               { orient: "left" },
                               { orient: "bottom" }
                           ]
                       }}>
            </LineChart>
        ) : <h1>Loading...</h1>;
}

function makeColor(colorNum, colors){
    if (colors < 1) colors = 1;
    // defaults to one color - avoid divide by zero
    return colorNum * (360 / colors) % 360;
}

export default Loader;

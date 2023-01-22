import React, { useEffect, useState } from "react";
import { ascending } from "d3-array"
import { csv } from "d3-fetch";
import { LineChart } from "graphic";

//region TODO: Move to React context and replace with correct api
import Co2Annual from "../fixtures/co2-annual.csv";
import Co2Monthly from "../fixtures/co2-monthly.csv";

/**
 * When handling import could use Promise.all([import])
 * @example
 *
 * const dataGroup = await Promise.all([
 *     import("../balabala1"), import("../balabala2"), ......
 * ]).then([GlobalAnnual, ......] => { GlobalAnnual, ...... });
 *
 */
const handlePath = () => ({ Co2Annual, Co2Monthly });
const handleData = data => data.sort((a, b) => ascending(a.time, b.time));

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
                        // monthly contain yyyy-mm, yearly pickup middle yyyy-06
                        time: "month" in data ? `${data["year"]}-${["0", "0", ...data["month"]].slice(-2).join('')}` : `${data["year"]}-01-01`,
                        ppm: "average" in data ? +data["average"] : +data["mean"],
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
                               case "Co2Annual":         return "#00ff00";
                               case "Co2Monthly":        return "#008800";
                               default:                  return "#000000";
                           }
                       }}
                       tip={type => {
                           switch (type) {
                               case "Co2Annual":        return "Global Annual";
                               case "Co2Monthly":       return "Global Monthly";
                               default:                 throw new Error("Invalid data");
                           }
                       }}
                       options={{
                           x: value => new Date(value["time"]),
                           y: value => value["ppm"],
                           type: value => value["type"],
                           axis: [
                               { orient: "left" },
                               { orient: "bottom" }
                           ]
                       }}>
            </LineChart>
        ) : <h1>Loading...</h1>;
}

export default Loader;

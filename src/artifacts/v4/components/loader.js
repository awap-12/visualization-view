import React, { useEffect, useState } from "react";
import { ascending } from "d3-array"
import { csv } from "d3-fetch";
import { LineChart } from "shared";

//region TODO: Move to React context and replace with correct api
import Co2Annual from "../fixtures/co2-annual.csv";
import De08 from "../fixtures/de08.csv";
import De082 from "../fixtures/de08-2.csv";
import Dss from "../fixtures/dss.csv";

/**
 * When handling import could use Promise.all([import])
 * @example
 *
 * const dataGroup = await Promise.all([
 *     import("../balabala1"), import("../balabala2"), ......
 * ]).then([GlobalAnnual, ......] => { GlobalAnnual, ...... });
 *
 */
const handlePath = () => ({ Co2Annual, De08, De082, Dss });
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
                        time: "meanAirAge" in data ? +data["meanAirAge"] : +data["year"],
                        ppm: "ppm" in data ? +data["ppm"] : +data["mean"],
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
                               case "Co2Annual":        return "#ff0000";
                               case "De08":             return "#00ff00";
                               case "De082":            return "#0000ff";
                               case "Dss":              return "#ff00ff";
                               default:                 return "#000000";
                           }
                       }}
                       tip={type => {
                           switch (type) {
                               case "Co2Annual":        return "Co2 Annual";
                               case "De08":             return "Law Dome DE08";
                               case "De082":            return "Law Dome DE08-2";
                               case "Dss":              return "DSS ice cores";
                               default:                 throw new Error("Invalid data");
                           }
                       }}
                       options={{
                           x: value => value["time"],
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

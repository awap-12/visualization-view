import React, { useEffect, useState } from "react";
import { ascending } from "d3-array"
import { csv } from "d3-fetch";
import { LineChart } from "shared";

//region TODO: Move to React context and replace with correct api
import GlobalAnnual from "../fixtures/HadCRUT-global-annual.csv";
import GlobalMonthly from "../fixtures/HadCRUT-global-monthly.csv";
import NHAnnual from "../fixtures/HadCRUT-northern-hemisphere-annual.csv";
import NHMonthly from "../fixtures/HadCRUT-northern-hemisphere-monthly.csv";
import SHAnnual from "../fixtures/HadCRUT-southern-hemisphere-annual.csv";
import SHMonthly from "../fixtures/HadCRUT-southern-hemisphere-monthly.csv";

/**
 * When handling import could use Promise.all([import])
 * @example
 *
 * const dataGroup = await Promise.all([
 *     import("../balabala1"), import("../balabala2"), ......
 * ]).then([GlobalAnnual, ......] => { GlobalAnnual, ...... });
 *
 */
const handlePath = () => ({ GlobalAnnual, GlobalMonthly, NHAnnual, NHMonthly, SHAnnual, SHMonthly });
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
                        time: data["Time"].includes("-") ? data["Time"] : `${data["Time"]}-01-01`,
                        anomaly: +data["Anomaly (deg C)"],
                        lowerConfidenceLimit: +data["Lower confidence limit (2.5%)"],
                        upperConfidenceLimit: +data["Upper confidence limit (97.5%)"]
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
                               case "GlobalAnnual":     return "#ff0000";
                               case "GlobalMonthly":    return "#800000";
                               case "NHAnnual":         return "#00ff00";
                               case "NHMonthly":        return "#008800";
                               case "SHAnnual":         return "#0000ff";
                               case "SHMonthly":        return "#000088";
                               default:                 return "#000000";
                           }
                       }}
                       tip={type => {
                           switch (type) {
                               case "GlobalAnnual":     return "Global Annual";
                               case "GlobalMonthly":    return "Global Monthly";
                               case "NHAnnual":         return "Northern-Hemisphere Annual";
                               case "NHMonthly":        return "Northern-Hemisphere Monthly";
                               case "SHAnnual":         return "Southern-Hemisphere Annual";
                               case "SHMonthly":        return "Southern-Hemisphere Monthly";
                               default:                 throw new Error("Invalid data");
                           }
                       }}
                       options={{
                           x: value => new Date(value["time"]),
                           y: value => value["anomaly"],
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

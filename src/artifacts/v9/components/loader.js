import React, { useEffect, useState } from "react";
import { csv } from "d3-fetch";
import DoughnutChart from "./doughnutChart";

//region TODO: Move to React context and replace with correct api
import layer1 from "../fixtures/layer1.csv";
import layer2 from "../fixtures/layer2.csv";
import layer3 from "../fixtures/layer3.csv";

/**
 * When handling import could use Promise.all([import])
 * @example
 *
 * const dataGroup = await Promise.all([
 *     import("../balabala1"), import("../balabala2"), ......
 * ]).then([GlobalAnnual, ......] => { GlobalAnnual, ...... });
 *
 */
const handlePath = () => ({ layer1, layer2, layer3 });
const handleData = data => ({
    name: "emission",
    children: data
});

//endregion

function extracted(data, max, depth) {
    if (!data[depth]) return max;
    let cache = [];
    for (let i = 0; i < max;) {
        const { key: subKey, value: subValue } = data[depth].shift();
        if (max < subValue) {
            cache = max;
            data[depth].unshift({ key: subKey, value: subValue })
            break;
        } else {
            i += subValue;
            const children = extracted(data, subValue, depth + 1);
            if (Array.isArray(children) && children.length > 1) {
                cache.push({ name: subKey, children });
            } else {
                cache.push({ name: subKey, value: subValue });
            }
        }
    }
    return cache;
}

function Loader() {
    const [chartData, setChartData] = useState(null);

    useEffect(() => {
        let cache = [], jobs = [];

        void (async () => {
            // csv use fetch https://developer.mozilla.org/docs/Web/API/fetch
            Object.entries(handlePath()).forEach(([key, path]) => {
                jobs.push(csv(path, data => {
                    return {
                        key: data["sector"],
                        value: +data["emissions"],
                    }
                }));
            });
            Promise.all(jobs).then(([master, ...value]) => {
                for (const { key, value: max } of master) {
                    const children = extracted(value, max, 0);
                    if (Array.isArray(children) && children.length > 1) {
                        cache.push({ name: key, children });
                    } else {
                        cache.push({ name: key, value: children })
                    }
                }
                console.log(cache);
                setChartData(handleData(cache));
            });
        })();
    }, []);

    return !!chartData ? <DoughnutChart data={chartData} /> : <h1>Loading...</h1>;
}

export default Loader;

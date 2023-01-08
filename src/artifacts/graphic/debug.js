import React, { Fragment, useContext, useEffect, useState } from "react";
import { Route } from "react-router";
import { Link } from "react-router-dom";
import { IoBarChart  } from "react-icons/io5";
import { ascending } from "d3-array";
import { csv } from "d3-fetch";
import { Button, Col, Container, Row } from "shared";
import { GraphicContext } from "./components/context";
import useGraphicCallback from "./components/callback";
import LineChart from "./components/lineChart";
import DoughnutChart from "./components/doughnutChart";

import sharedStyles from "shared/styles/debug.module.css";

//region Test import fixtures
import GlobalAnnual from "./fixtures/line/HadCRUT-global-annual.csv";
import GlobalMonthly from "./fixtures/line/HadCRUT-global-monthly.csv";
import NHAnnual from "./fixtures/line/HadCRUT-northern-hemisphere-annual.csv";
import NHMonthly from "./fixtures/line/HadCRUT-northern-hemisphere-monthly.csv";
import SHAnnual from "./fixtures/line/HadCRUT-southern-hemisphere-annual.csv";
import SHMonthly from "./fixtures/line/HadCRUT-southern-hemisphere-monthly.csv";

import layer1 from "./fixtures/doughnut/layer1.csv";
import layer2 from "./fixtures/doughnut/layer2.csv";
import layer3 from "./fixtures/doughnut/layer3.csv";

/**
 * When handling import could use Promise.all([import])
 * @example
 *
 * const dataGroup = await Promise.all([
 *     import("../balabala1"), import("../balabala2"), ......
 * ]).then([GlobalAnnual, ......] => { GlobalAnnual, ...... });
 *
 */
function handlePath(type) {
    switch (type) {
        case "line":
            return { GlobalAnnual, GlobalMonthly, NHAnnual, NHMonthly, SHAnnual, SHMonthly };
        case "doughnut":
            return { layer1, layer2, layer3 };
        default:
            throw new TypeError(`invalid type ${type}`);
    }
}

function handleData(type, data) {
    switch (type) {
        case "line": {
            const result = data.sort((a, b) => ascending(a.time, b.time));
            console.log("line", result);
            return result;
        }
        case "doughnut": {
            const result = { name: "emission", children: data };
            console.log("doughnut", "\n", result);
            return result;
        }
        default:
            throw new TypeError(`invalid type ${type}`);
    }
}

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

function Graphic() {
    const [doughnutChartData, setDoughnutChartData] = useState(null);
    const [lineChartData, setLineChartData] = useState(null);
    const { charts } = useContext(GraphicContext);
    const { line, doughnut } = useGraphicCallback();

    useEffect(() => {

        async function fetchData(type, jobs = []) {
            // csv use fetch https://developer.mozilla.org/docs/Web/API/fetch
            Object.entries(handlePath(type)).forEach(([key, path]) => {
                jobs.push(csv(path, data => {
                    switch (type) {
                        case "line":
                            return {
                                type: key,
                                // monthly contain yyyy-mm, yearly pickup middle yyyy-06
                                time: data["Time"].includes("-") ? data["Time"] : `${data["Time"]}-01-01`,
                                anomaly: +data["Anomaly (deg C)"]
                            }
                        case "doughnut":
                            return {
                                key: data["sector"],
                                value: +data["emissions"],
                            }
                        default:
                            throw new TypeError(`invalid type ${type}`);
                    }
                }));
            });
            return await Promise.all(jobs);
        }

        Promise.all([fetchData("line"), fetchData("doughnut")]).then(([line, [doughnutMaster, ...doughnutValue]]) => {
                const lineCache = line.reduce((pre, cur) => pre.concat(cur)), doughnutCache = [];
                setLineChartData(handleData("line", lineCache));
                for (const { key, value: max } of doughnutMaster) {
                    const children = extracted(doughnutValue, max, 0);
                    if (Array.isArray(children) && children.length > 1) {
                        doughnutCache.push({ name: key, children });
                    } else {
                        doughnutCache.push({ name: key, value: children })
                    }
                }
                setDoughnutChartData(handleData("doughnut", doughnutCache));
            }
        );
    }, []);

    return (
        <>
          <div className={sharedStyles.container}>
            <Container fluid>
              <Row>
                <Col>
                  <Button onClick={() => {
                      line("post", {
                          source: lineChartData,
                          x: value => new Date(value["time"]),
                          y: value => value["anomaly"],
                          type: value => value["type"],
                          config: type => {
                              switch (type) {
                                  case "GlobalAnnual":
                                      return { label: "Global Annual", color: "#ff0000" };
                                  case "GlobalMonthly":
                                      return { label: "Global Monthly", color: "#800000" };
                                  case "NHAnnual":
                                      return { label: "Northern-Hemisphere Annual", color: "#00ff00" };
                                  case "NHMonthly":
                                      return { label: "Northern-Hemisphere Monthly", color: "#008800" };
                                  case "SHAnnual":
                                      return { label: "Southern-Hemisphere Annual", color: "#0000ff" };
                                  case "SHMonthly":
                                      return { label: "Southern-Hemisphere Monthly", color: "#000088" };
                                  default:
                                      throw new Error("Invalid data");
                              }
                          }
                      });
                  }}>
                      Create Line Emitter
                  </Button>
                </Col>
                <Col>
                  <Button onClick={() =>{
                      line("put",{

                      })
                  }}>
                      Update Line Emitter
                  </Button>
                </Col>
              </Row>
              <Row>
                <Col>
                  <Button onClick={() => {
                      doughnut("post", {
                          source: doughnutChartData
                      });
                  }}>
                      Doughnut Trigger
                  </Button>
                </Col>
              </Row>
            </Container>
          </div>
          <br />
          {charts.map(({ type, ...props }, index) => {
              switch (type) {
                  case "line":
                      return (
                          <Fragment key={index}>
                            <div className={sharedStyles.container}>
                              <LineChart key={`line-chart-${index}`} {...props} />
                            </div>
                            <br />
                          </Fragment>
                      );
                  case "doughnut":
                      return (
                          <Fragment key={index}>
                            <div className={sharedStyles.container}>
                              <DoughnutChart key={`doughnut-chart-${index}`} {...props} />
                            </div>
                            <br />
                          </Fragment>
                      );
                  default:
                      return null;
              }
          })}
        </>
    );
}

//endregion

const DEBUG_ROOT = "/artifact/debug";

export const graphic = {
    link: (
        <Link className={sharedStyles.link} to={`${DEBUG_ROOT}/graphic`}>
          <IoBarChart className={sharedStyles.icon} />
          <span>Graphic</span>
        </Link>
    ),
    route: key => (
        <Route key={key} path="/graphic" element={
          <>
            <div className={sharedStyles.header}>
              <h1>Graphic</h1>
            </div>
            <div className={sharedStyles.body}>
              <Graphic />
            </div>
          </>
        } />
    )
};

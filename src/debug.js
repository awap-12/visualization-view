import React, { useEffect, useState } from "react";
import { Routes } from "react-router";
import { FaChevronLeft, FaListUl } from "react-icons/fa";

import styles from "./styles/debug.module.css";

import * as DebugShared from "shared/debug";
import * as DebugGraphic from "graphic/debug";
import * as DebugApi from "api/debug";

function Debug() {
    const [debugRouteGroup, setDebugRouteGroup] = useState(null);
    const [debugLinkGroup, setDebugLinkGroup] = useState(null);
    const [sidebarShow, setSideBarShow] = useState(true);

    useEffect(() => {
        const { linkGroup, routeGroup } = [DebugShared, DebugGraphic, DebugApi]
            .reduce((previous, module) => {
                const { linkGroup = [], routeGroup = [] } = previous ?? {};
                for (const { link, route } of Object.values({ ...module })) {
                    linkGroup.push(link);
                    routeGroup.push(route);
                }
                return { linkGroup, routeGroup };
            }, {});

        setDebugRouteGroup(routeGroup);
        setDebugLinkGroup(linkGroup);
    }, []);

    return (
        <main className={styles.app}>
          <aside className={[styles.sideBar, ...[sidebarShow ? styles.sideBarOpen: undefined]].join(" ")}>
            <div className={styles.sideBarBackground} />
            <div className={styles.sideBarContent}>
              <ul className={styles.sideBarList}>
                {debugLinkGroup?.map((module, index) =>
                    !!module
                        ? <li key={index} className={styles.sideBarItem}>{module}</li>
                        : null)}
              </ul>
            </div>
          </aside>
          <div className={styles.content}>
            <Routes>
              {debugRouteGroup?.map((route, index) =>
                  !!route
                      ? route(index)
                      : null)}
            </Routes>
          </div>
          <button className={styles.toggle} onClick={() => setSideBarShow(!sidebarShow)}>
            {sidebarShow
                ? <FaChevronLeft size={15} fill="white" />
                : <FaListUl size={15} fill="white" />}
          </button>
        </main>
    );
}

export default Debug;

import React from "react";
import { Route } from "react-router";
import { Link } from "react-router-dom";
import { IoBarChart } from "react-icons/io5"

import sharedStyles from "shared/styles/debug.module.css";

const DEBUG_ROOT = "/artifact/debug";

export const chart = {
    link: (
        <Link className={sharedStyles.link} to={`${DEBUG_ROOT}/alert`}>
          <IoBarChart className={sharedStyles.icon} />
          <span>Chart</span>
        </Link>
    ),
    route: key => (
        <Route key={key} path="/chart" element={
          <>
            <div className={sharedStyles.header}>
              <h1>Chart</h1>
            </div>
            <div className={sharedStyles.body}>
              <div className={sharedStyles.container}>
                <>
                </>
              </div>
            </div>
          </>
        } />
    )
}

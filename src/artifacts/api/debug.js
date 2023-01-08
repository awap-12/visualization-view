import { Route } from "react-router";
import { Link } from "react-router-dom";
import { MdApi } from "react-icons/md"

import sharedStyles from "shared/styles/debug.module.css";

const DEBUG_ROOT = "/artifact/debug";

export const Api = {
    link: (
        <Link className={sharedStyles.link} to={`${DEBUG_ROOT}/api`}>
          <MdApi className={sharedStyles.icon} />
          <span>Api</span>
        </Link>
    ),
    route: key => (
        <Route key={key} path="/api" element={
          <div></div>
        } />
    )
};

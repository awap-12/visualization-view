import React from "react";
import { Route, Routes } from "react-router";
import { ApiProvider, InfoContextHolder } from "api";

import Debug from "./debug";

function App() {
    return (
        <ApiProvider>
          <InfoContextHolder />
          <div className="App">
            <Routes>
              <Route path="/artifact/debug/*" element={<Debug />} />
              <Route path="*" element={<h1>Error</h1>} />
            </Routes>
          </div>
        </ApiProvider>
    );
}

export default App;

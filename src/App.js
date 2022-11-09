import "./App.css";
import V1 from "v1";
import V2 from "v2";
import V3 from "v3";
import { Route, Routes } from "react-router";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/artifact/v1" element={<V1 />} />
        <Route path="/artifact/v2" element={<V2 />} />
        <Route path="/artifact/v3" element={<V3 />} />
        <Route path="*" element={<h1>Error</h1>} />
      </Routes>
    </div>
  );
}

export default App;

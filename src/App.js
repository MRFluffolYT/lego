import React, { useState } from "react";
import Grid from "./components/Grid";
import Toolbar from "./components/Toolbar";
import Summary from "./components/Summary";

function App() {
  const [selectedColor, setSelectedColor] = useState("#ff0000");
  const [gridData, setGridData] = useState(
    Array(16).fill(0).map(() => Array(16).fill(null))
  );

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold mb-4">Pixel LEGO Editor</h1>
      <Toolbar selectedColor={selectedColor} setSelectedColor={setSelectedColor} />
      <Grid gridData={gridData} setGridData={setGridData} selectedColor={selectedColor} />
      <Summary gridData={gridData} />
    </div>
  );
}

export default App;


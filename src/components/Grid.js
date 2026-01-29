import React from "react";
import { Stage, Layer, Rect } from "react-konva";

const Grid = ({ gridData, setGridData, selectedColor }) => {
  const cellSize = 30;

  const handleClick = (row, col) => {
    const newGrid = gridData.map(r => [...r]);
    newGrid[row][col] = selectedColor;
    setGridData(newGrid);
  };

  return (
    <Stage width={gridData[0].length * cellSize} height={gridData.length * cellSize}>
      <Layer>
        {gridData.map((row, r) =>
          row.map((color, c) => (
            <Rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize}
              height={cellSize}
              fill={color || "#ffffff"}
              stroke="#ccc"
              onClick={() => handleClick(r, c)}
            />
          ))
        )}
      </Layer>
    </Stage>
  );
};

export default Grid;


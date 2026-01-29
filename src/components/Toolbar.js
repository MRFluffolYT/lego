import React from "react";

const colors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ffa500", "#800080", "#ffffff", "#000000"];

const Toolbar = ({ selectedColor, setSelectedColor }) => {
  return (
    <div className="flex gap-2 mb-4">
      {colors.map(color => (
        <div
          key={color}
          className={`w-8 h-8 cursor-pointer border ${selectedColor === color ? "border-black" : "border-gray-300"}`}
          style={{ backgroundColor: color }}
          onClick={() => setSelectedColor(color)}
        />
      ))}
    </div>
  );
};

export default Toolbar;


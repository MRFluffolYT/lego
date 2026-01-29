import React from "react";
import jsPDF from "jspdf";

const Summary = ({ gridData }) => {
  const colorCount = {};

  gridData.forEach(row =>
    row.forEach(cell => {
      if (cell) colorCount[cell] = (colorCount[cell] || 0) + 1;
    })
  );

  const generatePDF = () => {
    const pdf = new jsPDF();
    const cellSize = 10;
    gridData.forEach((row, r) => {
      row.forEach((color, c) => {
        if (color) {
          pdf.setFillColor(color);
          pdf.rect(c * cellSize, r * cellSize, cellSize, cellSize, "F");
        }
      });
    });
    pdf.save("lego-project.pdf");
  };

  return (
    <div className="mt-4">
      <h2 className="font-bold mb-2">Riepilogo mattoncini</h2>
      <ul>
        {Object.entries(colorCount).map(([color, count]) => (
          <li key={color}>
            {color}: {count}
          </li>
        ))}
      </ul>
      <button onClick={generatePDF} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">
        Genera PDF
      </button>
    </div>
  );
};

export default Summary;


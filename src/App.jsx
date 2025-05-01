import React, { useState } from "react";
import TokenScanner from "./TokenScanner";

function App() {
  const [holdersData, setHoldersData] = useState([]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Analisador de Token</h1>
      <TokenScanner setHoldersData={setHoldersData} />

      {holdersData.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Holders:</h2>
          <table className="w-full table-auto border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-2 py-1">Endereço</th>
                <th className="border px-2 py-1">Percentual</th>
              </tr>
            </thead>
            <tbody>
              {holdersData.map((holder, idx) => (
                <tr key={idx} className="border-t">
                  <td className="border px-2 py-1">{holder.address}</td>
                  <td className="border px-2 py-1">{holder.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;

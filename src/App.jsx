import React, { useState } from "react";
import TokenScanner from "./TokenScanner";

function App() {
  const [holdersData, setHoldersData] = useState([]);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🔍 PersonalShield Token Scanner</h1>
      <TokenScanner networkName="mainnet" setHoldersData={setHoldersData} />
      {holdersData.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Resultado da análise:</h2>
          <table className="w-full text-left border">
            <thead>
              <tr>
                <th className="border px-2 py-1">Endereço</th>
                <th className="border px-2 py-1">% do Supply</th>
                <th className="border px-2 py-1">Recebeu do Criador?</th>
                <th className="border px-2 py-1">Compra Legítima?</th>
              </tr>
            </thead>
            <tbody>
              {holdersData.map((holder) => (
                <tr key={holder.address}>
                  <td className="border px-2 py-1">{holder.address}</td>
                  <td className="border px-2 py-1">{holder.percentage}%</td>
                  <td className="border px-2 py-1">{holder.receivedFromMint ? "Sim" : "Não"}</td>
                  <td className="border px-2 py-1">{holder.acquiredLegit ? "Sim" : "Não"}</td>
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

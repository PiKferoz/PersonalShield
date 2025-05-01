import React, { useState } from "react";
import TokenScanner from "./TokenScanner";

function App() {
  const [holdersData, setHoldersData] = useState([]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Personal Shield</h1>
      <TokenScanner networkName="mainnet" setHoldersData={setHoldersData} />
      {holdersData.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Holders Analisados</h2>
          <ul className="space-y-2">
            {holdersData.map((h, idx) => (
              <li key={idx} className="border p-2 rounded">
                <p><strong>Endereço:</strong> {h.address}</p>
                <p><strong>Participação:</strong> {h.percentage}%</p>
                <p><strong>Recebeu da Mint:</strong> {h.receivedFromMint ? "Sim" : "Não"}</p>
                <p><strong>Aquisição Legítima:</strong> {h.acquiredLegit ? "Sim" : "Não"}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;

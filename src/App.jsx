// PersonalShield: Rastreador de Segurança de Tokens Solana
// Tecnologias: React + Vite

import React, { useState, useEffect } from "react";
import { saveAs } from "file-saver";
import TokenScanner from "./TokenScanner";

export default function App() {
  const [selectedNetwork, setSelectedNetwork] = useState("devnet");
  const [riskScore, setRiskScore] = useState(0);
  const [riskLabel, setRiskLabel] = useState("Calculando...");
  const [holdersData, setHoldersData] = useState([]);
  const [warning, setWarning] = useState("");
  const [suspiciousHolders, setSuspiciousHolders] = useState([]);

  useEffect(() => {
    const calcularRiscoComBaseNosHolders = async () => {
      try {
        const holders = holdersData;
        const totalHolders = holders.length;
        let highConcentration = false;
        let legitBuyers = 0;
        let indirectTransfers = 0;
        let suspicious = [];

        holders.forEach((holder) => {
          if (holder.percentage >= 5) highConcentration = true;
          if (holder.receivedFromMint) {
            indirectTransfers++;
            suspicious.push(holder);
          }
          if (holder.acquiredLegit) legitBuyers++;
        });

        let score = 0;
        if (highConcentration) score += 30;
        if (indirectTransfers / totalHolders > 0.3) score += 25;
        if (legitBuyers / totalHolders < 0.5) score += 30;

        score = Math.min(score, 100);
        setRiskScore(score);

        if (score > 70) setRiskLabel("Alto Risco de Rugpull");
        else if (score > 40) setRiskLabel("Risco Moderado");
        else setRiskLabel("Baixo Risco");

        if (suspicious.length > 0) {
          const warningMessage = `⚠️ Atenção: Detectamos ${suspicious.length} holder(s) com alta concentração de tokens que não foram adquiridos de forma legítima. Isso pode indicar distribuição suspeita.`;
          setWarning(warningMessage);
        } else {
          setWarning("");
        }

        setSuspiciousHolders(suspicious);
      } catch (error) {
        console.error("Erro ao calcular risco:", error);
      }
    };

    calcularRiscoComBaseNosHolders();
  }, [holdersData]);

  const exportarRelatorio = () => {
    let relatorio = `Relatório de Segurança do Token\n`;
    relatorio += `Rede: ${selectedNetwork}\n`;
    relatorio += `Score de Risco: ${riskScore}/100\n`;
    relatorio += `Nível de Risco: ${riskLabel}\n`;
    if (warning) relatorio += `Alerta: ${warning}\n`;
    if (suspiciousHolders.length > 0) {
      relatorio += `\n--- Holders Suspeitos ---\n`;
      suspiciousHolders.forEach((holder, i) => {
        relatorio += `#${i + 1} Endereço: ${holder.address} | ${holder.percentage}% do supply | Recebido sem compra: ${holder.receivedFromMint ? "Sim" : "Não"}\n`;
      });
    }
    const blob = new Blob([relatorio], { type: "text/plain;charset=utf-8" });
    saveAs(blob, `relatorio_personalshield_${Date.now()}.txt`);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">PersonalShield - Verificador de Segurança de Tokens Solana</h1>
      <label className="block mb-2 font-semibold">Rede Solana:</label>
      <select
        className="mb-4 p-2 border rounded"
        value={selectedNetwork}
        onChange={(e) => setSelectedNetwork(e.target.value)}
      >
        <option value="devnet">Devnet (teste)</option>
        <option value="mainnet">Mainnet (real)</option>
      </select>
      {selectedNetwork === "mainnet" && (
        <div className="mb-4 p-2 bg-yellow-100 text-yellow-800 border border-yellow-400 rounded">
          <p><strong>Aviso:</strong> Você está usando a <strong>Mainnet</strong>. Será necessário ter saldo real de SOL para cobrir taxas de transação.</p>
        </div>
      )}
      <TokenScanner
        networkName={selectedNetwork}
        setHoldersData={setHoldersData}
      />
      <div className="mt-6 p-4 border border-gray-300 rounded">
        <h2 className="text-xl font-semibold mb-2">🔎 Medidor de Risco de Rugpull</h2>
        <p className="mb-2 text-sm text-gray-700">
          O risco é calculado com base na concentração de tokens, número de holders legítimos, interações com o endereço de mint e distribuição suspeita.
        </p>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className={`h-4 rounded-full ${riskScore > 70 ? "bg-red-500" : riskScore > 40 ? "bg-yellow-500" : "bg-green-500"}`}
            style={{ width: `${riskScore}%` }}
          ></div>
        </div>
        <p className="text-sm mt-1 font-semibold text-gray-700">{riskLabel}</p>
        {warning && (
          <div className="mt-3 p-2 bg-red-100 text-red-800 border border-red-400 rounded">
            {warning}
          </div>
        )}
        <button
          onClick={exportarRelatorio}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Exportar Relatório
        </button>
      </div>
    </div>
  );
}

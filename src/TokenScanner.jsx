import React, { useState } from "react";

function TokenScanner({ networkName, setHoldersData }) {
  const [tokenMint, setTokenMint] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const headers = {
    accept: "application/json",
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjcmVhdGVkQXQiOjE3NDYxMzM3MzEwMDIsImVtYWlsIjoiZGlvY2FycmF6em9uZUBnbWFpbC5jb20iLCJhY3Rpb24iOiJ0b2tlbi1hcGkiLCJhcGlWZXJzaW9uIjoidjIiLCJpYXQiOjE3NDYxMzM3MzF9.0GaWmwLlPOnQxFW4s87NKc8p5TubX7X8BzOciYmrQ1E"
  };

  const fetchHolders = async (mintAddress) => {
    const url = `https://pro-api.solscan.io/v2.0/token/holders?tokenAddress=${mintAddress}&limit=10`;
    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error("Erro ao buscar holders");
    const result = await response.json();
    return result.data || [];
  };

  const fetchTransfers = async (mintAddress) => {
    const url = `https://pro-api.solscan.io/v2.0/token/transfer?tokenAddress=${mintAddress}`;
    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error("Erro ao buscar transferências");
    const result = await response.json();
    return result.data || [];
  };

  const fetchDeFiTransfers = async (mintAddress) => {
    const url = `https://pro-api.solscan.io/v2.0/token/defi/activities?tokenAddress=${mintAddress}`;
    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error("Erro ao buscar DeFi transfers");
    const result = await response.json();
    return result.data || [];
  };

  const fetchRecentTransactions = async (mintAddress) => {
    const url = `https://pro-api.solscan.io/v2.0/transaction/last?address=${mintAddress}`;
    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error("Erro ao buscar últimas transações");
    const result = await response.json();
    return result.data || [];
  };

  const analyzeToken = async () => {
    setLoading(true);
    setError(null);

    try {
      const holders = await fetchHolders(tokenMint);
      const transfers = await fetchTransfers(tokenMint);
      const defiTransfers = await fetchDeFiTransfers(tokenMint);
      const recentTx = await fetchRecentTransactions(tokenMint);

      const totalSupply = holders.reduce((acc, h) => acc + h.amount, 0);

      const processedHolders = holders.map((holder) => {
        const receivedFromMint = transfers.some(
          (tx) => tx.dst === holder.owner && tx.src === tokenMint
        );

        const acquiredLegit = !defiTransfers.some(
          (tx) => tx.dst === holder.owner && tx.type === "unknown"
        );

        return {
          address: holder.owner,
          percentage: ((holder.amount / totalSupply) * 100).toFixed(2),
          receivedFromMint,
          acquiredLegit,
        };
      });

      setHoldersData(processedHolders);
    } catch (err) {
      console.error("Erro ao verificar holders:", err);
      setError("Falha na análise do token.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <label className="block mb-2">
        Endereço do Token Mint:
        <input
          type="text"
          value={tokenMint}
          onChange={(e) => setTokenMint(e.target.value)}
          placeholder="Ex: 4gpjMaXNMxEq9HCRa..."
          className="border px-2 py-1 w-full"
        />
      </label>
      <button
        onClick={analyzeToken}
        className="bg-blue-600 text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? "Analisando..." : "Iniciar Análise"}
      </button>
      {error && <p className="text-red-600 mt-2">{error}</p>}
    </div>
  );
}

export default TokenScanner;

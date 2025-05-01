import React, { useState } from "react";

function TokenScanner({ networkName, setHoldersData }) {
  const [tokenMint, setTokenMint] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const HELIUS_RPC_URL = "https://mainnet.helius-rpc.com/?api-key=22acf63d-f640-4b00-8987-e8fd122ec312";

  const fetchTokenAccounts = async (mintAddress) => {
    const url = `https://api.helius.xyz/v0/tokens/metadata?mint=${mintAddress}&api-key=22acf63d-f640-4b00-8987-e8fd122ec312`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Erro ao buscar metadados do token");
    const result = await response.json();
    return result;
  };

  const fetchTransfers = async (mintAddress) => {
    const url = `https://api.helius.xyz/v0/addresses/${mintAddress}/transactions?limit=10&api-key=22acf63d-f640-4b00-8987-e8fd122ec312`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Erro ao buscar transações");
    const result = await response.json();
    return result;
  };

  const analyzeToken = async () => {
    setLoading(true);
    setError(null);

    try {
      const metadata = await fetchTokenAccounts(tokenMint);
      const transactions = await fetchTransfers(tokenMint);

      // Dados simulados para manter compatibilidade
      const holders = [
        { owner: metadata.updateAuthority || "Desconhecido", amount: 1 },
      ];

      const totalSupply = holders.reduce((acc, h) => acc + h.amount, 0);

      const processedHolders = holders.map((holder) => {
        const receivedFromMint = transactions.some(
          (tx) => tx.description?.includes(holder.owner)
        );

        const acquiredLegit = !transactions.some(
          (tx) => tx.description?.includes("unknown")
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
      console.error("Erro ao verificar token:", err);
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

import React, { useState } from "react";
import { Connection, PublicKey } from "@solana/web3.js";

const TokenScanner = ({ networkName, setHoldersData }) => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const connection = new Connection(
    networkName === "mainnet"
      ? "https://api.mainnet-beta.solana.com"
      : "https://api.devnet.solana.com"
  );

  const fetchHoldersFromSolscan = async (mintAddress) => {
    const response = await fetch(
      `https://public-api.solscan.io/token/holders?token=${mintAddress}&limit=1000`
    );
    const data = await response.json();
    return data.data || [];
  };

  const fetchSPLTransfers = async (address) => {
    const response = await fetch(
      `https://public-api.solscan.io/account/splTransfers?account=${address}&limit=100`
    );
    const data = await response.json();
    return data.data || [];
  };

  const verificarHolders = async (mintAddress) => {
    setLoading(true);
    try {
      const holders = await fetchHoldersFromSolscan(mintAddress);
      const totalSupply = holders.reduce((sum, h) => sum + h.amount, 0);

      const holdersDetalhados = await Promise.all(
        holders.map(async (holder) => {
          const address = holder.owner;
          const amount = holder.amount;
          const percentage = ((amount / totalSupply) * 100).toFixed(2);

          const transfers = await fetchSPLTransfers(address);
          const receivedFromMint = transfers.some(
            (tx) => tx.changeType === "inc" && tx.source === mintAddress
          );

          const acquiredLegit = transfers.some(
            (tx) => tx.changeType === "inc" && tx.tokenAddress === mintAddress && tx.source !== mintAddress
          );

          return {
            address,
            percentage: parseFloat(percentage),
            receivedFromMint,
            acquiredLegit,
          };
        })
      );

      setHoldersData(holdersDetalhados);
    } catch (error) {
      console.error("Erro ao verificar holders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleScan = () => {
    if (!input) return;
    verificarHolders(input);
  };

  return (
    <div className="mt-6">
      <label className="block font-semibold mb-2">Endereço do Token Mint:</label>
      <input
        type="text"
        className="border px-3 py-2 rounded w-full mb-4"
        placeholder="Ex: 4gpjMaXNMxEq9HCRaSaXttK1T4rTGNj8kSp68FLuh5uV"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button
        onClick={handleScan}
        disabled={loading}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        {loading ? "Analisando..." : "Iniciar Análise"}
      </button>
    </div>
  );
};

export default TokenScanner;

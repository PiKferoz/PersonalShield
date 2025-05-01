import React, { useState } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import axios from "axios";

export default function TokenScanner({ networkName, setHoldersData }) {
  const [tokenAddress, setTokenAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState("");

  const logInfo = (msg) => {
    setLog((prev) => prev + msg + "\n");
  };

  const handleScan = async () => {
    try {
      setLoading(true);
      setLog("🔍 Iniciando análise do token...\n");

      const connection = new Connection(
        networkName === "mainnet"
          ? "https://api.mainnet-beta.solana.com"
          : "https://api.devnet.solana.com",
        "confirmed"
      );

      const tokenMint = new PublicKey(tokenAddress);
      logInfo("🔗 Conectado à rede " + networkName.toUpperCase());

      const holdersResponse = await axios.get(
        `https://public-api.solscan.io/token/holders?token=${tokenAddress}&limit=50`,
        { headers: { accept: "application/json" } }
      );

      const holders = holdersResponse.data.data;

      logInfo(`✅ ${holders.length} holders encontrados.`);

      const totalSupply = holders.reduce(
        (acc, h) => acc + h.tokenAmount.uiAmount,
        0
      );

      const holdersComDados = [];

      for (const holder of holders) {
        const address = holder.owner;
        const percentage =
          (holder.tokenAmount.uiAmount / totalSupply) * 100;

        logInfo(`🔎 Verificando holder ${address}...`);

        const sigs = await connection.getSignaturesForAddress(
          new PublicKey(address),
          { limit: 100 }
        );

        const txs = await Promise.all(
          sigs.map((sig) =>
            connection.getTransaction(sig.signature, {
              maxSupportedTransactionVersion: 0,
            })
          )
        );

        let acquiredLegit = false;
        let receivedFromMint = false;

        for (const tx of txs) {
          if (!tx || !tx.transaction) continue;

          const instructions = tx.transaction.message.instructions;

          for (const ix of instructions) {
            if (
              ix.programId.toBase58() === "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" &&
              ix.data &&
              ix.data.length >= 2
            ) {
              const type = Buffer.from(ix.data, "base64")[0];
              if (type === 3 || type === 7) {
                const source = ix.accounts[0];
                const destination = ix.accounts[1];
                if (
                  tx.meta.postTokenBalances &&
                  tx.meta.postTokenBalances.length > 0 &&
                  tx.meta.postTokenBalances[0].mint === tokenMint.toBase58()
                ) {
                  if (source !== destination) {
                    acquiredLegit = true;
                  } else {
                    receivedFromMint = true;
                  }
                }
              }
            }
          }
        }

        holdersComDados.push({
          address,
          percentage: percentage.toFixed(4),
          acquiredLegit,
          receivedFromMint,
        });
      }

      setHoldersData(holdersComDados);
      logInfo("\n✅ Análise finalizada.");
    } catch (err) {
      console.error(err);
      logInfo("❌ Erro ao analisar o token. Verifique o endereço ou tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border p-4 rounded mb-4 bg-white">
      <label className="block font-semibold mb-2">
        Endereço do Token (Mint):
      </label>
      <input
        type="text"
        placeholder="Ex: 4gpjMaXNMxEq9HCRaSaXttK1T4rTGNj8kSp68FLuh5uV"
        className="p-2 border rounded w-full mb-2"
        value={tokenAddress}
        onChange={(e) => setTokenAddress(e.target.value)}
      />
      <button
        onClick={handleScan}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        disabled={loading}
      >
        {loading ? "Analisando..." : "Iniciar Análise"}
      </button>
      <pre className="bg-gray-100 text-sm p-2 mt-3 rounded overflow-auto h-48">{log}</pre>
    </div>
  );
}

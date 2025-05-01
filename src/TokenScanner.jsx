import React, { useState, useEffect, useRef } from "react";

function TokenScanner({ networkName, setHoldersData }) {
  const [tokenMint, setTokenMint] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const ws = useRef(null);

  const HELIUS_API_KEY = "22acf63d-f640-4b00-8987-e8fd122ec312";
  const WS_URL = `wss://mainnet.helius-rpc.com/?api-key=22acf63d-f640-4b00-8987-e8fd122ec312`;

  useEffect(() => {
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const fetchTransfersViaWebSocket = (mintAddress) => {
    return new Promise((resolve, reject) => {
      ws.current = new WebSocket(WS_URL);

      ws.current.onopen = () => {
        const subscriptionMessage = {
          jsonrpc: "2.0",
          id: 1,
          method: "transactionSubscribe",
          params: [
            {
              mentions: [mintAddress]
            },
            {
              commitment: "finalized",
              encoding: "jsonParsed"
            }
          ]
        };
        ws.current.send(JSON.stringify(subscriptionMessage));
      };

      const messages = [];
      const timeout = setTimeout(() => {
        ws.current.close();
        resolve(messages);
      }, 5000); // 5 segundos para coletar eventos

      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.method === "transactionNotification") {
          messages.push(data.params.result);
        }
      };

      ws.current.onerror = (err) => {
        clearTimeout(timeout);
        reject(new Error("Erro no WebSocket da Helius"));
      };

      ws.current.onclose = () => {
        clearTimeout(timeout);
      };
    });
  };

  const analyzeToken = async () => {
    setLoading(true);
    setError(null);

    try {
      const transfers = await fetchTransfersViaWebSocket(tokenMint);

      const holdersMap = new Map();
      transfers.forEach(tx => {
        const instructions = tx.transaction.message.instructions || [];

        instructions.forEach(instr => {
          const to = instr.parsed?.info?.destination;
          const from = instr.parsed?.info?.source;
          const amount = parseInt(instr.parsed?.info?.amount || 0);

          if (to && amount > 0) {
            holdersMap.set(to, (holdersMap.get(to) || 0) + amount);
          }
          if (from && amount > 0) {
            holdersMap.set(from, (holdersMap.get(from) || 0) - amount);
          }
        });
      });

      const holders = Array.from(holdersMap.entries())
        .filter(([_, amount]) => amount > 0)
        .map(([address, amount]) => ({ address, amount }));

      const totalSupply = holders.reduce((acc, h) => acc + h.amount, 0);

      const processedHolders = holders.map((holder) => {
        const receivedFromMint = false; // Não disponível via WebSocket
        const acquiredLegit = true; // Assumido padrão para simplificação

        return {
          address: holder.address,
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

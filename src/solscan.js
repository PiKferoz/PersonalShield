// api/solscan.js

export default async function handler(req, res) {
  const { endpoint, query } = req.query;

  if (!endpoint || !query) {
    return res.status(400).json({ error: "Parâmetros 'endpoint' e 'query' são obrigatórios" });
  }

  const url = `https://public-api.solscan.io/${endpoint}?${query}`;

  try {
    const response = await fetch(url, {
      headers: {
        accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Erro da Solscan: ${response.statusText}`);
    }

    const data = await response.json();
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(data);
  } catch (error) {
    console.error("Erro na proxy:", error.message);
    res.status(500).json({ error: "Erro ao consultar Solscan" });
  }
}

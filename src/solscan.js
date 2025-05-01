export default async function handler(req, res) {
  const { endpoint, query } = req.query;

  const url = `https://public-api.solscan.io/chaininfo/${endpoint}?${query}`;

  try {
    const response = await fetch(url, {
      headers: {
        accept: "application/json"
      }
    });

    const data = await response.json();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Erro na proxy da Solscan" });
  }
}

export default async function handler(req, res) {
  // We use Tenderly as the hidden backend node
  const RPC_URL = "https://sepolia.gateway.tenderly.co";

  try {
    const response = await fetch(RPC_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "RPC Proxy Error", details: error.message });
  }
}

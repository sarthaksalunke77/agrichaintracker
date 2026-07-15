const https = require("https");

const rpcs = [
  "https://sepolia.gateway.tenderly.co",
  "https://1rpc.io/sepolia",
  "https://ethereum-sepolia-rpc.publicnode.com",
  "https://rpc2.sepolia.org"
];

function testCORS(urlStr) {
  return new Promise((resolve) => {
    const url = new URL(urlStr);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: "OPTIONS",
      headers: {
        "Origin": "https://agrichaintracker.vercel.app",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type"
      }
    };

    const req = https.request(options, (res) => {
      const cors = res.headers["access-control-allow-origin"];
      resolve(`${urlStr} -> Status: ${res.statusCode}, CORS: ${cors || "NONE"}`);
    });

    req.on("error", (e) => resolve(`${urlStr} -> Error: ${e.message}`));
    req.end();
  });
}

async function run() {
  for (const r of rpcs) {
    console.log(await testCORS(r));
  }
}
run();

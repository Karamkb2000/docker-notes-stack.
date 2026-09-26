const { createClient } = require("redis");

const redis = createClient({ url: process.env.REDIS_URL || "redis://cache:6379" });
redis.on("error", (err) => console.error("redis error:", err.message));

async function main() {
  await redis.connect();
  console.log("worker started");

  const intervalMs = Number(process.env.TICK_MS || 5000);
  setInterval(async () => {
    const ticks = await redis.incr("worker_ticks");
    console.log(`worker tick #${ticks}`);
  }, intervalMs);
}

main().catch((err) => {
  console.error("worker failed:", err);
  process.exit(1);
});

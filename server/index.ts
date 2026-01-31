import { createApp } from "./app";
import { log } from "./vite";

createApp().then(({ server }) => {
  const port = 5000;
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
}).catch((err: Error) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

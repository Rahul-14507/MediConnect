import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
    // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  const port = parseInt(process.env.PORT || "5000", 10);
  const host = process.env.HOST || "127.0.0.1"; // force IPv4 by default

  // Add useful error handling and fallbacks (Windows doesn't like reusePort)
  function startServerListen() {
    server.listen(port, host, () => {
      log(`serving on http://${host}:${port}`);
    });
  }

  server.on("error", (err: any) => {
    log(`server error: ${err?.code ?? err}`);
    // Common recoverable cases: ENOTSUP (unsupported option), EADDRNOTAVAIL, EADDRINUSE
    if (err.code === "ENOTSUP" || err.code === "EADDRNOTAVAIL") {
      log("ENOTSUP/EADDRNOTAVAIL detected — retrying on 127.0.0.1 without special options...");
      // try again forcing IPv4 and minimal options
      try {
        server.close?.();
      } catch (_) {}
      // Try binding explicitly to IPv4 address, without reusePort
      server.listen(port, "127.0.0.1", () => {
        log(`serving on http://127.0.0.1:${port} (fallback)`);
      });
      return;
    }

    if (err.code === "EADDRINUSE") {
      log(`Port ${port} in use. Try a different PORT or kill the process using the port.`);
    } else {
      console.error(err);
    }
  });

  // Start listening
  startServerListen();

})();

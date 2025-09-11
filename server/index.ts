import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

// Parse BASE_URL to extract port and configuration
function parseBaseUrl(baseUrl: string) {
  try {
    const url = new URL(baseUrl);
    return {
      port: url.port ? parseInt(url.port, 10) : (url.protocol === 'https:' ? 443 : 80),
      host: url.hostname,
      protocol: url.protocol,
    };
  } catch (error) {
    // Fallback for invalid URLs
    return { port: 3000, host: 'localhost', protocol: 'http:' };
  }
}

// Get configuration from BASE_URL
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const { port, host } = parseBaseUrl(BASE_URL);
const NODE_ENV = process.env.NODE_ENV || 'development';

// Validate required environment variables
const requiredVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'VITE_SUPABASE_PUBLISHABLE_KEY'];
const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars);
  console.error('Please check your .env file and ensure all required variables are set.');
  process.exit(1);
}

const app = express();
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
  // Log configuration in development
  if (NODE_ENV === 'development') {
    console.log('🔧 Environment Configuration:');
    console.log(`   NODE_ENV: ${NODE_ENV}`);
    console.log(`   BASE_URL: ${BASE_URL} (single source of truth)`);
    console.log(`   PORT: ${port} (extracted from BASE_URL)`);
    console.log(`   API_BASE_URL: ${BASE_URL}/api (derived from BASE_URL)`);
  }

  await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (NODE_ENV === "development") {
    const server = createServer(app);
    await setupVite(app, server);
    server.listen({
      port: port,
      host: host,
    }, () => {
      log(`serving on port ${port}`);
    });
  } else {
    serveStatic(app);
    app.listen({
      port: port,
      host: host,
    }, () => {
      log(`serving on port ${port}`);
    });
  }
})();

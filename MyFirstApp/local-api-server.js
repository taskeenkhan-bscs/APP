const fs = require("fs");
const http = require("http");
const path = require("path");
const Buffer = require("buffer").Buffer;
const chatHandler = require("./api/chat");

const APP_DIRECTORY = path.dirname(require.resolve("./package.json"));
const PORT = Number(process.env.LOCAL_API_PORT) || 8000;
const LOCAL_ORIGIN = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

function loadLocalApiKey() {
  if (process.env.GEMINI_API_KEY) return;

  const envFile = path.join(APP_DIRECTORY, ".env.local");
  if (!fs.existsSync(envFile)) return;

  const lines = fs.readFileSync(envFile, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const match = line.match(
      /^\s*(GEMINI_API_KEY|GEMINI_MODEL)\s*=\s*(.*?)\s*$/,
    );
    if (match) {
      let value = match[2].trim();
      const quote = value[0];
      if (
        (quote === '"' || quote === "'") &&
        value[value.length - 1] === quote
      ) {
        value = value.slice(1, -1);
      }

      if (value) {
        process.env[match[1]] = value;
      }
    }
  }
}

function sendJson(response, status, body) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(body));
}

function createVercelResponse(response) {
  let statusCode = 200;
  const headers = {};

  return {
    status(code) {
      statusCode = code;
      return this;
    },
    setHeader(name, value) {
      headers[name] = value;
    },
    json(body) {
      if (response.writableEnded) return this;
      response.writeHead(statusCode, {
        ...headers,
        "Content-Type": "application/json; charset=utf-8",
      });
      response.end(JSON.stringify(body));
      return this;
    },
  };
}

function addLocalCorsHeaders(request, response) {
  const origin = request.headers.origin;
  if (origin && LOCAL_ORIGIN.test(origin)) {
    response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Vary", "Origin");
  }

  response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

loadLocalApiKey();

const server = http.createServer((request, response) => {
  addLocalCorsHeaders(request, response);

  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  const pathname = (request.url || "").split("?")[0];
  if (pathname !== "/api/chat") {
    sendJson(response, 404, { error: "Local API route not found." });
    return;
  }

  if (request.method !== "POST") {
    chatHandler(request, createVercelResponse(response)).catch((error) => {
      console.error("Local chat API failed.", error);
      if (!response.writableEnded) {
        sendJson(response, 500, { error: "Local chat API failed." });
      }
    });
    return;
  }

  const chunks = [];
  request.on("data", (chunk) => chunks.push(chunk));
  request.on("end", () => {
    try {
      const rawBody = Buffer.concat(chunks).toString("utf8");
      request.body = rawBody ? JSON.parse(rawBody) : {};
    } catch {
      sendJson(response, 400, { error: "Request body must be valid JSON." });
      return;
    }

    chatHandler(request, createVercelResponse(response)).catch((error) => {
      console.error("Local chat API failed.", error);
      if (!response.writableEnded) {
        sendJson(response, 500, { error: "Local chat API failed." });
      }
    });
  });
});

server.on("error", (error) => {
  console.error("Could not start the local chat API server.", error);
  process.exitCode = 1;
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Local chat API listening at http://127.0.0.1:${PORT}/api/chat`);
});

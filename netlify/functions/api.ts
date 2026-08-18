import serverless from "serverless-http";
import { buildApp } from "../../server/app";

// Wrap the existing Express API (server/app.ts) as a single Netlify Function.
const serverlessHandler = serverless(buildApp());

export const handler = async (event: any, context: any) => {
  // Netlify rewrites /api/* to this function; normalize the path so Express
  // still matches its /api/* routes regardless of the incoming prefix.
  if (typeof event.path === "string" && event.path.startsWith("/.netlify/functions/api")) {
    event.path = event.path.replace("/.netlify/functions/api", "/api") || "/api";
  }
  return serverlessHandler(event, context);
};

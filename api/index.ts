import { createServer } from "http";
import { app } from "../server/index";
import { registerRoutes } from "../server/routes";

const server = createServer(app);
let routesRegistered = false;

export default async function handler(req: any, res: any) {
  if (!routesRegistered) {
    await registerRoutes(app, server);
    routesRegistered = true;
  }

  app(req, res);
}

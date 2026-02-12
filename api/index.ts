import { app } from "../server/index";
import { registerRoutes } from "../server/routes";

// Initialize routes lazily
let routesRegistered = false;

export default async function handler(req: any, res: any) {
  if (!routesRegistered) {
    await registerRoutes(app);
    routesRegistered = true;
  }

  app(req, res);
}

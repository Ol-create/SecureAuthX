export function securityMiddleware(app) {
  app.disable("x-powered-by");
}

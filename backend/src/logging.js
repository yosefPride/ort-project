const write = (level, message) => console.log(`[${new Date().toISOString()} ${level}] ${message}`);

export const log = {
  info: (message) => write('INFO', message),
  error: (message) => write('ERROR', message),
};

/** Middleware that logs every request: "GET /api/teams → 200 (45ms)". */
export function logRequests(req, res, next) {
  const start = performance.now();
  const path = req.path;
  res.on('finish', () => {
    log.info(`${req.method} ${path} → ${res.statusCode} (${formatDuration(performance.now() - start)})`);
  });
  next();
}

/** "45ms" under a second, "1.18s" above it. */
function formatDuration(millis) {
  return millis < 1000 ? `${Math.round(millis)}ms` : `${(millis / 1000).toFixed(2)}s`;
}

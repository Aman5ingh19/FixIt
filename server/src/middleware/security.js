/**
 * Security middleware — additional hardening beyond helmet.
 */

/**
 * Sanitize request body to prevent NoSQL/XSS injection.
 */
function sanitizeInput(req, res, next) {
  if (req.body) {
    req.body = deepSanitize(req.body);
  }
  if (req.query) {
    req.query = deepSanitize(req.query);
  }
  next();
}

function deepSanitize(obj) {
  if (typeof obj === 'string') {
    // Remove potential script tags and event handlers
    return obj
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/javascript\s*:/gi, '')
      .trim();
  }
  if (Array.isArray(obj)) {
    return obj.map(deepSanitize);
  }
  if (obj && typeof obj === 'object') {
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      // Block keys starting with $ (Mongo-style injection)
      if (key.startsWith('$')) continue;
      cleaned[key] = deepSanitize(value);
    }
    return cleaned;
  }
  return obj;
}

/**
 * CORS preflight cache.
 */
function corsPreflightCache(req, res, next) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
  }
  next();
}

/**
 * Request ID middleware — attaches a unique ID to each request for tracing.
 */
let requestCounter = 0;
function requestId(req, res, next) {
  const id = `${Date.now()}-${++requestCounter}`;
  req.requestId = id;
  res.setHeader('X-Request-Id', id);
  next();
}

module.exports = { sanitizeInput, corsPreflightCache, requestId };

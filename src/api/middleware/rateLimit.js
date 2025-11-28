const attempts = new Map();

export function simpleRateLimit(key, limit = 3, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const entry = attempts.get(key) || { count: 0, first: now };
  if (now - entry.first > windowMs) {
    // reiniciar ventana
    attempts.set(key, { count: 1, first: now });
    return { allowed: true, remaining: limit - 1 };
  }
  entry.count += 1;
  attempts.set(key, entry);
  if (entry.count > limit) return { allowed: false, remaining: 0 };
  return { allowed: true, remaining: limit - entry.count };
}

export function rateLimitResetMiddleware(req, res, next) {
  try {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const correo = (req.body && req.body.correo) ? String(req.body.correo).toLowerCase() : '';
    const key = correo ? `${ip}:${correo}` : ip;
    const { allowed, remaining } = simpleRateLimit(key, 3, 10 * 60 * 1000);
    res.setHeader('X-RateLimit-Remaining', String(remaining));
    if (!allowed) return res.status(429).json({ message: 'Demasiados intentos. Intenta más tarde.' });
    next();
  } catch (e) {
    console.error('rateLimitResetMiddleware error:', e);
    next();
  }
}

export default rateLimitResetMiddleware;

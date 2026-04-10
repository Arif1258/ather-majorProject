import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'aether-monitor-super-secret-key-fallback';

export function signToken(payload: { id: string, name: string, email: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string, name: string, email: string };
  } catch (err) {
    return null;
  }
}

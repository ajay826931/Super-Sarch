import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'khm_super_secret_jwt_vendor_key_2026';

/**
 * Sign JWT token for vendor
 */
export function signVendorToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d', // 7 days session
  });
}

/**
 * Verify and decode JWT token for vendor
 */
export function verifyVendorToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

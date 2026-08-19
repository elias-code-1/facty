import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const kkiapayPrivateKey = process.env.KKIAPAY_PRIVATE_KEY || '';
  const isSandbox = kkiapayPrivateKey.startsWith('test_') || process.env.VITE_KKIAPAY_SANDBOX === 'true';
  return res.status(200).json({ sandbox: isSandbox });
}

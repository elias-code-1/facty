import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const kkiapayPrivateKey = process.env.KKIAPAY_PRIVATE_KEY || '';
  const isSandbox = true; // Mode sandbox forcé
  return res.status(200).json({ sandbox: isSandbox });
}

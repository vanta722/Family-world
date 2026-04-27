import crypto from 'crypto';

export function hashParentPin(pin: string, secret: string) {
  return crypto.createHmac('sha256', secret).update(pin).digest('hex');
}

export function verifyParentPin(pin: string, expectedHash: string, secret: string) {
  const provided = hashParentPin(pin, secret);
  return crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(expectedHash));
}

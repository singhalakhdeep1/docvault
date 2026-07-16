import crypto from 'crypto';

export class SignatureService {
  async generateSignatureHash(signature: string, documentId: string): Promise<string> {
    const hash = crypto.createHash('sha256')
      .update(signature + documentId + Date.now().toString())
      .digest('hex');
    return hash;
  }

  async verifySignature(signature: string, documentId: string, storedHash: string): Promise<boolean> {
    const computedHash = crypto.createHash('sha256')
      .update(signature + documentId)
      .digest('hex');
    
    return computedHash === storedHash;
  }

  async createDigitalSignature(data: any, privateKey: string): Promise<string> {
    const sign = crypto.createSign('SHA256');
    sign.update(JSON.stringify(data));
    sign.end();
    
    const signature = sign.sign(privateKey, 'base64');
    return signature;
  }

  async verifyDigitalSignature(data: any, signature: string, publicKey: string): Promise<boolean> {
    const verify = crypto.createVerify('SHA256');
    verify.update(JSON.stringify(data));
    verify.end();
    
    const isValid = verify.verify(publicKey, signature, 'base64');
    return isValid;
  }

  async generateTimestamp(): Promise<string> {
    return new Date().toISOString();
  }

  async createSignatureAuditTrail(documentId: string, signerId: string, signatureData: any) {
    return {
      documentId,
      signerId,
      signatureHash: await this.generateSignatureHash(signatureData.signature, documentId),
      timestamp: await this.generateTimestamp(),
      ipAddress: signatureData.ipAddress,
      userAgent: signatureData.userAgent,
      location: signatureData.location,
    };
  }
}

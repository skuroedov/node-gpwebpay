import * as crypto from 'crypto';

export type Key = crypto.KeyLike;
export function gpSign(base: string, privateKey: string , privateKeyPass: string) {
    const sign = crypto.createSign('sha1');
    sign.update(base);
    return sign.sign({ key: privateKey, passphrase: privateKeyPass }, 'base64');
}

export function gpValidate(base: string, digest: string, publicKey: string | Key) {
    const verify = crypto.createVerify('sha1');
    verify.update(base);
    return verify.verify(publicKey, digest, 'base64');
}
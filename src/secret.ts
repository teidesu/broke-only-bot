import {
    createHash,
    randomBytes,
    createCipheriv,
    createDecipheriv,
} from 'crypto'
import { buffersEqual } from '@mtcute/core'

const SECRET = createHash('sha256').update(process.env.ENC_SECRET!).digest()

export function encryptSecretMessage(message: string): string {
    const data = Buffer.from(message)

    const iv = randomBytes(16)
    const cipher = createCipheriv('aes-256-cbc', SECRET, iv)
    const sha = createHash('sha256')

    return Buffer.concat([
        iv,
        cipher.update(data),
        cipher.final(),
        sha.update(data).digest(),
    ]).toString('base64url')
}

export function decryptSecretMessage(message: string): string {
    const data = Buffer.from(message, 'base64url')
    const iv = data.slice(0, 16)
    const enc = data.slice(16, -32)
    const sha = data.slice(-32)

    const cipher = createDecipheriv('aes-256-cbc', SECRET, iv)
    const decrypted = Buffer.concat([cipher.update(enc), cipher.final()])

    const realSha = createHash('sha256').update(decrypted).digest()
    if (!buffersEqual(sha, realSha)) {
        throw new Error('Decryption failed')
    }

    return decrypted.toString()
}

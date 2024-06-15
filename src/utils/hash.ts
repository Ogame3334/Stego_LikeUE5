import crypto from 'crypto'

export const cryptoHash = (sentence: string) => {
    return crypto.createHash('sha256').update(sentence).digest('hex')
}

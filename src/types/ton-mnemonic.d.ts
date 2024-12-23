declare module 'ton-mnemonic' {
    export function mnemonicToSeed(mnemonic: string[], password?: string): Promise<Uint8Array>;
    export function mnemonicToEntropy(mnemonic: string[]): Promise<Uint8Array>;
    export function entropyToMnemonic(entropy: Uint8Array): Promise<string[]>;
    export function validateMnemonic(mnemonic: string[]): Promise<boolean>;
    export function generateMnemonic(): Promise<string[]>;
}

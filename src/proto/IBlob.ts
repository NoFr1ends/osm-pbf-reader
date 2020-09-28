export default interface IBlob {
    raw?: Buffer;
    rawSize?: number;
    zlibData?: Buffer;
    lzmaData?: Buffer;
}
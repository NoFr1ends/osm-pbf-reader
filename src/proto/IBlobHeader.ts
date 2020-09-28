export default interface IBlobHeader {
    type: string;
    indexdata?: Buffer;
    datasize?: number;
}
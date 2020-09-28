import {PathLike, promises as fs} from 'fs';
import * as zlib from 'zlib';
import {promisify} from "util";
import {Blob, BlobHeader, HeaderBlock, PrimitiveBlock} from './proto';
import IBlobHeader from "./proto/IBlobHeader";
import IBlob from "./proto/IBlob";
import IHeaderBlock from "./proto/IHeaderBlock";
import IPrimitiveBlock from "./proto/IPrimitiveBlock";

const inflate = promisify<zlib.InputType, Buffer>(zlib.inflate);

export default class PbfReader {
    private readonly file: fs.FileHandle;
    private header: IHeaderBlock;

    private fileStart: number = -1;

    private constructor(fd: fs.FileHandle) {
        this.file = fd;
    }

    private async readHeader(): Promise<any> {
        // The osm.pbf file starts with a 4 byte long size of the following header block
        const headerSizeBuffer = Buffer.alloc(4);
        await this.file.read(headerSizeBuffer, 0, 4, 0);

        const size = headerSizeBuffer.readUInt32BE(0);

        // Allocate buffer big enough for protobuf encoded header
        const headerBuffer = Buffer.alloc(size);
        await this.file.read(headerBuffer, 0, size, 4);

        // Decode header
        const header: IBlobHeader = BlobHeader.decode(headerBuffer);
        let errMsg = BlobHeader.verify(header);
        if(errMsg) throw Error(errMsg);

        if(header.type !== "OSMHeader") throw Error("Unexpected blob header!");

        // Allocate buffer for header data
        const headerBlobBuffer = Buffer.alloc(header.datasize);
        await this.file.read(headerBlobBuffer, 0, header.datasize, 4 + size);

        // Decode header data
        const headerBlob: IBlob = Blob.decode(headerBlobBuffer);
        errMsg = Blob.verify(headerBlob);
        if(errMsg) throw Error(errMsg);

        // Decompress blob if needed
        const buffer = await this.decompressBlob(headerBlob);
        this.header = HeaderBlock.decode(buffer);
        errMsg = HeaderBlock.verify(this.header);
        if(errMsg) throw Error(errMsg);

        this.fileStart = 4 + size + header.datasize;
    }

    async readNextBlob(): Promise<IPrimitiveBlock> {
        const headerSizeBuffer = Buffer.alloc(4);
        await this.file.read(headerSizeBuffer, 0, 4, this.fileStart);
        const size = headerSizeBuffer.readUInt32BE(0);

        // Allocate buffer big enough for protobuf encoded header
        const headerBuffer = Buffer.alloc(size);
        await this.file.read(headerBuffer, 0, size, this.fileStart + 4);

        // Decode header
        const header: IBlobHeader = BlobHeader.decode(headerBuffer);
        let errMsg = BlobHeader.verify(header);
        if(errMsg) throw Error(errMsg);

        switch(header.type) {
            case 'OSMData':
                return await this.readOSMData(header, this.fileStart + 4 + size);
        }
    }

    private async decompressBlob(blob: IBlob): Promise<Buffer> {
        if(blob.zlibData) {
            // Decompress zlib compressed header
            return await inflate(blob.zlibData);
        } else {
            return blob.raw;
        }
    }

    private async readOSMData(header: IBlobHeader, offset: number): Promise<any> {
        const buffer = Buffer.alloc(header.datasize);
        await this.file.read(buffer, 0, header.datasize, offset);

        const blob: IBlob = Blob.decode(buffer);
        let errMsg = Blob.verify(blob);
        if(errMsg) throw Error(errMsg);

        const data = await this.decompressBlob(blob);

        const primitiveBlock: IPrimitiveBlock = PrimitiveBlock.decode(data);
        console.log(primitiveBlock);

        return primitiveBlock;
    }

    static async openFile(file: PathLike): Promise<PbfReader> {
        const fd = await fs.open(file, 'r');

        const reader = new PbfReader(fd);
        await reader.readHeader();

        return reader;
    }
}

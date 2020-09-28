import { promises as fs } from 'fs';
import * as zlib from 'zlib';
import { promisify } from "util";
import {PathLike} from "fs";
import {Blob, BlobHeader, HeaderBlock} from './proto';
import IBlobHeader from "./proto/IBlobHeader";
import IBlob from "./proto/IBlob";
import IHeaderBlock from "./proto/IHeaderBlock";

const inflate = promisify(zlib.inflate);

export default class PbfReader {
    private readonly file: fs.FileHandle;
    private header: IHeaderBlock;

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

        // Allocate buffer for header data
        const headerBlobBuffer = Buffer.alloc(header.datasize);
        await this.file.read(headerBlobBuffer, 0, header.datasize, 4 + size);

        // Decode header data
        const headerBlob: IBlob = Blob.decode(headerBlobBuffer);
        errMsg = Blob.verify(headerBlob);
        if(errMsg) throw Error(errMsg);

        // Check if header is zlib compressed
        if(headerBlob.zlibData) {
            // Decompress zlib compressed header
            const decompressed = await inflate(headerBlob.zlibData);

            // Parse header data
            this.header = HeaderBlock.decode(decompressed);
            errMsg = HeaderBlock.verify(this.header);
            if(errMsg) throw Error(errMsg);
        } else {
            // Parse header data
            this.header = HeaderBlock.decode(headerBlob.raw);
            errMsg = HeaderBlock.verify(this.header);
            if(errMsg) throw Error(errMsg);
        }
    }

    static async openFile(file: PathLike): Promise<PbfReader> {
        const fd = await fs.open(file, 'r');

        const reader = new PbfReader(fd);
        await reader.readHeader();

        return reader;
    }
}
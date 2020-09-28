/*
const fs = require('fs');
const protobufjs = require('protobufjs');

const root = protobufjs.loadSync("pbf.proto");

const BlobHeader = root.lookup("BlobHeader");
const Blob = root.lookup("Blob");

fs.open('germany-latest.osm.pbf', 'r', (err, fd) => {
    if(err) {
        console.error(err);
        return;
    }

    const headerSizeBuffer = Buffer.alloc(4);
    fs.read(fd, headerSizeBuffer, 0, 4, 0, (err, num) => {
        if(err) {
            console.error(err);
            return;
        }

        // Header size read
        const size = headerSizeBuffer.readUInt32BE(0);

        const headerBuffer = Buffer.alloc(size);
        fs.read(fd, headerBuffer, 0, size, 4, (err, num) => {
            if(err) {
                console.error(err);
                return;
            }

            const header = BlobHeader.decode(headerBuffer);
            const errMsg = BlobHeader.verify(header);
            if(errMsg) {
                console.error(errMsg);
                return;
            }

            console.log(header);

            const dataBuffer = Buffer.alloc(header.datasize);
            fs.read(fd, dataBuffer, 0, header.datasize, 4 + size, (err, num) => {
                if(err) {
                    console.error(err);
                    return;
                }

                const blob = Blob.decode(dataBuffer);
                console.log(blob);
            });
        });
    });
});*/

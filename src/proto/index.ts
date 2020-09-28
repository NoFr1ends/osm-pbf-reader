const protobufjs = require('protobufjs');
const root = protobufjs.loadSync("pbf.proto");

export const BlobHeader = root.lookup("BlobHeader");
export const Blob = root.lookup("Blob");
export const HeaderBlock = root.lookup("HeaderBlock");
export const PrimitiveBlock = root.lookup("PrimitiveBlock");

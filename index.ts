import PbfReader from "./src/PbfReader";

PbfReader.openFile("germany-latest.osm.pbf").then(reader => {
    console.log(reader);
});
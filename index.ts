import PbfReader from "./src/PbfReader";

PbfReader.openFile("germany-latest.osm.pbf").then(async reader => {
    console.log(reader);

    const block = await reader.readNextBlob();
    console.log(block.primitivegroup[0].dense)

    block.primitivegroup.forEach(group => {
        let nodeIdx = 0;
        const nodes: any = {};
        for(let i = 0; i < group.dense.keysVals.length; i++) {
            const keyId = group.dense.keysVals[i];
            const valId = group.dense.keysVals[i+1];

            if(keyId == 0) {
                if(nodes[nodeIdx] && nodes[nodeIdx]["highway"] === "bus_stop") {
                    console.log(nodeIdx, nodes[nodeIdx]);
                }

                nodeIdx++;
                continue;
            }

            const key = String(block.stringtable.s[keyId]);
            const value = String(block.stringtable.s[valId]);

            if(!nodes[nodeIdx]) {
                nodes[nodeIdx] = {};
            }

            nodes[nodeIdx][key] = value;

            /*if(key === "highway" && value === "bus_stop") {
                console.log(nodeIdx, key, value);
            }*/
            i++;
        }

        console.log(group.dense.id.length);
    })
});

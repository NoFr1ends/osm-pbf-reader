import {Long} from "protobufjs";

export interface StringTable {
    s: Buffer[];
}

export interface PrimitiveGroup {
    nodes: Node[];
    dense: DenseNodes;
    way: Way[];
    relations: Relation[];
    changesets: ChangeSet[];
}

export interface Node {
    id: number;
    keys: number[];
    vals: number[];
    info?: Info;
    lat: Long;
    lon: Long;
}

export interface Info {
    version?: number;
    timestamp?: Long;
    changeset?: Long;
    uid?: number;
    userSid?: number;
    visible?: boolean;
}

export interface DenseNodes {
    id: Long[];
    denseinfo?: DenseInfo;
    lat: Long[];
    lon: Long[];
    keysVals: number[];
}

export interface DenseInfo {
    version: number[];
    timestamp: Long[];
    changeset: Long[];
    uid: number[];
    userSid: number[];
    visible: boolean[];
}

export interface Way {
    id: Long;
    keys: number[];
    vals: number[];
    info?: Info;
    refs: Long[];
}

export enum MemberType {
    NODE,
    WAY,
    RELATION
}

export interface Relation {
    id: Long;
    keys: number[];
    vals: number[];
    info?: Info;
    rolesSid: number[];
    memids: Long[];
    types: MemberType[];
}

export interface ChangeSet {
    id: Long;
}

export default interface IPrimitiveBlock {
    stringtable: StringTable;
    primitivegroup: PrimitiveGroup[];
}

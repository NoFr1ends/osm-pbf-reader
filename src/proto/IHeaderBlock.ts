import IHeaderBBox from "./IHeaderBBox";

export default interface IHeaderBlock {
    bbox: IHeaderBBox;
    requiredFeatures: string[];
    optionalFeatures: string[];
    writingprogram?: string;
    source?: string;
    osmosisReplicationTimestamp?: BigInteger;
    osmosisReplicationSequenceNumber?: BigInteger;
    osmosisReplicationBaseUrl?: string;
}
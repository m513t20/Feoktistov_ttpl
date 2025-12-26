import { BaseReciever } from "./baseReciever";
import { validateDate } from "./baseReciever";
import { FileWriter } from '../FileWriter/fileWriter';
import { MessageData } from "../Data/messageData";

export class SecondReciever extends BaseReciever {
    constructor(host: string, port: number, writer: FileWriter) {
        super('Server2', host, port, 21 , writer);
    }

    protected parseData(dataBuffer: Buffer): MessageData {
        let tsMicro: bigint = dataBuffer.readBigUInt64BE(0);

        let x: number = dataBuffer.readInt32BE(8);
        let y: number = dataBuffer.readInt32BE(12);
        let z: number = dataBuffer.readInt32BE(16);

        let date: Date = new Date(Number(tsMicro) / 1000);
        validateDate(date);

        return {
            timestamp: date,
            source: 'S2',
            values: `X: ${x}, Y: ${y}, Z: ${z}`
        };
    }
}
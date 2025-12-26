import { BaseReciever } from "./baseReciever";
import { validateDate } from "./baseReciever";
import { FileWriter } from '../FileWriter/fileWriter';
import { MessageData } from "../Data/messageData";

export class FirstReciever extends BaseReciever {
    constructor(host: string, port: number, writer: FileWriter) {
        super('Server1', host, port, 15, writer);
    }

    protected parseData(dataBuffer: Buffer): MessageData {
        let tsMicro: bigint = dataBuffer.readBigUInt64BE(0); 

        let temp: number = dataBuffer.readFloatBE(8);
        
        let pressure: number = dataBuffer.readInt16BE(12);
        
        let date: Date = new Date(Number(tsMicro) / 1000);
        validateDate(date);

        return {
            timestamp: date,
            source: 'S1',
            values: `Temp: ${temp.toFixed(2)}, Press: ${pressure}`
        };
    }
}

import net from 'net'

import { MessageData } from '../Data/messageData';
import { CONFIG } from '../Config/config';
import { FileWriter } from '../FileWriter/fileWriter';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function validateDate(date: Date){
    let now: Date = new Date(Date.now());

    if (isNaN(date.getTime()) || now.getFullYear() != date.getFullYear())
        throw TypeError("Incorrect date");
}

export abstract class BaseReciever {
    protected socket: net.Socket | null = null;
    protected inData: Buffer = Buffer.alloc(0);
    protected isConnected: boolean = false;

    public name: string = "";
    public host: string = "";
    public port: number = 0;
    public msgLegnth: number = 0;
    public writer!: FileWriter;

        constructor(
            nameInput: string,
            hostInput: string,
            portInput: number,
            msgLegnthInput: number,
            fileWriterInput: FileWriter
        ) 
        {
            this.name = nameInput;
            this.host = hostInput;
            this.port = portInput;
            this.msgLegnth = msgLegnthInput;
            this.writer = fileWriterInput
        }
    
        public stop() {
            this.isConnected = false;
            if (this.socket) {
                this.socket.destroy();
            }
        }
    
        public start() {
            console.log(`${this.name} is connecting to ${this.host}:${this.port}`)

            this.socket = new net.Socket();
            this.socket.connect(this.port, this.host, () => {
                console.log(`${this.name} Connected`);
                this.socket?.write(CONFIG.key);
                this.isConnected = true;
            })
            
            this.socket.on('data', (chunk: Buffer) => {
                this.handleData(chunk);
            });
    
            this.socket.on('error', (err) => {
                console.log(`${this.name} Error: ${err.message}`);
            });
    
            this.socket.on('close', () => {
                console.log(`${this.name} Disconnected.`);
                this.inData = Buffer.alloc(0); 
                if (this.isConnected) {
                    console.log("reconnecting...")
                    setTimeout(() => this.start(), CONFIG.reconnectDelay);
                }
            });
        }
    
        public async requestData() {
            if (this.socket && !this.socket.destroyed) {
                try
                {   
                    await sleep(1000);
                    this.socket.write('get');
                }
                catch (e){
                    console.log(`${this.name} request error ${e}`);
                    this.stop();
                }
            }
        }
    
        private handleData(chunk: Buffer) {
            console.log(`${this.name} data recieved`);
            this.inData = Buffer.concat([this.inData, chunk]);

            let start: number = 0;
            while (start + this.msgLegnth <= this.inData.length) {
                let dataBuffer: Buffer = this.inData.slice(start, start+this.msgLegnth);
                if (this.validateChecksum(dataBuffer)) {
                    try {
                        let parsed: MessageData = this.parseData(dataBuffer);
                        console.log('parsed succesfully');
                        this.writer.write(parsed);
                        this.inData = this.inData.slice(start + this.msgLegnth);
                    } catch (e) {
                        console.log(`${this.name} parsing error ${e}`);
                    }
                }

                start += 1;
            }
            this.requestData();
        }
    
        private validateChecksum(dataBuffer: Buffer): boolean {
            let receivedSum: number = dataBuffer[dataBuffer.length - 1];
            let sum: number = 0;
            for (let i = 0; i < dataBuffer.length - 1; i++) {
                sum += dataBuffer[i];
            }
            return (sum % 256) === receivedSum;
        }
    
        protected abstract parseData(dataBuffer: Buffer): MessageData;
}
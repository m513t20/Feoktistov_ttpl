import fs  from 'fs'

import { MessageData } from '../Data/messageData';

export class FileWriter {
    private stream: fs.WriteStream;

    constructor(filePath: string) {
        this.stream = fs.createWriteStream(filePath, { flags: 'a' });
    }

    public write(data: MessageData) {
        const line = `${formatDate(data.timestamp)} | ${data.source} | ${data.values}\n`;
        this.stream.write(line);
    }

    public close() {
        this.stream.end();
    }
}

function formatDate(date: Date): string{
    let pad = (n: number) => n.toString().padStart(2, '0');

    let year: number = date.getFullYear();
    let month: string = pad(date.getMonth()+1);
    let day: string = pad(date.getDate());
    let hour: string = pad(date.getHours());
    let minute: string = pad(date.getMinutes());
    let seconds: string = pad(date.getSeconds());

    let res: string = `${year}-${month}-${day} ${hour}:${minute}:${seconds}`;
    return res;
}


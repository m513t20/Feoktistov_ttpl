import net from 'net';
import fs from 'fs';
import { EventEmitter } from 'events';

// мокаю для тестирования работы с сетью и конфигом
jest.mock('net');
jest.mock('fs');

jest.mock('../src/Config/config', () => ({
    CONFIG: {
        server1: { host: '127.0.0.1', port: 3000 },
        server2: { host: '127.0.0.1', port: 3001 },
        outputFile: 'test.log',
        key: 'aaaaaa',
        reconnectDelay: 100
    }
}));

import { FileWriter } from '../src/FileWriter/fileWriter';
import { validateDate } from '../src/Reciever/baseReciever';
import { FirstReciever } from '../src/Reciever/firstReciever';
import { SecondReciever } from '../src/Reciever/secondReciever';
import { CONFIG } from '../src/Config/config';

const MockSocket = net.Socket as unknown as jest.Mock;
const MockWriteStream = {
    write: jest.fn(),
    end: jest.fn(),
};
(fs.createWriteStream as jest.Mock).mockReturnValue(MockWriteStream);

describe('full test', () => {
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
        consoleSpy.mockRestore();
    });

    describe('FileWriter', () => {
        test('Constructor', () => {
            new FileWriter('test.txt');
            expect(fs.createWriteStream).toHaveBeenCalledWith('test.txt', { flags: 'a' });
        });

        test('write', () => {
            let writer = new FileWriter('test.txt');
            let fixedDate = new Date('2001-01-01T12:30:45'); 
            
            writer.write({
                timestamp: fixedDate,
                source: 'TEST',
                values: 'Val: 1'
            });
            let expectedString = `2001-01-01 12:30:45 | TEST | Val: 1\n`;
            expect(MockWriteStream.write).toHaveBeenCalledWith(expectedString);
        });

        test('close', () => {
            let writer = new FileWriter('test.txt');
            writer.close();
            expect(MockWriteStream.end).toHaveBeenCalled();
        });
    });

    describe('validateDate', () => {
        test('invalid', () => {
            expect(() => validateDate(new Date('invalid'))).toThrow("Incorrect date");
        });

        test('invalid year', () => {
            let oldDate: Date = new Date();
            oldDate.setFullYear(1999); 
            expect(() => validateDate(oldDate)).toThrow("Incorrect date");
        });

        test('ok', () => {
            validateDate(new Date());
            expect(true).toBe(true);;
        });
    });

    describe('BaseReciever', () => {
        let mockSocket: any;
        let writer: FileWriter;
        let client: FirstReciever;

        let createMsg = (data: Buffer) => {
            let sum = 0;
            for(const byte of data) sum += byte;
            const checksum = sum % 256;
            return Buffer.concat([data, Buffer.from([checksum])]);
        };

        beforeEach(() => {
            mockSocket = new EventEmitter();
            mockSocket.connect = jest.fn((port, host, cb) => {
                if(cb) cb();
            });
            mockSocket.write = jest.fn();
            mockSocket.destroy = jest.fn();
            mockSocket.destroyed = false;
            MockSocket.mockImplementation(() => mockSocket);

            writer = new FileWriter('out.txt');
            client = new FirstReciever('127.0.0.1', 3000, writer);
        });

        test('start', () => {
            client.start();
            expect(mockSocket.connect).toHaveBeenCalledWith(3000, '127.0.0.1', expect.any(Function));
            expect(mockSocket.write).toHaveBeenCalledWith(CONFIG.key);
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Connected'));
        });

        test('stop', () => {
            client.start();
            client.stop();
            expect(mockSocket.destroy).toHaveBeenCalled();
        });

        test('error', () => {
            client.start();
            mockSocket.emit('error', new Error('Fail'));
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Error: Fail'));
        });

        test('reconnect', () => {
            client.start();
            mockSocket.emit('close');
            
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Disconnected'));
            expect(consoleSpy).toHaveBeenCalledWith('reconnecting...');

            let startSpy = jest.spyOn(client, 'start');
            jest.runAllTimers();
            expect(startSpy).toHaveBeenCalled();
        });

        test('requestData', async () => {
            client.start();
            let reqPromise = client.requestData();
            jest.advanceTimersByTime(1000);
            await reqPromise;
            expect(mockSocket.write).toHaveBeenCalledWith('get');
        });

        test('requestData error', async () => {
            client.start();
            mockSocket.write.mockImplementationOnce(() => { throw new Error('Write Error'); });
            let reqPromise = client.requestData();
            jest.advanceTimersByTime(1000);
            await reqPromise;
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('request error'));
            expect(mockSocket.destroy).toHaveBeenCalled();
        });

        test('handleData1', () => {
            client.start();
            let now = Date.now();
            let buf = Buffer.alloc(14);
            buf.writeBigUInt64BE(BigInt(now * 1000), 0);
            buf.writeFloatBE(12.34, 8);
            buf.writeInt16BE(100, 12);

            let msg = createMsg(buf);
            
            mockSocket.emit('data', msg);

            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('parsed succesfully'));
            expect(MockWriteStream.write).toHaveBeenCalledWith(expect.stringContaining('Temp: 12.34'));
        });

        test('handleData chcksum', () => {
            client.start();
            let data = Buffer.alloc(14).fill(0);
            let msg = Buffer.concat([data, Buffer.from([255])]);
            mockSocket.emit('data', msg);
            expect(MockWriteStream.write).not.toHaveBeenCalled();
        });

        test('handleData parse fail', () => {
            client.start();
            let buf = Buffer.alloc(14);
            buf.writeBigUInt64BE(BigInt(0), 0); 
            let msg = createMsg(buf);
            mockSocket.emit('data', msg);
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('parsing error'));
        });
    });
    
    describe('Recievers', () => {
        let writer: FileWriter;
        beforeEach(() => { writer = new FileWriter('out.txt'); });

        test('SecondReciever', () => {
            let client = new SecondReciever('host', 2, writer);
            let mockSocket = new EventEmitter();
            (client as any).socket = mockSocket; 

            let now = Date.now();
            let buf = Buffer.alloc(20);
            buf.writeBigUInt64BE(BigInt(now * 1000), 0);
            buf.writeInt32BE(10, 8);
            buf.writeInt32BE(20, 12);
            buf.writeInt32BE(30, 16);

            let sum = 0; 
            for(let index = 0; index<buf.length; index++) 
                sum+=buf[index];
            let msg = Buffer.concat([buf, Buffer.from([sum % 256])]);
            (client as any).handleData(msg);
            expect(MockWriteStream.write).toHaveBeenCalledWith(expect.stringContaining('X: 10, Y: 20, Z: 30'));
            expect(MockWriteStream.write).toHaveBeenCalledWith(expect.stringContaining('S2'));
        });
    });
});
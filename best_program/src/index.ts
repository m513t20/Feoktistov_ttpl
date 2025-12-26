import { CONFIG } from './Config/config'
import { FileWriter } from './FileWriter/fileWriter';
import { FirstReciever } from './Reciever/firstReciever';
import { SecondReciever } from './Reciever/secondReciever';

let writer: FileWriter = new FileWriter(CONFIG.outputFile);

let client1: FirstReciever = new FirstReciever(CONFIG.server1.host, CONFIG.server1.port, writer);
let client2: SecondReciever = new SecondReciever(CONFIG.server2.host, CONFIG.server2.port, writer);

console.log('Starting data collection. Press Ctrl+C to stop.');

client1.start();
client2.start();

process.on('SIGINT', () => {
    console.log('\nStopping...');
    client1.stop();
    client2.stop();
    writer.close();
    console.log('Done.');
    process.exit(0);
});


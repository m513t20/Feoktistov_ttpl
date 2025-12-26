import path from 'path'

export const CONFIG = {
    server1: { host: '95.163.237.76', port: 5123 }, 
    server2: { host: '95.163.237.76', port: 5124 }, 
    key: 'isu_pt',
    outputFile: path.join(__dirname, 'output.txt'),
    reconnectDelay: 5000,
};
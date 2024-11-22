import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import folders from '../utils/folders.js';
class LogController {
    LOG_FOLDER = folders.TEMP;
    BLOCK_SPACES = 2;
    createLog(identifier, log) {
        try {
            const [date, time] = new Date().toISOString().split('T');
            const todayErrorLogPath = path.resolve(this.LOG_FOLDER, `./error-logs-${date}.txt`);
            const LINE_BREAK = '\n'.repeat(this.BLOCK_SPACES);
            let logs = '';
            if (fs.existsSync(todayErrorLogPath)) {
                logs = fs.readFileSync(todayErrorLogPath, 'utf-8') + LINE_BREAK;
            }
            logs += `[${identifier}]\nTime: ${time}\n${log}` + LINE_BREAK;
            fs.writeFileSync(todayErrorLogPath, logs, { encoding: 'utf-8' });
            return true;
        }
        catch (err) {
            console.error(err);
            return false;
        }
    }
    clearPm2Logs(nowDate) {
        try {
            exec('pm2 flush', (err, stdout, stderr) => {
                if (err) {
                    console.error(`Error while flushing: ${err.message}`);
                    return;
                }
                if (stderr) {
                    console.error(`Error while flushing: ${stderr}`);
                    return;
                }
                console.log(`PM2 logs flushed successfully: ${stdout}`);
            });
        }
        catch (err) {
            console.log(err);
        }
    }
    rebootPm2Server(nowDate) {
        try {
            console.log(process.cwd());
            exec('npm run reload:pm2:prod', (err, stdout, stderr) => {
                if (err) {
                    console.error(`Error while rebooting: ${err.message}`);
                    return;
                }
                if (stderr) {
                    console.error(`Error while reboot: ${stderr}`);
                    return;
                }
                console.log(`PM2 logs rebooted successfully: ${stdout}`);
            });
        }
        catch (err) {
            console.log(err);
        }
    }
    rebootServer(nowDate) {
        try {
            exec('sudo reboot', (err, stdout, stderr) => {
                if (err) {
                    console.error(`Error while rebooting: ${err.message}`);
                    return;
                }
                if (stderr) {
                    console.error(`Error while reboot: ${stderr}`);
                    return;
                }
                console.log(`PM2 logs rebooted successfully: ${stdout}`);
            });
        }
        catch (err) {
            console.log(err);
        }
    }
}
export default new LogController();

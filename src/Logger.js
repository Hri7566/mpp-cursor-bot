const chalk = require('chalk');

class Logger {
    constructor(id, color) {
        this.id = id;
        this.color = color || chalk.blue;
        this.date = new Date();
    }
    
    info(...args) {
        this.logOut(console.log, chalk.bgBlue(`INFO`), ...args);
    }
    
    get log() {
        return this.info;
    }
    
    error(...args) {
        this.logOut(console.error, chalk.bgRed(`ERROR`), ...args);
    }
    
    warn(...args) {
        this.logOut(console.warn, chalk.bgYellow(`WARNING`), ...args);
    }
    
    getTime() {
        this.date = new Date();

        let hours = `00${this.date.getHours()}`.slice(-2);
        let minutes = `00${this.date.getMinutes()}`.slice(-2); 
        let seconds = `00${this.date.getSeconds()}`.slice(-2);

        return `${hours}:${minutes}:${seconds}`;
    }
    
    logOut(log, logLevel, ...args) {
        let t = this.getTime();
        log(chalk.green(`${this.date.getFullYear()}-${this.date.getMonth()}-${this.date.getMonth()}`), chalk.green(`${t}`), logLevel, this.color(this.id), ...args);
    }
}

module.exports = {
    Logger
}

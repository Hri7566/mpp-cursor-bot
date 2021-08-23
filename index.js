require('dotenv').config();

const chalk = require('chalk');
const { ClientHandler } = require('./src/ClientHandler');
const { StaticEventEmitter } = require('./src/Events');
const { Logger } = require('./src/Logger');

class Bot extends StaticEventEmitter {
    static clientHandler = ClientHandler;
    static logger = new Logger('Bot', chalk.green);

    static async start() {
        await this.bind();
        await this.clientHandler.start(require('./config.json'));
        this.emit('ready');
    }
    
    static async bind() {
        this.on('ready', () => {
            this.logger.info('Ready.');
        });
    }
}

Bot.start();

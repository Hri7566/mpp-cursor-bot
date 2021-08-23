const chalk = require('chalk');
const { StaticEventEmitter } = require('./Events');
const { Logger } = require('./Logger');
const { MPPClient } = require('./MPPClient');

class ClientHandler extends StaticEventEmitter {
    static logger = new Logger('CLH', chalk.blue);
    static clients = new Map();

    static async start(config) {
        await this.bind();

        this.config = config;

        this.startClients(config.channels);

        this.emit('ready');
    }
    
    static async bind() {
        this.on('ready', () => {
            this.logger.info(`Ready.`);
        });

        this.on('startClient', cldata => { // _id, uri
            this.logger.info(`Starting client in ${cldata._id}...`);
            let cl = new MPPClient(cldata.uri, cldata._id, this.config);
            let _id = cldata.uri + cldata._id;
            this.clients.set(_id, cl);
        });

        this.on('stopClient', cldata => { // _id, uri
            this.clients.delete(cldata.uri + cldata._id);
        });
    }

    static startClients(chdata) {
        this.logger.info(`Starting clients...`);

        for (let uri of Object.keys(chdata)) {
            let channels = chdata[uri];
            for (let channel of channels) {
                this.emit('startClient', {
                    _id: channel,
                    uri: uri
                });
            }
        }
    }
}

module.exports = {
    ClientHandler
}

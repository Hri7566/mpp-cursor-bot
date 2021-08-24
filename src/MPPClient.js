const Client = require('./Client');
const EventEmitter = require('events');
const { Logger } = require('./Logger');
const chalk = require('chalk');
const { CursorFunctionHandler } = require('./Cursor');

const MPPC_TOKEN = process.env.MPPC_TOKEN;

if (!MPPC_TOKEN) throw "No token in .env";

class MPPClient extends EventEmitter {
    constructor (uri, room, config) {
        super();

        this.config = config;
        
        this.bind();

        this.logger = new Logger(room, chalk.yellow);
        this.client = new Client(uri, MPPC_TOKEN);
        this.room = room;
        this.defaultUser = config.userset;

        this.setupCFH();
        
        this.emit('ready');
    }
    
    async bind() {
        this.on('ready', () => {
            this.emit('connect');

            this.cursorSendInterval = setInterval(() => {
                this.emit('sendCursor', this.cfh.cursor.pos.x + this.cfh.cursor.anchor.x, this.cfh.cursor.pos.y + this.cfh.cursor.anchor.y);
            }, 1000 / 20);

            this.logger.log('Ready.');
        });

        this.on('connect', () => {
            this.client.on('a', msg => {
                this.emit('receiveChat', msg);
            });
            
            this.client.on('hi', msg => {
                this.emit('setChannel');
            });
            
            this.client.on('ch', msg => {
                this.emit('userset');
                // this.emit('sendChat', "if you see this, it's working!!!");
                if (this.config.settings.chatOnConnect) {
                    this.emit('sendChat', "Connected.");
                }
            });
            
            this.client.on('t', msg => {
                this.emit('setChannel');
            });

            this.logger.log(`Connecting...`);
            this.client.start();
        });

        this.on('receiveChat', msg => {

        });

        this.on('sendChat', message => {
            this.client.sendArray([{
                m: 'a',
                message: `\u034f${message}`
            }]);
        });

        this.on('setChannel', (_id, set) => {
            this.client.setChannel(this.room || _id, set);
        });

        this.on('userset', (set) => {
            this.client.sendArray([{
                m:'userset',
                set: set || this.defaultUser
            }]);
        });

        this.on('sendCursor', (x, y) => {
            this.client.sendArray([{
                m: 'm',
                x: x,
                y: y
            }]);
        });
    }

    async setupCFH() {
        this.cfh = CursorFunctionHandler.default;
    }
}

module.exports = {
    MPPClient
}

const { EventEmitter } = require('events');

class StaticEventEmitter {
    static _events = EventEmitter.prototype._events;
    static on = EventEmitter.prototype.on;
    static off = EventEmitter.prototype.off;
    static once = EventEmitter.prototype.once;
    static emit = EventEmitter.prototype.emit;
}

module.exports = {
    StaticEventEmitter
}

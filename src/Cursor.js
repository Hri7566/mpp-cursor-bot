const EventEmitter = require('events');

class Vector2 {
    /**
     * Add Vector2
     * @param  {...Vector2} args List of Vector2
     */
     static add(...args) {
        let outv = new Vector2();
        for (let v of args) {
            if (!(v instanceof Vector2)) continue;
            outv.x += v.x;
            outv.y += v.y;
        }
    }

    static get a() {
        return this.add;
    }

    /**
     * Subtract Vector2
     * @param  {...Vector2} args List of Vector2
     */
    static subtract(...args) {
        let outv = new Vector2();
        for (let v of args) {
            if (!(v instanceof Vector2)) continue;
            outv.x -= v.x;
            outv.y -= v.y;
        }
    }

    static get sub() {
        return this.subtract;
    }

    static get s() {
        return this.subtract;
    }

    /**
     * Multiply Vector2
     * @param  {...Vector2} args List of Vector2
     */
    static multiply(...args) {
        let outv = new Vector2();
        for (let v of args) {
            if (!(v instanceof Vector2)) continue;
            outv.x *= v.x;
            outv.y *= v.y;
        }
    }

    static get mult() {
        return this.multiply;
    }

    static get m() {
        return this.multiply;
    }

    /**
     * Divide Vector2
     * @param  {...Vector2} args List of Vector2
     */
    static divide(...args) {
        let outv = new Vector2();
        for (let v of args) {
            if (!(v instanceof Vector2)) continue;
            outv.x /= v.x;
            outv.y /= v.y;
        }
    }

    static get div() {
        return this.divide;
    }

    static get d() {
        return this.d;
    }

    /**
     * Get the midpoint between two vectors.
     * @param {Vector2} v1 First vector
     * @param {Vector2} v2 Second vector
     */
    static midpoint(v1, v2) {
        return new Vector2((v1.x + v2.x) / 2, (v1.y + v2.y) / 2);
    }

    /**
     * Create Vector2
     * @param {number} x X
     * @param {number} y Y
     */
    constructor (x, y) {
        this.x = x;
        this.y = y;
    }
}

class Cursor {
    static screenBoundaries = class {
        static top = 0;
        static bottom = 100;
        static left = 0;
        static right = 100;

        static topLeft = new Vector2(this.left, this.top);
        static topRight = new Vector2(this.right, this.top);
        static bottomLeft = new Vector2(this.left, this.bottom);
        static bottomRight = new Vector2(this.right, this.bottom);
    }

    /**
     * MPP Cursor
     * @param {Vector2} pos Position
     * @param {Vector2} vel Position
     */
    constructor (pos, vel) {
        this.position = pos instanceof Vector2 ? new Vector2(pos.x, pos.y) : Vector2.midpoint(Cursor.screenBoundaries.topLeft, Cursor.screenBoundaries.bottomRight);
        this.anchor = new Vector2(0, 0);
        this.velocity = vel instanceof Vector2 ? new Vector2(vel.x, vel.y) : new Vector2(0, 0);
    }

    get pos() {
        return this.position;
    }

    get vel() {
        return this.velocity;
    }
}

class CursorFunctionHandler extends EventEmitter {
    static allFuncs = new Map();
    
    static get default() {
        let cfh = new CursorFunctionHandler();
        cfh.addFunc('vsine', {
            vsine_anglev: 0.0005
        });
        cfh.addFunc('hsine', {
            hsine_anglev: 0.0007
        });
        cfh.addFunc('dvd', {
            top: Cursor.screenBoundaries.top + 10,
            left: Cursor.screenBoundaries.left + 10,
            right: Cursor.screenBoundaries.right - 10,
            bottom: Cursor.screenBoundaries.bottom - 10
        });
        return cfh;
    }

    constructor (fr) {
        super();

        this.cursor = new Cursor();

        this.funcs = [];

        this.time = new Date();
        this.oldTime = new Date();
        this.deltaTime = (this.time - this.oldTime) / 100;

        this.updateLoop = setInterval(() => {
            this.tick();
        }, 1000 / fr || 60);
    }

    tick() {
        this.time = new Date();
        this.deltaTime = this.time - this.oldTime;

        for (let f of this.funcs) {
            f.func(this.cursor, this.deltaTime);
        }

        this.emit('tick', this.cursor.position.x + this.cursor.anchor.x, this.cursor.position.y + this.cursor.anchor.y);

        this.oldTime = new Date();
    }

    addFunc(str, set) {
        if (!CursorFunctionHandler.allFuncs.has(str)) return false;

        let f = CursorFunctionHandler.allFuncs.get(str);

        f.pre(this.cursor, set);

        this.funcs.push(f);
        
        return true;
    }

    addFuncNew(id, func) {
        let f = class extends CursorFunction {
            constructor () {
                super(id);
                this.func = func;
            }
        }

        this.funcs.push(f);
    }

    get t() {
        return this.time;
    }

    get ot() {
        return this.oldTime;
    }

    get dt() {
        return this.deltaTime;
    }
}

class CursorFunction {
    constructor (id, pre, func) {
        CursorFunctionHandler.allFuncs.set(id, this);
        this.pre = pre;
        this.func = func;
    }

    pre(c, set) {

    }

    func(c, dt) {

    }
}

new CursorFunction('dvd', (c, set) => {
    if (c.vel.x == 0) c.vel.x = 0.01;
    if (c.vel.y == 0) c.vel.y = 0.02;
    
    c.dvd_boundary = Cursor.screenBoundaries;

    if (!set) return;

    if (set.hasOwnProperty('left')) c.dvd_boundary.left = set.left;
    if (set.hasOwnProperty('right')) c.dvd_boundary.right = set.right;
    if (set.hasOwnProperty('top')) c.dvd_boundary.top = set.top;
    if (set.hasOwnProperty('bottom')) c.dvd_boundary.bottom = set.bottom;
}, (c, dt) => {
    c.pos.x += c.vel.x * dt;
    c.pos.y += c.vel.y * dt;

    if (c.pos.x < Cursor.screenBoundaries.left || c.pos.x > Cursor.screenBoundaries.right) {
        c.vel.x = -c.vel.x;
    }

    if (c.pos.y < Cursor.screenBoundaries.top || c.pos.y > Cursor.screenBoundaries.bottom) {
        c.vel.y = -c.vel.y;
    }
});

new CursorFunction('vsine', (c, set) => {
    c.vsine_angle = 0;
    c.vsine_anglev = 0.01;

    if (!set) return;

    if (set.hasOwnProperty('vsine_angle')) c.vsine_angle = set.vsine_angle;
    if (set.hasOwnProperty('vsine_anglev')) c.vsine_anglev = set.vsine_anglev;
}, (c, dt) => {
    c.vsine_angle += c.vsine_anglev * dt;
    c.anchor.y = Math.sin(c.vsine_angle * 10) * 10;
});

new CursorFunction('hsine', (c, set) => {
    c.hsine_angle = 0;
    c.hsine_anglev = 0.01;

    if (!set) return;

    if (set.hasOwnProperty('hsine_angle')) c.hsine_angle = set.hsine_angle;
    if (set.hasOwnProperty('hsine_anglev')) c.hsine_anglev = set.hsine_anglev;
}, (c, dt) => {
    c.hsine_angle += c.hsine_anglev * dt;
    c.anchor.x = Math.sin(c.hsine_angle * 10) * 10;
});

module.exports = {
    Cursor,
    Vector2,
    CursorFunction,
    CursorFunctionHandler
}

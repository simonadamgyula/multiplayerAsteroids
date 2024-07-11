export class Game {
    constructor(clients) {
        this.meteorites = [];
        this.bullets = [];

        this.meteorites_ids = 0;
        this.bullet_ids = 0;

        this.cicles = 0;
        this.clients = clients;

        this.loop = null;
    }

    update() {
        this.cicles++;

        if (this.cicles % 100 === 0) {
            this.meteorites.push(new Meteorite(this.meteorites_ids++, Math.floor(Math.random() * 360), { x: 0, y: 0 }));
        }

        this.sendBroadcast({ action: 'game_update', meteorites: this.meteorites, bullets: this.bullets });
    }

    start() {
        this.loop = setInterval(() => {
            this.update();
        }, 1000 / 30);
    }

    sendBroadcast(message) {
        [...this.clients.keys()].forEach((client) => {
            client.send(JSON.stringify(message));
        });
    }

    dispose() {
        clearInterval(this.loop);
        delete this;
    }
}

class Meteorite {
    constructor(id, facing, position) {
        this.id = id;
        this.position = position;
        this.facing = facing;
        this.rotation = 0;
    }

    update() {
        this.position.x += 5 * Math.sin(this.facing * Math.PI / 180);
        this.position.y -= 5 * Math.cos(this.facing * Math.PI / 180);

        this.rotation += 5;
    }
}

class Bullet {
    constructor(rotation) {
        this.position = new Object();
        this.position.x = 0;
        this.position.y = 0;
        this.rotation = rotation;
    }

    update() {
        this.position.x += 10 * Math.sin(this.rotation * Math.PI / 180);
        this.position.y -= 10 * Math.cos(this.rotation * Math.PI / 180);
    }
}
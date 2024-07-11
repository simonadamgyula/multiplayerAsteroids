const resolution = [1600, 950]

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

        this.meteorites.forEach((meteorite) => {
            if (meteorite.update()) {
                const index = this.meteorites.indexOf(meteorite);
                if (index > -1) {
                    this.meteorites.splice(index, 1);
                }

                this.sendBroadcast({ action: 'meteorite_destroyed', id: meteorite.id });
            }
        });
        this.bullets.forEach((bullet) => {
            if (bullet.update()) {
                const index = this.bullets.indexOf(bullet);
                if (index > -1) {
                    this.bullets.splice(index, 1);
                }

                this.sendBroadcast({ action: 'bullet_destroyed', id: bullet.id });
            }
        });

        if (this.cicles % 25 === 0) {
            this.meteorites.push(new Meteorite(this.meteorites_ids++, Math.floor(Math.random() * 360)));
        }
        this.checkCollision();

        this.sendBroadcast({ action: 'game_update', meteorites: this.meteorites, bullets: this.bullets });
    }

    checkCollision() {
        this.meteorites.forEach((meteorite) => {
            this.bullets.forEach((bullet) => {
                if (Math.abs(meteorite.position.x + meteorite.size / 2 - bullet.position.x) < meteorite.size / 2 && Math.abs(meteorite.position.y + meteorite.size / 2 - bullet.position.y) < meteorite.size / 2) {
                    this.duplicateMeteorites(meteorite);

                    const index = this.bullets.indexOf(bullet);
                    if (index > -1) {
                        this.bullets.splice(index, 1);
                        this.sendBroadcast({ action: 'bullet_destroyed', id: bullet.id });
                    }
                }
            });
        });
    }

    duplicateMeteorites(meteorite) {
        const index = this.meteorites.indexOf(meteorite);
        if (index > -1) {
            this.meteorites.splice(index, 1);
            this.sendBroadcast({ action: 'meteorite_destroyed', id: meteorite.id });
        }

        if (meteorite.size < 50) return;

        this.meteorites.push(new Meteorite(this.meteorites_ids++, meteorite.facing + 60));
        this.meteorites.push(new Meteorite(this.meteorites_ids++, meteorite.facing - 60));
    }

    shoot(bullet_position) {
        this.bullets.push(new Bullet(this.bullet_ids++, bullet_position.position, bullet_position.rotation));
        console.log(this.bullets)
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
    constructor(id, facing) {
        this.id = id;
        this.size = Math.floor(Math.random() * 100) + 100;
        this.position = Meteorite.getSpawnPostition(this.size);
        this.facing = facing;
        this.rotation = 0;
    }

    update() {
        if (this.position.x < -this.size || this.position.x > resolution[0] + this.size || this.position.y < -this.size || this.position.y > resolution[1] + this.size) {
            delete this;
            return true;
        }

        this.position.x += 5 * Math.sin(this.facing * Math.PI / 180);
        this.position.y -= 5 * Math.cos(this.facing * Math.PI / 180);

        this.rotation += 5;

        return false;
    }

    static getSpawnPostition(size) {
        const bounding_width = resolution[0] + size
        const bounding_height = resolution[1] + size

        var position = { x: 0, y: 0 }

        var p = Math.floor(Math.random() * ((bounding_width + bounding_height) * 2))
        if (p < (bounding_width + bounding_height)) {
            if (p < bounding_width) {
                position.x = p
                position.y = 0
            }
            else {
                position.x = bounding_width
                position.y = p - bounding_width
            }
        }
        else {
            p = p - (bounding_width + bounding_height)
            if (p < bounding_width) {
                position.x = bounding_width - p
                position.y = bounding_height
            }
            else {
                position.x = 0
                position.y = bounding_height - (p - bounding_width)
            }
        }

        position.x -= size / 2
        position.y -= size / 2

        return position
    }
}

class Bullet {
    constructor(id, position, rotation) {
        this.id = id;
        this.position = position;
        this.rotation = rotation;
    }

    update() {
        if (this.position.x < -50 || this.position.x > resolution[0] + 50 || this.position.y < -50 || this.position.y > resolution[1] + 50) {
            delete this;
            return true;
        }

        this.position.x += 30 * Math.sin(this.rotation * Math.PI / 180);
        this.position.y -= 30 * Math.cos(this.rotation * Math.PI / 180);
    }
}
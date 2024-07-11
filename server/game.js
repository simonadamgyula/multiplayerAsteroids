const resolution = [1600, 950]

export class Game {
    constructor(clients) {
        this.meteorites = new Set();
        this.bullets = new Set();

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
                this.meteorites.delete(meteorite);

                this.sendBroadcast({ action: 'meteorite_destroyed', id: meteorite.id });
            }
        });
        this.bullets.forEach((bullet) => {
            if (bullet.update()) {
                this.bullets.delete(bullet);

                this.sendBroadcast({ action: 'bullet_destroyed', id: bullet.id });
            }
        });

        if (this.cicles % 25 === 0) {
            const x = Math.floor(Math.random() * resolution[0]);
            const y = Math.floor(Math.random() * resolution[1]);

            const facing = Math.atan2(resolution[1] / 2 - y, resolution[0] / 2 - x) * 180 / Math.PI;

            this.meteorites.add(new Meteorite(this.meteorites_ids++, facing));
        }
        this.checkCollision();

        this.sendBroadcast({ action: 'game_update', meteorites: Array.from(this.meteorites), bullets: Array.from(this.bullets) });
    }

    checkCollision() {
        this.meteorites.forEach((meteorite) => {
            this.bullets.forEach((bullet) => {
                if (Math.abs(meteorite.position.x + (meteorite.size / 2) - bullet.position.x) < meteorite.size / 2 && Math.abs(meteorite.position.y + (meteorite.size / 2) - bullet.position.y) < meteorite.size / 2) {
                    this.duplicateMeteorites(meteorite);

                    this.bullets.delete(bullet);
                    this.sendBroadcast({ action: 'bullet_destroyed', id: bullet.id });
                }
            });

            for (const client of this.clients.keys()) {
                const player = this.clients.get(client);
                if (Math.abs(meteorite.position.x + (meteorite.size / 2) - (player.position.x + 20)) < (meteorite.size / 2) && Math.abs(meteorite.position.y + (meteorite.size / 2) - (player.position.y + 50)) < (meteorite.size / 2)) {
                    this.duplicateMeteorites(meteorite);

                    client.send(JSON.stringify({ action: 'score', sender: player.id }));
                    client.close();
                    this.clients.delete(client);
                    this.sendBroadcast({ sender: player.id, action: 'disconnect' });
                }
            }
        });
    }

    duplicateMeteorites(meteorite) {
        if (meteorite.size > 80) {
            this.meteorites.add(new Meteorite(this.meteorites_ids++, meteorite.facing + 50, { ...meteorite.position }, meteorite.size / 2));
            this.meteorites.add(new Meteorite(this.meteorites_ids++, meteorite.facing - 50, { ...meteorite.position }, meteorite.size / 2));
        }

        this.meteorites.delete(meteorite);
        this.sendBroadcast({ action: 'meteorite_destroyed', id: meteorite.id });

    }

    shoot(bullet_position) {
        this.bullets.add(new Bullet(this.bullet_ids++, bullet_position.position, bullet_position.rotation));
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
    constructor(id, facing, position, size) {
        this.id = id;
        this.size = size || Math.floor(Math.random() * 100) + 100;
        this.position = position || Meteorite.getSpawnPostition(this.size);
        this.facing = facing;
        this.rotation = 0;
    }

    update() {
        if (this.position.x < -this.size * 2 || this.position.x > resolution[0] + this.size * 2 || this.position.y < -this.size * 2 || this.position.y > resolution[1] + this.size * 2) {
            delete this;
            return true;
        }

        this.position.x += 5 * Math.sin(this.facing * Math.PI / 180);
        this.position.y -= 5 * Math.cos(this.facing * Math.PI / 180);

        this.rotation += 5;

        return false;
    }

    static getSpawnPostition(size) {
        const bounding_width = resolution[0] + size * 2
        const bounding_height = resolution[1] + size * 2

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

        position.x -= size
        position.y -= size

        return position
    }
}

class Bullet {
    constructor(id, position, rotation, owner) {
        this.id = id;
        this.position = position;
        this.rotation = rotation;
        this.owner = owner;
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
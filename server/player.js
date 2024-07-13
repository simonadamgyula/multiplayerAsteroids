const resolution = [1600, 950]

/**
 * Player class
 * @param {string} id - player id
 * @param {number} color - player color
 */
export class Player {
    constructor(id, color) {
        this.id = id;
        this.color = color;
        this.position = new Object();
        this.position.x = resolution[0] / 2 + Math.floor(Math.random() * 100) - 50;
        this.position.y = resolution[1] / 2 + Math.floor(Math.random() * 100) - 50;
        this.velocity = { x: 0, y: 0 };
        this.speed_modifier = 4;
        this.rotation = 0;

        this.score = 0;

        this.can_shoot = true;
    }

    /**
     * 
     * @param {string[]} direction 
     */
    update(direction) {
        if (this.position.x < -50 || this.position.x > resolution[0] + 50 || this.position.y < -50 || this.position.y > resolution[1] + 50) {
            return true;
        }

        if (direction.includes('forward')) {
            this.accelerate();
        }
        if (direction.includes('left')) {
            this.rotation -= 2;
        }
        if (direction.includes('right')) {
            this.rotation += 2;
        }

        this.move();

        return false;
    }

    accelerate() {
        this.velocity.x = Math.sin(this.rotation * Math.PI / 180);
        this.velocity.y = -Math.cos(this.rotation * Math.PI / 180);
    }

    move() {
        this.position.x += this.velocity.x * this.speed_modifier;
        this.position.y += this.velocity.y * this.speed_modifier;
    }

    shoot() {
        if (!this.can_shoot) return null;
        this.can_shoot = false;
        setTimeout(() => {
            this.can_shoot = true;
        }, 1000 / 2);
        return {
            position: {
                x: this.position.x + 20,
                y: this.position.y + 53.33
            },
            rotation: this.rotation
        }
    }
}
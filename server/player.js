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
        this.position.x = 0;
        this.position.y = 0;
        this.rotation = 0;
    }

    /**
     * 
     * @param {string[]} direction 
     */
    update(direction) {
        if (direction.includes('forward')) {
            this.move(5);
        }
        if (direction.includes('backward')) {
            this.move(-5);
        }
        if (direction.includes('left')) {
            this.rotation -= 2;
        }
        if (direction.includes('right')) {
            this.rotation += 2;
        }
    }

    move(distance) {
        this.position.x += distance * Math.sin(this.rotation * Math.PI / 180);
        this.position.y -= distance * Math.cos(this.rotation * Math.PI / 180);
    }
}
var keys = [];
var loop = null;

(async function () {

    const ws = await connectToServer();

    ws.onclose = () => {
        document.querySelector("body").innerHTML = `<h1>You died!</h1>\n<button onclick="location.reload()">Rejoin</button>`;
        document.body.classList.remove('playing');
        clearInterval(loop);
    }

    ws.onmessage = (webSocketMessage) => {

        const messageBody = JSON.parse(webSocketMessage.data);

        switch (messageBody.action) {
            case 'move':
                var ship = getOrCreateShip(messageBody);
                ship.style.transform = `translate(${messageBody.position.x}px, ${messageBody.position.y}px) rotate(${messageBody.rotation}deg)`;
                break;
            case 'disconnect':
                var ship = document.querySelector(`[data-sender='${messageBody.sender}']`);
                ship.remove();
                break;
            case "game_update":
                moveMeteorites(messageBody.meteorites);
                moveBullets(messageBody.bullets);
                break;
            case 'meteorite_destroyed':
                const meteorite = document.querySelector(`[data-meteorite='${messageBody.id}']`);
                if (!meteorite) return;
                meteorite.remove();
                break;
            case 'bullet_destroyed':
                const bullet = document.querySelector(`[data-bullet='${messageBody.id}']`);
                if (!bullet) return;
                bullet.remove();
                break;
        };
    }

    document.body.onkeydown = (event) => {
        if (!keys.includes(event.key)) {
            keys.push(event.key);
        }

        if (event.key === ' ') {
            console.log('shoot');
            ws.send(JSON.stringify({ action: 'shoot' }));
        }
    }

    document.body.onkeyup = (event) => {
        keys = keys.filter((key) => key !== event.key);
    }

    function setup() {
        loop = setInterval(() => {
            var directions = [];

            if (keys.includes('ArrowDown') || keys.includes('s')) {
                directions.push('backward');
            }
            if (keys.includes('ArrowLeft') || keys.includes('a')) {
                directions.push('left');
            }
            if (keys.includes('ArrowRight') || keys.includes('d')) {
                directions.push('right');
            }
            if (keys.includes('ArrowUp') || keys.includes('w')) {
                directions.push('forward');
            }

            ws.send(JSON.stringify({ action: 'move', directions }));
        }, 1000 / 60);
    }

    async function connectToServer() {
        const ws = new WebSocket('ws://localhost:7071/ws');
        return new Promise((resolve, reject) => {
            const timer = setInterval(() => {
                if (ws.readyState === 1) {
                    clearInterval(timer);
                    resolve(ws);

                    setup();
                }
            }, 10);
        });
    }

    function moveMeteorites(meteorites) {
        for (const meteorite of meteorites) {
            const meteoriteElement = getOrCreateMeteorite(meteorite);
            meteoriteElement.style.transform = `translate(${meteorite.position.x}px, ${meteorite.position.y}px) rotate(${meteorite.rotation}deg)`;
            meteoriteElement.style.width = `${meteorite.size}px`;
            meteoriteElement.style.height = `${meteorite.size}px`;
        }
    }

    function moveBullets(bullets) {
        for (const bullet of bullets) {
            const bulletElement = getOrCreateBullet(bullet);
            bulletElement.style.transform = `translate(${bullet.position.x}px, ${bullet.position.y}px) rotate(${bullet.rotation}deg)`;
        }
    }

    function getOrCreateBullet(bullet) {
        const existing = document.querySelector(`[data-bullet='${bullet.id}']`);
        if (existing) {
            return existing;
        }

        const template = document.getElementById('bullet-template');
        const result = template.content.firstElementChild.cloneNode(true);

        result.setAttribute("data-bullet", bullet.id);
        document.body.appendChild(result);

        return result;
    }

    function getOrCreateMeteorite(meteorite) {
        const existing = document.querySelector(`[data-meteorite='${meteorite.id}']`);
        if (existing) {
            return existing;
        }

        const template = document.getElementById('meteorite-template');
        const result = template.content.firstElementChild.cloneNode(true);

        result.setAttribute("data-meteorite", meteorite.id);
        document.body.appendChild(result);

        return result;
    }

    function getOrCreateShip(messageBody) {
        const sender = messageBody.sender;
        const existing = document.querySelector(`[data-sender='${sender}']`);
        if (existing) {
            return existing;
        }

        const template = document.getElementById('ship-template');
        const ship = template.content.firstElementChild.cloneNode(true);
        const svgPath = ship.getElementsByTagName('path')[0];

        ship.setAttribute("data-sender", sender);
        svgPath.setAttribute('stroke', `hsl(${messageBody.color}, 50%, 50%)`);
        document.body.appendChild(ship);

        return ship;
    }

})();

export class Movement {
    constructor(network) {
        this.queue = [];
        this.network = network;

        setInterval(this.runMovementQueue.bind(this));
    }

    runMovementQueue() {
        for (let que of this.queue) {
            if (que.x == 0 && que.y == 0) {
                this.queue.splice(this.queue.indexOf(que), 1);
                return;
            }

            let user = this.network.users.find(user => user.name == que.name);
            user.x += que.x;
            user.y += que.y;

            let direction = "idle";
            if (que.x == 0)
                direction = "idle";
            else {
                if (que.x > 0)
                    direction = "right";
                else
                    direction = "left";
            }

            this.network.sendToAll({
                type: "move",
                data: {
                    name: user.name,
                    x: user.x,
                    y: user.y,
                    direction
                }
            });
        }
    }

    movePlayer(socket, users, data) {
        let user = users.find(user => user.socket == socket);

        if (data.x == 0 && data.y == 0) {
            let que = this.queue.find(que => que && que.name == user.name);
            if (que) {
                this.queue.splice(this.queue.indexOf(que), 1);
            }

            this.network.sendToAll({
                type: "move",
                data: {
                    name: user.name,
                    x: user.x,
                    y: user.y,
                    direction: "idle"
                }
            });
        } else {
            let queu = {
                name: user.name,
                x: data.x,
                y: data.y
            }

            if (!this.queue.find(que => que && que.name == user.name)) {
                this.queue.push(queu);
            }
        }
        // if (user) {
        //     user.velX = data.x;
        //     user.velY = data.y;

        //     user.x += data.x;
        //     user.y += data.y;

        //     for (let player of users) {
        //         player.socket.send(JSON.stringify({
        //             type: "move",
        //             data: {
        //                 name: user.name,
        //                 x: user.x,
        //                 y: user.y
        //             }
        //         }));
        //     }
        // }
    }
}
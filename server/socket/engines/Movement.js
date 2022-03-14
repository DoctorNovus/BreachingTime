import { Rectangle } from "../shapes/Rectangle";

export class Movement {
    constructor(network) {
        this.queue = [];
        this.network = network;

        setInterval(this.runMovementQueue.bind(this));
    }

    checkCollision(rect, map) {
        let collides = false;

        for (let tile of map._tiles.parts) {
            tile = tile.value;
            if (tile.layer == ("foreground") && tile.health > 0) {
                if (rect.overlaps(tile.rect)) {
                    collides = true;
                }
            }
        }

        return collides;
    }

    runMovementQueue() {
        for (let que of this.queue) {
            if (!que) return;

            if (que.x == 0 && que.y == 0) {
                this.queue.splice(this.queue.indexOf(que), 1);
                return;
            }

            let user = this.network.users.find(user => user.name == que.name);
            if (user) {
                let rect = user.rect;
                if (!rect) {
                    rect = new Rectangle(user.x, user.y, user.width, user.height);
                    user.rect = rect;
                }

                rect.x += que.x;
                rect.y += que.y;

                if (this.checkCollision(rect, this.network.map)) {
                    rect.setPosition(user.x, user.y);
                    return;
                }

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

        for (let user of this.network.users) {
            let que = this.queue.find(que => que && que.name == user.name);
            if ((!que || que.y == 0) && user && user.rect) {
                let rect = user.rect;
                if (!rect.width || !rect.height) {
                    rect.width = 30;
                    rect.height = 30;
                }

                rect.setPosition(user.x, user.y + 1);


                if (this.checkCollision(rect, this.network.map)) {
                    rect.setPosition(user.x, user.y);
                    return;
                } else {
                    user.y = rect.y;

                    this.network.sendToAll({
                        type: "move",
                        data: {
                            name: user.name,
                            x: user.x,
                            y: user.y,
                            direction: "idle"
                        }
                    });
                }
            }
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
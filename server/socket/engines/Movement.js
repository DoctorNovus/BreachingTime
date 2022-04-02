import { Rectangle } from "../shapes/Rectangle";

export class Movement {
    constructor() {
        this.queue = [];
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

    runMovementQueue(net) {
        for (let que of this.queue) {
            if (!que) return;

            if (que.x == 0 && que.y == 0) {
                this.queue.splice(this.queue.indexOf(que), 1);
                return;
            }

            if (que.x > 0)
                que.x = 1;
            else if (que.x < 0)
                que.x = -1;

            if (que.y > 0)
                que.y = 1;
            else if (que.y < 0)
                que.y = -1;

            let user = net.users.find(user => user.name == que.name);
            if (user) {
                let rect = user.rect;
                if (!rect) {
                    rect = new Rectangle(user.x, user.y, user.width, user.height);
                    user.rect = rect;
                }

                let speed = 2;

                if (user.speed)
                    speed = user.speed;

                rect.x += que.x * speed;
                rect.y += que.y * speed;

                if (this.checkCollision(rect, net.map)) {
                    rect.setPosition(user.x, user.y);
                    return;
                }

                user.x += que.x * speed;
                user.y += que.y * speed;

                let direction = "idle";
                if (que.x == 0 && que.y == 0)
                    direction = "idle";
                else {
                    if (que.y == 0)
                        if (que.x > 0)
                            direction = "right";
                        else
                            direction = "left";
                    else
                        if(que.y > 0)
                            direction = "down";
                        else
                            direction = "up";
                }

                net.sendToAll({
                    type: "move",
                    data: {
                        name: user.name,
                        x: user.x,
                        y: user.y,
                        direction
                    }
                }, user.world);
            }
        }

        for (let user of net.users) {
            let que = this.queue.find(que => que && que.name == user.name);
            if ((!que) || (que && que.y == 0)) {
                if (!user.rect)
                    user.rect = new Rectangle(user.x, user.y, user.width, user.height);

                let rect = user.rect;

                if (!rect.width || !rect.height) {
                    rect.width = 30;
                    rect.height = 30;
                }

                rect.setPosition(user.x, user.y + 1);

                if (this.checkCollision(rect, net.map)) {
                    rect.setPosition(user.x, user.y);
                    if(!user.grounded){
                        net.sendToAll({
                            type: "move",
                            data: {
                                name: user.name,
                                x: user.x,
                                y: user.y,
                                direction: "idle"
                            }
                        }, user.world);

                        user.grounded = true;
                    }
                    return;
                } else {
                    user.grounded = false;
                    user.y = rect.y;

                    net.sendToAll({
                        type: "move",
                        data: {
                            name: user.name,
                            x: user.x,
                            y: user.y,
                            direction: "down"
                        }
                    }, user.world);
                }
            }
        }
    }

    movePlayer(net, socket, users, data) {
        let user = users.find(user => user.socket == socket);

        if (data.x == 0 && data.y == 0) {
            let que = this.queue.filter(que => que && que.name == user.name);
            for (let q of que) {
                this.queue.splice(this.queue.indexOf(q), 1);
            }

            net.sendToAll({
                type: "move",
                data: {
                    name: user.name,
                    x: user.x,
                    y: user.y,
                    direction: "idle"
                }
            }, user.world);
        } else {
            let queu = {
                name: user.name,
                x: data.x,
                y: data.y
            }

            if (!this.queue.find(que => que && que.name == user.name)) {
                this.queue.push(queu);
            } else {
                let que = this.queue.find(que => que && que.name == user.name);
                if (que.y == 0 && data.y > 0)
                    que.y = data.y;

                if (que.x == 0 && data.x > 0)
                    que.x = data.x;
            }
        }
    }
}
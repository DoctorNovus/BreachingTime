import { ItemTypeRegistry } from "../registry/ItemTypeRegistry";
import { Rectangle } from "../shapes/Rectangle";

export class Movement {
    constructor() {
        this.queue = [];
    }

    checkCollision(rect, zone, net, user) {
        let collides = false;
        let sign = false;
        if (!zone)
            return;

        let blocks = zone.blocks;
        let bb = blocks.parts || blocks;

        for (let tile of bb) {
            let tRect = new Rectangle(tile.x * 32, tile.y * 32, tile.value.width, tile.value.height);
            let index = ItemTypeRegistry.getByItem(tile.value.value);
            if (rect.overlaps(tRect)) {
                if (index.passthrough) {
                    if (index.id == "signs") {
                        this.applySign(net, user, tile);
                        sign = true;
                    }

                    continue;
                } else {
                    collides = true;
                    break;
                }
            }
        }

        if (rect.x < 0 || rect.x > (zone.width * 32) - 32 || rect.y < (-1 * zone.height * 32) || rect.y > zone.height * 32)
            collides = true;

        if (!sign) {
            net.send(user.socket, {
                type: "removeSignData",
                data: user.signData
            });

            user.signData = null;
        }

        return collides;
    }

    applySign(net, user, tile) {
        let val = tile.value;
        if (val.extra && val.extra.signData) {
            if (!user.signData || (user.signData && user.signData.text != val.extra.signData))
                net.send(user.socket, {
                    type: "signData",
                    data: {
                        x: tile.x,
                        y: tile.y,
                        text: val.extra.signData
                    }
                });

            user.signData = {
                x: tile.x,
                y: tile.y,
                text: val.extra.signData
            };
        }
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

            let user = net.zoneManager.getPlayer(que.name);
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

                let zone = net.zoneManager.zones.find(zone => zone.name == user.world);
                if (this.checkCollision(rect, zone, net, user)) {
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
                        if (que.y > 0)
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

        for (let zone of net.zoneManager.zones) {
            if (zone.players && zone.players.length > 0)
                for (let user of zone.players) {
                    let que = this.queue.find(que => que && que.name == user.name);
                    if ((!que) || (que && que.y == 0)) {
                        if (!user.rect)
                            user.rect = new Rectangle(user.x, user.y, user.width, user.height);

                        let rect = user.rect;

                        if (!rect.width || !rect.height) {
                            rect.width = 30;
                            rect.height = 30;
                        }

                        let fallSpeed = user.fallSpeed ? user.fallSpeed : 1;

                        rect.setPosition(user.x, user.y + fallSpeed);

                        let zone = net.zoneManager.zones.find(zone => zone.name == user.world);
                        if (this.checkCollision(rect, zone, net, user)) {
                            rect.setPosition(user.x, user.y);
                            if (!user.grounded) {
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
                            user.fallSpeed = 1;
                            return;
                        } else {
                            user.grounded = false;
                            user.y = rect.y;
                            fallSpeed += 0.1;
                            user.fallSpeed = fallSpeed;

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

        for (let quete of this.queue) {
            if (!quete)
                return;

            let user = net.zoneManager.getPlayer(quete.name);
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

                let zone = net.zoneManager.zones.find(zone => zone.name == user.world);
                if (this.checkCollision(rect, zone, net, user)) {
                    rect.setPosition(user.x, user.y);
                    if (!user.grounded) {
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

    movePlayer(net, socket, data) {
        let user = net.zoneManager.getPlayerBySocket(socket);

        if (!user)
            return;

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
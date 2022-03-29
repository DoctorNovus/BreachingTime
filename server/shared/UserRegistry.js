import { Singleton } from "../socket/systems/Singleton";

export class UserRegistry extends Singleton {
    constructor() {
        super();
        this.users = [];
    }

    addUser(user) {
        this.users.push(user);
    }

    removeUser(user) {
        this.users.splice(this.users.indexOf(user), 1);
    }

    getUser(name) {
        return this.users.find(u => u.name === name);
    }

    getUsers() {
        return this.users;
    }
}
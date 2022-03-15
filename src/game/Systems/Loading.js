import { Singleton } from "./Singleton";

export class Loading extends Singleton {

    setBoot(items) {
        this.boot = items;
    }

    checkBoot(name) {
        for (let i = 0; i < this.boot.length; i++) {
            if (!this.boot[i][name])
                return false;

            return true;
        }
    }

    setLoadingValues(name, value) {
        for (let i = 0; i < this.boot.length; i++) {
            this.boot[i].instance.setVariable(name, value);
        }
    }
}
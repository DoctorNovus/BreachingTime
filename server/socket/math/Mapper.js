export class Mapper {
    width = 0;
    height = 0;

    constructor(width, height = 1) {
        this.parts = [];

        this.width = width;
        this.height = height;

        if (width) {
            for (let i = 0; i < width; i++) {
                for (let j = 0; j < height; j++) {
                    this.set(i, j, 0);
                }
            }
        }
    }

    loop(callback) {
        for (let i = 0; i < this.parts.length; i++) {
            callback(this.parts[i]);
        }
    }

    set(x, y, value) {
        if (!this.get(x, y))
            this.parts.push({ x, y, value });
        else
            this.parts.find(part => part.x === x && part.y === y).value = value;

        return this.get(x, y);
    }

    get(x, y) {
        let part = this.parts.find(part => part.x == x && part.y == y);
        if (part && part.value)
            return part.value;
        else
            return null;
    }

    getFull(x, y) {
        let part = this.parts.find(part => part.x == x && part.y == y);
        if (part)
            return part;
        else
            return null;
    }


    add(x, y, value) {
        let part = this.get(x, y);
        if (!part)
            part = 0;

        part += value;
        this.set(x, y, part);
        return part;
    }

    divide(x, y, value) {
        let part = this.get(x, y);
        if (!part)
            part = 0;
        part /= value;
        this.set(x, y, part);
        return part;
    }

    asData(toggle){
        let parse = (part) => {
            if(!toggle)
                return part.value;
            else
                return part;
        }
        let data = this.parts.map(part => parse(part).asData ? parse(part).asData() : parse(part));
        return data;
    }

    static from(mapper, parts) {
        let w = 0;
        let h = 0;

        for (let i = 0; i < parts.length; i++) {
            let part = parts[i];
            let x = part.x;
            let y = part.y;

            if(w < x)
                w = x;
            if(h < y)
                h = y;

            mapper.set(x, y, part);
        }

        mapper.width = w + 1;
        mapper.height = h + 1;

        return mapper;
    }
}
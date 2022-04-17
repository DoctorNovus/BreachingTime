import fs from "fs";

export class FileSystem {
    static existsFull(path) {
        let parts = path.split(/\//g);
        let newPath = "";
        let dirs = parts.length - 1;

        for (let i = 0; i < parts.length; i++) {
            newPath += parts[i];
            if (dirs > 0) {
                if (!FileSystem.exists(`${newPath}/`))
                    fs.mkdirSync(newPath);

                newPath += "/";
                dirs--;
            } else {
                if (!FileSystem.exists(newPath))
                    fs.writeFileSync(newPath, "{}");
            }
        }

        return true;
    }

    static existsDir(path) {
        let parts = path.split(/\//g);
        parts.pop();
        let newPath = "";
        for (let i = 0; i < parts.length; i++) {
            newPath += parts[i];
            if (!FileSystem.exists(`${newPath}/`))
                fs.mkdirSync(newPath);
            newPath += "/";
        }
        return true;
    }

    static readFile(path) {
        if (FileSystem.existsDir(path)) {
            FileSystem.createFile(path);
            return fs.readFileSync(path);
        }
    }

    static createFile(path) {
        FileSystem.existsFull(path);
    }

    static exists(path) {
        return fs.existsSync(path);
    }

    static writeFile(path, data) {
        FileSystem.createFile(path);
        fs.writeFileSync(path, data);
    }
}
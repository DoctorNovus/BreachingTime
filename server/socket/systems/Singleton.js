export class Singleton {

    setVariable(variable, value){
        this[variable] = value;
    }
    
    static get instance(){
        if(!this._instance){
            this._instance = new this();
        }
        return this._instance;
    }
}
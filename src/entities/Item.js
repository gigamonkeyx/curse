
class Item {
    constructor(id, name, description) {
        this.id = id;
        this.name = name;
        this.description = description;
    }

    getInfo() {
        return `${this.name}: ${this.description}`;
    }
}

export default Item;

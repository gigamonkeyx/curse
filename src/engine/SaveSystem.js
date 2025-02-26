
class SaveSystem {
    constructor(storageKey) {
        this.storageKey = storageKey;
    }

    save(data) {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    }

    load() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : null;
    }

    clear() {
        localStorage.removeItem(this.storageKey);
    }
}

export default SaveSystem;

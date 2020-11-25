export class FIFONull<T> {
    protected list: Array<T> = [];

    constructor(list: Array<T>) {
        this.list = list;
    }

    public add(t: T): void {
        this.list.push(t);
    }

    public get(): T | null {
        if (this.list.length != 0) {
            return this.list.splice(0, 1)[0];
        }
        return null;
    }

    public size(): number {
        return this.list.length;
    }

}

export class FIFOThrow<T> extends FIFONull<T> {

    public get(): T {
        if (this.list.length != 0) {
            return this.list.splice(0, 1)[0];
        }
        throw "No more elements in FIFO";
    }
}

export class FIFO<T> extends FIFOThrow<T> {

}
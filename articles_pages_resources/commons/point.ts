export class Point {
    public x: number;
    public y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public equals(point: Point) {
        return point != null && this.x === point.x && this.y === point.y;
    }

    public toString(): string {
        return "(X: " + this.x + ", Y: " + this.y + ")";
    }
}
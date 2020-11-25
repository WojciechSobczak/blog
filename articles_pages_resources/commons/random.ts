export class Random {
    public static generate(from, to) {
        return Math.floor(Math.random() * to) + from; 
    }
}
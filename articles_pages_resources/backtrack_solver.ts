import {Pair} from "./commons/pair.js";
import {Point} from "./commons/point.js"
import {Random} from "./commons/random.js"
import {FIFONull} from "./commons/fifo.js"

export namespace Backtracking {

    declare type CellCallback = (field: FieldType, row: number, column: number) => boolean;

    export enum FieldType {
        START, FINISH, OBSTACLE, FIELD
    }

    export enum LookupStrategy {
        ALL_AROUND, CROSS
    }

    export class ActionCell {
        obstacle: boolean = false;
        distance: number | null = null;
        row: number;
        column: number;
    
        constructor(obstacle: boolean, row: number, column: number, distance?: number) {
            this.obstacle = obstacle;
            this.row = row;
            this.column = column;
            this.distance = distance;
        }

        public isVisited(): boolean {
            return this.distance != null;
        }
    
        public isObstacle(): boolean {
            return this.obstacle;
        }
    
        public isOnPoint(point: Point) {
            return this.column === point.x && this.row === point.y;
        }
    }
    
    export enum ActionType {
        CELL_BASE, CELL_CHECK, FINISH_FOUND, DISTANCE_SET, OBSTACLE_IGNORE, VISITED_IGNORE,
        BACKTRACK_START_FOUND, BACKTRACK_CELL_BASE, BACKTRACK_CELL_CHECK, BACKTRACK_CELL_CHOICE,
        BACKTRACK_CELL_IGNORE
    }
    
    export class Action {
        public type: ActionType = ActionType.DISTANCE_SET;
        public point: Point = new Point(0, 0);
        public distance: number | null = null;
    
        constructor(type: ActionType, point: Point, distance?: number) {
            this.type = type;
            this.point = point;
            this.distance = distance;
        }
    }
    
    export class StepByStepActions {
        public startPoint: Point;
        public finishPoint: Point;
        public actions: Array<Action> = new Array();
        public path: Array<Point> = new Array();
        public generatedObstacles: Array<Point> = new Array();
        
        //Resolving state
        public lastResolvedAction: Action | null;
        public lastCheckingCellPoint: Point | null;
        public currentlyEstablishedPath: Array<Point> = new Array();
    
        constructor(startPoint: Point, finishPoint: Point, actions: Array<Action>, generatedObstacles: Array<Point>, path: Array<Point>) {
            this.startPoint = startPoint;
            this.finishPoint = finishPoint;
            this.actions = actions;
            this.generatedObstacles = generatedObstacles;
            this.path = path;
        }
    }

    export class CheckOffset {
        public xOffset: number;
        public yOffset: number;
    
        constructor(xOffset: number, yOffset: number) {
            this.xOffset = xOffset;
            this.yOffset = yOffset;
        }
    }

    export class BacktrackSolver {

        private static readonly CHECK_AROUND_OFFSETS = new Array<CheckOffset>(
            new CheckOffset(0, -1), //north
            new CheckOffset(1, -1), //north-east
            new CheckOffset(1, 0), //east
            new CheckOffset(1, 1), //south-east
            new CheckOffset(0, 1), //south
            new CheckOffset(-1, 1), //south-west
            new CheckOffset(-1, 0), // west
            new CheckOffset(-1, -1) // north-west
        );
    
        private static readonly CHECK_CROSS_OFFSETS = new Array<CheckOffset>(
            new CheckOffset(0, -1), //north
            new CheckOffset(1, 0), //east
            new CheckOffset(0, 1), //south
            new CheckOffset(-1, 0), // west
        );

        private static getSettableField(arrayToSolve: Array<Array<FieldType>>): Point {
            while (true) {
                let x = Random.generate(0, arrayToSolve[0].length);
                let y = Random.generate(0, arrayToSolve.length);
                if (arrayToSolve[y][x] === FieldType.FIELD) {
                    return new Point(x, y);
                }
            };
        }

        private static generateObstacles(arrayToSolve: Array<Array<FieldType>>, obstaclesCount: number): Array<Point> {
            let generatedObstacles = new Array<Point>();
            for (let i = 0; i < obstaclesCount; i++) {
                let nonObstacle = this.getSettableField(arrayToSolve);
                arrayToSolve[nonObstacle.y][nonObstacle.x] = FieldType.OBSTACLE;
                generatedObstacles.push(nonObstacle);
            }
            return generatedObstacles;
        }

        private static forEveryCell(arrayToSolve: Array<Array<FieldType>>, callback: CellCallback) {
            for (let row = 0; row < arrayToSolve.length; row++) {
                for (let column = 0; column < arrayToSolve[row].length; column++) {
                    if (callback(arrayToSolve[row][column], row, column)) {
                        break;
                    }
                }
            }
        }

        private static getStartAndFinish(arrayToSolve: Array<Array<FieldType>>): Pair<Point, Point> {
            let start: Point = null;
            let finish: Point = null;
            this.forEveryCell(arrayToSolve, (field: FieldType, row: number, column: number) => {
                if (field === FieldType.START) {
                    start = new Point(column, row);
                }
                if (field === FieldType.FINISH) {
                    finish = new Point(column, row);
                }
                return start !== null && finish !== null;
            });
            
            if (start === null) {
                start = this.getSettableField(arrayToSolve);
                arrayToSolve[start.y][start.x] = FieldType.START;
            }
            if (finish === null) {
                finish = this.getSettableField(arrayToSolve);
                arrayToSolve[finish.y][finish.x] = FieldType.FINISH;
            }

            return new Pair(start, finish);
        }

        private static existsInArray(array: Array<Array<ActionCell>>, x: number, y: number): boolean {
            return x >= 0 && y >= 0 && x < array[0].length && y < array.length;
        }

        private static forOffsetedPoints(currentCell: Point, offsetsArray: Array<CheckOffset>, array: Array<Array<ActionCell>>, callback: (checkedCell: ActionCell) => boolean): void {
            for (let offset of offsetsArray) {
                let checkedX = currentCell.x + offset.xOffset;
                let checkedY = currentCell.y + offset.yOffset;
                if (this.existsInArray(array, checkedX, checkedY)) {
                    let checkedCell = array[checkedY][checkedX];
                    if (callback(checkedCell)) {
                        break;
                    }
                }
            }
        }
    
        private static forPointsAround(currentCell: Point, array: Array<Array<ActionCell>>, callback: (checkedCell: ActionCell) => boolean): void {
            this.forOffsetedPoints(currentCell, this.CHECK_AROUND_OFFSETS, array, callback);
        }
    
        private static forPointsCross(currentCell: Point, array: Array<Array<ActionCell>>, callback: (checkedCell: ActionCell) => boolean): void {
            this.forOffsetedPoints(currentCell, this.CHECK_CROSS_OFFSETS, array, callback);
        }

        public static solve(arrayToSolve: Array<Array<FieldType>>, lookupStrategy: LookupStrategy, fastSolve: boolean, randomObstaclesCount?: number): StepByStepActions {
            let actionsOutput = new Array<Action>();

            let generatedObstacles = new Array<Point>();
            if (randomObstaclesCount != null) {
                generatedObstacles = BacktrackSolver.generateObstacles(arrayToSolve, randomObstaclesCount);
            }
            let startAndFinish = BacktrackSolver.getStartAndFinish(arrayToSolve);
            let start = startAndFinish.first;
            let finish = startAndFinish.second;

            let rowsCount = arrayToSolve.length;
            let columnsCount = arrayToSolve[0].length;

            let cellsArray: Array<Array<ActionCell>> = [];
            for (let row = 0; row < rowsCount; row++) {
                let cellsRow = new Array<ActionCell>();
                for (let column = 0; column < columnsCount; column++) {
                    let field = arrayToSolve[row][column];
                    cellsRow.push(new ActionCell(field === FieldType.OBSTACLE, row, column, null));
                }
                cellsArray.push(cellsRow);
            }

            let pointsLookupFunc = (currentCell: Point, array: Array<Array<ActionCell>>, callback: (checkedCell: ActionCell) => boolean) => {
                this.forPointsAround(currentCell, array, callback);
            };
            if (lookupStrategy === LookupStrategy.CROSS) {
                pointsLookupFunc = (currentCell: Point, array: Array<Array<ActionCell>>, callback: (checkedCell: ActionCell) => boolean) => {
                    this.forPointsCross(currentCell, array, callback);
                };
            }

            //Mapping points to their distance
            let finishFound = false;
            let pointToVisit = new FIFONull<Point>([start]);
            cellsArray[start.y][start.x].distance = 0;

            while (pointToVisit.size() != 0) {
                let currentPoint = pointToVisit.get();
                let currentCell = cellsArray[currentPoint.y][currentPoint.x];
                if (!fastSolve) {
                    actionsOutput.push(new Action(ActionType.CELL_BASE, currentPoint));
                }
    
                pointsLookupFunc(currentPoint, cellsArray, (lookedUpCell: ActionCell) => {
                    let lookedUpPoint = new Point(lookedUpCell.column, lookedUpCell.row);
                    if (!fastSolve) {actionsOutput.push(new Action(ActionType.CELL_CHECK, lookedUpPoint));}
                    if (lookedUpCell.isOnPoint(finish)) {
                        if (!fastSolve) { actionsOutput.push(new Action(ActionType.FINISH_FOUND, finish)); }
                        finishFound = true;
                        lookedUpCell.distance = currentCell.distance + 1;
                        actionsOutput.push(new Action(ActionType.DISTANCE_SET, finish, lookedUpCell.distance));
                        return true;
                    }
                    if (lookedUpCell.obstacle) {
                        if (!fastSolve) {actionsOutput.push(new Action(ActionType.OBSTACLE_IGNORE, lookedUpPoint));}
                        return false;
                    } 
                    if (!lookedUpCell.obstacle && lookedUpCell.distance == null) {
                        lookedUpCell.distance = currentCell.distance + 1;
                        actionsOutput.push(new Action(ActionType.DISTANCE_SET, lookedUpPoint, lookedUpCell.distance));
                        pointToVisit.add(lookedUpPoint);
                        return false;
                    }
                    actionsOutput.push(new Action(ActionType.VISITED_IGNORE, lookedUpPoint));
                });

                if (finishFound) {
                    break;
                }
            }
    
            let solvedPath = new Array<Point>(finish);
            if (finishFound) {
                //Actual backtracking
                let currentPoint = finish;
                let currentCell = cellsArray[finish.y][finish.x];
                let startFound = false;
                while (startFound == false) {
                    if (!fastSolve) {actionsOutput.push(new Action(ActionType.BACKTRACK_CELL_BASE, currentPoint));}
                    pointsLookupFunc(currentPoint, cellsArray, (lookedUpCell: ActionCell) => {
                        let lookedUpPoint = new Point(lookedUpCell.column, lookedUpCell.row);
                        if (!fastSolve) {actionsOutput.push(new Action(ActionType.BACKTRACK_CELL_CHECK, lookedUpPoint));}
                        if (lookedUpPoint.equals(start)) {
                            if (!fastSolve) {actionsOutput.push(new Action(ActionType.BACKTRACK_START_FOUND, lookedUpPoint));}
                            startFound = true;
                            solvedPath.push(start);
                            return true;
                        } else if (lookedUpCell.isVisited() && lookedUpCell.distance == currentCell.distance - 1) {
                            if (!fastSolve) {actionsOutput.push(new Action(ActionType.BACKTRACK_CELL_CHOICE, lookedUpPoint));}
                            solvedPath.push(lookedUpPoint);
                            currentCell = lookedUpCell;
                            currentPoint = lookedUpPoint;
                            return true;
                        }
                        if (!fastSolve) {actionsOutput.push(new Action(ActionType.BACKTRACK_CELL_IGNORE, lookedUpPoint));}
                    });
                }
            }

            return new StepByStepActions(
                start, 
                finish, 
                actionsOutput, 
                generatedObstacles,
                solvedPath.reverse()
            );
        }
    }

}


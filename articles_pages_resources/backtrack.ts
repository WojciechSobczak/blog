import {Point} from "./commons/point.js"
import * as T from "./translations.js"
import * as B from "./backtrack_solver.js";

import Translations = T.Backtracking.Translations;
import BacktrackSolver = B.Backtracking.BacktrackSolver;
import LookupStrategy = B.Backtracking.LookupStrategy;
import Action = B.Backtracking.Action;
import ActionType = B.Backtracking.ActionType;
import FieldType = B.Backtracking.FieldType;
import StepByStepActions = B.Backtracking.StepByStepActions;

export namespace Backtracking {
    export class PathCell {
        public htmlCell: HTMLTableDataCellElement;
        public obstacle: boolean = false;
        public distance: number = null;
        public row: number = 0;
        public column: number = 0;
    
        constructor(htmlCell: HTMLTableDataCellElement, column: number, row: number) {
            this.htmlCell = htmlCell;
            this.column = column;
            this.row = row;
        }

        public isObstacle(): boolean {
            return this.obstacle;
        }
    }

    export class PointSet {
        private values: Array<Point> = [];
        public add(point: Point): void {
            for (let i = 0; i < this.values.length; i++) {
                if (this.values[i].equals(point)) {
                    return;
                }
            }
            this.values.push(point);
        }

        public remove(point: Point): void {
            for (let i = 0; i < this.values.length; i++) {
                if (this.values[i].equals(point)) {
                    this.values.splice(i, 1);
                    return;
                }
            }
        }

        public forEach(func: (point: Point) => void): void {
            this.values.forEach((point) => {
                func(point);
            })
        }

        public size(): number {
            return this.values.length;
        }
    }
    
    export class Cells2DArray {
        private cells: Array<Array<PathCell>> = [];
    
        constructor(cells: Array<Array<PathCell>>) {
            this.cells = cells;
        }
    
        public getRowsCount() {
            return this.cells.length;
        }
    
        public getColumsCount() {
            if (this.cells.length > 0) {
                return this.cells[0].length;
            }
            return 0;
        }
    
        public get(point: Point): PathCell {
            return this.cells[point.y][point.x];
        }
    }


    export enum GUIEditorClickAction {
        NONE, START_SET, FINISH_SET, OBSTACLE_SET, UNSET
    }

    export class GUIState {
        public destinationDiv: HTMLDivElement = null;
        public rows: number = 2;
        public columns: number = 2;
        public randomObstaclesCount: number = 0;
        public fixedSize: number | null = null;
        public clickAction = GUIEditorClickAction.NONE;
        public cellsArray = new Cells2DArray([]);
        public lookupStrategy = LookupStrategy.ALL_AROUND;

        public startPoint: Point | null = null;
        public finishPoint: Point | null = null;
        public obstaclesSet: PointSet = new PointSet();

        public stepByStepActions: StepByStepActions | null = null;
    }
    
    
    export class GUIHandler {
    
        public static PARENT_DIV_CLASS_NAME = '__pthfind_prnt_div_style';
        public static TABLE_CLASS_NAME = '__pthfind_table_style';
        public static TR_CLASS_NAME = '__pthfind_row_style';
        public static TD_CLASS_NAME = '__pthfind_cell_style';
    
    
        public static ROWS_INPUT_ID = '__pthfind_row_input_id';
        public static COLUMNS_INPUT_ID = '__pthfind_cols_input_id';
        public static OBSTACLES_INPUT_ID = '__pthfind_obstacles_input_id';
        public static SIZE_SLIDER_ID = '__pthfind_size_slider_id';
        public static FAST_RESOLVE_START_BUTTON_ID = '__pthfind_fast_resolve_button_id';
        public static STEP_BY_STEP_RESOLVE_BUTTON_ID = '__pthfind_step_by_step_resolve_button_id';
        public static NEXT_STEP_BUTTON_ID = '__pthfind_next_step_button_id';
        public static CLEAR_ARRAY_BUTTON_ID = '__pthfind_clear_array_button_id';
        public static CURRENT_ACTION_TEXT = '__pthfind_current_action_text_id';
        public static CLICK_ACTION_SELECT_ID = '__pthfind_click_action_select_id';
        public static LOOKUP_STRATEGY_SELECT_ID = '__pthfind_click_lookup_strategy_id';
    
        public static MIN_ROW_VALUE = 2;
        public static MIN_COLUMNS_VALUE = 2;
        public static MIN_OBSTACLES_VALUE = 0;
        public static MIN_SLIDER_SIZE_VALUE = 10;
        public static MAX_SLIDER_SIZE_VALUE = 200;
    
        public static CURRENT_STATE = new GUIState();


        public static getState() {
            return this.CURRENT_STATE;
        }

        public static getStateCells() {
            return this.getState().cellsArray;
        }
    
        private static generateParentStyle() {
            return `
                .${GUIHandler.PARENT_DIV_CLASS_NAME} {
                    height: 100%;
                }
            `;
        };
    
        private static generateTableStyle(parentSizePx: number) {
            let height = parentSizePx / this.CURRENT_STATE.rows;
            let width = parentSizePx / this.CURRENT_STATE.columns;
            if (this.CURRENT_STATE.fixedSize != null) {
                height = this.CURRENT_STATE.fixedSize;
                width = this.CURRENT_STATE.fixedSize;
            }
    
            let size = Math.min(width, height);
    
            return `
                .${GUIHandler.PARENT_DIV_CLASS_NAME} {
                    height: 100%;
                }
                .${GUIHandler.TABLE_CLASS_NAME} {
                    margin-left: auto;
                    margin-right: auto;
                }
                .${GUIHandler.TR_CLASS_NAME} {
                }
                .${GUIHandler.TD_CLASS_NAME} {
                    text-align: center;
                    width: ${size}px;
                    height: ${size}px;
                    max-width: ${size}px;
                    max-height: ${size}px;
                    min-width: ${size}px;
                    min-height: ${size}px;
                    font-family: "Courier New", Courier, monospace;
                    font-weight: bold;
                    color: black;
                    word-wrap: normal;
                    overflow: hidden;
                    border-radius: 3px;
                    box-shadow: inset 0 0 8px #000000;
                }
            `;
        }
    
        public static createInputsMenu(destElem: HTMLDivElement) {
            destElem.classList.add("article-interactive-panel");
            let div = document.createElement("div");
            div.innerHTML = `
                <div>
                    <h2>Array Pathfinding Backtrack solver </h2>
                    <h3>${Translations.getTranslation("array.settings")}:</h3>
                    <table>
                        <tr>
                            <td><label>${Translations.getTranslation("array.settings.columns")}:</label></td>
                            <td>
                                <input class="article-interactive-input" 
                                    id="${this.ROWS_INPUT_ID}" 
                                    type="number" 
                                    min="${this.MIN_ROW_VALUE}" 
                                    value="${this.CURRENT_STATE.columns}">
                                </input>
                            </td>
                        </tr>
                        <tr>
                            <td><label>${Translations.getTranslation("array.settings.rows")}:</label></td>
                            <td>
                                <input class="article-interactive-input" 
                                    id="${this.COLUMNS_INPUT_ID}" 
                                    type="number" min="${this.MIN_COLUMNS_VALUE}"
                                    value="${this.CURRENT_STATE.rows}">
                                </input>
                            </td>
                        </tr>
                        <tr>
                            <td><label>${Translations.getTranslation("array.settings.cell.size")}:</label></td>
                            <td>
                                <input 
                                    id="${this.SIZE_SLIDER_ID}" 
                                    type="range" 
                                    min="${this.MIN_SLIDER_SIZE_VALUE}" 
                                    max="${this.MAX_SLIDER_SIZE_VALUE}" 
                                    value="${this.MAX_SLIDER_SIZE_VALUE}">
                                </input>
                            </td>
                        </tr>
                    </table>
                    <div>
                        <h3>${Translations.getTranslation("random.generation.options")}: </h3>
                        <label>
                            ${Translations.getTranslation("random.generation.obstacles")}:
                            <input class="article-interactive-input" 
                                id="${this.OBSTACLES_INPUT_ID}" 
                                type="number" 
                                min="${this.MIN_OBSTACLES_VALUE}" 
                                value="${this.CURRENT_STATE.randomObstaclesCount}">
                            </input>
                        </label>
                    </div>
                    <div>
                        <h3>${Translations.getTranslation("gui.options")}: </h3>
                        <div>
                            <label>
                                ${Translations.getTranslation("gui.click.action")}:
                                <select id="${this.CLICK_ACTION_SELECT_ID}" class="article-interactive-input">
                                    <option value="${GUIEditorClickAction.NONE}">-</option>
                                    <option value="${GUIEditorClickAction.START_SET}">${Translations.getTranslation("gui.click.action.start_set")}</option>
                                    <option value="${GUIEditorClickAction.FINISH_SET}">${Translations.getTranslation("gui.click.action.finish_set")}</option>
                                    <option value="${GUIEditorClickAction.OBSTACLE_SET}">${Translations.getTranslation("gui.click.action.obstacle_set")}</option>
                                    <option value="${GUIEditorClickAction.UNSET}">${Translations.getTranslation("gui.click.action.unset_set")}</option>
                                </select>
                            </label>
                        </div>
                    </div>
                    <div>
                        <h3>${Translations.getTranslation("solver.options")}: </h3>
                        <div>
                            <label>
                                ${Translations.getTranslation("solver.lookup.strategy")}
                                <select id="${this.LOOKUP_STRATEGY_SELECT_ID}" class="article-interactive-input">
                                    <option value="${LookupStrategy.ALL_AROUND}">${Translations.getTranslation("solver.lookup.strategy.all_around")}</option>
                                    <option value="${LookupStrategy.CROSS}">${Translations.getTranslation("solver.lookup.strategy.cross")}</option>
                                </select>
                            </label>
                        </div>
                    </div>
                    <div>
                    <h3>${Translations.getTranslation("gui.buttons.actions")}: </h3>
                        <div>
                            <label>
                                <button id="${this.FAST_RESOLVE_START_BUTTON_ID}" class="btn">${Translations.getTranslation("actions.automatic.solve")}</button>
                            </label>
                        </div>
                        <div>
                            <label>
                                <button id="${this.STEP_BY_STEP_RESOLVE_BUTTON_ID}" class="btn">${Translations.getTranslation("actions.automatic.steps")}</button>
                            </label>
                            <label>
                                <button id="${this.NEXT_STEP_BUTTON_ID}" class="btn">${Translations.getTranslation("actions.automatic.next_step")}</button>
                            </label>
                        </div>
                        <div>
                            <label>
                                <button id="${this.CLEAR_ARRAY_BUTTON_ID}" class="btn">${Translations.getTranslation("actions.automatic.clear")}</button>
                            </label>
                        </div>
                    </div>
                    <div>
                        <label>
                            ${Translations.getTranslation("actions.automatic.next_step_display")}:
                            <span id="${this.CURRENT_ACTION_TEXT}"></span>
                        </label>
                    </div>
                </table>
            `;
            destElem.appendChild(div);
        }
    
        public static getCreatedArray(destElem: HTMLDivElement): Cells2DArray {
            let output: Array<Array<PathCell>> = [];
            let htmlRows = destElem.getElementsByClassName(this.PARENT_DIV_CLASS_NAME)[0].getElementsByTagName("tr");
            for (let row = 0; row < htmlRows.length; row++) {
                let outputArray = new Array<PathCell>();
                let htmlRow = htmlRows[row];
                let cells = htmlRow.getElementsByTagName("td");
                for (let cell = 0; cell < cells.length; cell++) {
                    outputArray.push(new PathCell(cells[cell], cell, row));
                }
                output.push(outputArray);
            }
            return new Cells2DArray(output);
        }
    
        public static createArray(destElem: HTMLDivElement, rows: number, columns: number) {
            let htmlParentDiv = document.createElement("div");
            htmlParentDiv.setAttribute("class", this.PARENT_DIV_CLASS_NAME);
    
            let htmlStyle = document.createElement("style");
            htmlStyle.innerHTML = this.generateParentStyle();
            htmlParentDiv.appendChild(htmlStyle);
    
            let htmlTable = document.createElement("table");
            htmlTable.setAttribute("class", this.TABLE_CLASS_NAME);
    
            for (let row = 0; row < rows; row++) {
                let htmlRow = document.createElement("tr");
                htmlRow.setAttribute("class", this.TR_CLASS_NAME);
                let outputRow = new Array<PathCell>();
                for (let column = 0; column < columns; column++) {
                    let htmlCell = document.createElement("td");
                    htmlCell.setAttribute("class", this.TD_CLASS_NAME);
                    htmlRow.appendChild(htmlCell);
    
                    outputRow.push(new PathCell(htmlCell, column, row));
                }
                htmlTable.appendChild(htmlRow);
            }
            
            htmlParentDiv.appendChild(htmlTable);
            destElem.appendChild(htmlParentDiv);
    
            htmlStyle.innerHTML = htmlStyle.innerHTML + this.generateTableStyle(htmlParentDiv.getBoundingClientRect().width);
        }

        public static clearActionsText() {
            document.getElementById(this.CURRENT_ACTION_TEXT).textContent = "";
        }

        public static onRowsInputChange(input: HTMLInputElement) {
            this.getState().stepByStepActions = null;
            this.clearActionsText();

            let rows = parseInt(input.value);
            if (rows && rows >= this.MIN_ROW_VALUE) {
                this.getState().rows = rows;
                this.recreateArrayFromState(true);
            }
        }

        public static onColumnsInputChange(input: HTMLInputElement) {
            this.getState().stepByStepActions = null;
            this.clearActionsText();
            let columns = parseInt(input.value);
            if (columns && columns >= this.MIN_COLUMNS_VALUE) {
                this.getState().columns = columns;
                this.recreateArrayFromState(true);
            }
        }

        public static onObstaclesInputChange(input: HTMLInputElement) {
            let obstacles = parseInt(input.value);
            if (obstacles && obstacles >= this.MIN_OBSTACLES_VALUE) {
                this.getState().randomObstaclesCount = obstacles;
            }
        }

        public static onClearArrayButtonClicked(input: HTMLInputElement) {
            this.getState().stepByStepActions = null;
            this.clearActionsText();
            this.recreateArrayFromState(true);
        }

        public static onSizeSliderChange(input: HTMLInputElement) {
            let size = parseInt(input.value);
            if (size && size >= this.MIN_SLIDER_SIZE_VALUE) {
                this.getState().fixedSize = size;
                this.recreateArrayFromState(false);
            }
        }

        public static onClickActionSelectChange(select: HTMLSelectElement) {
            let selectedIndex = select.selectedIndex;
            let selectedVal = parseInt(select.options[selectedIndex].value) as GUIEditorClickAction;
            this.getState().clickAction = selectedVal;
        }

        public static onLookupStrategySelectChange(select: HTMLSelectElement) {
            let selectedIndex = select.selectedIndex;
            let selectedVal = parseInt(select.options[selectedIndex].value) as LookupStrategy;
            this.getState().lookupStrategy = selectedVal;
        }

        public static onSingleCellClick(cell: HTMLTableDataCellElement, row: HTMLTableRowElement) {
            if (this.getState().clickAction !== GUIEditorClickAction.NONE) {
                this.getState().stepByStepActions = null;
            }
            let cellPoint = new Point(cell.cellIndex, row.rowIndex);
            switch (this.getState().clickAction) {
                case GUIEditorClickAction.START_SET: {
                    this.setStart(cellPoint);
                    this.drawStart(cellPoint);
                    break;
                }
                case GUIEditorClickAction.FINISH_SET: {
                    this.setDestination(cellPoint);
                    this.drawDestination(cellPoint);
                    break;
                }
                case GUIEditorClickAction.OBSTACLE_SET: {
                    this.setObstacle(cellPoint);
                    this.drawObstacle(cellPoint);
                    break;
                }
                case GUIEditorClickAction.UNSET: {
                    this.unsetAll(cellPoint);
                    this.undrawAll(cellPoint);
                    break;
                }
            }
        }

        public static getSolverInputArray(): Array<Array<FieldType>> {
            let cellsArray = this.getState().cellsArray;
            let startPoint = this.getState().startPoint;
            let finishPoint = this.getState().finishPoint;
            
            let outputArray = new Array<Array<FieldType>>();
            for (let row = 0; row < cellsArray.getRowsCount(); row++) {
                let outputRow = new Array<FieldType>();
                for (let column = 0; column < cellsArray.getColumsCount(); column++) {
                    let currentPoint = new Point(column, row);
                    if (currentPoint.equals(startPoint)) {
                        outputRow.push(FieldType.START);
                    } 
                    else if (currentPoint.equals(finishPoint)) {
                        outputRow.push(FieldType.FINISH);
                    } 
                    else if (cellsArray.get(currentPoint).isObstacle()) {
                        outputRow.push(FieldType.OBSTACLE);
                    } else {
                        outputRow.push(FieldType.FIELD);
                    }
                }
                outputArray.push(outputRow);
            }

            return outputArray;
        }

        public static onFastResolveButtonClick() {
            this.getState().stepByStepActions = null;
            this.recreateArrayFromState(false);

            let actions = BacktrackSolver.solve(
                this.getSolverInputArray(), 
                this.getState().lookupStrategy, 
                true, 
                this.getState().obstaclesSet.size() == 0 ? this.getState().randomObstaclesCount : null
            );
            for (let action of actions.actions) {
                if (action.type === ActionType.DISTANCE_SET) {
                    this.drawDistance(action.point, action.distance);
                }
            }
            for (let pathPoint of actions.path) {
                this.drawPath(pathPoint);
            }
            for (let obstacle of actions.generatedObstacles) {
                this.drawObstacle(obstacle);
            }
            this.drawStart(actions.startPoint);
            this.drawDestination(actions.finishPoint);
        }

        public static applySolveAction(action: Action) {
        }
    
        public static setupGUICallbacks(destElem: HTMLDivElement) {
            var _self = this;
            let rowsInput = document.getElementById(this.ROWS_INPUT_ID);
            rowsInput.onchange = function(ev: Event) {
                _self.onRowsInputChange(ev.target as HTMLInputElement);
            };
    
            let columnsInput = document.getElementById(this.COLUMNS_INPUT_ID);
            columnsInput.onchange = function(ev: Event) {
                _self.onColumnsInputChange(ev.target as HTMLInputElement);
            };
    
            let obstaclesInput = document.getElementById(this.OBSTACLES_INPUT_ID);
            obstaclesInput.onchange = function(ev: Event) {
                _self.onObstaclesInputChange(ev.target as HTMLInputElement);
            };

            let clearArrayButton = document.getElementById(this.CLEAR_ARRAY_BUTTON_ID);
            clearArrayButton.onclick = function(ev) {
                _self.onClearArrayButtonClicked(ev.target as HTMLInputElement);
            };

            let sizeSlider = document.getElementById(this.SIZE_SLIDER_ID);
            sizeSlider.oninput = function(ev) {
                _self.onSizeSliderChange(ev.target as HTMLInputElement);
            };

            let clickActionSelect = document.getElementById(this.CLICK_ACTION_SELECT_ID);
            clickActionSelect.onchange = function(ev) {
                _self.onClickActionSelectChange(ev.target as HTMLSelectElement);
            }

            let lookupStrategy = document.getElementById(this.LOOKUP_STRATEGY_SELECT_ID);
            lookupStrategy.onchange = function(ev) {
               _self.onLookupStrategySelectChange(ev.target as HTMLSelectElement);
            }
    
            let fastResolveButton = document.getElementById(this.FAST_RESOLVE_START_BUTTON_ID);
            fastResolveButton.onclick = function(ev) {
               _self.onFastResolveButtonClick();
            };

            // let stepByStepResolveButton = document.getElementById(this.STEP_BY_STEP_RESOLVE_BUTTON_ID);
            // stepByStepResolveButton.onclick = function(ev) {
            //     _self.recreateArrayFromState(destElem, false);
            //     let presenter = new Presenter();
            //     let actions = presenter.calculateAllSteps();
            //     _self.getState().stepByStepActionsOpt = actions;
            //     _self.setStart(actions.startPoint.x, actions.startPoint.y);
            //     _self.drawStart(actions.startPoint.x, actions.startPoint.y)
            //     _self.setDestination(actions.finishPoint.x, actions.finishPoint.y);
            //     _self.drawDestination(actions.finishPoint.x, actions.finishPoint.y)
            // };

            

            // let nextStepButton = document.getElementById(this.NEXT_STEP_BUTTON_ID);
            // nextStepButton.onclick = function(ev) {
            //     let actionsOpt = _self.getState().stepByStepActionsOpt;
            //     console.log(actionsOpt);
            //     if (actionsOpt != null && actionsOpt.actions.length != 0) {
            //         if (actionsOpt.resolved == false) {
            //             document.getElementById(_self.CURRENT_ACTION_TEXT).textContent = _self.getTranslation("array.not_resolvable");
            //             return;
            //         }

            //         let nextAction = actionsOpt.actions[0];
            //         actionsOpt.actions.splice(0, 1);
            //         switch(nextAction.type) {
            //             case ActionType.CELL_BASE: {
            //                 if (actionsOpt.previousBaseOpt != null) {
            //                     _self.restoreStyle(actionsOpt.previousBaseOpt);
            //                 }
            //                 _self.drawBaseCell(nextAction.point);
            //                 actionsOpt.previousBaseOpt = nextAction.point;
            //                 break;
            //             }
            //             case ActionType.CELL_CHECK: {
            //                 _self.drawCellCheck(nextAction.point);
            //                 break;
            //             }
            //             case ActionType.FINISH_FOUND: {
            //                 if (actionsOpt.previousBaseOpt != null) {
            //                     _self.restoreStyle(actionsOpt.previousBaseOpt);
            //                 }
            //                 _self.drawDestination(nextAction.point.x, nextAction.point.y);
            //                 break;
            //             }
            //             case ActionType.DISTANCE_SET: {
            //                 _self.drawDistance(nextAction.point.x, nextAction.point.y, nextAction.distanceSetOpt);
            //                 _self.restoreStyle(nextAction.point);
            //                 break;
            //             }
            //             case ActionType.OBSTACLE_IGNORE: {
            //                 _self.restoreStyle(nextAction.point);
            //                 break;
            //             }
            //             case ActionType.VISITED_IGNORE: {
            //                 _self.restoreStyle(nextAction.point);
            //                 break;
            //             }
            //             case ActionType.BACKTRACK_START_FOUND: {
            //                 _self.drawStart(nextAction.point.x, nextAction.point.y);
            //                 if (actionsOpt.previousBaseOpt != null) {
            //                     _self.drawPath(actionsOpt.previousBaseOpt.x, actionsOpt.previousBaseOpt.y);
            //                 }
            //                 break;
            //             }
            //             case ActionType.BACKTRACK_CELL_BASE: {
            //                 if (actionsOpt.previousBaseOpt != null) {
            //                     if (actionsOpt.previousBaseOpt.equals(actionsOpt.finishPoint)) {
            //                         _self.drawDestination(actionsOpt.previousBaseOpt.x, actionsOpt.previousBaseOpt.y);
            //                     }
            //                 }
            //                 _self.drawBaseCell(nextAction.point);
            //                 actionsOpt.previousBaseOpt = nextAction.point;
            //                 break;
            //             }
            //             case ActionType.BACKTRACK_CELL_CHECK: {
            //                 _self.drawCellCheck(nextAction.point);
            //                 break;
            //             }
            //             case ActionType.BACKTRACK_CELL_IGNORE: {
            //                 _self.restoreStyle(nextAction.point);
            //                 break;
            //             }
            //             case ActionType.BACKTRACK_CELL_CHOICE: {
            //                 if (actionsOpt.previousBaseOpt != null) {
            //                     _self.drawPath(actionsOpt.previousBaseOpt.x, actionsOpt.previousBaseOpt.y);
            //                 }
            //                 _self.drawPath(nextAction.point.x, nextAction.point.y);
            //                 break;
            //             }
            //         }
            //         if (nextAction.type == ActionType.BACKTRACK_START_FOUND) {
            //             GUIHandler.displayPath(actionsOpt.path);
            //         } else {
            //             let actionTranslation = _self.getTranslation("actiontype." + ActionType[nextAction.type].toLowerCase());
            //             let pointText = "X: " + nextAction.point.x + ", Y: " + nextAction.point.y;
            //             document.getElementById(_self.CURRENT_ACTION_TEXT).textContent =  actionTranslation + " ⇒ (" + pointText + ")";
            //         }
            //     }
            // };

            let cellsArray = this.getStateCells();
            for (var row = 0; row < cellsArray.getRowsCount(); row++) {
                for (var column = 0; column < cellsArray.getColumsCount(); column++) {
                    cellsArray.get(new Point(column, row)).htmlCell.onclick = function(ev) {
                        let cell = ev.target as HTMLTableDataCellElement;
                        let row = cell.parentElement as HTMLTableRowElement;
                        _self.onSingleCellClick(cell, row);
                    }
                }
            }
        }
    
        private static displayPath(pathArray: Array<Point>) {
            let path = "<br />" + Translations.getTranslation("resolved.path") + ":<br />";
            for (let i = 0; i < pathArray.length; i++) {
                path += pathArray[i].toString();
                if (i != pathArray.length - 1) {
                    path += " ⇒ <br />";
                }
            }
            document.getElementById(this.CURRENT_ACTION_TEXT).innerHTML = path;
        }

        public static recreateArrayFromState(removeCellsProps: boolean) {
            let destElem = this.getState().destinationDiv;
            let parentDiv = destElem.getElementsByClassName(this.PARENT_DIV_CLASS_NAME)[0];
            parentDiv.parentElement.removeChild(parentDiv);
            this.createArray(destElem, this.CURRENT_STATE.rows, this.CURRENT_STATE.columns);
            this.CURRENT_STATE.cellsArray = this.getCreatedArray(destElem);

            if (removeCellsProps) {
                this.getState().startPoint = null;
                this.getState().finishPoint = null;
                this.getState().obstaclesSet = new PointSet();
            }

            let startPoint = this.getState().startPoint;
            let finishPoint = this.getState().finishPoint;
            if (startPoint != null) {
                this.drawStart(startPoint);
            }
            if (finishPoint != null) {
                this.drawDestination(finishPoint);
            }
            let obstacles = this.getState().obstaclesSet;
            this.getState().obstaclesSet = new PointSet();
            obstacles.forEach((obstaclePoint) => {
                this.setObstacle(obstaclePoint);
                this.drawObstacle(obstaclePoint);
            })
            this.setupGUICallbacks(destElem);
        }
    
        public static createGUI(destElem: HTMLDivElement) {
            destElem.innerHTML = "";
            this.getState().rows = 5;
            this.getState().columns = 5;
            this.getState().destinationDiv = destElem;
            this.createInputsMenu(destElem);
            this.createArray(destElem, 5, 5);
            this.getState().cellsArray = this.getCreatedArray(destElem);
            this.setupGUICallbacks(destElem);
        }
    
        public static setObstacle(point: Point): void {
            this.unsetAll(point);
            let cell = this.getStateCells().get(point);
            cell.obstacle = true;
            this.getState().obstaclesSet.add(point);
        }

        public static drawObstacle(point: Point): void {
            let cell = this.getStateCells().get(point);
            cell.htmlCell.setAttribute("style", "background-color: grey;");
        }
    
        public static setDistance(point: Point, distance: number): void {
            let cell = this.getStateCells().get(point);
            cell.distance = distance;
        }

        public static drawDistance(point: Point, distance: number): void {
            let cell = this.getStateCells().get(point);
            cell.htmlCell.textContent = distance.toFixed();
        }
    
        public static drawPath(point: Point): void {
            let cell = this.getStateCells().get(point);
            cell.htmlCell.setAttribute("style", "background-color: lightgreen;");
        }
    
        public static setStart(point: Point): void {
            let startPoint = this.CURRENT_STATE.startPoint;
            if (startPoint != null) {
                this.unsetAll(startPoint);
            }
            this.CURRENT_STATE.startPoint = point;
        }

        public static drawStart(point: Point): void {
            let cell = this.getStateCells().get(point);
            cell.htmlCell.setAttribute("style", "background-color: lightskyblue;");
            cell.htmlCell.textContent = "START";
        }
    
        public static setDestination(point: Point): void {
            let finishPoint = this.CURRENT_STATE.finishPoint;
            if (finishPoint != null) {
                this.unsetAll(finishPoint);
            }
            this.CURRENT_STATE.finishPoint = point;
        }

        public static drawDestination(point: Point): void {
            let cell = this.getStateCells().get(point);
            cell.htmlCell.setAttribute("style", "background-color: lightcoral;");
            cell.htmlCell.textContent = "END";
        }

        public static drawBaseCell(point: Point) {
            let cell = this.getStateCells().get(point);
            this.preserveStyle(point);
            cell.htmlCell.setAttribute("style", "background-color: lightblue;");
        }

        public static drawCellCheck(point: Point) {
            let cell = this.getStateCells().get(point);
            this.preserveStyle(point);
            cell.htmlCell.setAttribute("style", "background-color: #FFD700;");
        }

        public static preserveStyle(point: Point) {
            let cell = this.getStateCells().get(point);
            cell.htmlCell.setAttribute("prev-style", cell.htmlCell.getAttribute("style"));
        }

        public static restoreStyle(point: Point) {
            let cell = this.getStateCells().get(point);
            if (cell.htmlCell.hasAttribute("prev-style")) {
                cell.htmlCell.setAttribute("style", cell.htmlCell.getAttribute("prev-style"));
            }
        }

        public static unsetAll(point: Point): void {
            let startPoint = this.getState().startPoint;
            if (startPoint != null && startPoint.equals(point)) {
                this.getState().startPoint = null;
            }
            let finishPoint = this.getState().finishPoint;
            if (finishPoint != null && finishPoint.equals(point)) {
                this.getState().finishPoint = null;
            }
            this.getState().obstaclesSet.remove(point);

            let cell = this.getStateCells().get(point);
            cell.obstacle = false;
            cell.distance = null;
            cell.htmlCell.removeAttribute("style");
            cell.htmlCell.textContent = "";
        }

        public static undrawAll(point: Point): void {
            let cell = this.getStateCells().get(point);
            cell.htmlCell.removeAttribute("style");
            cell.htmlCell.textContent = "";
        }
    
    }


}




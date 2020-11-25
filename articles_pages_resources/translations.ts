export namespace Backtracking {

    export class Translations {

        private static getCookie(name: string) {
            const value = "; " + document.cookie;
            const parts = value.split("; " + name + "=");
            
            if (parts.length == 2) {
                return parts.pop().split(";").shift();
            }
        }

        public static getTranslation(name: string) {
            let language = this.getCookie("lang");
            if (language == null) {
                language = "PL";
            }
            
            return {
                "PL": {
                    "array.settings": "Ustawienia tablicy",
                    "array.settings.columns": "Liczba kolumn",
                    "array.settings.rows": "Liczba wierszy",
                    "array.settings.cell.size": "Rozmiar komórki",
                    "random.generation.options": "Opcje losowego generowania",
                    "random.generation.obstacles": "Liczba przeszkód",
                    "gui.options": "Opcje GUI",
                    "gui.click.action": "Akcja kliknięcia w tablicę",
                    "gui.click.action.start_set": "Ustaw punkt startowy",
                    "gui.click.action.finish_set": "Ustaw punkt końcowy",
                    "gui.click.action.obstacle_set": "Ustaw przeszkodę",
                    "gui.click.action.unset_set": "Usuń wszelkie poprzednie ustawienia",
                    "gui.buttons.actions": "Akcje",
                    "solver.options": "Opcje solvera",
                    "solver.lookup.strategy": "Sposób sprawdzania komórek",
                    "solver.lookup.strategy.all_around": "Sprawdź wszystkie dookoła (8 kierunków)",
                    "solver.lookup.strategy.cross": "Sprawdź krzyżowe (4 kierunki)",
                    "actions.automatic.solve": "Rozwiąż automatycznie",
                    "actions.automatic.steps": "Rozwiąż krok po kroku",
                    "actions.automatic.next_step": "Następny krok",
                    "actions.automatic.clear": "Wyczyść tablicę",
                    "actions.automatic.next_step_display": "Aktualnie robiony krok",
                    "actiontype.cell_base": "Szukanie z komórki",
                    "actiontype.cell_check": "Sprawdzanie komórki",
                    "actiontype.finish_found": "Znaleziono cel!",
                    "actiontype.distance_set": "Ustawianie odległości od startu",
                    "actiontype.obstacle_ignore": "Ignorowanie przeszkody",
                    "actiontype.visited_ignore": "Ignorowanie już odwiedzonej komórki",
                    "actiontype.backtrack_start_found": "Znaleziono start!",
                    "actiontype.backtrack_cell_base": "Szukanie z komórki dla ścieżki",
                    "actiontype.backtrack_cell_check": "Sprawdzanie komórki dla ścieżki",
                    "actiontype.backtrack_cell_choice": "Znaleziono część ścieżki",
                    "actiontype.backtrack_cell_ignore": "Ignorowanie kandydata na ścieżkę",
                    "array.not_resolvable": "Nie da się rozwiązać tego przypadku",
                    "resolved.path": "Znaleziona ścieżka"
                },
                "ENG": {
                    "array.settings": "Array settings",
                    "array.settings.columns": "Columns count",
                    "array.settings.rows": "Rows count",
                    "array.settings.cell.size": "Cell size",
                    "random.generation.options": "Random generation options",
                    "random.generation.obstacles": "Obstacles count",
                    "gui.options": "GUI options",
                    "gui.click.action": "Array click action",
                    "gui.click.action.start_set": "Set start point",
                    "gui.click.action.finish_set": "Set finish point",
                    "gui.click.action.obstacle_set": "Set obstacle",
                    "gui.click.action.unset_set": "Remove all previously set properties",
                    "gui.buttons.actions": "Actions",
                    "solver.options": "Solver options",
                    "solver.lookup.strategy": "Strategy of cell checking",
                    "solver.lookup.strategy.all_around": "Check all around (8 directions)",
                    "solver.lookup.strategy.cross": "Check crossed (4 directions)",
                    "actions.automatic.solve": "Automatic solve",
                    "actions.automatic.steps": "Step by step solve",
                    "actions.automatic.next_step": "Next step",
                    "actions.automatic.clear": "Clear array",
                    "actions.automatic.next_step_display": "Currently performed step",
                    "actiontype.cell_base": "Checking from cell",
                    "actiontype.cell_check": "Checking cell",
                    "actiontype.finish_found": "Finish found!",
                    "actiontype.distance_set": "Setting distance on cell",
                    "actiontype.obstacle_ignore": "Ignoring obstacle",
                    "actiontype.visited_ignore": "Ignoring already visited cell",
                    "actiontype.backtrack_start_found": "Backtracking start found!",
                    "actiontype.backtrack_cell_base": "Backtracking checking from cell",
                    "actiontype.backtrack_cell_check": "Backtracking cell check",
                    "actiontype.backtrack_cell_choice": "Chosing cell for path",
                    "actiontype.backtrack_cell_ignore": "Ignoring cell while backtracking",
                    "array.not_resolvable": "Not resolvable case",
                    "resolved.path": "Resolved path"
                }
            }[language][name];
        }
    }
}




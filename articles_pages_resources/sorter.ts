declare var toastr: any;

namespace SortingVisualizer 
{

enum Algorithm {
    BUBBLE_SORT = "BUBBLE_SORT",
    INSERTION_SORT = "INSERTION_SORT"
}

class CompareAction {
    public firstIndex: number = 0;
    public secondIndex: number = 0;
    public comparisonSuccess: boolean = false;

    constructor(firstIndex: number, secondIndex: number, comparisonSuccess: boolean) {
        this.firstIndex = firstIndex
        this.secondIndex = secondIndex
        this.comparisonSuccess = comparisonSuccess
    }
}

class SwapAction {
    public firstIndex: number = 0;
    public secondIndex: number = 0;

    constructor(firstIndex: number, secondIndex: number) {
        this.firstIndex = firstIndex
        this.secondIndex = secondIndex
    }
}

class FinishAction {
}

export class SortingVisualizer {

    public static readonly PARENT_CONTAINER_ID: string = "sorter-parent-container";
    public static readonly COLLECTION_INPUT_ID: string = "sorter-parent-container-input";
    public static readonly ACTION_DIV_ID: string = "sorter-action-container";

    private sorterActionContainer: HTMLDivElement = null
    private startButtonElement: HTMLButtonElement = null
    private stopButtonElement: HTMLButtonElement = null
    private inputElement: HTMLInputElement = null
    private algorithm: Algorithm = Algorithm.BUBBLE_SORT
    private collectionToSort: Array<number> = [7, 5, 4, 6, 1, 3, 2]

    private stopCurrentSort: boolean = false;

    constructor(
        sorterActionContainer: HTMLDivElement,
        inputElement: HTMLInputElement,
        startButtonElement: HTMLButtonElement,
        stopButtonElement: HTMLButtonElement,
        algorithm: Algorithm
    ) {
        this.sorterActionContainer = sorterActionContainer;
        this.inputElement = inputElement;
        this.inputElement.value = this.collectionToSort.toString()
            .replaceAll('[|]', '')
            .replaceAll(',', ', ');

        this.startButtonElement = startButtonElement;
        this.stopButtonElement = stopButtonElement;
        this.algorithm = algorithm

        this.startButtonElement.onclick = () => {
            try {
                this.collectionToSort = this.#parseUserInput();
            } catch (error) {
                toastr.error("Niepoprawny format wejścia.")
                return
            }
            this.startButtonElement.disabled = true
            this.#recreateSortingTable()
            this.#startSorting();
        };

        this.stopButtonElement.onclick = () => {
            this.stopCurrentSort = true
            this.#recreateSortingTable()
        };

        this.#recreateSortingTable()

    }

    #parseUserInput(): Array<number> {
        let userInput = this.inputElement.value;
        userInput = JSON.parse(`[${userInput}]`);
        for (const elem of userInput) {
            if (!Number.isFinite(elem)) {
                throw "Not a sortable number"
            }
        }
        return userInput as unknown as Array<number>;
    }

    #startSorting() {
        switch (this.algorithm) {
            case Algorithm.BUBBLE_SORT:
            case Algorithm.INSERTION_SORT: {
                this.#bubbleSortInsertionSortAnimationStart(this.algorithm);
                break;
            }
            default:
                throw "NOT IMPLEMENTED"
        }
    }

    *#bubbleSort() {
        for (let iteration = 0; iteration < this.collectionToSort.length - 1; iteration++) {
            for (let index = 0; index < this.collectionToSort.length - iteration - 1; index++) {
                const isGreater = this.collectionToSort[index] > this.collectionToSort[index + 1]
                yield new CompareAction(index, index + 1, !isGreater);
                if (isGreater) {
                    const temp = this.collectionToSort[index]
                    this.collectionToSort[index] = this.collectionToSort[index + 1]
                    this.collectionToSort[index + 1] = temp
                    yield new SwapAction(index, index + 1);
                }
            }
        }
        yield new FinishAction();
    }

    *#insertionSort() {
        for (let iteration = 1; iteration < this.collectionToSort.length; iteration++) {
            for (let index = iteration; index > 0; index--) {
                const isGreater = this.collectionToSort[index] > this.collectionToSort[index - 1]
                yield new CompareAction(index, index - 1, !isGreater);
                if (!isGreater) {
                    break;
                }
                const temp = this.collectionToSort[index]
                this.collectionToSort[index] = this.collectionToSort[index - 1]
                this.collectionToSort[index - 1] = temp
                yield new SwapAction(index, index - 1);
            }
        }
        yield new FinishAction();
    }

    #enableStartDisableStop() {
        if (this.stopCurrentSort == true) {
            this.#enableNextSort()
            return true;
        }
        return false;
    }

    #enableNextSort() {
        this.stopCurrentSort = false
        this.startButtonElement.disabled = false
    }

    #bubbleSortInsertionSortAnimationStart(algorithm: Algorithm) {
        var generator = (() => {
            switch (algorithm) {
                case Algorithm.BUBBLE_SORT: return this.#bubbleSort();
                case Algorithm.INSERTION_SORT: return this.#insertionSort();
                default: throw "NOT IMPLEMENTED"
            }
        })();
        
        const resolveAction = () => {
            if (this.#enableStartDisableStop()) return;
            
            const currentAction = generator.next().value
            if (currentAction instanceof CompareAction) {
                this.#resolveComparison(currentAction, () => {
                    resolveAction();
                })
            }
            else if (currentAction instanceof SwapAction) {
                this.#swapElements(currentAction.firstIndex, currentAction.secondIndex, () => {
                    resolveAction();
                })
            }
            else if (currentAction instanceof FinishAction) {
                this.#enableNextSort();
            }
        };
        resolveAction();
    }

    #resolveComparison(action: CompareAction, onAnimationEnd: CallableFunction) {
        const elements = this.sorterActionContainer.querySelectorAll('div')
        const rightElement = elements[action.firstIndex];
        const leftElement = elements[action.secondIndex]

        const successClass = 'sorter-action-container-div-compare-success'
        const compareClass = 'sorter-action-container-div-compared'
        const failedClass = 'sorter-action-container-div-compare-failed'

        const addClass = (clazz) => {    
            rightElement.classList.add(clazz)
            leftElement.classList.add(clazz)
        }
        const removeClass = (clazz) => {    
            rightElement.classList.remove(clazz)
            leftElement.classList.remove(clazz)
        }

        addClass(compareClass)
        setTimeout(() => {
            removeClass(compareClass)
            addClass(action.comparisonSuccess ? successClass : failedClass)
            setTimeout(() => {
                removeClass(action.comparisonSuccess ? successClass : failedClass)
                setTimeout(() => {
                    onAnimationEnd()
                }, 300)
            }, 300)
        }, 300)
    }

    #swapElements(leftIndex: number, rightIndex: number, afterAnimationCallback: CallableFunction) {
        if (rightIndex == leftIndex) {
            return
        }

        if (rightIndex < leftIndex) {
            [rightIndex, leftIndex] = [leftIndex, rightIndex]
        }

        const elements = this.sorterActionContainer.querySelectorAll('div')
        const rightElement = elements[rightIndex];
        const leftElement = elements[leftIndex]
        const rightX = rightElement.getBoundingClientRect().x;
        const leftX = leftElement.getBoundingClientRect().x;

        rightElement.style.cssText = `
            transform: translateX(-${rightX - leftX}px); 
            transition: transform 0.3s;
        `;
        leftElement.style.cssText = `
            transform: translateX(${rightX - leftX}px); 
            transition: transform 0.3s;
        `;

        setTimeout(() => {
            this.#recreateSortingTable()
            setTimeout(() => {
                afterAnimationCallback();
            }, 300)
        }, 300)
    }

    #recreateSortingTable() {
        this.sorterActionContainer.innerHTML = ''
        for (const elementToSort of this.collectionToSort) {
            let element = document.createElement('div')
            let text = document.createElement('p')
            text.innerText = elementToSort.toString();
            element.appendChild(text)
            this.sorterActionContainer.appendChild(element)
        }
    }

    #getRandomInt(min, max) {
        const minCeiled = Math.ceil(min);
        const maxFloored = Math.floor(max);
        return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
    }

}

};
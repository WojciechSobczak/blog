class WSTuple {
    constructor(elements) {
        if (!Array.isArray(elements)) {
            throw "tuple need array as constructor parameter";
        }
        this.elements = elements;
    }

    size() {
        return this.elements.length;
    }

    forEach(func) {
        this.elements.forEach(elem => {
            func(elem);
        });
    }

    get(index) {
        if (index >= this.size()) {
            throw "Too big index";
        }
        if (index < 0) {
            throw "Negative index";
        }
        return this.elements[index];
    }

    toString() {
        return 'WSTuple [' + this.elements + ']';
    }
}

class WSSet {
    constructor(initElements) {
        this.elementMap = new Map();
        if (Array.isArray(initElements)) {
            this.addElements(initElements);
        }
        let _self = this;
        if (initElements instanceof WSSet) {
            initElements.forEach(elem => {
                _self.addElement(elem);
            });
        }
    }

    toString() {
        let string = 'WSSet { \n'
        this.forEach(elem => {
            string += "    " + elem.toString() + "\n";
        })
        return string += '}\n';
    }

    size() {
        return this.elementMap.size;
    }

    addElements(elementsToAdd) {
        if (!Array.isArray(elementsToAdd)) {
            throw "set need array as addElements() parameter";
        }
        let _self = this;
        elementsToAdd.forEach(element => {
            _self.elementMap.set(JSON.stringify(element), element);
        });
    }

    addElement(element) {
        this.addElements([element]);
    }

    hasElement(element) {
        return this.elementMap.has(JSON.stringify(element));
    }

    removeElements(elementsToRemove) {
        if (!Array.isArray(elementsToRemove)) {
            throw "set need array as removeElements() parameter";
        }
        let _self = this;
        elementsToRemove.forEach(element => {
            _self.elementMap.delete(JSON.stringify(element));
        });
    }

    removeElement(element) {
        this.removeElements([element]);
    }

    forEach(func) {
        this.elementMap.forEach((value, key) => {
            func(value);
        });
    }

    cartesianProduct(otherSet) {
        let outputSet = new WSSet();
        this.forEach(element => {
            otherSet.forEach(otherElement => {
                outputSet.addElement(new WSTuple([element, otherElement]));
            });
        });
        return outputSet;
    }

    sum(otherSet) {
        let outputSet = new WSSet();
        this.forEach(elem => {
            outputSet.addElement(elem);
        });
        otherSet.forEach(elem => {
            outputSet.addElement(elem);
        });
        return outputSet;
    }

    commonSet(otherSet) {
        let outputSet = new WSSet();
        let _self = this;
        this.forEach(elem => {
            if (otherSet.hasElement(elem)) {
                outputSet.addElement(elem);
            }
        });
        return outputSet;
    }
}


class BinaryRelation {

    constructor(elems) {
        let _self = this;
        this.set = new WSSet();
        if (elems instanceof WSSet) {
            elems.forEach(elem => {
                _self.addElement(elem);
            });
        }
        if (Array.isArray(elems)) {
            this.addElements(elems);
        }
    }

    toString() {
        let string = 'BinaryRelation { \n'
        this.forEach(elem => {
            string += "    " + elem.toString() + "\n";
        })
        return string += '}\n';
    }

    forEach(func) {
        this.set.forEach(elem => {
            func(elem);
        });
    }

    addElement(element) {
        this.addElements([element]);
    }

    addElements(elementsToAdd) {
        if (!Array.isArray(elementsToAdd)) {
            throw "Binary relation need array as addElements() parameter";
        }
        elementsToAdd.forEach(elem => {
            if (!(elem instanceof WSTuple) || elem.size() != 2) {
                throw "Binary relation needs 2-elem tuple";
            }
        });
        let _self = this;
        elementsToAdd.forEach(elem => {
            _self.set.addElement(elem);
        });
    }

    getDomain() {
        let output = new WSSet();
        this.set.forEach(elem => {
            output.addElement(elem.get(0));
        });
        return output;
    }

    getRange() {
        let output = new WSSet();
        this.set.forEach(elem => {
            output.addElement(elem.get(1));
        });
        return output;
    }

    composition(otherBRelation) {
        let firstSetDomain = this.getDomain();
        let secondSetRange = otherBRelation.getRange();

        let newDomain = firstSetDomain.commonSet(secondSetRange);

        let _self = this;
        let output = new BinaryRelation();

        newDomain.forEach(domainElem => {
            otherBRelation.forEach(rElem => {
                _self.forEach(sElem => {
                    if (rElem.get(1) === domainElem && sElem.get(0) === domainElem) {
                        output.addElement(new WSTuple([rElem.get(0), sElem.get(1)]));
                    }
                });
            });
        });

        return output;
    }
}

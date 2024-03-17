"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validation = void 0;
const constants_1 = require("../../../constants");
const helpers_1 = require("../../../helpers");
const FCTBase_1 = require("../FCTBase");
class Validation extends FCTBase_1.FCTBase {
    _validations = [];
    constructor(FCT) {
        super(FCT);
    }
    get() {
        return this._validations;
    }
    getForEIP712() {
        return this._validations.map((c, i) => ({
            index: (i + 1).toString(),
            value_1: this.handleVariable(c.value1),
            op: c.operator,
            value_2: this.handleVariable(c.value2),
        }));
    }
    getForData() {
        return this._validations.map((c) => ({
            value1: this.handleVariable(c.value1),
            operator: constants_1.ValidationOperator[c.operator],
            value2: this.handleVariable(c.value2),
        }));
    }
    getIndex(id) {
        if (id === "0")
            return 0;
        const index = this._validations.findIndex((v) => v.id === id);
        if (index === -1)
            throw new Error(`Validation with id ${id} not found`);
        return index + 1;
    }
    add({ nodeId, validation, }) {
        const call = this.FCT.getCallByNodeId(nodeId);
        const id = this.addValidation(validation);
        call.setOptions({
            validation: id,
        });
        return { type: "validation", id };
    }
    addValidation(validation) {
        if (this.isIValidation(validation.value1)) {
            const id = this.addValidation(validation.value1);
            validation.value1 = { type: "validation", id };
        }
        if (this.isIValidation(validation.value2)) {
            const id = this.addValidation(validation.value2);
            validation.value2 = { type: "validation", id };
        }
        const id = validation.id || this._validations.length.toString();
        // Check if the validation id is already used
        if (this._validations.some((v) => v.id === id))
            throw new Error(`Validation with id ${id} already exists`);
        // if value1 or value2 is a string, check if it is a integer
        if (typeof validation.value1 === "string") {
            if (isNaN(parseInt(validation.value1, 10)))
                throw new Error(`Invalid value1 for validation ${id}`);
        }
        if (typeof validation.value2 === "string") {
            if (isNaN(parseInt(validation.value2, 10)))
                throw new Error(`Invalid value2 for validation ${id}`);
        }
        this._validations.push({
            value1: validation.value1,
            operator: validation.operator,
            value2: validation.value2,
            id,
        });
        return id;
    }
    handleVariable(value) {
        if (helpers_1.InstanceOf.ValidationVariable(value)) {
            const index = this.getIndex(value.id);
            const outputIndexHex = index.toString(16).padStart(4, "0");
            return outputIndexHex.padStart(constants_1.ValidationBase.length, constants_1.ValidationBase);
        }
        if (helpers_1.InstanceOf.Variable(value)) {
            return this.FCT.variables.getVariable(value, "uint256");
        }
        return value;
    }
    isIValidation(value) {
        return typeof value === "object" && value !== null && "value1" in value && "operator" in value && "value2" in value;
    }
}
exports.Validation = Validation;
//# sourceMappingURL=index.js.map
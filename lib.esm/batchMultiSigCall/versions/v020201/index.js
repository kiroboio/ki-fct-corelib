import { Version_old } from "../oldVersion";
import { SessionId_020201 } from "./SessionId";
// NEW VERSION - 0x020201
const Limits = [
    { name: "valid_from", type: "uint40" },
    { name: "expires_at", type: "uint40" },
    { name: "payable_gas_limit_in_kilo", type: "uint24" },
    { name: "max_payable_gas_price", type: "uint40" },
    { name: "purgeable", type: "bool" },
    { name: "blockable", type: "bool" },
];
// This version introduced payable_gas_limit_in_kilo and max_payable_gas_price, removed gas_price_limit
export class Version_020201 extends Version_old {
    SessionId;
    constructor(FCT) {
        super(FCT);
        this.SessionId = new SessionId_020201(FCT);
    }
    Limits = Limits;
    getLimitsMessage(FCT) {
        const FCTOptions = FCT.options;
        return {
            valid_from: FCTOptions.validFrom,
            expires_at: FCTOptions.expiresAt,
            payable_gas_limit_in_kilo: FCTOptions.payableGasLimitInKilo,
            max_payable_gas_price: FCTOptions.maxGasPrice,
            purgeable: FCTOptions.purgeable,
            blockable: FCTOptions.blockable,
        };
    }
}
//# sourceMappingURL=index.js.map
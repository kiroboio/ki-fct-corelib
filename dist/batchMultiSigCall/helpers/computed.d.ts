import { ComputedVariable } from "types";
interface Computed {
    value: string;
    add: string;
    sub: string;
    pow: string;
    mul: string;
    div: string;
    mod: string;
}
export declare const comp: (value: string) => {
    toJSON: () => string;
    toValue: () => string;
    mod: (mod: string) => {
        toJSON: () => string;
        toValue: () => string;
        comp: {
            mod: string;
            value: string;
            add: string;
            sub: string;
            pow: string;
            mul: string;
            div: string;
        };
    };
    div: (div: string) => {
        toJSON: () => string;
        toValue: () => string;
        mod: (mod: string) => {
            toJSON: () => string;
            toValue: () => string;
            comp: {
                mod: string;
                value: string;
                add: string;
                sub: string;
                pow: string;
                mul: string;
                div: string;
            };
        };
        comp: {
            div: string;
            value: string;
            add: string;
            sub: string;
            pow: string;
            mul: string;
            mod: string;
        };
    };
    mul: (mul: string) => {
        toJSON: () => string;
        toValue: () => string;
        mod: (mod: string) => {
            toJSON: () => string;
            toValue: () => string;
            comp: {
                mod: string;
                value: string;
                add: string;
                sub: string;
                pow: string;
                mul: string;
                div: string;
            };
        };
        div: (div: string) => {
            toJSON: () => string;
            toValue: () => string;
            mod: (mod: string) => {
                toJSON: () => string;
                toValue: () => string;
                comp: {
                    mod: string;
                    value: string;
                    add: string;
                    sub: string;
                    pow: string;
                    mul: string;
                    div: string;
                };
            };
            comp: {
                div: string;
                value: string;
                add: string;
                sub: string;
                pow: string;
                mul: string;
                mod: string;
            };
        };
        comp: {
            mul: string;
            value: string;
            add: string;
            sub: string;
            pow: string;
            div: string;
            mod: string;
        };
    };
    pow: (pow: string) => {
        toJSON: () => string;
        toValue: () => string;
        mod: (mod: string) => {
            toJSON: () => string;
            toValue: () => string;
            comp: {
                mod: string;
                value: string;
                add: string;
                sub: string;
                pow: string;
                mul: string;
                div: string;
            };
        };
        div: (div: string) => {
            toJSON: () => string;
            toValue: () => string;
            mod: (mod: string) => {
                toJSON: () => string;
                toValue: () => string;
                comp: {
                    mod: string;
                    value: string;
                    add: string;
                    sub: string;
                    pow: string;
                    mul: string;
                    div: string;
                };
            };
            comp: {
                div: string;
                value: string;
                add: string;
                sub: string;
                pow: string;
                mul: string;
                mod: string;
            };
        };
        mul: (mul: string) => {
            toJSON: () => string;
            toValue: () => string;
            mod: (mod: string) => {
                toJSON: () => string;
                toValue: () => string;
                comp: {
                    mod: string;
                    value: string;
                    add: string;
                    sub: string;
                    pow: string;
                    mul: string;
                    div: string;
                };
            };
            div: (div: string) => {
                toJSON: () => string;
                toValue: () => string;
                mod: (mod: string) => {
                    toJSON: () => string;
                    toValue: () => string;
                    comp: {
                        mod: string;
                        value: string;
                        add: string;
                        sub: string;
                        pow: string;
                        mul: string;
                        div: string;
                    };
                };
                comp: {
                    div: string;
                    value: string;
                    add: string;
                    sub: string;
                    pow: string;
                    mul: string;
                    mod: string;
                };
            };
            comp: {
                mul: string;
                value: string;
                add: string;
                sub: string;
                pow: string;
                div: string;
                mod: string;
            };
        };
        comp: {
            pow: string;
            value: string;
            add: string;
            sub: string;
            mul: string;
            div: string;
            mod: string;
        };
    };
    sub: (sub: string) => {
        toJSON: () => string;
        toValue: () => string;
        mod: (mod: string) => {
            toJSON: () => string;
            toValue: () => string;
            comp: {
                mod: string;
                value: string;
                add: string;
                sub: string;
                pow: string;
                mul: string;
                div: string;
            };
        };
        div: (div: string) => {
            toJSON: () => string;
            toValue: () => string;
            mod: (mod: string) => {
                toJSON: () => string;
                toValue: () => string;
                comp: {
                    mod: string;
                    value: string;
                    add: string;
                    sub: string;
                    pow: string;
                    mul: string;
                    div: string;
                };
            };
            comp: {
                div: string;
                value: string;
                add: string;
                sub: string;
                pow: string;
                mul: string;
                mod: string;
            };
        };
        mul: (mul: string) => {
            toJSON: () => string;
            toValue: () => string;
            mod: (mod: string) => {
                toJSON: () => string;
                toValue: () => string;
                comp: {
                    mod: string;
                    value: string;
                    add: string;
                    sub: string;
                    pow: string;
                    mul: string;
                    div: string;
                };
            };
            div: (div: string) => {
                toJSON: () => string;
                toValue: () => string;
                mod: (mod: string) => {
                    toJSON: () => string;
                    toValue: () => string;
                    comp: {
                        mod: string;
                        value: string;
                        add: string;
                        sub: string;
                        pow: string;
                        mul: string;
                        div: string;
                    };
                };
                comp: {
                    div: string;
                    value: string;
                    add: string;
                    sub: string;
                    pow: string;
                    mul: string;
                    mod: string;
                };
            };
            comp: {
                mul: string;
                value: string;
                add: string;
                sub: string;
                pow: string;
                div: string;
                mod: string;
            };
        };
        pow: (pow: string) => {
            toJSON: () => string;
            toValue: () => string;
            mod: (mod: string) => {
                toJSON: () => string;
                toValue: () => string;
                comp: {
                    mod: string;
                    value: string;
                    add: string;
                    sub: string;
                    pow: string;
                    mul: string;
                    div: string;
                };
            };
            div: (div: string) => {
                toJSON: () => string;
                toValue: () => string;
                mod: (mod: string) => {
                    toJSON: () => string;
                    toValue: () => string;
                    comp: {
                        mod: string;
                        value: string;
                        add: string;
                        sub: string;
                        pow: string;
                        mul: string;
                        div: string;
                    };
                };
                comp: {
                    div: string;
                    value: string;
                    add: string;
                    sub: string;
                    pow: string;
                    mul: string;
                    mod: string;
                };
            };
            mul: (mul: string) => {
                toJSON: () => string;
                toValue: () => string;
                mod: (mod: string) => {
                    toJSON: () => string;
                    toValue: () => string;
                    comp: {
                        mod: string;
                        value: string;
                        add: string;
                        sub: string;
                        pow: string;
                        mul: string;
                        div: string;
                    };
                };
                div: (div: string) => {
                    toJSON: () => string;
                    toValue: () => string;
                    mod: (mod: string) => {
                        toJSON: () => string;
                        toValue: () => string;
                        comp: {
                            mod: string;
                            value: string;
                            add: string;
                            sub: string;
                            pow: string;
                            mul: string;
                            div: string;
                        };
                    };
                    comp: {
                        div: string;
                        value: string;
                        add: string;
                        sub: string;
                        pow: string;
                        mul: string;
                        mod: string;
                    };
                };
                comp: {
                    mul: string;
                    value: string;
                    add: string;
                    sub: string;
                    pow: string;
                    div: string;
                    mod: string;
                };
            };
            comp: {
                pow: string;
                value: string;
                add: string;
                sub: string;
                mul: string;
                div: string;
                mod: string;
            };
        };
        comp: {
            sub: string;
            value: string;
            add: string;
            pow: string;
            mul: string;
            div: string;
            mod: string;
        };
    };
    add: (add: string) => {
        toJSON: () => string;
        toValue: () => string;
        mod: (mod: string) => {
            toJSON: () => string;
            toValue: () => string;
            comp: {
                mod: string;
                value: string;
                add: string;
                sub: string;
                pow: string;
                mul: string;
                div: string;
            };
        };
        div: (div: string) => {
            toJSON: () => string;
            toValue: () => string;
            mod: (mod: string) => {
                toJSON: () => string;
                toValue: () => string;
                comp: {
                    mod: string;
                    value: string;
                    add: string;
                    sub: string;
                    pow: string;
                    mul: string;
                    div: string;
                };
            };
            comp: {
                div: string;
                value: string;
                add: string;
                sub: string;
                pow: string;
                mul: string;
                mod: string;
            };
        };
        mul: (mul: string) => {
            toJSON: () => string;
            toValue: () => string;
            mod: (mod: string) => {
                toJSON: () => string;
                toValue: () => string;
                comp: {
                    mod: string;
                    value: string;
                    add: string;
                    sub: string;
                    pow: string;
                    mul: string;
                    div: string;
                };
            };
            div: (div: string) => {
                toJSON: () => string;
                toValue: () => string;
                mod: (mod: string) => {
                    toJSON: () => string;
                    toValue: () => string;
                    comp: {
                        mod: string;
                        value: string;
                        add: string;
                        sub: string;
                        pow: string;
                        mul: string;
                        div: string;
                    };
                };
                comp: {
                    div: string;
                    value: string;
                    add: string;
                    sub: string;
                    pow: string;
                    mul: string;
                    mod: string;
                };
            };
            comp: {
                mul: string;
                value: string;
                add: string;
                sub: string;
                pow: string;
                div: string;
                mod: string;
            };
        };
        pow: (pow: string) => {
            toJSON: () => string;
            toValue: () => string;
            mod: (mod: string) => {
                toJSON: () => string;
                toValue: () => string;
                comp: {
                    mod: string;
                    value: string;
                    add: string;
                    sub: string;
                    pow: string;
                    mul: string;
                    div: string;
                };
            };
            div: (div: string) => {
                toJSON: () => string;
                toValue: () => string;
                mod: (mod: string) => {
                    toJSON: () => string;
                    toValue: () => string;
                    comp: {
                        mod: string;
                        value: string;
                        add: string;
                        sub: string;
                        pow: string;
                        mul: string;
                        div: string;
                    };
                };
                comp: {
                    div: string;
                    value: string;
                    add: string;
                    sub: string;
                    pow: string;
                    mul: string;
                    mod: string;
                };
            };
            mul: (mul: string) => {
                toJSON: () => string;
                toValue: () => string;
                mod: (mod: string) => {
                    toJSON: () => string;
                    toValue: () => string;
                    comp: {
                        mod: string;
                        value: string;
                        add: string;
                        sub: string;
                        pow: string;
                        mul: string;
                        div: string;
                    };
                };
                div: (div: string) => {
                    toJSON: () => string;
                    toValue: () => string;
                    mod: (mod: string) => {
                        toJSON: () => string;
                        toValue: () => string;
                        comp: {
                            mod: string;
                            value: string;
                            add: string;
                            sub: string;
                            pow: string;
                            mul: string;
                            div: string;
                        };
                    };
                    comp: {
                        div: string;
                        value: string;
                        add: string;
                        sub: string;
                        pow: string;
                        mul: string;
                        mod: string;
                    };
                };
                comp: {
                    mul: string;
                    value: string;
                    add: string;
                    sub: string;
                    pow: string;
                    div: string;
                    mod: string;
                };
            };
            comp: {
                pow: string;
                value: string;
                add: string;
                sub: string;
                mul: string;
                div: string;
                mod: string;
            };
        };
        sub: (sub: string) => {
            toJSON: () => string;
            toValue: () => string;
            mod: (mod: string) => {
                toJSON: () => string;
                toValue: () => string;
                comp: {
                    mod: string;
                    value: string;
                    add: string;
                    sub: string;
                    pow: string;
                    mul: string;
                    div: string;
                };
            };
            div: (div: string) => {
                toJSON: () => string;
                toValue: () => string;
                mod: (mod: string) => {
                    toJSON: () => string;
                    toValue: () => string;
                    comp: {
                        mod: string;
                        value: string;
                        add: string;
                        sub: string;
                        pow: string;
                        mul: string;
                        div: string;
                    };
                };
                comp: {
                    div: string;
                    value: string;
                    add: string;
                    sub: string;
                    pow: string;
                    mul: string;
                    mod: string;
                };
            };
            mul: (mul: string) => {
                toJSON: () => string;
                toValue: () => string;
                mod: (mod: string) => {
                    toJSON: () => string;
                    toValue: () => string;
                    comp: {
                        mod: string;
                        value: string;
                        add: string;
                        sub: string;
                        pow: string;
                        mul: string;
                        div: string;
                    };
                };
                div: (div: string) => {
                    toJSON: () => string;
                    toValue: () => string;
                    mod: (mod: string) => {
                        toJSON: () => string;
                        toValue: () => string;
                        comp: {
                            mod: string;
                            value: string;
                            add: string;
                            sub: string;
                            pow: string;
                            mul: string;
                            div: string;
                        };
                    };
                    comp: {
                        div: string;
                        value: string;
                        add: string;
                        sub: string;
                        pow: string;
                        mul: string;
                        mod: string;
                    };
                };
                comp: {
                    mul: string;
                    value: string;
                    add: string;
                    sub: string;
                    pow: string;
                    div: string;
                    mod: string;
                };
            };
            pow: (pow: string) => {
                toJSON: () => string;
                toValue: () => string;
                mod: (mod: string) => {
                    toJSON: () => string;
                    toValue: () => string;
                    comp: {
                        mod: string;
                        value: string;
                        add: string;
                        sub: string;
                        pow: string;
                        mul: string;
                        div: string;
                    };
                };
                div: (div: string) => {
                    toJSON: () => string;
                    toValue: () => string;
                    mod: (mod: string) => {
                        toJSON: () => string;
                        toValue: () => string;
                        comp: {
                            mod: string;
                            value: string;
                            add: string;
                            sub: string;
                            pow: string;
                            mul: string;
                            div: string;
                        };
                    };
                    comp: {
                        div: string;
                        value: string;
                        add: string;
                        sub: string;
                        pow: string;
                        mul: string;
                        mod: string;
                    };
                };
                mul: (mul: string) => {
                    toJSON: () => string;
                    toValue: () => string;
                    mod: (mod: string) => {
                        toJSON: () => string;
                        toValue: () => string;
                        comp: {
                            mod: string;
                            value: string;
                            add: string;
                            sub: string;
                            pow: string;
                            mul: string;
                            div: string;
                        };
                    };
                    div: (div: string) => {
                        toJSON: () => string;
                        toValue: () => string;
                        mod: (mod: string) => {
                            toJSON: () => string;
                            toValue: () => string;
                            comp: {
                                mod: string;
                                value: string;
                                add: string;
                                sub: string;
                                pow: string;
                                mul: string;
                                div: string;
                            };
                        };
                        comp: {
                            div: string;
                            value: string;
                            add: string;
                            sub: string;
                            pow: string;
                            mul: string;
                            mod: string;
                        };
                    };
                    comp: {
                        mul: string;
                        value: string;
                        add: string;
                        sub: string;
                        pow: string;
                        div: string;
                        mod: string;
                    };
                };
                comp: {
                    pow: string;
                    value: string;
                    add: string;
                    sub: string;
                    mul: string;
                    div: string;
                    mod: string;
                };
            };
            comp: {
                sub: string;
                value: string;
                add: string;
                pow: string;
                mul: string;
                div: string;
                mod: string;
            };
        };
        comp: {
            add: string;
            value: string;
            sub: string;
            pow: string;
            mul: string;
            div: string;
            mod: string;
        };
    };
    comp: Computed;
};
export declare const getComputedVariableMessage: (computedVariables: ComputedVariable[]) => Record<`computed_${number}`, ComputedVariable>;
export {};

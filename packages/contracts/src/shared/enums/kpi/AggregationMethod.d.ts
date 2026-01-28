export declare const AggregationMethod: {
    readonly SUM: "SUM";
    readonly EOP: "EOP";
    readonly AVG: "AVG";
    readonly MAX: "MAX";
    readonly MIN: "MIN";
};
export type AggregationMethod = typeof AggregationMethod[keyof typeof AggregationMethod];

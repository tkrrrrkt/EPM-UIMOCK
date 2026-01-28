export declare const OwnerType: {
    readonly SYSTEM: "SYSTEM";
    readonly USER: "USER";
};
export type OwnerType = (typeof OwnerType)[keyof typeof OwnerType];

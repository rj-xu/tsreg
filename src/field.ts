import { Bit } from "./mask.ts";
import { Reg } from "./reg.ts";

export function BitField<T extends Reg>(s_or_range: number | readonly [number, number], l = 1, base = 0) {
    const BIT = new Bit(s_or_range, l, base);

    return function (target: Reg, key: string) {
        Object.defineProperty(target, key, {
            get(this: T) {
                return this.read(BIT);
            },
            set(this: T, val: number) {
                this.write(val, BIT);
            },
            enumerable: true,
            configurable: true,
        });
    };
}

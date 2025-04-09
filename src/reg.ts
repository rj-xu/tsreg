import { assertMatch } from "@std/assert/match";
import { Access, IsReadable, IsWritable } from "./access.ts";
import { Bit, Mask } from "./mask.ts";

export abstract class Reg {
    readonly access: Access = Access.RW;
    constructor(
        readonly addr: number,
        readonly size: number = 4,
    ) {
    }

    private _read(bit?: Bit) {
        if (!IsReadable(this.access)) {
            throw Error("Not readable register");
        }
        let val = 0xFFFF_FFFF;
        if (bit) {
            val = bit.get(val);
        }
        console.log(`Read ${this.addr.toString(16)} ${val.toString(16)}`);
        return val;
    }

    read(
        bit?: Bit,
        options?: undefined,
    ): number;
    read(
        bit?: Bit,
        options?: { set_mask?: undefined; clear_mask?: Mask },
    ): [number, boolean];
    read(
        bit?: Bit,
        options?: { set_mask?: Mask; clear_mask?: undefined },
    ): [number, boolean];
    read(
        bit?: Bit,
        options?: { set_mask?: Mask; clear_mask?: Mask },
    ): [number, boolean, boolean];
    read(
        bit?: Bit,
        options?: { set_mask?: Mask; clear_mask?: Mask },
    ): number | [number, boolean] | [number, boolean, boolean] {
        const rv = this._read();

        const val = bit?.get(rv) ?? rv;
        if (!options) return val;

        const results: [number, boolean?] = [val];
        if (options.set_mask) results.push(options.set_mask.is_set(rv));
        if (options.clear_mask) results.push(options.clear_mask.is_clear(rv));

        return val;
    }

    private _write(val: number, bit?: Bit) {
        if (!IsWritable(this.access)) {
            throw Error("Not writable register");
        }
        if (bit) {
            const rv = this.read();
            val = bit.set_field(rv, val);
        }
        console.log(`Write ${this.addr.toString(16)} ${val.toString(16)}`);
    }

    write(val: number, bit?: Bit, set_mask?: Mask, clear_mask?: Mask) {
        this._write(val, bit);
    }
}

export class RoReg extends Reg {
    override access: Access = Access.RO;
}
export class RwReg extends Reg {
    override access: Access = Access.RW;
}
export class WoReg extends Reg {
    override access: Access = Access.WO;
}

let reg = new RwReg(0x0, 4);
reg.read(undefined, { set_mask: new Mask(0xFFFF_FFFF), clear_mask: new Mask(0xFFFF_FFFF) });

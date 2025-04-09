import { Access, IsReadable, IsWritable } from './access.ts'
import { Bit, Mask } from './mask.ts'

abstract class Reg {
    readonly access: Access = Access.RW
    constructor(
        readonly addr: number,
        readonly size: number,
    ) {
    }

    private _read(bit?: Bit) {
        if (!IsReadable(this.access)) {
            throw Error('Not readable register')
        }
        let val = 0xFFFF_FFFF
        if (bit) {
            val = bit.get(val)
        }
        console.log(`Read ${this.addr.toString(16)} ${val.toString(16)}`)
        return val
    }

    read(bit?: Bit) {
        return this._read(bit)
    }

    private _write(val: number, bit?: Bit) {
        if (!IsWritable(this.access)) {
            throw Error('Not writable register')
        }
        if (bit) {
            const rv = this.read()
            val = bit.set_field(rv, val)
        }
        console.log(`Write ${this.addr.toString(16)} ${val.toString(16)}`)
    }

    write(val: number, bit?: Bit) {
        this._write(val, bit)
    }
}

export class RoReg extends Reg {
    override access: Access = Access.RO
}
export class RwReg extends Reg {
    override access: Access = Access.RW
}
export class WoReg extends Reg {
    override access: Access = Access.WO
}

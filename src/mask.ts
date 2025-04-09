export class Mask {
    constructor(readonly mask: number) {}
    get(val: number) {
        return val & this.mask;
    }
    set(val: number, mask: number) {
        return val | mask;
    }
    clear(val: number, mask: number) {
        return val & ~mask;
    }
    toggle(val: number, mask: number) {
        return val ^ mask;
    }

    is_set(val: number) {
        return (val & this.mask) === this.mask;
    }
    is_clear(val: number) {
        return (val & this.mask) === 0;
    }

    add(masks: Mask[]): Mask {
        let mask = this.mask;

        for (const m of masks) {
            mask |= m.mask;
        }

        return new Mask(mask);
    }
}

export class Bit extends Mask {
    readonly s: number;
    readonly l: number;
    constructor(s_or_range: number | readonly [number, number], l = 1, base = 0) {
        let s = 0;
        if (Array.isArray(s)) {
            const range = s_or_range as readonly [number, number];
            s = range[0];
            l = range[1] - range[0] + 1;
        }
        s += base;
        const mask = ((1 << l) - 1) << s;
        super(mask);
        this.s = s;
        this.l = l;
    }

    get_field(val: number) {
        return (val & this.mask) >> this.s;
    }
    set_field(val: number, field: number) {
        return (val & ~this.mask) | ((field << this.s) & this.mask);
    }
}

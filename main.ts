class Mask {
    readonly mask: number
    constructor(mask: number) {
      this.mask = mask
    }
    get(val: number) {
      return val & this.mask
    }
    set(val: number, mask: number) {
      return val | mask
    }
    clear(val: number, mask: number) {
      return val & ~mask
    }
    toggle(val: number, mask: number) {
      return val ^ mask
    }
  }

  class BitMask extends Mask {
    readonly s: number
    readonly l: number
    constructor(s: number, l: number = 1) {
      const mask = ((1 << l) - 1) << s
      super(mask)
      this.s = s
      this.l = l
    }
    static from_range(s: number, e: number) {
      return new BitMask(s, e - s + 1)
    }
    get_field(val: number) {
      return (val & this.mask) >> this.s
    }
    set_field(val: number, field: number) {
      return (val & ~this.mask) | ((field << this.s) & this.mask)
    }
  }

  enum Access {
    NA = 0b00,
    RO = 0b01,
    WO = 0b10,
    RW = 0b11,
  }

  abstract class Reg {
    addr: number
    size: number
    access: Access = Access.NA
    constructor(addr: number, size: number) {
      this.addr = addr
      this.size = size
    }
    read(bit?: [number, number]) {
      let val = 0xFFFF_FFFF
      if (bit) {
        val = BitMask.from_range(...bit).get(val)
      }
      console.log("Read ", val)
      return val
    }
    write(val: number, bit: [number, number]) {
      let rv = this.read()
      rv = BitMask.from_range(...bit).set_field(rvv, val)
      console.log("Write ", rv)
    }
  }
  class RwReg extends Reg {
    override access: Access = Access.RW
  }

  class GlbConfig extends RwReg {
    get_event_id() { this.read([0, 1]) }
    set_event_id(val: number) { this.write(val, [0, 1]) }
    get_event_mask() { this.read([2, 3]) }
    set_event_mask(val: number) { this.write(val, [2, 3]) }
  }


  // Decorator factory for bit field accessors
  function BitField(bits: [number, number]) {
    return function (target: any, key: string) {
      const getMethodName = `get_${key}`;
      const setMethodName = `set_${key}`;
      target.prototype[getMethodName] = function() {
        return this.read(bits);
      };
      target.prototype[setMethodName] = function(val: number) {
        this.write(val, bits);
      };
    };
  }

  class GlbConfig2 extends RwReg {
    @BitField([0,1]) eventId!: number;
    @BitField([2,3]) eventMask!: number;

    // Decorators auto-generate:
    // get_eventId(), set_eventId()
    // get_eventMask(), set_eventMask()
  }


  class GlbConfig3 extends RwReg {
    private static readonly FIELD_RANGES = {
      eventId: [0,1],
      eventMask: [2,3]
    };

    get_field<T extends keyof typeof GlbConfig.FIELD_RANGES>(name: T) {
      return this.read(GlbConfig.FIELD_RANGES[name]);
    }

    set_field<T extends keyof typeof GlbConfig.FIELD_RANGES>(name: T, val: number) {
      this.write(val, GlbConfig.FIELD_RANGES[name]);
    }
  }


  // Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
  if (import.meta.main) {
    console.log("Add 2 + 3 =", add(2, 3));
  }

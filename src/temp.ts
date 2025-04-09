import * as log from "@std/log";


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
  read(bit?: readonly [number, number]) {
    let val = 0xFFFF_FFFF
    if (bit) {
      val = BitMask.from_range(...bit).get(val)
    }
    log.debug("Read ", val)
    return val
  }
  write(val: number, bit?: readonly [number, number]) {
    if (bit) {
      const rv = this.read()
      val = BitMask.from_range(...bit).set_field(rv, val)
    }
    log.debug("Write ", val)
  }
}
class RwReg extends Reg {
  override access: Access = Access.RW
}

class GlbConfig extends RwReg {
  get event_id() { return this.read([0, 1]) }
  set event_id(val: number) { this.write(val, [0, 1]) }
  get event_mask() { return this.read([2, 3]) }
  set event_mask(val: number) { this.write(val, [2, 3]) }
}

function BitField(bits: [number, number]) {
  return function (target: object, propName: string) {
    // 添加原型属性访问逻辑
    Object.defineProperty(target, propName, {
      get: function (this: Reg) {
        return this.read(bits);
      },
      set: function (this: Reg, val: number) {
        this.write(val, bits);
      },
      enumerable: true,
      configurable: true
    });
  };
}

class GlbConfig2 extends RwReg {
  @BitField([0, 1])
  declare event_id: number;

  @BitField([2, 3])
  declare event_trigger: number;
}

class GlbConfig3 extends RwReg {
  private static readonly FIELD_RANGES = {
    eventId: [0, 1],
    eventMask: [2, 3]
  } as const;

  get_field<T extends keyof typeof GlbConfig3.FIELD_RANGES>(name: T) {
    return this.read(GlbConfig3.FIELD_RANGES[name]);
  }

  set_field<T extends keyof typeof GlbConfig3.FIELD_RANGES>(name: T, val: number) {
    this.write(val, GlbConfig3.FIELD_RANGES[name]);
  }
}

function hello() {
  console.log("Hello, Deno!");
}


// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  hello();

  const GLB_CONFIG = new GlbConfig(0x00, 4)
  let a = GLB_CONFIG.event_id
  GLB_CONFIG.event_id = 0xFF
  console.log(a)

  const GLB_CONFIG2 = new GlbConfig2(0x00, 4)
  let b = GLB_CONFIG2.event_id
  GLB_CONFIG2.event_id = 0xFF
  console.log(b)

  const GLB_CONFIG3 = new GlbConfig3(0x00, 4)
  let c = GLB_CONFIG3.get_field("eventId")
  GLB_CONFIG3.set_field("eventId", 0xFF)
  console.log(c)
}

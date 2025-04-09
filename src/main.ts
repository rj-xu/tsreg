import { BitField } from "./field.ts";
import { RwReg } from "./reg.ts";

class GlbConfig extends RwReg {
    @BitField(0, 1)
    declare EVENT_ID: number;

    @BitField([2, 3])
    declare EVENT_TRIGGER: number;
}

export const GLB_CONFIG = new GlbConfig(0x4000_0000);

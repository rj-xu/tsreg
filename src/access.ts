export enum Access {
    NA = 0b00,
    RO = 0b01,
    WO = 0b10,
    RW = 0b11,
}

export function IsReadable(access: Access): boolean {
    return (access & Access.RO) !== 0
}

export function IsWritable(access: Access): boolean {
    return (access & Access.WO) !== 0
}

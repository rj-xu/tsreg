export function hex(v: number) {
    return v.toString(16).padStart(8, "0").toUpperCase();
}

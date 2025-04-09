export function BitField(bits: [number, number]) {
    return function (target: any, key: string) {
        Object.defineProperty(target, key, {
            get() {
                return this.read(bits);
            },
            set(val: number) {
                this.write(val, bits);
            },
            enumerable: true,
            configurable: true,
        });
    };
}


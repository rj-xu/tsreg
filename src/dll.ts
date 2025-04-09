const MY_DLL = Deno.dlopen(
    "libs/my_dll.dll",
    {
        add: { parameters: ["i32", "i32"], result: "i32" },
    } as const,
);

export function add(a: number, b: number): number {
    return MY_DLL.symbols.add(a, b);
}

let a = add(1, 2);
console.log(a);

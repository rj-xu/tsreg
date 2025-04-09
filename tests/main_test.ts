import { assertEquals } from "@std/assert";
import { hello } from "../src/temp.ts";

Deno.test(function addTest() {
  hello();
});

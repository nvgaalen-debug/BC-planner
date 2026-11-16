// Voorbeeld van een "motortest": pure logica, geen server, geen netwerk. node:test.
// Draai met: npm run motor
import { test } from "node:test";
import assert from "node:assert/strict";

function telOpen(items) {
  return items.filter((i) => !i.done).length;
}

test("telOpen telt alleen niet-afgeronde items", () => {
  assert.equal(telOpen([{ done: true }, { done: false }, { done: false }]), 2);
  assert.equal(telOpen([]), 0);
});

import assert from "node:assert/strict";
import test from "node:test";
import redirect from "./src/index.js";

test("permanently redirects www to the apex while preserving path and query", () => {
  const response = redirect.fetch(
    new Request("http://www.neoomsi.com/docs/faq/?line=42"),
  );

  assert.equal(response.status, 301);
  assert.equal(response.headers.get("location"), "https://neoomsi.com/docs/faq/?line=42");
});

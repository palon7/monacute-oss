import { MonapartyClient } from "../src/index";

test("test", () => {
  expect(new MonapartyClient("http://api.com/_api").getEndpoint()).toBe(
    "http://api.com/_api"
  );
});

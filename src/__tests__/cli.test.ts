import { describe, it, expect } from "vitest";
import { execSync } from "node:child_process";

describe("wt CLI", () => {
  it("prints help with all subcommands", () => {
    const output = execSync("npx tsx src/cli.ts --help", {
      encoding: "utf-8",
    });
    expect(output).toContain("new");
    expect(output).toContain("list");
    expect(output).toContain("open");
    expect(output).toContain("kill");
    expect(output).toContain("status");
    expect(output).toContain("init");
  });
});

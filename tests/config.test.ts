import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { readConfig, writeConfig, type Config } from "../src/config.js";
import fs from "fs";
import os from "os";
import path from "path";

const TEST_DIR = path.join(os.tmpdir(), ".mimir-test-" + Date.now());

describe("config", () => {
  beforeEach(() => fs.mkdirSync(TEST_DIR, { recursive: true }));
  afterEach(() => fs.rmSync(TEST_DIR, { recursive: true }));

  it("returns empty config when file does not exist", () => {
    const config = readConfig(TEST_DIR);
    expect(config).toEqual({});
  });

  it("writes and reads config", () => {
    const cfg: Config = { apiKey: "sk-test", activeGame: "dark-souls-3" };
    writeConfig(cfg, TEST_DIR);
    expect(readConfig(TEST_DIR)).toEqual(cfg);
  });
});

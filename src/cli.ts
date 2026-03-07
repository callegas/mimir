#!/usr/bin/env node
import { Command } from "commander";
import { setupCommand } from "./commands/setup.js";
import { useCommand } from "./commands/use.js";
import { importCommand } from "./commands/import.js";

const program = new Command();

program
  .name("mimir")
  .description("Personal AI game companion")
  .version("0.1.0");

program
  .command("setup")
  .description("Configure Claude API key")
  .action(setupCommand);

program
  .command("use <name>")
  .description("Switch active game — generates trophy list via Claude if new")
  .action(useCommand);

program
  .command("import <file>")
  .description("Import a custom game trophy list from JSON")
  .action(importCommand);

program.parse();

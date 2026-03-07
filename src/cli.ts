#!/usr/bin/env node
import { Command } from "commander";
import { setupCommand } from "./commands/setup.js";
import { useCommand } from "./commands/use.js";
import { importCommand } from "./commands/import.js";
import { statusCommand } from "./commands/status.js";
import { noteCommand } from "./commands/note.js";
import { modeCommand } from "./commands/mode.js";
import { listCommand } from "./commands/list.js";
import { doneCommand } from "./commands/done.js";

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

program.command("status").description("Show active game progress").action(statusCommand);
program.command("note <text>").description("Update notes for current game").action(noteCommand);
program.command("mode <explore|platinum>").description("Switch game mode").action(modeCommand);

program
  .command("list")
  .description("List trophies")
  .option("--dlc <name>", "Filter by DLC")
  .action(listCommand);

program.command("done <name>").description("Mark trophy as done").action((name) => doneCommand(name));
program.command("undone <name>").description("Unmark a trophy").action((name) => doneCommand(name, true));

program.parse();

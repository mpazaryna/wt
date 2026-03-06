#!/usr/bin/env node
import { Command } from "commander";
import { registerNew } from "./commands/new.js";
import { registerList } from "./commands/list.js";
import { registerOpen } from "./commands/open.js";
import { registerKill } from "./commands/kill.js";
import { registerStatus } from "./commands/status.js";
import { registerInit } from "./commands/init.js";

const program = new Command();

program
  .name("wt")
  .description("Manage git worktrees paired with Claude Code sessions")
  .version("0.1.0");

registerNew(program);
registerList(program);
registerOpen(program);
registerKill(program);
registerStatus(program);
registerInit(program);

program.parse();

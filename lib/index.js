#!/usr/bin/env node
const chalk = require("chalk");
const { createCommand } = require("commander");
const {
  isInstalled,
  getPkgMan,
  logErr,
  cloneRepo,
  installPkgs,
} = require("./utils");

const createProject = async (name) => {
  const gitInstalled = await isInstalled("git");
  if (!gitInstalled) {
    logErr(`Git is not installed on your mechine. Please install first!.`);
  }
  const pkgMan = await getPkgMan();
  if (!pkgMan) {
    logErr(
      `(yarn | npm | pnpm) is not installed on your mechine. Please install one of them first!.`
    );
  }

  await cloneRepo(name);
  await installPkgs(pkgMan, name);
};

const main = async () => {
  const pkgJson = require("../package.json");
  const program = createCommand(pkgJson.name)
    .version(pkgJson.version)
    .arguments("[project-directory]")
    .usage(`${chalk.green("<project-directory>")} [options]`)
    .action(async (name, _) => {
      if (!name) logErr("Project directory is required");
      name = name?.toLowerCase()?.replace(" ", "-");
      return createProject(name);
    })
    .allowUnknownOption();

  await program.parseAsync(process.argv);
};

main();

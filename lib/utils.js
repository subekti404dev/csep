const { exec } = require("child_process");
const { writeFileSync } = require("fs");
const rimraf = require("rimraf");
const path = require("path");
const chalk = require("chalk");
const commandExists = require("command-exists");
const repoUrl = `https://github.com/subekti404dev/simple-express-project`;

const logErr = (err) => {
  console.log(chalk.red(err));
  process.exit(1);
};

const execAsync = async (cmd) => {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) reject(stderr);
      resolve(stdout);
    });
  });
};

const isInstalled = async (app) => {
  try {
    await commandExists(app);
    return true;
  } catch (error) {
    return false;
  }
};

const getPkgMan = async () => {
  const [yarnInstalled, npmInstalled, pnpmInstalled] = await Promise.all([
    isInstalled("yarn"),
    isInstalled("npm"),
    isInstalled("pnpm"),
  ]);
  if (yarnInstalled) return "yarn";
  if (npmInstalled) return "npm";
  if (pnpmInstalled) return "pnpm";
  return;
};

const renameProject = async (name) => {
  const projectDir = path.join(process.cwd(), name);
  const pkgJsonFilePath = path.join(projectDir, "package.json");
  let pkgJson;
  try {
    pkgJson = require(pkgJsonFilePath);
  } catch (error) {}
  if (!pkgJson) {
    console.log(`Error renaming project: package.json file not found`);
  }
  pkgJson.name = name;
  writeFileSync(pkgJsonFilePath, JSON.stringify(pkgJson, null, 2));
  rimraf.sync(path.join(projectDir, ".git"));
  await execAsync(
    `cd ${projectDir} && git init && git add . && git commit -m "chore: init express project"`
  );
};

const installPkgs = async (pkgMan, name) => {
  try {
    const projectDir = path.join(process.cwd(), name);
    await execAsync(`cd ${projectDir} && ${pkgMan} install`);
    console.log(`\n==========================================\n`);
    console.log(`Project Successfully Created !!`);
    console.log(`to run the project:`);
    console.log(chalk.green(`cd ${name} && yarn dev`));
    console.log(`\n==========================================\n`);
  } catch (error) {
    logErr(error);
  }
};

const cloneRepo = async (name) => {
  try {
    await execAsync(`git clone ${repoUrl} ${name}`);
    await renameProject(name);
  } catch (error) {
    logErr(error);
  }
};

module.exports = {
  logErr,
  execAsync,
  isInstalled,
  getPkgMan,
  renameProject,
  installPkgs,
  cloneRepo,
};

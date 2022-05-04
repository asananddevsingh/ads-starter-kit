import fs from "fs-extra";
import path from "path";
import shell from "shelljs";
import chalk from "chalk";
import parse from 'parse-gitignore';
import paths from "./pathUtils";

export const showSuccessMessage = (options) => {
  console.log(chalk.green(`\nCongratulations! Your application is ready.\n`));
  console.log(`run commands ${chalk.cyan(`cd ${options.appName}`)} && ${chalk.cyan(`${getPackageManager()} start`)}`);
}

export const makeAppDirectory = (appTargetPath) => {
  if (fs.existsSync(appTargetPath)) {
    console.log(chalk.red(`Folder ${appTargetPath} exists. Delete existing or use another name.`));
    return false;
  }

  fs.mkdirSync(appTargetPath);
  return true;
}

export const postProcess = (options) => {
  if (isPackageJsonExists(options)) {
    return postProcessNode(options);
  }
  return true;
}

export const isPackageJsonExists = (options) => {
  const packgaeJsonPath = paths.getPackageJsonPath(options.templatePath);
  return fs.existsSync(packgaeJsonPath);
}

export const getPackageManager = () => {
  if (shell.which("yarn")) {
    return "yarn";
  } else if (shell.which("npm")) {
    return "npm";
  }
  return;
}

export const postProcessNode = (options) => {
  shell.cd(options.tartgetPath);

  const cmd = getPackageManager();
  if (cmd) {
    console.log(chalk.blue.bold(`\nHang Tight`), chalk.green("Installing application dependencies...\n"));
    const result = shell.exec(`${cmd} install`);
    if (result.code !== 0) {
      return false;
    }
  } else {
    console.log(chalk.red("No yarn or npm found. Can't run installation."));
  }

  return true;
}

export const getGitIgnoreEntries = (gitIgnorePath) => {
  const gitIgnoreContent = fs.readFileSync(gitIgnorePath, { encoding: 'utf-8' })
  return parse(gitIgnoreContent);
}

const isInGitIgnore = (gitIgnoreEntries, file) => {
  const ignoreIndex = gitIgnoreEntries.findIndex(gitIgn => {
    var gitIgnRegEx = new RegExp(gitIgn);
    var fileRegEx = new RegExp(file)
    return gitIgnRegEx.test(fileRegEx);
  })
  return ignoreIndex !== -1;
}

export const writeAppContent = (templatePath, appName, gitIgnoreEntries) => {
  const filesToCreate = fs.readdirSync(templatePath);
  filesToCreate.forEach(file => {
    if (isInGitIgnore(gitIgnoreEntries, file)) {
      return;
    }

    const originFilePath = path.join(templatePath, file);
    // get stats about the current file.
    const stats = fs.statSync(originFilePath);

    if (stats.isFile()) {
      const fileContent = fs.readFileSync(originFilePath, "utf8");
      const writeFilePath = path.join(paths.appDirectory, appName, file);
      fs.writeFileSync(writeFilePath, fileContent, "utf8");
      console.log(chalk.magenta(`Copied file:`), chalk.green(file));
    } else if (stats.isDirectory()) {
      const writeDirPath = path.join(paths.appDirectory, appName, file);
      fs.mkdirSync(writeDirPath);
      console.log(chalk.blue(`Created folder:`), chalk.green(file));
      // recursive call
      writeAppContent(path.join(templatePath, file), path.join(appName, file), gitIgnoreEntries);
    }
  });
}
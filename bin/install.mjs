#!/usr/bin/env node

import regexpTree from "regexp-tree";
import { replaceInFile } from "replace-in-file";
import fs from 'fs';
import path from 'path';
import { normalize } from "./normalize.mjs";
import YAML from "yaml";
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const argv = yargs(hideBin(process.argv))
  .usage('Usage: npx @tisf/regex <url> [options]')
  .command('$0 <url>', 't', (yargs) => {
    yargs.positional('url', {
      describe: 'Github Url',
      type: 'string'
    })
  })
  .help('h')
  .demandCommand(1)
  .parse();


async function regex(files, re, rep, already, callback) {
  try {
    const filecont = await fs.promises.readFile(files, 'utf-8');
    if (already && filecont.includes(already)) {
      return;
    }

    const reg = regexpTree.toRegExp(re);
    let to = rep;

    if (callback) {
      to = input => callback(input.replace(reg, rep));
    }

    const results = await replaceInFile({
      files,
      from: reg,
      to,
    });

    console.log('Replacement results:', results);
  } catch (error) {
    console.error('Error occurred:', error);
  }
}

(async () => {
  const { url } = argv;
  const yml = await normalize(url, null);

  const yaml = YAML.parse(yml);
  const pth = path.resolve(...yaml.path);

  for (const a of yaml.data) {
    console.log(a);
    await regex(
      pth,
      a.find && a.find.trim(),
      a.replace && a.replace.trim(),
      a.already && a.already.trim()
    );
  }

  console.log('Project setup complete.');
})();

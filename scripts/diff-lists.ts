import { diffTokenLists } from "@uniswap/token-lists";
import fs from "fs";
import path from "path";
import isEmpty from "lodash/isEmpty";

const args = process.argv.slice(2);
const ignoreExtensions = args[0] === "--ignoreExtensions";
const paths = ignoreExtensions ? args.slice(1) : args;

if (
  paths.length !== 2 ||
  paths.some((arg) => arg.startsWith("--"))
) {
  console.error(
    "Usage: pnpm run diff:lists [--ignoreExtensions] listA.json listB.json"
  );
  process.exit(1);
}

const [listA, listB] = paths;

const listAContents = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "../", listA), "utf8")
);

const listBContents = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "../", listB), "utf8")
);

if (!listAContents.tokens || !listBContents.tokens) {
  console.error("Lists must have a 'tokens' property");
  process.exit(1);
}

if (!fs.existsSync("./diff-output")) {
  fs.mkdirSync("./diff-output");
}

const getFileName = (input: string) =>
  path.basename(input).replace(".json", "");

let diff = diffTokenLists(listAContents.tokens, listBContents.tokens);

if (ignoreExtensions) {
  Object.entries(diff.changed).forEach(([network, changeData]) => {
    const parsedNetwork = Number(network);
    Object.entries(changeData).forEach(([address, changes]) => {
      if (changes.length === 1 && changes[0] === "extensions") {
        delete diff.changed[parsedNetwork][address];
      }
    });

    if (isEmpty(diff.changed[parsedNetwork])) {
      delete diff.changed[parsedNetwork];
    }
  });
}

fs.writeFileSync(
  `./diff-output/diff_${getFileName(listA)}<>${getFileName(listB)}.json`,
  JSON.stringify(diff, null, 2)
);

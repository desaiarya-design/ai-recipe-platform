const fs = require("fs");

const inputFile = "./scripts/recipes.json";
const outputFile = "./scripts/recipes-fixed.json";

const data = fs.readFileSync(inputFile, "utf8");

const recipes = data
  .trim()
  .split("\n")
  .map(line => JSON.parse(line));

fs.writeFileSync(
  outputFile,
  JSON.stringify(recipes, null, 2)
);

console.log(`Converted ${recipes.length} recipes successfully`);
import fs from "fs";
import process from "process";
import { readdir } from "fs/promises";

interface metaData {
  name: string;
  description: string;
  image: string;
  attributes: any[];
}

async function main() {
  let index = 0;

  fs.readdirSync("collection/upload").forEach(file => {
    // Rename the file
    fs.renameSync("collection/upload/"+file, "./collection/nfts/"+index+".png");    
    index++;
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

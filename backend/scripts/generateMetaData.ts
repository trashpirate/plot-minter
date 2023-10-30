import fs from "fs";
import process from "process";
import {readdir} from "fs/promises";

const url = "ipfs://bafybeif5p3lxttzmsonp76aneos5xaawjfvden7ctdycl7hicaddeclz3y/";

interface metaData {
  name: string;
  description: string;
  image: string;
  attributes: any[];
}

function shuffle(array: string[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

async function getFileList(dirName: string) {
  let files: string[] = [];
  const items = await readdir(dirName, {withFileTypes: true});

  for (const item of items) {
    if (item.isDirectory()) {
      files = [...files, ...(await getFileList(`${ dirName }/${ item.name }`))];
    } else {
      files.push(`${ dirName }/${ item.name }`);
    }
  }

  return files;
}

async function readDir(dirName: string) {
  let files: string[] = [];
  const fileList = await getFileList(dirName);
  for (let index = 0; index < fileList.length; index++) {
    const file = fileList[index];
    const relPath = file.replace(dirName + "/", "");
    files.push(relPath);
  }
  return files;
}

async function main() {

  const imageList = await readDir("collection/images");

  // write logs
  fs.writeFile('./collection/logs.txt', "", function (err) {});

  const randomizedList = shuffle(imageList);
  let index=0;
  randomizedList.forEach((file) => {
    const [color, name] = file.split("/");

    // write logs
    fs.appendFile('./collection/logs.txt', index + ": " + file + "\n", function (err) {});

    // write metadata file
    let json: metaData;
    json = {
      name: "Plot #" + index,
      description: "A plot of grass to touch, relax, and unwind.",
      image:
        url +
        color + '/' + name.toString(),
      attributes: [
        {
          trait_type: "Color",
          value: color,
        },
      ],
    };

    fs.writeFileSync(
      "./collection/metadata/" + index,
      JSON.stringify(json)
    );

    index++;
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

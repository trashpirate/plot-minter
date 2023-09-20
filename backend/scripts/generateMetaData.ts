import fs from "fs";
import process from "process";
import { readdir } from "fs/promises";

interface metaData {
  name: string;
  description: string;
  image: string;
  attributes: any[];
}

async function getFileList(dirName: string) {
  let files: string[] = [];
  const items = await readdir(dirName, { withFileTypes: true });

  for (const item of items) {
    if (item.isDirectory()) {
      files = [...files, ...(await getFileList(`${dirName}/${item.name}`))];
    } else {
      files.push(`${dirName}/${item.name}`);
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

function shuffle(array: string[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

async function main() {
  let index = 0;

  const imageList = await readDir("collection/images");
  const randomizedList = shuffle(imageList);
  randomizedList.forEach((file) => {
    const [color, name] = file.split("/");
    let json: metaData;
    json = {
      name: "Plot #" + index,
      description: "A plot of grass to touch, relax, and unwind.",
      image:
        "ipfs://bafybeif5p3lxttzmsonp76aneos5xaawjfvden7ctdycl7hicaddeclz3y/" +
        file.toString(),
      attributes: [
        {
          trait_type: "Color",
          value: color,
        },
      ],
    };

    fs.writeFileSync(
      "./collection/metadata/" + index + ".json",
      JSON.stringify(json)
    );
    index++;
    console.log(file);
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

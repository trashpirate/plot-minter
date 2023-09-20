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
    const [number, name] = file.split("_");
    const [color, suffix] = name.split(".");

    let json: metaData;
    json = {
      name: "Plot #" + index,
      description: "A plot of grass to touch, relax, and unwind.",
      image:
        "ipfs://bafybeibuogtgyd3bgf4zop5fggjvbvnkdd6ngz4zuyp63xwdhk43rmaeqe/" +
        file.toString(),
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

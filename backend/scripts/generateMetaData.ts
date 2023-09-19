import fs from "fs";
import process from "process";

interface metaData {
  name: string;
  description: string;
  image: string;
  external_url: string;
  attributes: any[];
}

async function main() {
  let index = 0;
  fs.readdirSync("./images/").forEach((file) => {
    let json: metaData;
    json = {
      name: "Token #" + index,
      description: "Description",
      external_url: "",
      image:
        "ipfs://bafybeih2upxi6xczw2tvmcv7x2zlkxkbxaeqs7dzonnpknuigyxojng3qu/" +
        file.toString(),
      attributes: [
        {
          trait_type: "Base",
          value: "Grass",
        },
      ],
    };

    fs.writeFileSync("./metadata/" + index + ".json", JSON.stringify(json));
    index++;
    console.log(file);
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

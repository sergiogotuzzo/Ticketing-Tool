const fs = require("fs");

function getFiles(path) {
  return fs
    .readdirSync(path)
    .map((file) =>
      fs.lstatSync(`${path}/${file}`).isDirectory()
        ? getFiles(`${path}/${file}`)
        : require(`${path}/${file}`)
    )
    .flat();
}

module.exports = {
  getFiles,
};

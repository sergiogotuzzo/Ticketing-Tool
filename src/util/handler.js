const fs = require("fs");

/**
 * SUBSCRIBES TU GIULIO AND CODE (https://www.youtube.com/@GiulioAndBasta)
 */
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

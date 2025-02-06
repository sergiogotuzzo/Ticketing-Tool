const fs = require("fs");

function getFiles(path) {
  let files = [];

  for (const filePath of fs.readdirSync(path)) {
    const file = require(`${path}/${filePath}`);

    files.push(file);
  }

  return files;
}

module.exports = {
  getFiles,
};

const fs = require('fs');
const path = require('path');

function printFileInfo(file) {
  fs.stat(path.join(file.path, file.name), (err, stats) => {
    if (err) {
      console.err(err.message);
    } else {
      const parsedName = path.parse(file.name);
      const fileName = parsedName.name;
      const fileExt = parsedName.ext.slice(1);
      const fileSize = stats.size / 1000; // Metric units
      console.log(`${fileName} - ${fileExt} - ${fileSize}kb`);
    }
  });
}

fs.readdir(
  path.join(__dirname, 'secret-folder'),
  { withFileTypes: true },
  (err, files) => {
    if (err) {
      console.error(err);
    } else {
      files.forEach((file) => {
        if (file.isFile()) {
          printFileInfo(file);
        }
      });
    }
  },
);

const fs = require('fs');
const path = require('path');

const readFileStream = fs.createReadStream(
  path.join(__dirname, 'text.txt'),
  'utf8',
);

let fileContent = '';
readFileStream.on('data', (chunk) => {
  fileContent += chunk;
});

readFileStream.on('end', () => {
  console.log(fileContent);
});

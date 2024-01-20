const fs = require('fs');
const path = require('path');
const { stdin } = require('process');

console.log("Hi! Write you message here and it'll be saved in text.txt:");

const fileWrite = fs.createWriteStream(
  path.join(__dirname, 'text.txt'),
  'utf8',
);

process.on('SIGINT', () => {
  console.log('\nSucess! Your message have been saved in text.txt \n');
  process.exit();
});

stdin.on('data', (chunk) => {
  if (chunk.toString().trim() === 'exit') {
    process.emit('SIGINT');
  } else {
    fileWrite.write(chunk);
  }
});

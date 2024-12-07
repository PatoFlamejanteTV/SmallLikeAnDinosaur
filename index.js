/*back-end system that, dynamically, makes a homepage with a clickable list of .txt files on parts/ (folder), when clicking, the .txt files will display together with an style.css and script.js*/

const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();

//app.use(express.static('public'));

app.get('/', (req, res) => {
  const files = fs.readdirSync(path.join(__dirname, 'parts'));
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>SmallLikeAnDinosaur</title>
      <link rel="stylesheet" href="style.css">
    </head>
    <body>
      <h1>SmallLikeAnDinosaur</h1>
      <ul>
        ${files.map(file => `<li><a href="/${file}">${file}</a></li>`).join('')}
      </ul>
      <div id="content"></div>
      <script src="script.js"></script>
    </body>
    </html>
  `;
  res.send(html);
});

app.get('/:file', (req, res) => {
  const file = req.params.file;
  let content = fs.readFileSync(path.join(__dirname, 'parts', file), 'utf8');
  content = content.replace(/\n/g, '<br>'); // Replace newlines with <br> tags
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${file}</title>
      <link rel="stylesheet" href="style.css">
    </head>
    <body>
      <h1>${file}</h1>
      <div id="content">${content}</div>
      <script src="script.js"></script>
    </body>
    </html>
  `;
  res.send(html);
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
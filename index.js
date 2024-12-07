const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();

// Servindo arquivos estáticos diretamente da raiz do projeto
app.use(express.static(path.join(__dirname)));

// Página inicial
app.get('/', (req, res) => {
  const files = fs.readdirSync(path.join(__dirname, 'parts'));
  const fileData = files.map(file => {
    const filePath = path.join(__dirname, 'parts', file);
    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(2); // Size in KB, rounded to 2 decimal places
    const fileM = stats.mtime
    return { file, sizeKB, fileM };
  });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>SmallLikeAnDinosaur</title>
      <link rel="stylesheet" href="style.css">
    </head>
    <body>
      <h1>SmallLikeAnDinosaur</h1>
      <p>Imagine um lugar misterioso, um lugar de baixo da terra, conectado por um indivíduo capaz de virar um gato e atrair pessoas para sua dimensão, este é o conceito-chave de SLAD.</p>
      <ul>
        ${fileData.map(({ file, sizeKB, fileM }) => `<li><a href="/${file}">${file} (${sizeKB} KB) <br></a><small>[LAST MOD.: ${fileM}]</small></li>`).join('')}
      </ul>
      <div id="content"></div>
      <script src="script.js"></script>
    </body>
    </html>
  `;
  res.send(html);
});

// Exibir conteúdo dos arquivos .txt
app.get('/:file', (req, res) => {
  const file = req.params.file;
  const filePath = path.join(__dirname, 'parts', file);

  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/\n/g, '<br>'); // Substitui quebras de linha por <br>

    const files = fs.readdirSync(path.join(__dirname, 'parts'));
    const currentFileIndex = files.indexOf(file);
    const previousFile = files[currentFileIndex - 1];
    const nextFile = files[currentFileIndex + 1];

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
        ${previousFile ? `<button id="backButton" onclick="window.location.href='/${previousFile}'">Back</button>` : ''}
        ${nextFile ? `<button id="nextButton" onclick="window.location.href='/${nextFile}'">Next</button>` : ''}
        <button id="homeButton" onclick="window.location.href='/'">Home</button>
      </body>
      </html>
    `;
    res.send(html);
  } else {
    res.status(404).send('File not found');
  }
});

// Inicializar o servidor
app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// In-memory cache to store request counts
const requestCache = {};

// Request limit per minute
const MAX_REQUESTS_PER_MINUTE = 30;

// Middleware to track and enforce request limits
app.use((req, res, next) => {
  const ipAddress = req.ip; 

  if (!requestCache[ipAddress]) {
    requestCache[ipAddress] = {
      lastRequestTime: new Date(),
      requestCount: 0
    };
  }

  const timeSinceLastRequest = (new Date() - requestCache[ipAddress].lastRequestTime) / 1000; 

  requestCache[ipAddress].requestCount++;
  requestCache[ipAddress].lastRequestTime = new Date();

  if (requestCache[ipAddress].requestCount > MAX_REQUESTS_PER_MINUTE && timeSinceLastRequest < 60) {
    return res.status(429).send('Too many requests. Go make DoS another day.');
  }

  next(); 
});

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
        ${fileData.map(({ file, sizeKB, fileM }) => `<li><a href="/${file}">${file} (${sizeKB} KB) <br></a><small><a>[LAST MOD.: ${fileM}]</a></small></li>`).join('')}
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
    content = content.replace(/\n/g, '<br>'); 
    content = content.replace(/\{([^}]+)\}/g, '<img src="images/$1.jpg">');


    const files = fs.readdirSync(path.join(__dirname, 'parts'));
    const orderFile = path.join(__dirname, 'parts', 'order.json');
    const order = JSON.parse(fs.readFileSync(orderFile, 'utf8'));

    const sortedFiles = files.sort((a, b) => {
      return order[a] - order[b];
    });

    const currentFileIndex = sortedFiles.indexOf(file);
    const previousFile = sortedFiles[currentFileIndex - 1];
    const nextFile = sortedFiles[currentFileIndex + 1];

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${file}</title>
        <link rel="stylesheet" href="style.css">
      </head>
      <body>
        <h1>${file}</h1>
        <div id="content"><a>${content}</a></div>
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
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
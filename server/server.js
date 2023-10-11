import http from 'node:http';
import path from 'node:path';
import url from 'node:url';
import fs from 'fs-extra';
import {WebSocketServer} from 'ws';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const baseDir = path.resolve(__dirname, '..');
const clientDir = path.join(baseDir, 'client');

const extensions = {
  html: {
    encoding: 'utf-8',
    contentType: 'text/html',
  },
  css: {
    encoding: 'utf-8',
    contentType: 'text/css',
  },
  js: {
    encoding: 'utf-8',
    contentType: 'text/javascript',
  },
  jpg: {
    encoding: null,
    contentType: 'image/jpeg',
  },
  mp3: {
    encoding: null,
    contentType: 'audio/mpeg',
  },
};

// this recursively reads a client directory, and returns an
// array of {path, encoding, contentType, content}, where `path` is relative
// to the clientDir.
const readClientTree = relPath => {
  const dirents = fs.readdirSync(
    path.join(clientDir, relPath),
    { withFileTypes: true }
  );
  const files = [];
  dirents.forEach(dirent => {
    const newPath = path.join(relPath, dirent.name);
    if (dirent.isFile()) {
      const ext = path.extname(dirent.name).slice(1);
      const content = fs.readFileSync(
        path.join(clientDir, newPath),
        extensions[ext].encoding
      );

      files.push({
        path: newPath,
        ...extensions[ext],
        content,
      });
    }
    else if (dirent.isDirectory()) {
      files.push(...readClientTree(newPath));
    }
  });
  return files;
};


const defaults = {
  host: 'localhost',
  port: 8088,
};

export const Server = opts => {
  const {host, port} = {...defaults, ...opts};

  const clientFiles = readClientTree('');
  console.log(
    'clientFiles:\n' +
    clientFiles.map(cf => `  ${cf.path}`).join('\n')
  );

  const reqHandler = (req, res) => {
    if (req.method === 'GET') {
      const relPath = (req.url === '/' ? '/index.html' : req.url)
        .slice(1)
        .replace(/\//g, '\\');
      console.log(`GET ${relPath}`);

      const file = clientFiles.find(
        cf => cf.path === relPath
      );
      if (file) {
        res.writeHead(200, { 'Content-Type': file.contentType });
        res.write(file.content);
        res.end();
      }
    }
  };

  const server = http.createServer(reqHandler);
  const wss = new WebSocketServer({server});

  wss.on('connection', function connection(ws) {
    ws.on('error', console.error);
    ws.on('message', function message(data) {
      console.log('received: %s', data);
    });
    ws.send('something');
  });

  server.listen(port, host, () => {
    console.log(`Server started on host ${host}:${port}`);
  });
  return {
    server, wss,
  };
};

export default Server;
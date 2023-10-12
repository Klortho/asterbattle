import http from 'node:http';
import path from 'node:path';
import fs from 'fs-extra';
import {extensions} from './file-types.js';

// this recursively reads a directory tree, storing all of the files'
// contents in memory. It returns an
// array of {path, encoding, contentType, content}, where `path` is relative
// to the clientDir.
export const readTree = root => {
  const _readTree = relPath => {
    const absPath = path.join(root, relPath);
    const dirents = fs.readdirSync(absPath, { withFileTypes: true });
    const files = [];
    dirents.forEach(dirent => {
      const newRelPath = path.join(relPath, dirent.name);
      const newAbsPath = path.join(absPath, dirent.name);
      if (dirent.isFile()) {
        const ext = path.extname(dirent.name).slice(1);
        if (!extensions[ext]) {
          console.warn(`Client file found of unknown type '${newPath}'`);
        }
        else {
          const content = fs.readFileSync(
            newAbsPath,
            extensions[ext].encoding
          );
          files.push({
            path: newRelPath,
            ...extensions[ext],
            content,
          });
        }
      }
      else if (dirent.isDirectory()) {
        files.push(..._readTree(newRelPath));
      }
    });
    return files;
  };
  const tree = _readTree('');
  tree.byPath = Object.fromEntries(
    tree.map(cf => [cf.path, cf])
  );
  return tree;
};

export const StaticServer = (root, overrides=[]) => {
  const staticFiles = readTree(root);
  //console.log('Static files:\n  ' + staticFiles.map(sf => sf.path).join('\n  '));
  const reqHandler = (req, res) => {
    const route = overrides.find(ov => ov.match(req));
    if (route) {
      return route.handler(req, res);
    }
    else if (req.method === 'GET') {
      const relPath = (req.url === '/' ? '/index.html' : req.url)
        .slice(1)
        .replace(/\//g, '\\');
      const file = staticFiles.find(
        cf => cf.path === relPath
      );
      if (file) {
        res.writeHead(200, { 'Content-Type': file.contentType });
        res.write(file.content);
        res.end();
      }
      else {
        console.log(`Couldn't find ${relPath}`);
        res.statusCode = 404;
        res.end();
      }
    }
  };

  const server = http.createServer(reqHandler);
  return server;
};

export default StaticServer;

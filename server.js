const dotenv = require('dotenv')
const express = require('express');
const app = express();
const proxy = require('http-proxy-middleware');


console.log(' ____');
console.log('/  __\\');
console.log('|: /---)  \\    /   ___');
console.log('\\:( _/    \\  /   /_  \\');
console.log('\\  \\      \\/    \\_\\::)');
console.log('  \\_ \\   _0""0_   / _/');
console.log('    \\ \\/=  \\/  =\\/ /');
console.log('     \\ |  (||)  | /');
console.log('      \\_\\______/_/');
console.log('      __//    \\\\__');
console.log('     /__//====\\\\__\\');
console.log('  _ //__//====\\\\__\\\\ _');
console.log('  _ //__//====\\\\__\\\\ _');
console.log('  _ //   /(  )\\   \\\\ _');
console.log('  _ /    /(  )\\    \\ _');
console.log('         |(  )|');
console.log('         /    \\');
console.log('        / /||\\ \\');
console.log('        \\:_/\\_:/ ');
console.log(' ');

const result = dotenv.config();
if (result.error) {
  console.log('Lagosta needs a .env file with the properties PROXY_BASE_URL and SERVE_FOLDER set to function properly.');
  process.exit(0);
} else {
  app.use(express.static(process.env.SERVE_FOLDER ? process.env.SERVE_FOLDER : 'dist'));
  const krillBase = process.env.PROXY_BASE_URL ? process.env.PROXY_BASE_URL : 'https://localhost:3000';

  const proxyConf = {
    target: krillBase,
    changeOrigin: true,
    secure: false,
    logLevel: 'debug'
  };

  app.use('/api', proxy(proxyConf));
  app.use('/auth', proxy(proxyConf));
  app.use('/stats', proxy(proxyConf));

  app.get('/', (req, res) => {
    res.send('Lagosta should be running by now. If not, shrimp happens.');
  });

  app.listen(3003, () => console.log('Lagosta is listening on port 8081!'));
}



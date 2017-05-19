require('json5/lib/require');

const
  Configstore = require('configstore'),
  defaultConfig = require('./../config/default.json5'),
  config = new Configstore('cloud9-launcher', defaultConfig);

console.log('default configure: ', config.all);
console.log('Please change this in ~/.config/configstore/cloud9-launcher.json');

process.exit();

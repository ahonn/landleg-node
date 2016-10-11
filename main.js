#!/usr/bin/env node

var fs = require('fs');
var os = require('os');
var md5 = require('md5');
var yaml = require('js-yaml');
var readlineSync = require('readline-sync');
var superagent = require('superagent');
var program = require('commander');
var userHome = require('user-home');

program
  .version('1.0.0')
  .usage(['[options]'])
  .option('-i, --login [username@password]', '登录用户账号')
  .option('-o, --logout', '注销账号登录')
  .parse(process.argv);

var LOGIN_URL = 'http://enet.10000.gd.cn:10001/client/login';
var LOGOUT_URL = 'http://enet.10000.gd.cn:10001/client/logout';
var ACTIVE_URL = 'http://enet.10000.gd.cn:8001/hbservice/client/active?';
var SECRET = 'Eshore!@#';

var client_ip = getClient('ip');
var client_mac = getClient('mac');

console.log('=============================');
console.log('地腿 For Node.js By Ahonn')
console.log('=============================');
console.log('IP: ' + client_ip);
console.log('MAC: ' + client_mac);
console.log('=============================');

var config = {
  username: '',
  password: '',
  wifi: '4060',
  nasip: '219.128.230.1'
}
if (!fs.existsSync(`${userHome}/landleg.yml`) || program.login) {
  try {
    if (program.login === true || program.login === undefined) {
      config.username = readlineSync.question('username: ');
      config.password = readlineSync.question('password: ');
    } else {
      config.username = program.login.split('@')[0];
      config.password = program.login.split('@')[1];
    }
  } catch (err) {
    console.log(err);
    console.log('请使用 landleg --login [username@password]');
  }

  fs.writeFileSync(`${userHome}/landleg.yml`, yaml.safeDump(config), 'utf8'); 
} else {
  config = yaml.safeLoad(fs.readFileSync(`${userHome}/landleg.yml`, 'utf8'));
}
var wifi = config.wifi;
var nasip = config.nasip;

function getClient(type) {
  var ip, mac;
  var ifaces = os.networkInterfaces();
  Object.keys(ifaces).forEach(function (ifname) {
    ifaces[ifname].forEach(function (iface) {
      if (iface.family === 'IPv4' && iface.address.split('.')[0] == '10' && !ip) {
        ip = iface.address;
        mac = iface.mac;
      }
    });
  });
  return type === 'ip' ? ip : mac;
}

function keepActive(callback) {
  var timestamp = (new Date()).getTime();
  var authenticator = md5(client_ip + nasip + client_mac + timestamp + SECRET).toUpperCase();
  
  var params = {
    username: config.username,
    clientip: client_ip,
    nasip: nasip,
    mac: client_mac,
    timestamp: timestamp,
    authenticator: authenticator,
  };
  var params_str = Object.keys(params).map(function (prop) {
    return [prop, params[prop]].join('=');
  }).join('&'); 
  var url = ACTIVE_URL + params_str;

  superagent
    .get(url)
    .end(function (err, res) {
      if (res.ok) {
        callback(res.body);
      }
    })
};

function login(callback) {
  var timestamp = (new Date()).getTime();
  var authenticator = md5(client_ip + nasip + client_mac + timestamp + SECRET).toUpperCase();

  var params = {
    username: config.username,
    password: config.password,
    verificationcode: '',
    clientip: client_ip,
    nasip: nasip,
    mac: client_mac,
    iswifi: wifi,
    timestamp: timestamp,
    authenticator: authenticator
  };
  superagent
    .post(LOGIN_URL)
    .send(params)
    .end(function (err, res) {
      if (res.ok) {
        callback(res.body);
      }
    })
}

function logout(callback) {
  var timestamp = (new Date()).getTime();
  var authenticator = md5(client_ip + nasip + client_mac + timestamp + SECRET).toUpperCase();

  var params = {
    clientip: client_ip,
    nasip: nasip,
    mac: client_mac,
    timestamp: timestamp,
    authenticator: authenticator
  };

  superagent
    .post(LOGOUT_URL)
    .send(params)
    .end(function (err, res) {
      if (res.ok) {
        callback(res.body);
      }
    })
}


if (!program.logout) {
  try {
    var keepLoginActive = function () {
      keepActive(function (res) {
        console.log(`${(new Date()).toLocaleString()} ${res.resinfo}`);
        if (res.rescode === '1') {
          login(function () {
            console.log(`${(new Date()).toLocaleString()} 登录中 ...`);
            setTimeout(keepLoginActive, 1000);
          })
        }
        setTimeout(keepLoginActive, 120000);
      })
    };
    keepLoginActive();
  } catch (err) {
    console.error(err);
    keepLoginActive();
  }
} else {
  keepActive(function (res) {
    console.log(`${(new Date()).toLocaleString()} ${res.resinfo}`);
    var activeStatus = function () {
      keepActive(function (res) {
        console.log(`${(new Date()).toLocaleString()} ${res.resinfo}`);
      })
    };
    if (res.rescode === '0') {
      logout(function () {
        console.log(`${(new Date()).toLocaleString()} 注销中 ...`);
        setTimeout(activeStatus, 1000);
      })
    }
  })
}
#!/usr/bin/env node

var fs = require('fs');
var os = require('os');
var md5 = require('md5');
var yaml = require('js-yaml');
var readlineSync = require('readline-sync');
var superagent = require('superagent');

var LOGIN_URL = 'http://enet.10000.gd.cn:10001/client/login';
var LOGOUT_URL = 'http://enet.10000.gd.cn:10001/client/logout';
var ACTIVE_URL = 'http://enet.10000.gd.cn:8001/hbservice/client/active?';
var SECRET = 'Eshore!@#';

var client_ip = getClient('ip');
var client_mac = getClient('mac');

var config = {
  username: '',
  password: '',
  wifi: '4060',
  nasip: '219.128.230.1'
}
if (!fs.existsSync('./config.yml')) {
  config.username = readlineSync.question('username: ');
  config.password = readlineSync.question('password: ');
  fs.writeFileSync('./config.yml', yaml.safeDump(config), 'utf8');
} else {
  config = yaml.safeLoad(fs.readFileSync('./config.yml', 'utf8'));
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

function checkActive(callback) {
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
      callback(res.body);
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
      callback(res.body);
    })
}

logout(function (result) {
  console.log(result);
  checkActive(function (result) {
    console.log(result);
  })
})
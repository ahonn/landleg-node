'use strict';

var fs   = require('fs');
var yaml = require('js-yaml');
var md5 = require('md5');
var superagent = require('superagent');

var utils = require('./utils.js');

var MAIN_URL = 'http://enet.10000.gd.cn:10001/client/';
var LOGIN_URL = MAIN_URL + 'login';
var ACTIVE_URL = 'http://enet.10000.gd.cn:8001/hbservice/client/active?';
var SECRET = 'Eshore!@#';

var client_ip = utils.getClient('ip');
var client_mac = utils.getClient('mac');
var wifi_port = '4060';

var config = yaml.safeLoad(fs.readFileSync('./config.yml', 'utf8'));
var username = config.username;
var password = config.password;
var nasip = config.nasip;

function checkActive(callback) {
  var timestamp = (new Date()).getTime();
  var authenticator = md5(client_ip + nasip + client_mac + timestamp + SECRET).toUpperCase();
  
  var params = {
    username: username,
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
    username: username,
    password: password,
    verificationcode: '',
    clientip: client_ip,
    nasip: nasip,
    mac: client_mac,
    iswifi: wifi_port,
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

login(function (result) {
  console.log(result);
})
checkActive(function (result) {
  console.log(result);
})
























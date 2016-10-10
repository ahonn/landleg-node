'use strict';

var os = require('os');

exports.getClient = function (type) {
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
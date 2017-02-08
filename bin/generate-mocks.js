#!/usr/bin/env node

var faker = require('faker');
var fs = require('fs');

var logtypes = ['Logtype 1', 'Logtype 2', 'Logtype 3', 'Logtype 4'];
var usernames = loadUsernames(15);
var ports = [80, 80, 80, 80, 443, 443, 443, 443, 22, 25, 25, 143, 143, 143];
var srcIps = loadIps(15);
var dstIps = loadIps(4500);
var protocols = ['UDP', 'TCP'];
var actions = ['A', 'D'];
var sensorIds = [1, 2, 3, 4, 5];
var defaultData = {
  logtypes: logtypes,
  usernames: usernames,
  ports: ports,
  srcIps: srcIps,
  dstIps: dstIps,
  protocols: protocols,
  actions: actions,
  sensorIds: sensorIds,
};

function loadUsernames(max) {
  let usernames = [];
  for (var i = 0; i < max; i++) {
    usernames.push(faker.name.lastName() + '.' + faker.name.firstName());
  }

  return usernames;
}

function loadIps(max) {
  let ips = [];
  for (var i = 0; i < max; i++) {
    ips.push(faker.internet.ip());
  }

  return ips;
}

var json = JSON.stringify(defaultData);

fs.writeFile(__dirname + '/../config/mocks.json', json, (err) => {
  if (err) throw err;
  console.log('It\'s saved!');
});

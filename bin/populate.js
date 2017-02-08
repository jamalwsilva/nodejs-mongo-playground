#!/usr/bin/env node

const cp = require('child_process');
const config = require('../config/config.js');

var runned = 0;

for (var i = 0; i < config.MAX_PROCESSES; i++) {
  runNext();
}

function runNext() {
  if (runned++ < config.NU_ITERATIONS) {
    var current = cp.fork(__dirname + '/do-populate-db.js');
    console.log(current.pid + ': running process step ' + runned + ' from ' + config.NU_ITERATIONS);
    current.on('exit', function () {
      runNext();
    });
  }
}

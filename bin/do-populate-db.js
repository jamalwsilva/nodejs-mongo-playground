#!/usr/bin/env node

var faker = require('faker');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/logs';

var config = require(__dirname + '/../config/config.js');
var mocks = require(__dirname + '/../config/mocks.json');

var BULK_SIZE = config.BULK_SIZE;
var MAX_INSERTS_PER_PROCESS = config.MAX_INSERTS_PER_PROCESS;

function log(message) {
  console.log(process.pid + ': ' + message);
}

function getDoc() {
  var port = faker.random.arrayElement(mocks.ports);
  var doc = {
      date: new Date(),
      logtype: faker.random.arrayElement(mocks.logtypes),
      protocol: faker.random.arrayElement(mocks.protocols),
      action: faker.random.arrayElement(mocks.actions),
      sensor_id: faker.random.arrayElement(mocks.sensorIds),
      username: faker.random.arrayElement(mocks.usernames),
      src_ip: faker.random.arrayElement(mocks.srcIps),
      src_port: port,
      dst_ip: faker.random.arrayElement(mocks.dstIps),
      dst_port: port,
    };

  doc.full_message = 'Firewall ' + Object.keys(doc).map(field => doc[field]).join(' ');

  return doc;
}

function getDocs() {
  var documents = [];
  for (var i = 0; i < BULK_SIZE; i++) {
    documents.push(getDoc());
  }

  return documents;
}

function populateDb() {
  var begin = 0;
  var end = 0;
  var total = MAX_INSERTS_PER_PROCESS;

  var promise = new Promise(function (resolve) {
    insertBulk(0);

    function insertBulk(bulk) {
      begin = (bulk * BULK_SIZE);
      end = ((bulk + 1) * BULK_SIZE);
      log('creating documents from ' + begin + ' to ' + end + ' of ' + total);
      doInsert().then(function () {
        if (++bulk < config.NU_BULKS_PER_PROCESS) {
          insertBulk(bulk);
          return;
        }

        resolve('finished mongo populate');
      });
    }
  });

  return promise;
}

function doInsert() {
  var documents = getDocs();
  var collectionNames = config.COLLECTION_NAMES;
  var current = 0;

  var promise = new Promise(function (resolve) {
    MongoClient.connect(url, function (err, db) {
      assert.equal(null, err);
      insertNext(collectionNames[current], db);
    });

    function insertNext(collectionName, db) {
      var collection = db.collection(collectionName);
      collection.insertMany(documents).then(function () {
        var nextCollection = collectionNames[++current];
        if (nextCollection) {
          insertNext(nextCollection, db);
          return;
        }

        db.close();
        resolve('finished insertMany operations');
      });
    }
  });

  return promise;
}

populateDb().then(function () {
  log('finalizing process');
});

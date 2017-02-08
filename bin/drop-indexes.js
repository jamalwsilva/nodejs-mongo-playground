#!/usr/bin/env node

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var url = 'mongodb://localhost:27017/logs';
var config = require(__dirname + '/../config/config.js');

function dropIndexes(collectionName) {
  MongoClient.connect(url, function (err, db) {
    assert.equal(null, err);
    doDropIndexes(collectionName, db);
  });
}

function doDropIndexes(collectionName, db) {
  var messages = db.collection(collectionName);
  var indexes = config.INDEXES_MAP[collectionName];
  var promises = indexes.map(function (index) {
    return messages.dropIndex(index.options.name);
  });

  Promise.all(promises).then(function () {
    db.close();
  });
}

config.COLLECTION_NAMES.forEach(dropIndexes);

#!/usr/bin/env node

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var url = 'mongodb://localhost:27017/logs';
var config = require(__dirname + '/../config/config.js');

function createIndexes(collectionName) {
  var indexes = config.INDEXES_MAP[collectionName];
  indexes.map(function (index) {
    MongoClient.connect(url, function (err, db) {
      assert.equal(null, err);
      var messages = db.collection(collectionName);
      var promise = messages.createIndex(index.fields, index.options);
      promise.then(function () {
        db.close();
      });
    });
  });
}

config.COLLECTION_NAMES.forEach(createIndexes);

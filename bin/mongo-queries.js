#!/usr/bin/env mongo

var conn = Mongo();
var logs = conn.getDB('logs');

var user = logs.messages_simple.find().limit(1).next();

Date.prototype.tojson = function () {
  return '"' + this.toISOString() + '"';
};

function getDateInterval(crop) {
  var earliest = logs.messages_simple.find().limit(1).next().date;
  var latest = logs.messages_simple.find().sort({ _id: -1 }).limit(1).next().date;
  var diff = latest.getTime() - earliest.getTime();
  var offset = Math.floor(diff * (1 - crop) / 2);

  var date0 = ISODate();
  date0.setTime(earliest.getTime() + offset);
  var date1 = ISODate();
  date1.setTime(latest.getTime() - offset);

  var dateInterval = {
    $gte: date0,
    $lt: date1,
  };
  return dateInterval;
}

function defaultQueries() {
  return [
    { logtype: 'Logtype 1', protocol: 'UDP' },
    { logtype: 'Logtype 1', action: 'A' },
    { logtype: 'Logtype 1', action: 'A', sensor_id: 1, username: user.username },
    { logtype: 'Logtype 1', action: 'A', src_port: 443 },
    { logtype: 'Logtype 1', sensor_id: 1 },
    { logtype: 'Logtype 1', username: user.username },
    { logtype: 'Logtype 1', sensor_id: 1, username: user.username },
    { logtype: 'Logtype 1', protocol: 'UDP', sensor_id: 1, username: user.username },
    {
      logtype: 'Logtype 1',
      action: 'A',
      src_ip: '254.103.224.14',
      dst_ip: '31.79.133.128',
      src_port: 22,
    },
    {
      date: { $gte: ISODate('2016-02-14T07:33'), $lt: ISODate('2016-02-14T08:33') },
      logtype: 'Logtype 1', action: 'A', src_port: 443,
    },
    {
      full_message: /Logtype 3/,
    },
    {
      $text: { $search: 'Logtype 3' },
    },
  ];
}

var dateIntervalShorter = getDateInterval(1 / 6);
var dateIntervalShort = getDateInterval(1 / 3);
var dateIntervalHalf = getDateInterval(1 / 2);
var dateIntervalLong = getDateInterval(2 / 3);
var dateIntervalLonger = getDateInterval(5 / 6);
var intervals = [
  dateIntervalShorter,
  dateIntervalShort,
  dateIntervalHalf,
  dateIntervalLong,
  dateIntervalLonger,
];
var queries = [];

intervals.forEach(function (interval) {
  defaultQueries().forEach(function (query) {
    query.date = interval;
    queries.push(query);
  });
});

var results = logs.getCollectionNames()
  .filter(coll => coll.match(/^messages_/))
  .map(function (coll) {
    return {
      collection: coll,
      queries: queries.map(function (query) {
        var begin = new ISODate();
        var count = logs[coll].find(query).count();
        var end = new ISODate();
        return {
          collection: coll,
          query: query,
          count: count,
          duration: (end.getTime() - begin.getTime()) / 1000,
        };
      }),
    };
  });

results.forEach(printjsononeline);

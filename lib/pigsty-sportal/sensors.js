var debug = require('debug')('pigsty-sportal');

function Sensor(options) {
  var self = this;
  options = options || {}
  self.db = options.db;
  self.sid = 0;
  self.cid = 0;
};

function Sensors(options) {
  var self = this;
  self.db = options.db;
  self.locked = false; // ghettolock 
  self.sensors = {};
};

Sensor.prototype.lookup = function(sensor, callback) {
  var self = this;

  if (self.err) {
    return callback(err);
  };

  if (!sensor) {
    return callback("No sensor provided");
  };

  if (!sensor.name) {
    return callback("No sensor name provided");
  }

  sensor.interface = sensor.interface || "";
  sensor.filter = sensor.filter || null;
  sensor.name = sensor.name || ""; 
  sensor.encoding = sensor.encoding || null;
  sensor.detail = sensor.detail || null;

  var query = 'select sid from sensor where \
  hostname = ? and interface = COALESCE(?, interface) \
  and COALESCE(filter, -1) = COALESCE(?, filter, -1) \
  and COALESCE(encoding, -1) = COALESCE(?, encoding, -1) \
  and COALESCE(detail, -1) = COALESCE(?, detail, -1) \
  LIMIT 1';
  
  var params = [ sensor.name, sensor.interface, sensor.filter,
  sensor.encoding, sensor.detail ];

  self.pool.query(query, params, function(error, results, fields) {
  	if (error) {
  		return callback(error);
  	}

  	var sensor = results[0];

  	if (sensor) {
      self.err = null;
      self.sid = sensor.sid; 
      return callback(null, sensor) ;
    }

    var query = 'insert into sensor (hostname, interface, \
    filter, encoding, detail) values (?,?,?,?,?)';

    self.pool.query(query, params, function (error, results, fields) {
    	self.sid = result.insertId;
    	callback(error, result);
    });
  });
}

Sensor.prototype.increment_cid = function() {
  var self = this;
  self.cid += 1;
  return self.cid;
}

module.exports = Sensors;
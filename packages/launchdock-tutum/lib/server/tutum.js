
Tutum = function Tutum (username, token) {
  this.username = username || Settings.get('tutumUsername');
  this.token = token || Settings.get('tutumToken');
  this.apiBaseUrl = "https://dashboard.tutum.co";
  this.apiFullUrl = this.apiBaseUrl + "/api/v1/";
  this.loadBalancerUri = "/api/v1/service/56507358-5b58-4f33-a605-44d652dca9b6/";

  this.checkCredentials = function () {
    if (!this.username || !this.token) {
      throw new Meteor.Error("Missing Tutum API credentials.");
    }
  };
}


Tutum.prototype.create = function (resourceType, data) {
  return HTTP.call("POST", this.apiFullUrl + resourceType + "/", {
    headers: {
      "Authorization": "ApiKey " + this.username + ":" + this.token,
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    data: data
  });
};


Tutum.prototype.list = function (resourceType) {
  return HTTP.call("GET", this.apiFullUrl + resourceType + "/", {
    headers: {
      "Authorization": "ApiKey " + this.username + ":" + this.token,
      "Accept": "application/json"
    }
  });
};


Tutum.prototype.get = function (resourceUri) {
  return HTTP.call("GET", this.apiBaseUrl + resourceUri, {
    headers: {
      "Authorization": "ApiKey " + this.username + ":" + this.token,
      "Accept": "application/json"
    }
  });
};


Tutum.prototype.update = function (resourceUri, data) {
  return HTTP.call("PATCH", this.apiBaseUrl + resourceUri, {
    headers: {
      "Authorization": "ApiKey " + this.username + ":" + this.token,
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    data: data
  });
};


Tutum.prototype.start = function (resourceUri) {
  return HTTP.call("POST", this.apiBaseUrl + resourceUri + "start/", {
    headers: {
      "Authorization": "ApiKey " + this.username + ":" + this.token,
      "Accept": "application/json"
    }
  });
};


Tutum.prototype.stop = function (resourceUri) {
  return HTTP.call("POST", this.apiBaseUrl + resourceUri + "stop/", {
    headers: {
      "Authorization": "ApiKey " + this.username + ":" + this.token,
      "Accept": "application/json"
    }
  });
};


Tutum.prototype.redeploy = function (resourceUri) {
  return HTTP.call("POST", this.apiBaseUrl + resourceUri + "redeploy/", {
    headers: {
      "Authorization": "ApiKey " + this.username + ":" + this.token,
      "Accept": "application/json"
    }
  });
};


Tutum.prototype.delete = function (resourceUri) {
  return HTTP.call("DELETE", this.apiBaseUrl + resourceUri, {
    headers: {
      "Authorization": "ApiKey " + this.username + ":" + this.token,
      "Accept": "application/json"
    }
  });
};


Tutum.prototype.logs = function (containerUuid, callback) {
  var url = 'wss://stream.tutum.co/v1/container/' + containerUuid +
            '/logs/?user=' + this.username + '&token=' + this.token;

  var WebSocket = Npm.require('ws');
  var socket = new WebSocket(url);

  socket.on('open', function() {
    console.log('Listening to Tutum container logs...');
  });

  socket.on('message', Meteor.bindEnvironment(function(messageStr) {
    var msg = JSON.parse(messageStr);

    if (_.isFunction(callback)) {
      callback(null, msg, socket);
    } else {
      console.log(msg.log);
    }
  }));

  socket.on('error', function(e) {
    console.error(e);
    callback(e);
  });

  socket.on('close', function() {
    console.log('Tutum container logs stopped');
  });
}


Tutum.prototype.addLinkToLoadBalancer = function (linkedServiceName, linkedServiceUri) {
  if (!linkedServiceUri || !linkedServiceName) {
    throw new Meteor.Error("Tutum.addLinkToLoadBalancer: Missing balancer details.");
  }

  // Query the chosen load balancer to get the currently linked services
  try {
    var lb = this.get(this.loadBalancerUri);
  } catch (e) {
    return e;
  }
  var currentLinks = lb.data.linked_to_service;

  // Build the new link
  var newLink = {
    "name": linkedServiceName,
    "to_service": linkedServiceUri
  };

  // Add new link to existing links
  currentLinks.push(newLink)

  // Update the load balancer
  return HTTP.call("PATCH", this.apiBaseUrl + this.loadBalancerUri, {
    headers: {
      "Authorization": "ApiKey " + this.username + ":" + this.token,
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    data: {
      "linked_to_service": currentLinks
    }
  });
};


Tutum.prototype.reloadLoadBalancers = function () {

  // Query the load balancer service to get the currently running containers
  try {
    var lb = this.get(this.loadBalancerUri);
  } catch (e) {
    throw new Meteor.Error(e);
  }

  lbContainers = lb.data.containers;

  var self = this;

  console.log("Redeploying 1st load balancer...");
  try {
    self.redeploy(lbContainers[0]);
  } catch (e) {
    throw new Meteor.Error(e);
  }

  Meteor.setTimeout(function() {
    console.log("Redeploying 2nd load balancer...");
    try {
      self.redeploy(lbContainers[1]);
    } catch (e) {
      throw new Meteor.Error(e);
    }
  }, 8000);
};


Tutum.prototype.updateStackServices = function (services) {
  var self = this;

  _.each(services, function (service_uri) {
    try {
      var service = self.get(service_uri);
    } catch(e) {
      return e;
    }
    Services.update({ uri: service_uri }, {
      $set: {
        name: service.data.name,
        uuid: service.data.uuid,
        imageName: service.data.image_name,
        stack: service.data.stack,
        state: service.data.state,
        tags: service.data.tags,
        uri: service_uri
      }
    }, {
      upsert: true
    });
  });
}


Tutum.prototype.updateEnvVars = function (serviceUri, newEnvVars) {
  if (!serviceUri || !newEnvVars) {
    throw new Meteor.Error("Tutum.updateEnvVars: Missing args.");
  }

  // Query the service to get the current env vars
  try {
    var service = this.get(serviceUri);
  } catch (e) {
    throw new Meteor.Error(e);
  }
  var currentEnvVars = service.data.container_envvars;

  // Add new env vars
  var updatedEnvVars = currentEnvVars.concat(newEnvVars);

  // Update the service
  return HTTP.call("PATCH", this.apiBaseUrl + serviceUri, {
    headers: {
      "Authorization": "ApiKey " + this.username + ":" + this.token,
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    data: {
      "container_envvars": updatedEnvVars
    }
  });
};


Tutum.prototype.getServiceContainers = function (serviceUri) {
  try {
    var service = this.get(serviceUri);
    return service.data.containers;
  } catch(e) {
    return e;
  }
}


Tutum.prototype.checkMongoState = function (containerUuid, callback) {
  var command = 'bash /opt/mongo/status_check.sh';
  var url = 'wss://stream.tutum.co/v1/container/' + containerUuid +
            '/exec/?user=' + this.username + '&token=' + this.token +
            '&command=' + command;

  var WebSocket = Npm.require('ws');
  var socket = new WebSocket(url);

  socket.on('open', function() {
    console.log('Tutum shell websocket opened');
  });

  socket.on('message', Meteor.bindEnvironment(function(messageStr) {
    var msg = JSON.parse(messageStr);
    console.log("MONGO: ", msg.output);
    if (msg.output === 'Replica set is now accepting connections!') {
      callback(null, true);
    }
  }));

  socket.on('error', function(e) {
    console.error(e);
    callback(e);
  });

  socket.on('close', function() {
    console.log('Tutum shell websocket closed');
  });
}

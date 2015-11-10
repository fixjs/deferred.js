(function (g) {
  'use strict';
  var global = g();

  function moduleDefinition(isFunction) {
    var Promise = global.Promise;

    function use(_Promise_) {
      Promise = _Promise_;
    }

    function isPromiseAlike(obj) {
      return ((obj && typeof obj === 'object') || false) && isFunction(obj.then) || false;
    }

    function will(promise) {
      return {
        done: function (onFulfilled, onRejected) {
          var self = arguments.length ? promise.then.apply(promise, arguments) : promise;
          self.then(null, function (err) {
            setTimeout(function () {
              throw err;
            }, 0);
          });
        }
      };
    }

    function resolve(value, baseFulfill, baseReject, save) {
      var promise;
      if (isPromiseAlike(value)) {
        will(value).done(baseFulfill, baseReject);
        promise = value;
      } else {
        promise = new Promise(function (fulfill) {
          fulfill(value);
          baseFulfill(value);
        });
      }
      save(promise);
    }

    function reject(reason, baseReject, save) {
      save(new Promise(function (fulfill, reject) {
        reject(reason);
        baseReject(reason);
      }));
    }

    function defer() {
      var resolvedPromise,
        baseFulfill,
        baseReject,
        dfd = {},
        promise = new Promise(function (fulfill, reject) {
          baseFulfill = fulfill;
          baseReject = reject;
        });

      function save(newPromise) {
        resolvedPromise = newPromise;
        promise.source = newPromise;
      }
      dfd.promise = promise;
      dfd.resolve = function (value) {
        if (resolvedPromise) {
          return;
        }
        resolve(value, baseFulfill, baseReject, save);
      };
      dfd.reject = function (reason) {
        if (resolvedPromise) {
          return;
        }
        reject(reason, baseReject, save);
      };
      return dfd;
    }
    defer.use = use;
    return defer;
  }

  if (typeof exports === 'object') {
    module.exports = moduleDefinition(require('isfunc'));
  } else if (typeof define === 'function' && define.amd) {
    define(['../isfunc/index.js'], moduleDefinition);
  } else {
    if (typeof Function.isFunction !== 'function') {
      return console.log('deferred.js requires the fixjs/isFunction module');
    }
    global.deferred = moduleDefinition(Function.isFunction);
  }
}(function () {
  return this;
}));

'use strict';

var trie = require('trie-map');

var HANDLER_INDEX = 0;
var PARAMS_INDEX = 1;

//fastest way to clone an array
//http://stackoverflow.com/questions/3978492/javascript-fastest-way-to-duplicate-an-array-slice-vs-for-loop
function cloneArray(arr) {
  return arr.slice(0);
}

function parsePath(path) {
  const index = path.lastIndexOf('?');
  let queryStrings;
  if (index !== -1) {
    queryStrings = path.substring(index + 1)
                      .split('&')
                      .reduce((params, keyValue) => {
                        keyValue = keyValue.split('=');
                        params[keyValue[0]] = keyValue[1];
                        return params;
                      }, {});
    path = path.substring(0, index);
  }

  return {
    path,
    queryStrings
  };
}

function nodeHasStarEdge(node) {
  var edges = trie.getNodeEdges(node);
  var edge;

  if (edges.length === 1) {
    edge = edges[0];
    if (trie.getLabel(edges[0]) === '*') {
      return true;
    }
  }

  return false;
}

/**
 findPath

 returns an array with size of 2
  first item is value of node
  second item is params of path
*/
function findPath(node, path, captureMode) {
  var length = path.length,
      findNode,
      paramValue = '',
      params = [],
      star = false,
      allHandlers = captureMode ? [] : null,
      handler,
      i;

  for (i = 0; i < length; i++) {
    //check if star is false and current node has a edge star
    if (!star && nodeHasStarEdge(node)) {
      star = true;
    }

    //if star is valid it means that, we reached a param and we need to
    //store a param and push it to params array.
    if (star) {
      if (path[i] !== '/') {
        paramValue += path[i];
        continue;
      } else {
        params.push(paramValue);
        paramValue = '';
        star = false;
        node = trie.getNodeWithEdge('*', node);
      }
    }

    if (captureMode) {
      handler = trie.getNodeValue(node);
      if (handler) {
        allHandlers.push([handler, cloneArray(params)]);
      }
    }

    node = trie.getNodeWithEdge(path[i], node);

    if (!node) {
      return false;
    }
  }

  //we need this code to make sure that we are passing the last param as well
  if (star) {
    params.push(paramValue);
    node = trie.getNodeWithEdge('*', node);
  }

  if (captureMode) {
    handler = trie.getNodeValue(node);
    if (handler) {
      allHandlers.push([handler, params]);
    } else {
      return false;
    }
  }

  return captureMode? allHandlers : [trie.getNodeValue(node), params];
}

function addPath(root, path, func) {
  /*
    replace all :[a-zA-Z0-9]+\/ with *
    for example
      /users/:id => /users/*
      /users/:id/friends => /users/* /friends
   */
   var paramKeys = [];

   path = path.replace(/\:([a-zA-Z0-9]+)/g, function(match, p1){
     paramKeys.push(p1);
     return '*';
   }).split('');

   trie.setValue(root, path, function (paramValues, queryStrings, context) {
     var params = {},
         length = paramValues.length,
         i;

     for (i = 0; i < length; i++) {
       params[paramKeys[i]] = paramValues[i];
     }

     func(params, queryStrings, context);
   });
}

function process(root, path) {
  const parsedPath = parsePath(path);
  var route = findPath(root, parsedPath.path);
  var handler;
  if (route) {
    handler = route[HANDLER_INDEX];
    if (handler) {
      handler(route[PARAMS_INDEX], parsedPath.queryStrings);
      return null;
    }
  } else {
    return 'not found';
  }
}

function processAllHandlers(root, path) {
  const parsedPath = parsePath(path);
  var routes = findPath(root, parsedPath.path, true);
  var context = {};

  if (routes) {
    routes.forEach(function (route) {
      var handler = route[HANDLER_INDEX];
      handler(route[PARAMS_INDEX], parsedPath.queryStrings, context);
    });
  }

  return context;
}

module.exports = {
  create: function () {
    var root = trie.createNode();

    return {
      path: function (path, func) {
        addPath(root, path, func);
      },
      process: function (path) {
        return process(root, path);
      },
      capture: function (path) {
        return processAllHandlers(root, path);
      }
    };
  }
};

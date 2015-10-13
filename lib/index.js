var trie = require('trie-map');

var HANDLER_INDEX = 0;
var PARAMS_INDEX = 1;

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
function findPath(node, path) {
  var length = path.length,
      findNode,
      paramValue = '',
      params = [],
      star = false,
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

  return [trie.getNodeValue(node), params];
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

   trie.setValue(root, path, function (paramValues) {
     var params = {},
         length = paramValues.length,
         i;

     for (i = 0; i < length; i++) {
       params[paramKeys[i]] = paramValues[i];
     }

     func(params);
   });
}

function process(root, path, error) {
  var route = findPath(root, path);
  var handler;
  if (route) {
    handler = route[HANDLER_INDEX];
    if (handler) {
      handler(route[PARAMS_INDEX]);
      return null;
    }
  } else {
    return 'not found';
  }
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
      }
    };
  }
};

'use strict';

var route = require('./lib');
var router = route.create();

router.path('/users/:id', function (params, qs, context) {
  context.component = '1';
  context.child = {};

  return context.child;
});

router.path('/users/:id/friends/:cool', function (params, qs, context) {
  context.component = '2';
  context.child = {};

  return context.child;
});

var error = router.capture('/users/14?q=12');
console.log('error:', error);

error = router.capture('/users/14/friends/ali');
console.log('error:', error);

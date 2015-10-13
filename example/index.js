var route = require('trie-route');

var router = route.create();

router.path('/users/:id', function (params) {
  console.log('this is /users/:id path');
  console.log("here's the list of params", params);
});

router.path('/users/:id/friends', function (params) {
  console.log('this is /users/:id/friends path');
  console.log("here's the list of params", params);
});

var error = router.process('/users/14');
console.log('error:', error);

error = router.process('/users/14/enemies');
console.log('error:', error);

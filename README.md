# yet another router implementation with trie at core

This is a simple implementation of router by using Trie data structure at core.
It has a basic param feature for example the following code are valid.

```
/users/:id
/users/:id/friends
```

here's an example code:

```js
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
```

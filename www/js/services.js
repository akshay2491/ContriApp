angular.module('starter.services', ['underscore'])

.service('Data', function(_) {

  var calculateSummary = function(details, userVar) {
      var finalArray = [];
      var name = _.pluck(userVar, 'name');
      //var name = ["A", "B", "C","D","E"];
      var arr = [];
      _.each(userVar, function(val) {
          var sum = 0;
          _.each(details, function(some) {
              if (val.id === some.id) {
                  sum = sum + some.exp;
              }
          });
          arr.push({
              'id': val.id,
              'name': val.name,
              'image': val.image,
              'total': sum
          });
      });
      var sumArray = _.pluck(arr, 'total');
      var total = _.reduce(sumArray, function(memo, num) {
          return memo + num;
      }, 0);
      var balance = total / name.length;
      _.each(arr, function(user) {
          finalArray.push({
              "id": user.id,
              "name": user.name,
              'exp': user.total - balance,
              'image': user.image
          })
      });
      var tmp = _.pluck(finalArray, 'exp');
      var finalUsers = call(tmp, finalArray);
      return finalUsers;
  }

  function call(arrt, user) {
      for (var i = 0; i < arrt.length; i++) {
          if (arrt[i] > 0) {
              user[i].owe = [];
              user[i].lend = [];
              for (var j = 0; j < arrt.length; j++) {
                  if (arrt[j] < 0 && i != j) {
                      user[j].lend = [];
                      user[j].owe = [];
                      if (arrt[i] != 0) {
                          if (Math.abs(arrt[j]) <= arrt[i]) {
                              arrt[i] = arrt[i] + arrt[j];
                              user[i].owe.push({
                                  'name': user[j].name,
                                  'image': user[j].image,
                                  'amount': Math.round(Math.abs(arrt[j]))
                              });
                              user[j].lend.push({
                                  'name': user[i].name,
                                  'image': user[i].image,
                                  'amount': Math.round(Math.abs(arrt[j]))
                              });
                              arrt[j] = 0;
                          } else {
                              if (Math.abs(arrt[j]) > arrt[i]) {
                                  arrt[j] = arrt[i] + arrt[j];
                                  user[i].owe.push({
                                      'name': user[j].name,
                                      'image': user[j].image,
                                      'amount': Math.round(Math.abs(arrt[i]))
                                  });
                                  user[j].lend.push({
                                      'name': user[i].name,
                                      'image': user[i].image,
                                      'amount': Math.round(Math.abs(arrt[i]))
                                  });
                                  arrt[i] = 0;
                              }
                          }
                      }
                  }
              }
          }
      }
      return user;
  }
  return {
      calculateSummary: calculateSummary
  }
})

.factory('mySharedService', function($rootScope) {
    var sharedService = {};

    sharedService.message = [];
    sharedService.idVal = '';
    sharedService.currency = '';
    sharedService.exp = [];

    sharedService.prepForBroadcast = function(msg, id,currency) {
        this.message = msg;
        this.idVal = id;
        this.currency = currency;
        $rootScope.$broadcast('handleBroadcast');
        //this.broadcastItem();
    };

    sharedService.prepForExpSummary = function(msg,currency) {
        this.exp = msg;
        this.currency = currency;
        $rootScope.$broadcast('handleBroadcast');
    }

    sharedService.broadcastItem = function() {
        $rootScope.$broadcast('handleBroadcast');

    };

    return sharedService;
})
.service('loadingScreen', function($ionicLoading) {
    var showNotification = function() {
        $ionicLoading.show({
            noBackdrop: true,
            template: '<ion-spinner icon="android"/>'
        });
    };

    var hideNotification = function() {
        $ionicLoading.hide();
    };

    return {
        showNotification: showNotification,
        hideNotification: hideNotification
    }
})
.service('alertPopup',function($ionicPopup){
  var showPopup = function(msg) {
    var alertPopup = $ionicPopup.alert({
        title: 'Alert',
        template: "<p style='text-align:center'>"+msg+"</p>"
    });
    alertPopup.then(function(res) {
        //console.log('Thank you for not eating my delicious ice cream cone');
    });
  };

  return {
    showPopup:showPopup
  }
})

.factory('$localstorage', function($window) {
    return {
        set: function(key, val) {
            $window.localStorage[key] = val;
        },
        get: function(key) {
            return $window.localStorage[key];
        },
        setObject: function(key, val) {
            $window.localStorage[key] = JSON.stringify(val);
        },
        getObject: function(key) {
            return $window.localStorage[key];
        },
        deleteObject: function(key) {
            $window.localStorage.removeItem(key);
        }

    }
})
.factory('File', function($http) {
    return {
        upload: function(photo) {

            var json = {
                'base64': photo,
                '_ContentType': 'image/jpeg'
            }

            var config = {
                method: 'POST',
                url: 'https://api.parse.com/1/files/pict.jpg',
                data: json,
                headers: {
                    'X-Parse-Application-Id': 'Bl66NOMwA7tRfb7MlOIOaRhrMPz9jP9znTCbOsOP',
                    'X-Parse-REST-API-Key': 'JzFCO99WcxVhlvocSl346lW3PxvRD1iOZxS61ZX4'
                }
            };
            return $http(config);
        }
    }
});
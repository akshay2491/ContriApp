angular.module('starter.controllers', [])

.controller('MainCtrl', function($scope, $rootScope, $state) {
  $rootScope.userVariable = [];
  $rootScope.userDetails = [];
  //$rootScope.notificationObj = [];
  $rootScope.currentUser = Parse.User.current();

  $rootScope.getAllUsers = function() {
      var userDetails = [];
      var query = new Parse.Query(Parse.User);
      query.find({
          success: function(results) {
              _.each(results, function(user) {
                  userDetails.push({
                      'id': user.id,
                      'name': user.attributes.name,
                      'userName': user.attributes.username,
                      'image':user.attributes.image
                  });
              });
              $rootScope.userDetails = userDetails;
              $scope.$apply();
              //callback();
          }
      })
  }

  $rootScope.getNotification = function() {
      $rootScope.notificationObj = [];
      var query = new Parse.Query('notification');
      query.equalTo('userTripId', $rootScope.currentUser.id);
      query.find({
          success: function(results) {
              if (results.length != 0) {
                  _.each(results, function(individual) {
                      _.each($rootScope.userDetails, function(user) {
                          if (user.id === individual.attributes.parent) {
                              $rootScope.notificationObj.push({
                                  'id': individual.id,
                                  'createdBy': user.name,
                                  'tripName': individual.attributes.name,
                                  'tripId': individual.attributes.tripId,
                                  'image':user.image,
                                  'confirmed': individual.attributes.confirmed
                              });
                              $scope.$broadcast('scroll.refreshComplete');
                              //loadingScreen.hideNotification();
                              $scope.$apply();
                          }
                      })
                  })
                console.log($rootScope.notificationObj)
              } else {
                  //loadingScreen.hideNotification();
                  $scope.$broadcast('scroll.refreshComplete');
                  $scope.$apply();
              }
          }
      })
  }

  $rootScope.gotoPage = function(val) {
      $state.go(val);
  }

})

.controller('loginCtrl', function($scope, $state, $rootScope, $ionicLoading, loadingScreen, $mdDialog, $ionicPopover, $ionicHistory, $localstorage) {
  $scope.user = {};
  $scope.isError = false;
  $scope.errReg = false;

  $scope.show = function() {
      $ionicLoading.show({
          template: 'Loading...'
      });
  };
  $scope.hide = function() {
      $ionicLoading.hide();
  };

  $scope.$on('$ionicView.enter', function() {
      $ionicHistory.clearHistory();
      $ionicHistory.clearCache();
  });

  $scope.gotoMainPage = function(userList) {
      loadingScreen.showNotification();
      Parse.User.logIn(userList.uName, userList.pName, {
          success: function(user) {
              //$localstorage.set('username',userList.uName);
              //$localstorage.set('password',userList.pName);
              //$localstorage.set('isAuthen',true);
              $localstorage.setObject('User', user);
              $scope.isError = false;
              //$rootScope.notificationObj = [];
              $rootScope.getAllUsers();
              $rootScope.currentUser = user;
              /*$ionicHistory.nextViewOptions({
                  disableAnimate: true,
                  disableBack: true,
                  historyRoot: true
              });*/
              //$ionicHistory.clearHistory();
              //$ionicHistory.clearCache();
              loadingScreen.hideNotification();
              $state.go('tab.dash');
              $scope.user = {};
              $scope.$apply();
          },
          error: function(user, error) {
              loadingScreen.hideNotification();
              $scope.isError = true;
              $scope.errorMsg = error;
          }
      });
  }

  $scope.registerClearUser = function() {
      $scope.user = {};
  }


  $scope.registerUser = function(form) {
      var user = new Parse.User();
      user.set("username", form.username);
      user.set("name", form.uname);
      user.set("password", form.password);
      user.set("email", form.email);
      user.set('image','http://placehold.it/100x100');

      // other fields can be set just like with Parse.Object
      user.signUp(null, {
          success: function(user) {
              $mdDialog.show(
                  $mdDialog.alert()
                  .parent(angular.element(document.body))
                  .title('Alert Message')
                  .content('You Have successfully Registered')
                  .ariaLabel('Alert Dialog Demo')
                  .ok('Got it!')
              );
              $state.go('login');
              // Hooray! Let them use the app now.
          },
          error: function(user, error) {
              // Show the error message somewhere and let the user try again.
              $scope.errReg = true;
              $scope.errorReg = error.message;
          }
      });
  }
})
.controller('expenseCtrl', function($scope, $ionicLoading, $cordovaToast, $ionicHistory, $state, $ionicPopover, $mdToast, $rootScope, loadingScreen, $mdDialog, mySharedService) {

  $scope.expensesItem = [];
  //$scope.loading = false;
  var expObj = Parse.Object.extend('expenses');

  $scope.$on('$ionicView.loaded', function() {
      loadingScreen.showNotification();
      $scope.findTripForMember();

  });

  $scope.findTripForMember = function() {
      var tripsArray = [];
      var query = new Parse.Query('trips');
      query.equalTo('members', $rootScope.currentUser.id);
      query.find({
          success: function(results) {
              _.each(results, function(arr) {
                  var createdBy = '';
                  for (var i = 0; i < $rootScope.userDetails.length; i++) {
                      if (arr.attributes.parent === $rootScope.userDetails[i].id) {
                          createdBy = $rootScope.userDetails[i].name;
                      }
                  }
                  tripsArray.push({
                      'id': arr.id,
                      'name': arr.attributes.name,
                      'members': arr.attributes.members,
                      'createdBy': createdBy,
                      'date': arr.attributes.date
                  });
              });
              $scope.tripsArray = tripsArray;
              loadingScreen.hideNotification();
              $scope.$broadcast('scroll.refreshComplete');
              $cordovaToast.show('Pull to Refresh','short','bottom');
              $scope.$apply();
              //console.log(results);
          },
          error: function(errorMsg) {

          }
      });
  }

  $scope.getExpenseFromTrip = function(index) {
      loadingScreen.showNotification();
      var expensesItems = [];
      var query = new Parse.Query('expenses');
      query.equalTo('tripId', $scope.tripsArray[index].id);
      query.find({
          success: function(results) {
              for (var i = 0; i < results.length; i++) {
                  var createdBy = '';
                  for (var j = 0; j < $rootScope.userDetails.length; j++) {
                      if (results[i].attributes.parent === $rootScope.userDetails[j].id) {
                          createdBy = $scope.userDetails[j].name;
                      }
                  }
                  expensesItems.push({
                      'id': results[i].id,
                      'name': results[i].attributes.name,
                      'parentId':results[i].attributes.parent,
                      'amount': results[i].attributes.amount,
                      'date': results[i].updatedAt,
                      'createdBy': createdBy
                  });
              }
              mySharedService.prepForBroadcast(expensesItems, $scope.tripsArray[index].id);
              loadingScreen.hideNotification();
              $state.go('internal.addExpense');
              $scope.$apply();
          },
          error: function(err) {

          }
      });
  }


  //var query = new Parse.
  $scope.getExpenses = function() {
      var expensesItems = [];
      var GameScore = Parse.Object.extend("expenses");
      var query = new Parse.Query(GameScore);
      query.find({
          success: function(results) {
              for (var i = 0; i < results.length; i++) {
                  var createdBy = '';
                  for (var j = 0; j < $rootScope.userDetails.length; j++) {
                      if (results[i].attributes.parent === $rootScope.userDetails[j].id) {
                          createdBy = $scope.userDetails[j].name;
                      }
                  }
                  expensesItems.push({
                      'id': results[i].id,
                      'name': results[i].attributes.name,
                      'amount': results[i].attributes.amount,
                      'date': results[i].updatedAt,
                      'createdBy': createdBy
                  });
              }

              $scope.expensesItem = expensesItems;
              $scope.$apply();
          },
          error: function(err) {

          }
      });
  }

  /* $scope.addExpenses = function(exp)
   {
     var expObj = Parse.Object.extend('expenses');
     var obj = new expObj();
     obj.set('name',exp.name);
     obj.set('amount',parseInt(exp.amount));
     obj.set('parent',Parse.User.current().id);

     obj.save(null,{
       success:function(results){
         var createdBy = '';
         for(var j = 0 ;j<$rootScope.userDetails.length;j++)
           {
             if(results.attributes.parent === $rootScope.userDetails[j].id)
             {
               createdBy = $scope.userDetails[j].name;
             }
           }
         $scope.expensesItem.push({'id':results.id,'name':results.attributes.name,'amount':results.attributes.amount,'date':results.updatedAt,'createdBy':createdBy});
         $scope.popover.hide();
         $mdDialog.show(
           $mdDialog.alert()
             .parent(angular.element(document.body))
             .title('Alert')
             .content('Your Expense has been added')
             .ariaLabel('Alert Dialog Demo')
             .ok('Got it!')
             
         );
         $scope.expenses = {};
         $scope.$apply();
         
       },
       error:function(err){
         console.log(err);
       }
     });
   }*/
})

.controller('DashCtrl', function($scope, $state, $cordovaToast, $rootScope, $ionicHistory, $ionicModal, $ionicLoading, loadingScreen) {
  /*$ionicHistory.clearCache();
  $ionicHistory.clearHistory();*/

  var userDetails = [];
  $scope.expensesItem = [];
  $rootScope.notificationObj = [];

  $scope.$on('$ionicView.enter', function() {
      //loadingScreen.showNotification();
      $ionicHistory.clearCache();
      $ionicHistory.clearHistory();
      $rootScope.getNotification();
  });

  $scope.openNotification = function() {
      $state.go('notification');
      $cordovaToast.show('Pull to refresh','short','bottom');
  }
})

.controller('summaryCtrl', function($scope, Chats, $cordovaToast, $rootScope, Data, mySharedService, $state, loadingScreen) {
  $scope.isRead = false;

  $scope.$on('$ionicView.loaded', function() {
      loadingScreen.showNotification();
      $scope.findTripForMember();
  });

  $scope.getExpensesDetails = function() {
      $scope.users = [];
      var expObj = Parse.Object.extend('expenses');
      var query = new Parse.Query(expObj);
      var finalArray = [],
          finalId = [];

      query.find({
          success: function(results) {
              for (var i = 0; i < results.length; i++) {
                  finalArray.push({
                      'id': results[i].attributes.parent,
                      'exp': results[i].attributes.amount,
                      'expName': results[i].attributes.name
                  });
                  //finalId.push(results[i].attributes.parent);
              }
              $scope.users = Data.calculateSummary(finalArray, $rootScope.userDetails);
              $scope.$broadcast('scroll.refreshComplete');
              $scope.isRead = true;
              $scope.$apply();
          }
      });
  }

  $scope.findTripForMember = function() {
      var tripsArray = [];
      var query = new Parse.Query('trips');
      query.equalTo('members', $rootScope.currentUser.id);
      query.find({
          success: function(results) {
              _.each(results, function(arr) {
                  var createdBy = '';
                  for (var i = 0; i < $rootScope.userDetails.length; i++) {
                      if (arr.attributes.parent === $rootScope.userDetails[i].id) {
                          createdBy = $rootScope.userDetails[i].name;
                      }
                  }
                  tripsArray.push({
                      'id': arr.id,
                      'name': arr.attributes.name,
                      'members': arr.attributes.members,
                      'createdBy': createdBy,
                      'date': arr.attributes.date,
                      'members': arr.attributes.members
                  });
              });
              $scope.tripsArray = tripsArray;
              loadingScreen.hideNotification();
              $scope.$broadcast('scroll.refreshComplete');
              $cordovaToast.show('Pull to Refresh','short','bottom');
              $scope.$apply();
              //console.log(results);
          },
          error: function(errorMsg) {

          }
      });
  }

  $scope.getExpenseFromTrip = function(index) {
      var expensesItems = [];
      var userDetails = [];
      var query = new Parse.Query('expenses');
      query.equalTo('tripId', $scope.tripsArray[index].id);
      query.find({
          success: function(results) {
              for (var i = 0; i < results.length; i++) {
                  var createdBy = '';
                  for (var j = 0; j < $rootScope.userDetails.length; j++) {
                      if (results[i].attributes.parent === $rootScope.userDetails[j].id) {
                          createdBy = $scope.userDetails[j].name;
                      }
                  }
                  //finalArray.push({'id':results[i].attributes.parent,'exp':results[i].attributes.amount,'expName':results[i].attributes.name});
                  expensesItems.push({
                      'id': results[i].attributes.parent,
                      'expName': results[i].attributes.name,
                      'exp': results[i].attributes.amount,
                      'date': results[i].updatedAt,
                      'createdBy': createdBy
                  });
              }
              _.each($scope.tripsArray[index].members, function(user) {
                  _.each($rootScope.userDetails, function(members) {
                      if (members.id === user) {
                          userDetails.push({
                              'id': user,
                              'name': members.name,
                              'image':members.image
                          });
                      }
                  })
              })

              var imp = Data.calculateSummary(expensesItems, userDetails);
              mySharedService.prepForExpSummary(imp);
              $state.go('external');
              $scope.$apply();
          },
          error: function(err) {

          }
      });
  }
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope, $state, $ionicModal, $ionicHistory, $rootScope) {
  $scope.settings = {
      enableFriends: true
  };
  $scope.logOutUser = function() {
      $localstorage.deleteObject('User');
      $rootScope.currentUser = null;
      $rootScope.notificationObj = [];
      Parse.User.logOut();
      $ionicHistory.clearCache();
      $ionicHistory.clearHistory();
      $state.go('login');
  }
})


.controller('ToastCtrl', function($scope, $mdToast) {
  $scope.closeToast = function() {
      $mdToast.hide();
  }
})
.controller('tripCtrl', function($scope, $cordovaToast, $rootScope, $state, $ionicPopover, $ionicModal, $mdDialog) {

  $scope.showUser = false;
  $scope.trip = {};

  $scope.$on('$ionicView.beforeEnter', function() {
      $scope.loadTheUserInMember();
      $scope.presentDateFromSystem();
  });

  $scope.presentDateFromSystem = function() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();
    $scope.presentDate = today;
  };


  $scope.loadTheUserInMember = function() {
      $scope.members = [];
      var resultUserObj = {
          name: '',
          email: '',
          id: '',
          image:''
      };
      resultUserObj.name = $rootScope.currentUser.attributes.name + '(You)';
      resultUserObj.email = $rootScope.currentUser.attributes.email;
      resultUserObj.image = $rootScope.currentUser.attributes.image;
      resultUserObj.id = $scope.currentUser.id;
      $scope.members.push(resultUserObj);
  }

  $scope.getUserFromSearch = function(name) {
      var resultUser = [];
      //$scope.resultUser = [];
      var query = new Parse.Query(Parse.User);
      query.find({
          success: function(results) {
              _.each(results, function(user) {
                  if (user.attributes.name.toUpperCase() === name.name.toUpperCase() || user.attributes.username.toUpperCase() === name.name.toUpperCase()) {
                      var resultUserObj = {
                          name: '',
                          email: '',
                          id: ''
                      };
                      if ($scope.members.length != 0) {
                          var isPresent = false;
                          for (var i = 0; i < $scope.members.length; i++) {
                              if ($scope.members[i].id == user.id) {
                                  isPresent = true;
                              }
                          }
                          if (!isPresent) {
                              resultUserObj.name = user.attributes.name;
                              resultUserObj.email = user.attributes.email;
                              resultUserObj.image = user.attributes.image;
                              resultUserObj.id = user.id;
                              resultUserObj.isAdded = true;
                              resultUser.push(resultUserObj);
                          }

                      } else {
                          resultUserObj.name = user.attributes.name;
                          resultUserObj.email = user.attributes.email;
                          resultUserObj.image = user.attributes.image;
                          resultUserObj.isAdded = true;
                          resultUserObj.id = user.id;
                          resultUser.push(resultUserObj);
                      }
                  }
                  else
                  {
                    //$cordovaToast.show('No user found','short','bottom');
                  }
              });
              $scope.showUser = true;
              $scope.resultUser = resultUser;
              $scope.$apply();
          }
      })
  }

  $scope.addMembers = function(user) {
      if ($scope.members.length != 0) {
          var resultUserObj = {
              name: '',
              email: '',
              id: '',
              image:''
          };
          resultUserObj.name = user.name;
          resultUserObj.email = user.email;
          resultUserObj.image = user.image;
          resultUserObj.id = user.id;
          for (var i = 0; i < $scope.resultUser.length; i++) {
              if ($scope.resultUser[i].id == user.id) {
                  $scope.resultUser[i].isAdded = false;
                  $scope.resultUser[i] = {};
                  $scope.members.push(resultUserObj);
                  var msg = user.name + ' Added';
                  $cordovaToast.show(msg,'short','bottom');
              }
          }
      } else {
          for (var i = 0; i < $scope.resultUser.length; i++) {
              if ($scope.resultUser[i].id == user.id) {
                  var resultUserObj = {
                      name: '',
                      email: '',
                      id: '',
                      image:''
                  };
                  resultUserObj.name = user.name;
                  resultUserObj.email = user.email;
                  resultUserObj.image = user.image;
                  resultUserObj.id = user.id;
                  $scope.resultUser[i].isAdded = false;
                  $scope.resultUser[i] = {};
                  $scope.members.push(resultUserObj);
                  var msg = user.name + ' Added';
                  $cordovaToast.show(msg,'short','bottom');
              }
          }
      }
  }

  $scope.removeMembers = function(index) {
    $scope.members.splice(index,1);
     /* for (var i = 0; i < $scope.members.length; i++) {
          if ($scope.members[i].id == user.id) {
              $scope.members.splice(user, 1);
              var msg = user.name + ' Removed';
              $cordovaToast.show(msg,'short','bottom');
          }
      }*/
  }

  $ionicModal.fromTemplateUrl('templates/my-modal.html', {
      scope: $scope
  }).then(function(modal) {
      $scope.modal = modal;
  });


  $scope.openContacts = function() {

      $scope.resultUser = [];
      $scope.searchName = {};
      $scope.modal.show();
  };

  $scope.closePopover = function() {
      $scope.modal.hide();
  };

  $scope.submitTrip = function(tripDetails) {
      var userTemp = _.pluck($scope.members, 'id');
      var userArray = [];
      var tripObj = Parse.Object.extend('trips');
      var obj = new tripObj();
      userArray.push($rootScope.currentUser.id);
      obj.set('name', tripDetails.name);
      obj.set('date', tripDetails.date);
      obj.set('parent', $rootScope.currentUser.id);
      obj.set('members', userArray);
      obj.save(null, {
          success: function(results) {
              _.each(userTemp, function(list) {
                      if (list != $rootScope.currentUser.id) {
                          var notificationObj = Parse.Object.extend('notification');
                          var newObj = new notificationObj();
                          newObj.set('name', results.attributes.name);
                          newObj.set('date', results.attributes.date);
                          newObj.set('parent', results.attributes.parent);
                          newObj.set('tripId', results.id);
                          newObj.set('confirmed', false);
                          newObj.set('userTripId', list);
                          newObj.save(null, {
                              success: function(result) {},
                              error: function(err) {

                              }
                          })
                      }
                  })
                  $cordovaToast.show('Trip Added', 'short', 'bottom');
              $scope.tripDetails = {};
              $scope.members = [];
              $state.go('tab.dash');
          },
          error: function(err) {

          }
      });
  }
})
.controller('tripExpCtrl', function($scope, $cordovaToast, mySharedService, $mdDialog, $ionicPopover, $rootScope, $ionicModal) {
  $scope.expensesItem = mySharedService.message;
  $scope.tripId = mySharedService.idVal;
  $scope.$on('$ionicView.loaded', function() {
      $scope.getMembersOfTrip();
  });


  $scope.getMembersOfTrip = function() {
          var membersForExp = [];
          var query = new Parse.Query('trips');
          query.equalTo('objectId', $scope.tripId);
          query.first({
              success: function(result) {
                  _.each(result.attributes.members, function(user) {
                      _.each($rootScope.userDetails, function(list) {
                          if (user === list.id) {
                              membersForExp.push({
                                  'name': list.name,
                                  'username': list.userName,
                                  'image':list.image
                              });
                          }
                      })
                  })
                  $scope.membersForExp = membersForExp;
                  $scope.$apply();
              }
          });
      }
      /*  $scope.popover = $ionicPopover.fromTemplateUrl('templates/templateUrl.html', {
           scope: $scope
         }).then(function(popover) {
           $scope.expenses = {};
           $scope.popover = popover;

         });*/

  $scope.openExpenseTab = function() {
      $scope.expenses = {};
      $scope.modal.show();
  };

  $scope.deleteExpense = function(index) {
    $scope.expensesItem.splice(index,1);
  }

  $scope.editExpense = function(exp,index) {

  }

  $scope.getUserFromSearchForExpense = function(name) {
      var resultUser = [];
      var query = new Parse.Query(Parse.User);
      query.find({
          success: function(results) {
              _.each(results, function(user) {
                  if (user.attributes.name.toUpperCase() === name.name.toUpperCase() || user.attributes.username.toUpperCase() === name.name.toUpperCase()) {
                      var resultUserObj = {
                          name: '',
                          email: '',
                          id: ''
                      };
                      resultUserObj.name = user.attributes.name;
                      resultUserObj.email = user.attributes.username;
                      resultUserObj.image = user.attributes.image;
                      resultUserObj.isAdded = true;
                      resultUserObj.id = user.id;
                      resultUser.push(resultUserObj);

                  }
              });
              $scope.showUser = true;
              $scope.resultUserForExpense = resultUser;
              $scope.$apply();
          }
      });
  }

  $scope.addMembersForExpenses = function(user, index) {
      var query = new Parse.Query('trips');
      query.equalTo('objectId', $scope.tripId);
      query.first({
          success: function(result) {
              var val = _.contains(result.attributes.members, user.id);
              console.log(val)
              if (!val) {
                  var mainQuery = new Parse.Query('notification');
                  mainQuery.equalTo('tripId', $scope.tripId);
                  mainQuery.equalTo('userTripId', user.id);
                  mainQuery.find({
                      success: function(results) {
                          if (results.length != 0) {
                             $cordovaToast.show('User Yet to Confirm','short','bottom');
                          } else {
                              var expObj = Parse.Object.extend('notification');
                              var newObj = new expObj();
                              newObj.set('name', result.attributes.name);
                              newObj.set('date', result.attributes.date);
                              newObj.set('parent', result.attributes.parent);
                              newObj.set('tripId', result.id);
                              newObj.set('confirmed', false);
                              newObj.set('userTripId', user.id);
                              newObj.save(null, {
                                  success: function(result) {
                                      console.log(index)
                                      $scope.resultUserForExpense[index].isAdded = false;
                                      $scope.$apply();
                                      console.log('saved');
                                      $cordovaToast.show('User added','short','bottom');
                                  },
                                  error: function(err) {

                                  }
                              })
                          }
                      }
                  })

              } else {
                  $cordovaToast.show('Already member of the trip','short','bottom');

              }


          }
      })
  }

  $scope.closePopover = function() {
      $scope.modal.hide();
  };

  $ionicModal.fromTemplateUrl('templates/expenses-templates.html', {
      scope: $scope
  }).then(function(modal) {
      //$scope.expenses = {};
      $scope.modal = modal;
  });

  /*$scope.openPopover = function($event)
{
console.log('in')
$scope.popover.show($event);
}

$scope.$on('$destroy', function() {
      $scope.popover.remove();
    });
*/
  $scope.calculateTotal = function($event) {

      var arr = [];
      var arr = _.pluck($scope.expensesItem, 'amount');
      var sum = _.reduce(arr, function(memo, num) {
          return memo + num;
      }, 0);
      var str = 'Total Till now Rs. ' + sum;
      $cordovaToast.show(str,'short','bottom');
  }

  $scope.addExpenses = function(exp) {
      var expObj = Parse.Object.extend('expenses');
      var obj = new expObj();
      obj.set('name', exp.name);
      obj.set('amount', parseInt(exp.amount));
      obj.set('tripId', mySharedService.idVal);
      obj.set('parent', Parse.User.current().id);

      obj.save(null, {
          success: function(results) {
              var createdBy = '';
              for (var j = 0; j < $rootScope.userDetails.length; j++) {
                  if (results.attributes.parent === $rootScope.userDetails[j].id) {
                      createdBy = $scope.userDetails[j].name;
                  }
              }
              $scope.expensesItem.push({
                  'id': results.id,
                  'name': results.attributes.name,
                  'amount': results.attributes.amount,
                  'date': results.updatedAt,
                  'parentId':results.attributes.parent,
                  'createdBy': createdBy
              });
              $scope.closePopover();
              $cordovaToast.show('Expense Added','short','bottom');
              $scope.$apply();

          },
          error: function(err) {
              console.log(err);
          }
      });
  }

})
.controller('sumExpCtrl', function($scope, $rootScope, mySharedService) {

    $scope.users = mySharedService.exp;
})
.controller('profileCtrl', function($scope,File,$rootScope, $cordovaToast, loadingScreen, $ionicHistory, $ionicPlatform, $state, $localstorage, $mdBottomSheet, $cordovaCamera) {
  var profileUser = {};
  $scope.profileUser = {};
  $scope.isFieldEnabled = true;
  console.log($rootScope.currentUser);
  profileUser.id = $rootScope.currentUser.id;
  profileUser.name = $rootScope.currentUser.attributes.name;
  profileUser.userName = $rootScope.currentUser.attributes.username;
  profileUser.emailId = $rootScope.currentUser.attributes.email;
  if($rootScope.currentUser.attributes.image == undefined)
  {
    profileUser.pictureUrl = 'http://placehold.it/100x100';
  }
  else
  {
    profileUser.pictureUrl = $rootScope.currentUser.attributes.image;  
  }
  $scope.profileUser = profileUser;
  $scope.isSubmit = true;
  //$scope.pictureUrl = 'http://placehold.it/200x200';
  $scope.editFields = function() {
      $scope.isFieldEnabled = false;
      $scope.isSubmit = false;
  }

  $scope.uploadImage = function($event) {
      $mdBottomSheet.show({
          templateUrl: 'templates/bottom-sheet.html',
          controller: 'bottomSheetCtrl',
          targetEvent: $event
      }).then(function(result) {
          console.log(result);
          if (result.name === 'Camera') {
              $scope.loadCamera();
              //$scope.getPictureFromSys();
          } else {
              //$scope.loadFileSystem();
          }
      })
  }
$ionicPlatform.ready(function(){

  $scope.loadCamera = function() {

    var options = {
            quality: 100,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.CAMERA,
            allowEdit: true,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 100,
            cameraDirection:1,
            targetHeight: 100,
            saveToPhotoAlbum: false
          };

     $cordovaCamera.getPicture(options).then(function(imageData) {
        
            $scope.profileUser.pictureUrl = "data:image/jpeg;base64," + imageData;
      });
    }
});


  $scope.updateFields = function(user) {
      loadingScreen.showNotification();
      var temp = user.pictureUrl;
      temp = temp.replace('data:image/jpeg;base64,','');
      File.upload(temp).success(function(data) {
            var image = data.url;
            var query = new Parse.Query(Parse.User);
            query.equalTo('objectId', $rootScope.currentUser.id);
            query.first({
          success: function(result) {
              //result.set("image",parseFile);
              result.set('name', user.name);
              result.set('email', user.emailId);
              result.set('image',image);
              if (user.hasOwnProperty('password')) {
                  result.set('password', user.password);
              }
              result.save(null, {
                  success: function(res) {
                      loadingScreen.hideNotification();
                      $scope.isFieldEnabled = true;
                      $scope.isSubmit = true;
                      $cordovaToast.show('Profile Updated','short','bottom');
                      $rootScope.currentUser = res;
                      $scope.$apply();
                  }
              })
          }
      })
      });
      //var query = new Parse.Query(Parse.User);
      //query.equalTo('objectId', $rootScope.currentUser.id);
      /*query.first({
          success: function(result) {
              //result.set("image",parseFile);
              result.set('name', user.name);
              result.set('email', user.emailId);
              if (user.hasOwnProperty('password')) {
                  result.set('password', user.password);
              }
              result.save(null, {
                  success: function(res) {
                      loadingScreen.hideNotification();
                      $scope.isFieldEnabled = true;
                      $scope.isSubmit = true;
                      $cordovaToast.show('Profile Updated','short','bottom');
                      $rootScope.currentUser = res;
                      $scope.$apply();
                  }
              })
          }
      })*/
  }

  $scope.logOutUser = function() {
      $localstorage.deleteObject('User');
      $rootScope.currentUser = null;
      $rootScope.notificationObj = [];
      Parse.User.logOut();
      $ionicHistory.clearCache();
      $ionicHistory.clearHistory();
      $state.go('login');
  }
})
.controller('bottomSheetCtrl', function($scope, $rootScope, $mdBottomSheet) {
  $scope.items = [{
      name: 'Camera',
      classStyle: 'icon ion-camera'
  }, {
      name: 'Files',
      classStyle: 'icon ion-image'
  }, ];
  $scope.listItemClick = function($index) {
      var clickedItem = $scope.items[$index];
      $mdBottomSheet.hide(clickedItem);
  };
})
.controller('notificationCtrl', function($scope, $rootScope) {

  $scope.declineTrip = function(user) {
      for (var i = 0; i < $rootScope.notificationObj.length; i++) {
          if ($rootScope.notificationObj[i].id === user.id) {
              $rootScope.notificationObj[i].confirmed = true;
              var query = new Parse.Query('notification');
              query.equalTo('objectId', $rootScope.notificationObj[i].id);
              $rootScope.notificationObj.splice(user, 1);
              query.find({
                  success: function(results) {
                      results[0].destroy({
                          success: function(res) {
                              $cordovaToast.show('Trip Declined','short','bottom');
                          }
                      });
                  }
              });
          }
      }
  }

  $scope.confirmTrip = function(user) {
      for (var i = 0; i < $rootScope.notificationObj.length; i++) {
          if ($rootScope.notificationObj[i].id === user.id) {
              $rootScope.notificationObj[i].confirmed = true;
              var query = new Parse.Query('notification');
              query.equalTo('objectId', $rootScope.notificationObj[i].id);
              $rootScope.notificationObj.splice(user, 1);
              query.find({
                  success: function(results) {
                      var newQuery = new Parse.Query('trips');
                      newQuery.equalTo('objectId', results[0].attributes.tripId);
                      newQuery.equalTo('parent', results[0].attributes.parent);
                      newQuery.first({
                          success: function(result) {
                              var arr = result.attributes.members;
                              arr.push(results[0].attributes.userTripId);
                              result.set('members', arr);
                              result.save({
                                  success: function(res) {
                                      results[0].destroy({
                                          success: function(res) {
                                              $cordovaToast.show('Trip Confirmed','short','bottom');
                                          }
                                      });
                                  }
                              });
                          }
                      })
                  }
              });
          }
      }
  }
});
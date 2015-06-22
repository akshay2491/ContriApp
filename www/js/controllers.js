angular.module('starter.controllers', [])

.controller('loginCtrl',function($scope,$location,$rootScope,$ionicLoading){

   $rootScope.userVariable = [];
     $scope.getUserById = function()
  {
    var query = new Parse.Query(Parse.User);
    query.find({
      success: function(result) {
        for(var i=0;i<result.length;i++)
       { 
        $rootScope.userVariable.push({'name':result[i].attributes.name,'userName':result[i].attributes.username,'id':result[i].id});
      }
      }
    });
  }

  $scope.getUserById();

  $scope.show = function() {
    $ionicLoading.show({
      template: 'Loading...'
    });
  };
  $scope.hide = function(){
    $ionicLoading.hide();
  };
  $scope.isError = false;
  $scope.gotoMainPage = function(user)
  { 

    $scope.show();
    Parse.User.logIn(user.uName, user.pName, {
      success: function(user) {
        $scope.isError = false;
        $location.path('/tab/dash');
         $scope.hide();
        $scope.user = {};
        $scope.$apply();
      },
      error: function(user, error) {
        console.log('in')
        $scope.isError = true;
        $scope.errorMsg = error;
      }
    });
    //$location.path('/tab/dash');
  }
})
.controller('expenseCtrl',function($scope,$ionicLoading,$ionicPopover){

      $scope.expensesItem = [];
    //$scope.loading = false;
    var expObj = Parse.Object.extend('expenses');


  $scope.popover = $ionicPopover.fromTemplateUrl('templates/templateUrl.html', {
    scope: $scope
  }).then(function(popover) {
    console.log(popover)
    $scope.popover = popover;
  });

  $scope.openPopover = function($event)
  {
    $scope.popover.show($event);
  }

    //var query = new Parse.
    $scope.getExpenses = function()
    { 
      var expensesItems = [];
      var GameScore = Parse.Object.extend("expenses");
      var query = new Parse.Query(GameScore);
      query.find({
        success:function(results){
          
          for(var i=0;i<results.length;i++)
          {
            expensesItems.push({'id':results[i].id,'name':results[i].attributes.name,'amount':results[i].attributes.amount,'date':results[i].updatedAt});
          }

          $scope.expensesItem = expensesItems;
          $scope.$apply();
        },
        error:function(err){

        }
      });
    }

    $scope.addExpenses = function(exp)
    {
      var expObj = Parse.Object.extend('expenses');
      var obj = new expObj();
      obj.set('name',exp.name);
      obj.set('amount',parseInt(exp.amount));
      obj.set('parent',Parse.User.current().id);

      obj.save(null,{
        success:function(results){

          $scope.expensesItem.push({'id':results.id,'name':results.attributes.name,'amount':results.attributes.amount,'date':results.updatedAt});
          $scope.popover.hide();
          $ionicLoading.show({ template: 'Expense Added!', noBackdrop: true, duration: 2000 });
          $scope.expenses = {};
          $scope.$apply();
          
        },
        error:function(err){
          console.log(err);
        }
      });
    }

})

.controller('DashCtrl', function($scope,$location) {
 // $rootScope.getUserById(Parse.User.current().id);

    $scope.expensesItem = [];
    $scope.currentUser = Parse.User.current();
    //$scope.loading = false;
    var expObj = Parse.Object.extend('expenses');

    $scope.gotoPage = function(val)
    { console.log(val);
      $location.path(val);
    }
    //var query = new Parse.
    /*$scope.getExpenses = function()
    { 
      var expensesItems = [];
      var GameScore = Parse.Object.extend("expenses");
      var query = new Parse.Query(GameScore);
      query.find({
        success:function(results){
          
          for(var i=0;i<results.length;i++)
          {
            expensesItems.push({'id':results[i].id,'name':results[i].attributes.name,'amount':results[i].attributes.amount,'date':results[i].updatedAt});
          }

          $scope.expensesItem = expensesItems;
          $scope.$apply();
        },
        error:function(err){

        }
      });
    }

    $scope.addExpenses = function(exp)
    {
      var expObj = Parse.Object.extend('expenses');
      var obj = new expObj();
      obj.set('name',exp.name);
      obj.set('amount',parseInt(exp.amount));
      obj.set('parent',Parse.User.current().id);

      obj.save(null,{
        success:function(results){

          $scope.expensesItem.push({'id':results.id,'name':results.attributes.name,'amount':results.attributes.amount,'date':results.updatedAt})
          $scope.expenses = {};
          $scope.$apply();
          
        },
        error:function(err){
          console.log(err);
        }
      });
    }*/
})

.controller('ChatsCtrl', function($scope, Chats,$rootScope,Data) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});
  $scope.isRead = false;
  $scope.getExpenses=function() {
    $scope.users = [];
    var expObj = Parse.Object.extend('expenses');
    var query = new Parse.Query(expObj);
    var finalArray = [],finalId=[] ;

    query.find({
      success:function(results){
        for(var i=0;i<results.length;i++)
        { 
          finalArray.push({'id':results[i].attributes.parent,'exp':results[i].attributes.amount,'expName':results[i].attributes.name});
          //finalId.push(results[i].attributes.parent);
        }
        $scope.users = Data.calculateSummary(finalArray,$rootScope.userVariable);
        $scope.$broadcast('scroll.refreshComplete');
        $scope.isRead = true;
        $scope.$apply();
      }
    });
  }

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  }
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope,$location,$ionicModal) {
  $scope.settings = {
    enableFriends: true
  };
  $scope.logOutUser = function()
  {
    Parse.User.logOut();
    $location.path('/login');  
    
  }
});

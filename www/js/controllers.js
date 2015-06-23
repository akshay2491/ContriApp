angular.module('starter.controllers', [])

.controller('MainCtrl',function($scope,$rootScope,$location){
    $rootScope.userVariable = [];
    $rootScope.userDetails = [];
    $rootScope.currentUser = Parse.User.current();

    $rootScope.getAllUsers=function() {
      var userDetails = [];
      var query = new Parse.Query(Parse.User);
      query.find({success:function(results){
        console.log(results);
        _.each(results,function(user){
          userDetails.push({'id':user.id,'name':user.attributes.name,'userName':user.attributes.username});
        });
        $rootScope.userDetails = userDetails;
      }})
    }

    $rootScope.gotoPage = function(val)
    { 
      $location.path(val);
    }
})

.controller('loginCtrl',function($scope,$location,$rootScope,$ionicLoading,$mdDialog,$ionicPopover){
  
  $scope.user = {};
  $scope.isError = false;

  $scope.show = function() {
    $ionicLoading.show({
      template: 'Loading...'
    });
  };
  $scope.hide = function(){
    $ionicLoading.hide();
  };

  $scope.gotoMainPage = function(user)
  { 
    $scope.show();
    Parse.User.logIn(user.uName, user.pName, {
      success: function(user) {

        $scope.isError = false;
        $rootScope.getAllUsers();
        $rootScope.currentUser = user;
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
  }


  $scope.registerUser = function(form)
  {
    var user = new Parse.User();
    user.set("username", form.username);
    user.set("name", form.uname);
    user.set("password", form.password);
    user.set("email", form.email);

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
        $location.path('/login');
        // Hooray! Let them use the app now.
      },
      error: function(user, error) {
        // Show the error message somewhere and let the user try again.
        alert("Error: " + error.code + " " + error.message);
      }
    });
  }
})
.controller('expenseCtrl',function($scope,$ionicLoading,$ionicPopover,$mdToast,$rootScope,$mdDialog){
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

  $scope.calculateTotal = function($event) {
    var arr = [];
    var arr = _.pluck($scope.expensesItem, 'amount');
    var sum = _.reduce(arr, function(memo, num){ return memo + num; }, 0);
    $mdDialog.show(
      $mdDialog.alert()
        .parent(angular.element(document.body))
        .title('Alert')
        .content('Your Total is Rs:'+sum)
        .ariaLabel('Alert Dialog Demo')
        .ok('Got it!')
        
    );
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
          { var createdBy='';
            for(var j = 0 ;j<$rootScope.userDetails.length;j++)
            {
              if(results[i].attributes.parent === $rootScope.userDetails[j].id)
              { console.log($rootScope.userDetails[j])
                createdBy = $scope.userDetails[j].name;
              }
            }
            expensesItems.push({'id':results[i].id,'name':results[i].attributes.name,'amount':results[i].attributes.amount,'date':results[i].updatedAt,'createdBy':createdBy});
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
    }
})

.controller('DashCtrl', function($scope,$location,$rootScope) {
 // $rootScope.getUserById(Parse.User.current().id);
    var userDetails = [];
    $scope.expensesItem = [];
    getAllUsers();
    function getAllUsers() {
      var query = new Parse.Query(Parse.User);
      query.find({success:function(results){
        _.each(results,function(user){
          userDetails.push({'id':user.id,'name':user.attributes.name,'userName':user.attributes.username});
        });
        $rootScope.userDetails = userDetails;
      }})
    }
    
    //$scope.loading = false;
    var expObj = Parse.Object.extend('expenses');

    
})

.controller('summaryCtrl', function($scope, Chats,$rootScope,Data) {
  $scope.isRead = false;

  $scope.getExpensesDetails=function() {
    console.log($rootScope.userDetails)
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
        $scope.users = Data.calculateSummary(finalArray,$rootScope.userDetails); 
        console.log($scope.users)
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
})
.controller('ToastCtrl',function($scope,$mdToast){
  $scope.closeToast = function(){
    $mdToast.hide();
  }
});

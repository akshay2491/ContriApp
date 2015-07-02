angular.module('starter.controllers', [])

.controller('MainCtrl',function($scope,$rootScope,$state){
    $rootScope.userVariable = [];
    $rootScope.userDetails = [];
    //$rootScope.notificationObj = [];
    $rootScope.currentUser = Parse.User.current();
    $rootScope.getAllUsers=function() {
      var userDetails = [];
      var query = new Parse.Query(Parse.User);
      query.find({success:function(results){
        _.each(results,function(user){
          userDetails.push({'id':user.id,'name':user.attributes.name,'userName':user.attributes.username});
        });
        $rootScope.userDetails = userDetails;
        $scope.$apply();
        //callback();
      }})
    }

    $scope.getNotification = function(){
      $rootScope.notificationObj = [];
      var query = new Parse.Query('notification');
      query.equalTo('userTripId',$rootScope.currentUser.id);
      query.find({success:function(results){
        console.log(results)
        if(results.length!=0)
        {
        _.each(results,function(individual){
          console.log(individual)
          _.each($rootScope.userDetails,function(user){
            console.log(user)
            if(user.id === individual.attributes.parent) {
              $rootScope.notificationObj.push({'id':individual.id,'createdBy':user.name,'tripName':individual.attributes.name,'tripId':individual.attributes.tripId,'confirmed':individual.attributes.confirmed});
              console.log($rootScope.notificationObj)
              //$scope.$broadcast('scroll.refreshComplete');
              $scope.$apply();
            }
          })
        })
      }
      else
      {
        //$scope.$broadcast('scroll.refreshComplete');
        $scope.$apply();
      }
        }
      })
    }

    $rootScope.gotoPage = function(val)
    { 
      $state.go(val);
    }

})

.controller('loginCtrl',function($scope,$state,$rootScope,$ionicLoading,$mdDialog,$ionicPopover,$ionicHistory){
  $scope.user = {};
  $scope.isError = false;
  $scope.errReg = false;

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
    Parse.User.logIn(user.uName, user.pName, {
      success: function(user) {
        $scope.show();
        $scope.isError = false;
        //$rootScope.notificationObj = [];
        $rootScope.getAllUsers();
        $rootScope.currentUser = user;
        /*$ionicHistory.nextViewOptions({
            disableAnimate: true,
            disableBack: true,
            historyRoot: true
        });*/
        $ionicHistory.clearHistory();
        $ionicHistory.clearCache();
        $state.go('tab.dash');
        $scope.hide();
        $scope.user = {};
        $scope.$apply();
      },
      error: function(user, error) {
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
.controller('expenseCtrl',function($scope,$ionicLoading,$ionicHistory,$state,$ionicPopover,$mdToast,$rootScope,loadingScreen,$mdDialog,mySharedService){

      $scope.expensesItem = [];
    //$scope.loading = false;
    var expObj = Parse.Object.extend('expenses');

     $scope.$on('$ionicView.loaded', function(){ 
        console.log("App view (menu) entered.");
        loadingScreen.showNotification();
        $scope.findTripForMember();

    });

  $scope.findTripForMember = function() {
    var tripsArray = [];
    var query = new Parse.Query('trips');
    query.equalTo('members',$rootScope.currentUser.id);
    query.find({success:function(results){
      _.each(results,function(arr){
        var createdBy = '';
        for(var i = 0 ;i <$rootScope.userDetails.length;i++)
        { 
          if(arr.attributes.parent === $rootScope.userDetails[i].id)
          {
            createdBy = $rootScope.userDetails[i].name;
          }
        }
        tripsArray.push({'id':arr.id,'name':arr.attributes.name,'members':arr.attributes.members,'createdBy':createdBy,'date':arr.attributes.date});
      });
      $scope.tripsArray = tripsArray;
      loadingScreen.hideNotification();
      $scope.$broadcast('scroll.refreshComplete');
      $scope.$apply();
      //console.log(results);
    },
    error:function(errorMsg){

    }});
  }

  $scope.getExpenseFromTrip = function(index) {
    var expensesItems = [];
    var query = new Parse.Query('expenses');
    query.equalTo('tripId',$scope.tripsArray[index].id);
    query.find({success:function(results){
      for(var i=0;i<results.length;i++)
          { var createdBy='';
            for(var j = 0 ;j<$rootScope.userDetails.length;j++)
            {
              if(results[i].attributes.parent === $rootScope.userDetails[j].id)
              { 
                createdBy = $scope.userDetails[j].name;
              }
            }
            expensesItems.push({'id':results[i].id,'name':results[i].attributes.name,'amount':results[i].attributes.amount,'date':results[i].updatedAt,'createdBy':createdBy});
          }
           mySharedService.prepForBroadcast(expensesItems,$scope.tripsArray[index].id);
           $state.go('internal.addExpense');
           $scope.$apply();
    },error:function(err){

    }});
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
              {
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

.controller('DashCtrl', function($scope,$state,$rootScope,$ionicHistory,$ionicModal,$ionicLoading,loadingScreen) {
  /*$ionicHistory.clearCache();
  $ionicHistory.clearHistory();*/

 // $rootScope.getUserById(Parse.User.current().id);
    var userDetails = [];
    $scope.expensesItem = [];
    $rootScope.notificationObj = [];

      $ionicModal.fromTemplateUrl('templates/notification-templates.html', {
        scope: $scope
      }).then(function(modal) {
        $scope.modal = modal;
      });

     /*  $scope.show = function() {
          $ionicLoading.show({
            noBackdrop: true,
            template: '<p class="item-icon-left">Loading stuff...<ion-spinner icon="lines"/></p>'
          });
        };
        $scope.hide = function(){
          $ionicLoading.hide();
        };*/

      $scope.$on('$ionicView.enter',function(){
        //loadingScreen.showNotification();
        $scope.getNotification();
      });

      
      $scope.getNotification = function(){
      $rootScope.notificationObj = [];
      var query = new Parse.Query('notification');
      query.equalTo('userTripId',$rootScope.currentUser.id);
      query.find({success:function(results){
        console.log(results)
        if(results.length!=0)
        {
        _.each(results,function(individual){
          console.log(individual)
          _.each($rootScope.userDetails,function(user){
            console.log(user)
            if(user.id === individual.attributes.parent) {
              $rootScope.notificationObj.push({'id':individual.id,'createdBy':user.name,'tripName':individual.attributes.name,'tripId':individual.attributes.tripId,'confirmed':individual.attributes.confirmed});
              console.log($rootScope.notificationObj)
              $scope.$broadcast('scroll.refreshComplete');
              //loadingScreen.hideNotification();
              $scope.$apply();
            }
          })
        })
      }
      else
      {
        //loadingScreen.hideNotification();
        $scope.$broadcast('scroll.refreshComplete');
        $scope.$apply();
      }
        }
      })
    }


  $scope.closePopover = function() {
    $scope.modal.hide();
  };

  $scope.declineTrip = function(user) {
    for(var i=0;i<$rootScope.notificationObj.length;i++) {
      if($rootScope.notificationObj[i].id === user.id) {
        $rootScope.notificationObj[i].confirmed = true;
        var query = new Parse.Query('notification');
        query.equalTo('objectId',$rootScope.notificationObj[i].id);
        $rootScope.notificationObj.splice(user,1);
        query.find({success:function(results){
          results[0].destroy({});
        }});
      }
    }
  }

  $scope.confirmTrip = function(user) {
    for(var i=0;i<$rootScope.notificationObj.length;i++) {
      if($rootScope.notificationObj[i].id === user.id) {
        $rootScope.notificationObj[i].confirmed = true;
        var query = new Parse.Query('notification');
        query.equalTo('objectId',$rootScope.notificationObj[i].id);
        $rootScope.notificationObj.splice(user,1);
        query.find({success:function(results){
          var newQuery = new Parse.Query('trips');
          newQuery.equalTo('objectId',results[0].attributes.tripId);
          newQuery.equalTo('parent',results[0].attributes.parent);
          newQuery.first({success:function(result){
            var arr = result.attributes.members;
            arr.push(results[0].attributes.userTripId);
            result.set('members',arr);
            result.save({success:function(res){
              results[0].destroy({});
            }});
          }})          
        }
      });
      }
    }
  }

/*    $scope.getNotification = function() {
      var query = new Parse.Query('notification');
      query.containedIn('userTripId',$rootScope.currentUser.id);
      query.find({success:function(results){
          console.log(results);
        },error:function(err){

        }
      })
    }*/

    $scope.openNotification = function(){
      $scope.modal.show();
    }
/*    getAllUsers();
    function getAllUsers() {
      var query = new Parse.Query(Parse.User);
      query.find({success:function(results){
        _.each(results,function(user){
          userDetails.push({'id':user.id,'name':user.attributes.name,'userName':user.attributes.username});
        });
        $rootScope.userDetails = userDetails;
      }})
    }*/
    
    //$scope.loading = false;
    //var expObj = Parse.Object.extend('expenses');

    
})

.controller('summaryCtrl', function($scope, Chats,$rootScope,Data,mySharedService,$state,loadingScreen) {
  $scope.isRead = false;

  $scope.$on('$ionicView.loaded',function(){
    loadingScreen.showNotification();
    $scope.findTripForMember();
  });

  $scope.getExpensesDetails=function() {
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
        $scope.$broadcast('scroll.refreshComplete');
        $scope.isRead = true;
        $scope.$apply();
      }
    });
  }

   $scope.findTripForMember = function() {
    var tripsArray = [];
    var query = new Parse.Query('trips');
    query.equalTo('members',$rootScope.currentUser.id);
    query.find({success:function(results){
      _.each(results,function(arr){
        var createdBy = '';
        for(var i = 0 ;i <$rootScope.userDetails.length;i++)
        { 
          if(arr.attributes.parent === $rootScope.userDetails[i].id)
          {
            createdBy = $rootScope.userDetails[i].name;
          }
        }
        tripsArray.push({'id':arr.id,'name':arr.attributes.name,'members':arr.attributes.members,'createdBy':createdBy,'date':arr.attributes.date,'members':arr.attributes.members});
      });
      $scope.tripsArray = tripsArray;
      loadingScreen.hideNotification();
      $scope.$broadcast('scroll.refreshComplete');
      $scope.$apply();
      //console.log(results);
    },
    error:function(errorMsg){

    }});
  }

  $scope.getExpenseFromTrip = function(index) {
    var expensesItems = [];
    var userDetails = [];
    var query = new Parse.Query('expenses');
    query.equalTo('tripId',$scope.tripsArray[index].id);
    query.find({success:function(results){
      for(var i=0;i<results.length;i++)
          { var createdBy='';
            for(var j = 0 ;j<$rootScope.userDetails.length;j++)
            {
              if(results[i].attributes.parent === $rootScope.userDetails[j].id)
              { 
                createdBy = $scope.userDetails[j].name;
              }
            }
            //finalArray.push({'id':results[i].attributes.parent,'exp':results[i].attributes.amount,'expName':results[i].attributes.name});
            expensesItems.push({'id':results[i].attributes.parent,'expName':results[i].attributes.name,'exp':results[i].attributes.amount,'date':results[i].updatedAt,'createdBy':createdBy});
          }
             _.each($scope.tripsArray[index].members,function(user){
              _.each($rootScope.userDetails,function(members){
                if(members.id === user) {
                  userDetails.push({'id':user,'name':members.name});
                }
              })
            })

          var imp =Data.calculateSummary(expensesItems,userDetails);
          mySharedService.prepForExpSummary(imp);
           $state.go('external');
           $scope.$apply();
    },error:function(err){

    }});
  }




  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  }
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope,$state,$ionicModal,$ionicHistory,$rootScope) {
  $scope.settings = {
    enableFriends: true
  };
  $scope.logOutUser = function()
  {
    $rootScope.currentUser = null;
    $rootScope.notificationObj = [];
    Parse.User.logOut();
    $ionicHistory.clearCache();
    $ionicHistory.clearHistory();
    $state.go('login');  
  }
})


.controller('ToastCtrl',function($scope,$mdToast){
  $scope.closeToast = function(){
    $mdToast.hide();
  }
})
.controller('tripCtrl',function($scope,$rootScope,$state,$ionicPopover,$ionicModal,$mdDialog){

  $scope.showUser = false;
  $scope.members = [];
  $scope.trip = {};
  $scope.getUserFromSearch = function(name)
  { 
    
     var resultUser = [];
    //$scope.resultUser = [];
    var query = new Parse.Query(Parse.User);
      query.find({success:function(results){
        _.each(results,function(user){
            if(user.attributes.name.toUpperCase() === name.name.toUpperCase() || user.attributes.username.toUpperCase() === name.name.toUpperCase())
            { 
              var resultUserObj = {name:'',email:'',id:''};
              if($scope.members.length != 0) 
              { 
              var isPresent = false;
              for(var i = 0 ;i<$scope.members.length;i++) {
                if($scope.members[i].id == user.id)
                {
                  isPresent = true;
                }
              }
              if(!isPresent)
              {
                resultUserObj.name = user.attributes.name;
                  resultUserObj.email = user.attributes.username;
                  resultUserObj.id = user.id;
                  resultUserObj.isAdded = true;
                resultUser.push(resultUserObj);
              }
              
            }
            else
            {
              resultUserObj.name = user.attributes.name;
              resultUserObj.email = user.attributes.username;
              resultUserObj.isAdded = true;
              resultUserObj.id = user.id;
              resultUser.push(resultUserObj);
            }
            }    
        });
         $scope.showUser = true;
        $scope.resultUser = resultUser;
        $scope.$apply();
      }})

  }

  $scope.addMembers = function(user) {

    if($scope.members.length !=0)
    {
          var resultUserObj = {name:'',email:'',id:''};
          resultUserObj.name = user.name;
          resultUserObj.email = user.username;
          resultUserObj.id = user.id;
           for(var i = 0 ;i < $scope.resultUser.length;i++)
          {
            if($scope.resultUser[i].id == user.id) 
            {
              $scope.resultUser[i].isAdded = false;
              $scope.resultUser[i] = {};
              $scope.members.push(resultUserObj);
            }
          }
    }
    else
    {
      for(var i = 0 ;i < $scope.resultUser.length;i++)
          {
            if($scope.resultUser[i].id == user.id) {
              var resultUserObj = {name:'',email:'',id:''};
              resultUserObj.name = user.name;
              resultUserObj.email = user.username;
              resultUserObj.id = user.id;
              $scope.resultUser[i].isAdded = false;
              $scope.resultUser[i] = {};
              $scope.members.push(resultUserObj);
            }
          }
    }
  }

  $scope.removeMembers = function(user) {
    for(var i = 0 ;i < $scope.members.length;i++)
    {
      if($scope.members[i].id == user.id) {
        $scope.members.splice(user,1);
      }
    }
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

  $scope.submitTrip = function(tripDetails){
    var userTemp = _.pluck($scope.members,'id');
    var userArray = [];
    var tripObj = Parse.Object.extend('trips');
    var obj = new tripObj();
   
    obj.set('name',tripDetails.name);
    obj.set('date',tripDetails.date);
    obj.set('parent',$rootScope.currentUser.id);
    obj.set('members',userArray);
    obj.save(null,{
      success:function(results){
        console.log(results)
        _.each(userTemp,function(list){
           var notificationObj = Parse.Object.extend('notification');
          var newObj = new notificationObj();
          newObj.set('name',results.attributes.name);
          newObj.set('date',results.attributes.date);
          newObj.set('parent',results.attributes.parent);
          newObj.set('tripId',results.id);
          newObj.set('confirmed',false);
          console.log(list)
          newObj.set('userTripId',list);
          newObj.save(null,{
            success:function(result){
              console.log(result);
            },error:function(err){

            }
          })
        })
        $mdDialog.show(
          $mdDialog.alert()
            .parent(angular.element(document.body))
            .title('Alert Message')
            .content('You Have successfully Created a Trip')
            .ariaLabel('Alert Dialog Demo')
            .ok('Got it!')
        );
        $scope.tripDetails = {};
        $scope.members = [];
        $state.go('tab.dash');
    },error:function(err){

    }
  });


  }

/*  $scope.popover = $ionicPopover.fromTemplateUrl('templates/templateUrl.html', {
    scope: $scope
  }).then(function(popover) {
    console.log(popover)
    $scope.popover = popover;
  });*/

})
.controller('tripExpCtrl',function($scope,mySharedService,$mdDialog,$ionicPopover,$rootScope){

    $scope.expensesItem =  mySharedService.message;

     $scope.popover = $ionicPopover.fromTemplateUrl('templates/templateUrl.html', {
        scope: $scope
      }).then(function(popover) {
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

  $scope.addExpenses = function(exp)
    {
      var expObj = Parse.Object.extend('expenses');
      var obj = new expObj();
      obj.set('name',exp.name);
      obj.set('amount',parseInt(exp.amount));
      obj.set('tripId',mySharedService.idVal);
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
.controller('sumExpCtrl',function($scope,$rootScope,mySharedService){
    $scope.users = mySharedService.exp;
})
.controller('profileCtrl',function($scope,$rootScope,$ionicHistory,$state){
    var profileUser = {};
    $scope.profileUser = {};
    $scope.isFieldEnabled = true;
    profileUser.id = $rootScope.currentUser.id;
    profileUser.name = $rootScope.currentUser.attributes.name;
    profileUser.userName = $rootScope.currentUser.attributes.username;
    profileUser.emailId = $rootScope.currentUser.attributes.email;
    $scope.profileUser = profileUser;

    $scope.editFields = function() {
      $scope.isFieldEnabled = false;
    }

    $scope.updateFields =function(user) {
      console.log(user)
      var query = new Parse.Query(Parse.User);
      query.equalTo('objectId',$rootScope.currentUser.id);
      query.first({success:function(obj){
        obj.set('name',user.name);
        obj.set('email',user.emailId);
        if(user.hasOwnProperty('password')){
          obj.set('password',user.password);
        }
        obj.save(null,{success:function(res){
          $scope.isFieldEnabled = true;
          /*$ionicHistory.clearCache();
          $ionicHistory.clearHistory();*/
          /*$rootScope.currentUser = Parse.User.current();
          $rootScope.getAllUsers($scope.getNotification);*/
          $scope.$apply();
        }})
      }})
    }

    $scope.logOutUser = function()
    {
      $rootScope.currentUser = null;
      $rootScope.notificationObj = [];
      Parse.User.logOut();
      $ionicHistory.clearCache();
      $ionicHistory.clearHistory();
      $state.go('login');  
    }
});

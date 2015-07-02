angular.module('starter.services', ['underscore'])

.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'https://avatars3.githubusercontent.com/u/11214?v=3&s=460'
  },{
    id: 2,
    name: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'https://pbs.twimg.com/profile_images/479090794058379264/84TKj_qa.jpeg'
  }, {
    id: 3,
    name: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'https://pbs.twimg.com/profile_images/598205061232103424/3j5HUXMY.png'
  }, {
    id: 4,
    name: 'Mike Harrington',
    lastText: 'This is wicked good ice cream.',
    face: 'https://pbs.twimg.com/profile_images/578237281384841216/R3ae1n61.png'
  }];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  };
})
.service('Data',function(_){

  var calculateSummary = function (details,userVar) {
        var finalArray = [];
        var name = _.pluck(userVar,'name');
        //var name = ["A", "B", "C","D","E"];
        var arr = [];
        _.each(userVar, function (val) {
            var sum = 0;
            _.each(details, function (some) {
                if (val.id === some.id) {
                    sum = sum + some.exp;
                }
            });
            arr.push({
                'id':val.id,
                'name': val.name,
                'total': sum
            });
        });
        var sumArray = _.pluck(arr, 'total');
        var total = _.reduce(sumArray, function (memo, num) {
            return memo + num;
        }, 0);
        var balance = total / name.length;
        _.each(arr, function (user) {
            finalArray.push({
                "id":user.id,
                "name": user.name,
                'exp': user.total - balance
            })
        });
        var tmp = _.pluck(finalArray, 'exp');
        var finalUsers = call(tmp,finalArray);
        return finalUsers;
    } 

    function call(arrt,user)
    {   
        for(var i=0;i<arrt.length;i++)
        {   
            if(arrt[i]>0)
            {     user[i].owe = [];
                 user[i].lend = [];
                 
                for(var j=0;j<arrt.length;j++)
                {    
                    if(arrt[j] < 0 && i!=j)
                    { user[j].lend = [];
                      user[j].owe = [];
                        if(arrt[i]!=0)
                        {
                            
                        if(Math.abs(arrt[j]) <=arrt[i])
                        {
                            arrt[i]=arrt[i]+arrt[j];
                            user[i].owe.push({'name':user[j].name,'amount':Math.abs(arrt[j])});
                            user[j].lend.push({'name':user[i].name,'amount':Math.abs(arrt[j])});
                            arrt[j]=0;
                            
                            
                        }
                        else
                        {
                            if(Math.abs(arrt[j]) > arrt[i])
                        {
                            arrt[j]=arrt[i]+arrt[j];
                            user[i].owe.push({'name':user[j].name,'amount':Math.abs(arrt[i])});
                             user[j].lend.push({'name':user[i].name,'amount':Math.abs(arrt[i])});
                            arrt[i]=0;
                           
                           
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
      calculateSummary:calculateSummary
    }
})

.factory('mySharedService', function($rootScope) {
    var sharedService = {};
    
    sharedService.message = [];
    sharedService.idVal = '';
    sharedService.exp = [];

    sharedService.prepForBroadcast = function(msg,id) {
        this.message = msg;
        this.idVal = id;
        $rootScope.$broadcast('handleBroadcast');
        //this.broadcastItem();
    };

    sharedService.prepForExpSummary = function(msg) {
        this.exp = msg;
        $rootScope.$broadcast('handleBroadcast'); 
    }

    sharedService.broadcastItem = function() {
        $rootScope.$broadcast('handleBroadcast');

    };

    return sharedService;
})
.service('loadingScreen',function($ionicLoading){
     var showNotification = function() {
          $ionicLoading.show({
            noBackdrop: true,
            template: '<p class="item-icon-left">Loading stuff...<ion-spinner icon="lines"/></p>'
          });
        };

    var hideNotification = function(){
      $ionicLoading.hide();
    };

    return {
        showNotification : showNotification,
        hideNotification : hideNotification
    }
})

.factory('$localstorage',function($window){
    return {
        set:function(key,val) {
            $window.localStorage[key] = val;
        },
        get:function(key) {
            return $window.localStorage[key];
        },
        setObject:function(key,val) {
            $window.localStorage[key] = JSON.stringify(val);
        },
        getObject:function(key) {
            return JSON.stringify($window.localStorage[key]);
        },
        deleteObject:function(key) {
            $window.localStorage.removeItem(key);
        }

    }
});

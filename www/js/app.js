// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services','underscore','ngMaterial','ngCordova'])

.run(function($ionicPlatform,$ionicPopup,$state,$ionicHistory,$localstorage,$rootScope) {

   /* if($localstorage.getObject('User')) {
      console.log('yo')
      $state.go('tab.dash');
    }*/
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
      console.log(fromState)
      if(fromState.url === '/dash') {
        $ionicPlatform.onHardwareBackButton(function (event) {
        $ionicPopup.confirm({
                title: 'System warning',
                template: 'are you sure you want to exit?'
              }).then(function(res){
                if(res){
                  navigator.app.exitApp();
                }
              })
        //$ionicHistory.clearHistory();
       /* $ionicPlatform.onHardwareBackButton(function (event) {
              
           })*/
       })
    }
  });
/*
   $ionicPlatform.onHardwareBackButton(function (event) {

      if($ionicHistory.currentStateName() == 'tab.dash') {
          $ionicPopup.confirm({
            title: 'System warning',
            template: 'are you sure you want to exit?'
          }).then(function(res){
            if(res){
              navigator.app.exitApp();
            }
          })
      }
   
  });*/

  Parse.initialize("Bl66NOMwA7tRfb7MlOIOaRhrMPz9jP9znTCbOsOP", "L43adggR803mrSPL53rm137XO9tCONWL1k0lokpJ");
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider,$mdThemingProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the varmious states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
  .state('login',{
    url:'/login',
    cache:false,
    templateUrl:'templates/login.html',
    controller:'loginCtrl'
  })

   .state('register',{
    url:'/register',
    templateUrl:'templates/register.html',
    controller:'loginCtrl'
  })

      .state('internal',{
    url:'/internal',
    cache:false,
     abstract: true,
    templateUrl:'templates/trip-expenses.html',
    controller:'tripExpCtrl'
  })
      .state('internal.addMembers',{
        url:'/addMembers',
        cache:false,
        views:{
          'menuContent':{
            templateUrl:'templates/trip-add-members.html'
          }
        }
      })

      .state('internal.addExpense',{
        url:'/expenses',
        cache:false,
        views:{
          'menuContent':{
            templateUrl:'templates/trip-add-expenses.html'
          }
        }
      })

      .state('internal.viewMembers',{
        url:'/viewMembers',
        cache:false,
        views:{
          'menuContent':{
            templateUrl:'templates/trip-view-members.html'
          }
        }
      })

    .state('external',{
    url:'/external',
    cache:false,
    templateUrl:'templates/summary-expense.html',
    controller:'sumExpCtrl'
  })

   .state('trip',{
    url:'/trip',
    cache:false,
    templateUrl:'templates/trip-main.html',
    controller:'tripCtrl'
  })

   .state('profile',{
    url:'/profile',
    cache:false,
    templateUrl:'templates/profile-main.html',
    controller:'profileCtrl'
  })

  // setup an abstract state for the tabs directive
    .state('tab', {
    url: "/tab",
    abstract: true,
    templateUrl: "templates/tabs.html"
  })

  // Each tab has its own nav history stack:

  .state('tab.dash', {
    url: '/dash',
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-dash.html',
        controller: 'DashCtrl'
      }
    }
  })

   .state('tab.expenses', {
    url: '/expenses',
    views: {
      'tab-expenses': {
        templateUrl: 'templates/tab-expenses.html',
        controller: 'expenseCtrl'
      }
    }
  })
  .state('tab.summary', {
      url: '/summary',
      views: {
        'tab-summary': {
          templateUrl: 'templates/tab-summary.html',
          controller: 'summaryCtrl'
        }
      }
    })
    .state('tab.chat-detail', {
      url: '/chats/:chatId',
      views: {
        'tab-chats': {
          templateUrl: 'templates/chat-detail.html',
          controller: 'ChatDetailCtrl'
        }
      }
    })

   /*    .state('profile',{
    url:'/profile',
    cache:false,
    templateUrl:'templates/profile-main.html',
    controller:'profileCtrl'
  })*/


  .state('tab.profile', {
    url: '/profile',
    cache:false,
    views: {
      'tab-profile': {
        templateUrl: 'templates/profile-main.html',
        controller: 'profileCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');

});

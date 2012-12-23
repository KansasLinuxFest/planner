requirejs.config({
  paths: {
    jquery: "/static/javascripts/vendor/jquery",
    knockout: "/static/javascripts/vendor/knockout"
  }
});

define(['knockout', 'viewmodels'], function(ko, vm) {
  var task_list = new vm.TaskList();

  return {
    task_list : task_list
  }
});
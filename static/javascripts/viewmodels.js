requirejs.config({
  paths: {
    knockout: "/static/javascripts/vendor/knockout",
    jquery:   "/static/javascripts/vendor/jquery"
  }
});

define(['knockout', 'jquery'], function(ko, $) {
  var resource = "/",
      csrf_token = $('input[name="csrfmiddlewaretoken"]').val(),
      post_object = {
        'csrfmiddlewaretoken': csrf_token
      };

  // View-model for a task
  function Task(id, markdown, html) {
    var self = this;

    // Data members
    self.id = ko.observable(id);
    self.markdown = ko.observable(markdown);
    self.html = ko.observable(html);
    self.is_being_edited = ko.observable(false);

    // Methods to manage the task
    self.edit = function edit() {
      self.is_being_edited(true);
    };

    self.defer = function defer() {
      var new_post_object = {}; 
      $.extend(new_post_object, post_object, {
        'pk': self.id,
        'defer': 1
      });

      $.post(resource, new_post_object);
    };

    self.done = function done() {
    };
  };

  function TaskList() {
    var self = this;

    // Data members
    self.tasks = ko.observableArray();

    // Methods to manage the list
    self.done = function done(task) {
      task.done();

      // Update the view-model
      self.tasks.remove(task);
    };
    
    self.defer = function defer(task) {
      task.defer();

      // Update the view-model
      self.tasks.remove(task);
    };

    self.add_today = function add_today() {
    };

    self.add_tomorrow = function add_tomorrow() {
    };
  };

  return {
    Task: Task,
    TaskList: TaskList
  };
});

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
      },
      NEW_ID = 'new';

  // View-model for a task
  function Task(id, markdown, html, ibe) {
    var self = this;

    // Data members
    self.id = ko.observable(id);
    self.markdown = ko.observable(markdown);
    self.html = ko.observable(html);

    // If argument supplied, respect it, else default to false
    self.is_being_edited = ibe === undefined ? ko.observable(false) : ko.observable(ibe);

    this.is_being_edited.subscribe(function edit_post(new_is_being_edited) {
      if ( !new_is_being_edited ) {
        // Only if the editor has lost focus, do we update, or create
        if ( self.id() === NEW_ID ) {
          // A new object should be created
          var new_post_object = {};
          $.extend(new_post_object, post_object, {
            'task': self.markdown()
          });

          $.post(resource, new_post_object,
            function (response) {
              var response = JSON.parse(response)
                , html = response.html
                , id = response.id;

              self.html(html);
              self.id(id);
            });
        } else {
          // For existing objects 
          var new_post_object = {};
          $.extend(new_post_object, post_object, {
            'pk': self.id,
            'task': self.markdown()
          });

          $.post(resource, new_post_object, 
            function (response) {
              var response = JSON.parse(response)
                , html = response.html;

              self.html(html);
            });
        }
      }
    });

    // Methods to manage the task
    self.edit = function edit() {
      self.is_being_edited(true);
    };

    self.defer = function defer() {
      // Create a new object with all the properties in post_object
      var new_post_object = {}; 
      $.extend(new_post_object, post_object, {
        'pk': self.id,
        'defer': 1
      });

      $.post(resource, new_post_object);
    };

    self.done = function done() {
      // Create a new object with all the properties in post_object
      var new_post_object = {};
      $.extend(new_post_object, post_object, {
        'pk': self.id,
        'done': 1
      });

      $.post(resource, new_post_object);
    };
  };

  function TaskList(tasks, day, full_date, human_date) {
    var self = this;

    // Data members
    self.tasks = ko.observableArray(tasks);
    self.day = ko.observable(day);
    self.full_date = ko.observable(full_date);
    self.human_date = ko.observable(human_date);


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
      var nt = new Task(NEW_ID, '- ', '<p></p>', true);

      self.tasks.unshift(nt);
    };

    self.add_tomorrow = function add_tomorrow() {
    };
  };

  return {
    Task: Task,
    TaskList: TaskList
  };
});

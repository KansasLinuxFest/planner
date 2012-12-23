requirejs.config({
  paths: {
    knockout: "/static/javascripts/vendor/knockout",
  }
});

define(['knockout'], function(ko) {
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
      // TODO actual marking on server
      console.log('defered');
    };

    self.done = function done() {
      // TODO actual marking on server
      console.log('done');
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
  };

  return {
    Task: Task,
    TaskList: TaskList
  };
});

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
  function Task(id, markdown, html, done, ibe) {
    var self = this;

    // Data members
    self.id = ko.observable(id);
    self.markdown = ko.observable(markdown);
    self.html = ko.observable(html);
    self.done = ko.observable(done);

    // If argument supplied, respect it, else default to false
    self.is_being_edited = ibe === undefined ? ko.observable(false) : ko.observable(ibe);

    this.is_being_edited.subscribe(function edit_post(new_is_being_edited) {
      if ( !new_is_being_edited ) {
        // Only if the editor has lost focus, do we update, or create
        if ( self.id() === NEW_ID ) {
          // Create only if there is substantial data. I mean, why would you
          // accept "- a" as a task?
          if ( self.markdown().length < 4 ) {
            return;
          }

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

    self.mark_done = function mark_done() {
      // If done, mark as undone, else, mark as done

      // Create a new object with all the properties in post_object
      var new_post_object = {};
      $.extend(new_post_object, post_object, {
        'pk': self.id,
        'done': self.done() ? 0 : 1
      });

      $.post(resource, new_post_object);
      self.done(!self.done());
    };
  };

  function TaskList(tasks, day, date, full_date, human_date) {
    var self = this;

    // Data members
    self.tasks = ko.observableArray(tasks);
    self.day = ko.observable(day);
    self.full_date = ko.observable(full_date);
    self.human_date = ko.observable(human_date);
    self.date = ko.observable(date);


    // Methods to manage the list
    self.done = function done(task) {
      task.mark_done();
     };
    
    self.defer = function defer(task) {
      task.defer();

      // Update the view-model
      self.tasks.remove(task);
    };

    self.add_today = function add_today() {
      var nt = new Task(NEW_ID, '- ', '<p></p>', false, true);

      self.tasks.unshift(nt);
    };

    // Methods to amend entire list
    self.update_from_response = function update_from_response(response) {
      var resp = JSON.parse(response);

      self.human_date(resp.human);
      self.date(resp.date);
      self.tasks([]);

      for (var i=0, tmp_task; i<resp.tasks.length; i++) {
        tmp_task = resp.tasks[i];

        self.tasks.push(new Task(tmp_task.pk,
              tmp_task.markdown,
              tmp_task.html,
              tmp_task.done));
      }
    };
    self.get_unfinished = function get_unfinished() {
      $.get(resource, { 'done' : 0, 'type': 'JSON' }, self.update_from_response);
    };

    self.get_for_date = function get_for_date(date) {
      $.get(resource, {'date': date, 'type': 'JSON'}, self.update_from_response);
    };

    self.get_date_string = function get_date_string(date) {
      return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
    };

    self.get_yesterdays = function get_yesterdays() {
      var date = new Date();
      date.setDate(date.getDate() - 1);

      // This is something like a strftime call. It takes a js Date object and
      // converts it to 2013-01-12
      self.get_for_date(self.get_date_string(date));
    };

    self.get_tomorrows = function get_tomorrows() {
      var date = new Date();
      date.setDate(date.getDate() + 1);

      self.get_for_date(self.get_date_string(date));
    };

    self.get_todays = function get_todays() {
      var date = new Date();

      self.get_for_date(self.get_date_string(date));
    };
  };



  return {
    Task: Task,
    TaskList: TaskList
  };
});

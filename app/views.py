from datetime import datetime, date

from django.http import HttpResponse
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.template.loader import render_to_string
from django.views.generic import View

from app.models import Task

def get_day_of_week(date):
  """ Returns the day of the week for the date object passed. """
  return date.strftime("%A")

def get_full_date(date):
  """ Returns a string like 'November 27, 2009' """
  return date.strftime("%B %d, %Y")

def date_from_string(indate):
  """ Returns a python datetime.date object from a string formatted as
  '2012-11-21' = 'yyyy-mm-dd' """
  return datetime.strptime(indate, "%Y-%m-%d")

def json_from_task(tasks, singleton=False):
  """ Returns a JSON string of the tasks.
  
  If you want the object to be treated as a single element (the JSON will have
  a single object), pass the singleton argument as True. On the other hand, if
  you want the tasks to be treated as a list, (the JSON will be an array even
  if there is only one element) """
  if singleton:
    return render_to_string('task-single.json', {'task': tasks})
  else:
    return render_to_string('task-list.json', {'tasks': tasks})


""" Defines a set of exceptions with proper error codes according to my
interpretation of the HTTP standard.

http://en.wikipedia.org/wiki/List_of_HTTP_status_codes
"""
class HttpResponseBadRequest(HttpResponse):
  def __init__(self, *args, **kwargs):
    super(HttpResponseBadRequest, self).__init__(*args, **kwargs)
    self.status_code = 400

class HttpResponseCreated(HttpResponse):
  def __init__(self, *args, **kwargs):
    super(HttpResponseCreated, self).__init__(*args, **kwargs)
    self.status_code = 201



class Home(View):
  """ Defines the get/post/update/delete actions for the only view in the app.

  Note that even the delete, update methods are routed through a POST request
  on part of the client. This isn't very RESTful, but works on older browsers
  and can degrade gracefully. """

  def get(self, request, *args, **kwargs):
    """ Returns a fully formatted application or alternatively a JSON of tasks
    if so requested. """
    context = {}
    all_tasks = Task.objects.all()

    today = date.today()
    context['today'] = {'full': get_full_date(today),
        'day': get_day_of_week(today)}

    tasks_for_today = all_tasks.filter(date=today).filter(active=True)
    context['tasks_for_today'] = tasks_for_today

    if 'type' in request.GET and request.GET['type'] == 'JSON':
      return HttpResponse(json_from_task(tasks_for_today))

    return render_to_response('planner.html', context,
        context_instance=RequestContext(request))

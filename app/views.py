from datetime import datetime, date, timedelta

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

def get_human(indate):
  """ Attempts to return a string that best describes the date relative to the
  date today. e.g. Today, Tomorrow, Yesterday, The Day efore Yesterday etc."""
  today = date.today()
  delta = indate - date.today()

  humans = {
      -2 : 'The Day before Yesterday',
      -1 : 'Yesterday',
      0  : 'Today',
      1  : 'Tomorrow',
      2  : 'The Day after Tomorrow'
  }

  try:
    return humans[delta.days]
  except KeyError:
    return "Some Day"


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
        'day': get_day_of_week(today), 
        'human': get_human(today)}

    tasks_for_today = all_tasks.order_by('-pk').filter(date=today)\
        .filter(active=True).filter(done=False)
    context['tasks_for_today'] = tasks_for_today

    if 'type' in request.GET and request.GET['type'] == 'JSON':
      return HttpResponse(json_from_task(tasks_for_today))

    return render_to_response('planner.html', context,
        context_instance=RequestContext(request))


  def post(self, request, *args, **kwargs):
    """ Creates, Updates or Deletes tasks as requested by the client.
    """

    # Create an entirely new object
    if 'pk' not in request.POST:
      # Not enough data to do anything
      if 'task' not in request.POST:
        return HttpResponseBadRequest()

      today = date.today()
      task = Task.objects.create(date=today, task=request.POST['task'],
        done=False)
      task.save()

      return HttpResponseCreated(json_from_task(task, True))

    # This is a request for an update
    if 'pk' in request.POST:
      task = Task.objects.filter(pk=request.POST['pk'])
      if not task.exists():
        return HttpResponseBadRequest()

      task = Task.objects.get(pk=request.POST['pk'])

      if 'done' in request.POST:
        task.done = True if request.POST['done'] == '1' else False

      if 'task' in request.POST:
        task.task = request.POST['task']

      if 'date' in request.POST:
        task.date = date_from_string(request.POST['date'])

      if 'defer' in request.POST:
        task.date = date.today() + timedelta(days=1) if request.POST['defer'] == '1' else date.today()

      if 'active' in request.POST:
        task.active = False if request.POST['active'] == '0' else True

      task.save()
      return HttpResponse(json_from_task(task, True))

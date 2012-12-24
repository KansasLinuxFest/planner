from datetime import datetime, date, timedelta

from django.utils import unittest
from django.test.client import Client

from models import Task

class HomeViewsTestCase(unittest.TestCase):
  def setUp(self):
    self.c = Client()

  def testGet(self):
    response = self.c.get('/')
    self.assertEqual(200, response.status_code, 
        "GET / doesn't return 200.")

  def testJSONGet(self):
    response = self.c.get('/', {'type':'JSON'})
    self.assertEqual(200, response.status_code,
        "GET /type=JSON doesn't return 200.")

  def testPost(self):
    target = '- this is the\n- last time\n- that I will'
    response = self.c.post('/',
        {'task': target})

    self.assertEqual(201, response.status_code,
        "POST / with correct data, doesn't return 201")

    tasks = Task.objects.reverse()
    flag = False
    for a in tasks:
      if a.task == target:
        flag = True

    self.assertEqual(flag, True,
        "POST / with correct data, doesn't create an object.")

  def testUpdate(self):
    # Non-existant primary-key
    response = self.c.post('/',
        {'pk': 100, 'done': 1})
    self.assertEqual(400, response.status_code,
        "POST / with non-existant pk doesn't return 400.")

    # Existant primary-key
    response = self.c.post('/',
        {'pk': 4, 'done': 1})
    self.assertEqual(200, response.status_code,
        "POST / with correct pk doesn't return 200.")

    # Should update the object
    task = Task.objects.get(pk=4)
    self.assertEqual(task.done, True,
        "POST / with correct pk doesn't update *done*")

    # Try updating the task attribute
    target = "Voila, it works!"
    response = self.c.post('/',
        {'pk': 4, 'task': target})
    task = Task.objects.get(pk=4)
    self.assertEqual(task.task, target,
        "POST / with correct pk doesn't update *task*")

    # Try updating the date attribute
    target = "2012-12-19"
    target_dt = datetime.strptime(target, "%Y-%m-%d").date()
    response = self.c.post('/',
        {'pk': 4, 'date': target})
    task = Task.objects.get(pk=4)
    self.assertEqual(task.date, target_dt,
        "POST / with correct pk doesn't update *date*")

    # Try deferring
    target = date.today() + timedelta(days=1)
    response = self.c.post('/',
        {'pk': 4, 'defer': 1})
    task = Task.objects.get(pk=4)
    self.assertEqual(task.date, target,
        "POST / with correct pk doesn't defer to tomorrow")

  def testDelete(self):
    response = self.c.post('/',
        {'pk': 4, 'active': 0})
    task = Task.objects.get(pk=4)
    self.assertEqual(task.active, False,
        "POST / with correct pk doesn't delete")

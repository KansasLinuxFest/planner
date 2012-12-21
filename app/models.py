from django.db import models
from markdown import markdown

class Task(models.Model):
  date = models.DateField()
  done = models.BooleanField(default=False)
  task = models.TextField() # Formatted as markdown
  active = models.BooleanField(default=True)

  def to_ul(self):
    """ Formats the task as an HTML ul and returns a string """
    return markdown(self.task, output_format='html4')

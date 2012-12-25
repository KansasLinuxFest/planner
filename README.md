Planner is a django application to plan out your day in terms of tasks and then
to mark each task as done or defer it to the next day. It aims to be as clutter
free as possible, which is why you might find the lack of features appalling.

This is a single user local installation and at the moment there is no user
verification or login. It is assumed that the user will use a web-server to
guard against requests from external IPs.

## Usage

To set things up, first, you must get a copy of python-virtualenv. Try any of
the following, if you don't have virtualenv already:

- sudo apt-get install python-virtualenv ( or the equivalent for your system)
- sudo pip install virtualenv

### Setting up the virtualenv

```sh
cd planner
virtualenv .
```

This sets up the virtual environment with its own python libraries and its own
packages directory. Activate this environment with

```sh
cd planner
source bin/activate
```

Now install all the requirements of the application.

```sh
pip install -r requirements.txt 
```

### Setting up local settings

Define a localsettings.py file in the app directory: It will be of the form
defined in this [gist][localsettings].

Fill up the details as applicable, and run 

```sh
python manage.py runserver
```

to view the planner application on localhost:8000. Beyond this point, it is
upto you to select the deployment scheme. I prefer nginx proxying requests to a
gunicorn server.

### Contributing and Using

The source code to this application is released under the MIT License (see the
LICENSE file). Some components are subject to their own licenses as indicated
(see static/javascripts/vendor directory). 

[localsettings]: https://gist.github.com/4372489



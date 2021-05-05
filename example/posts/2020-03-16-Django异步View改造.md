---
title: Django异步View改造
subtitle: 文章暂存
author: systemime
date: 2020-03-16
header_img: /img/in-post/2020-10-29/header.jpg
catalog: true
tags:
  - python
---

欢迎来到我的世界.

<!-- more -->

[![](https://miro.medium.com/fit/c/28/28/2*7BDg45SlSMpTlYpITNKLfg.jpeg)
](https://medium.com/@bruno.fosados?source=post_page-----5986c4511ae6--------------------------------)

Hello there! [Django 3.1](https://django.readthedocs.io/en/latest/topics/async.html) finally was released with support for **Class Based Views** and **Function Based Views**, a big thanks for this amazing gift to everyone at the [Django Software Foundation](https://www.djangoproject.com/foundation/).

So here is your quick-start guide on how to start writing asynchronous Django views.

This was a little tricky to get started with, I had to jumped over the process of how the support for _async_ CBV was actually implemented. A good approach if you ask me, to maintain retro compatibility with normal _sync_ requests/response, middleware and all cool features of Django that we all use and love.

Ba [](https://github.com/django/asgiref/)[DjangoCon 2019 — Just Add Await: Retrofitting Async Into Django by Andrew Godwin](https://www.youtube.com/watch?v=d9BAUBEyFgM) which explains how asynchronicity in Django is been implemented, so lets create our first _Async CBV_.

Make sure to use latest **Django** version

    $ pip install git+https://github.com/django/django.git@stable/3.1.x

The current _async_ requests handlers need to check that you actually wrote an _async_ views so to complain with this validation there two ways of doing so:

## 1. Add \`\_is_coroutine = asyncio.coroutines.\_is_coroutine\` property to view.

That’s it, now whatever the implementation of your view might be (`get()`, `post()`, etc) it will be actually handle as an _async_ one, lets add a`POST`:

Please notice the **_async_** and **_await_** keywords you **must** add them in order to to indicate python to get ready and open a space in the event-loop (the thread in which _async_ code runs) and send some awaited `call()` to it, so when that awaited `call()` is resolve (just like promises on JavaScript) python can knows how to handle, this kind of functions have a fancy name, _coroutines_. Ok lets test our view…

Unfortunately, there is not yet support for _async_ development server. So, we need the help of a cool guy called [uvicorn](https://www.uvicorn.org/) checkout the logo is so cool!

    $ pip install uvicorn

If you created your project with a modern version of Django you should have a settings file called: `asgi.py` which basically complains with the [ASGI](https://asgi.readthedocs.io/en/latest/specs/index.html) specification. This file looks like magic, oh yeah!! but its just following a protocol of how to run ASGI application, in django the `get_asgi_application()` function does all the heavy lifting creating a callable handler to run our Django app for us, This handler is invoked by Uvicorn passing the incoming request, so is the main entry point for our django app, similar as its predecessor WSGI. Ok lets gets our hands on it.

    $ uvicorn project.asgi:application --reload

Uvicorn follows python module dot notation to access our `asgi.py`, then the `:` with the name of the handler in this case `application` here is how my `asgi.py` file looks like:

\`djinar\` is the name of my project.

Important thing to notice from this file is the `“DJANGO_SETTINGS_MODULE”` environment variable which if not set, defaults to `“config.settings.local”` which is the same as `config/settings/local.py` my local development settings file, so two options here, your could `export DJANGO_SETTINGS_MODEL='your_project.settings'` to point your _settings.py_ or replace the default value at your _asgi.py_ file before running Uvicorn, so it can find the correct settings file of your Django project.

Let’s make a test `POST` request. I love this cli rest client called `httpie` lets take it for a spin:

    $ pip install httpie  
    ...  
    ...  
    $ http POST localhost:8000  
    ...  
    ...

Oh bummer we forgot to wire-in our view within the **urls.py** file.

lets give it an other try…

    $ http POST http://localhost:8000/offer  
    \# sleep should happen here, then eventually the response.  
    ...This was run asynchronously, man thats a long word :|

Now try increasing/decreasing the `sleep()` time on the _async_ **post** view.

That was it! Now you know how to write _Async_ CBV so create cool async applications that do not block the main thread of your application when running `io` intensive e.g. long take DB queries, reading/writing to disk, sub reques/reponses inside a view, etc…

There is an other way of creating **ACBV**s …

## 2. Using \`\_\_call\_\_\`

At the time of writing this article I was not able to declare the async view in this way. My guess it that the actual support for this is work in progress, I will update this article once this is actually working on the stable branch, If you manage it to work in this way, drop me a line on twitter [@brunuxcom](https://twitter.com/brunuxcom)

Lets go further and create an app for processing and stream live video from webcam using **WebRTC** technologies.

I adapted this from [aiortc](https://github.com/aiortc/aiortc) examples to run with Django, adding all the code here is going to make this post a little bit verbose, so I’m just review the Django related stuff instead, if you would like to run this code in your local, clone the repo:

    $ git clone [git@github.com](mailto:git@github.com):Brunux/djnar.git --branch experiments

Check the [README.md](https://github.com/Brunux/djnar/blob/experiments/README.md) file for instruction on how to setup your local development environment.

So our streaming views should look like this:

We have one TempleView for serving, well, basically static content HTML/CSS/JS.

Magic happens on the `SteamingOfferView`, more specific our `post()` _async_ function in which…

First, we read a posted RTC Session description (line 20) sent from the client check [JS code](https://github.com/Brunux/djnar/blob/experiments/djinar/experiments/static/experiments/streaming.js), this is related to WebRTC Specification, with this description we can create a session between in this case two hosts, web browser client and our Django application, so in response to this session description we create an answer follwing WebRTC specifications (line 75) an send back to the client.

After this connection has been established the web browser client starts sending video over a `track` channel (line 52) using this stream of video we apply a `VideoTransformTrack` (line 60) using the selected transformation on the HTML page send over the `TemplateView`, once it has been proccessed we send it back to the client, we also add some audio track to make it more fun (line 32).

Finally we open a data channel in which we ping →pong, back and forward over a data channel (data track) between the hosts.

As you can see the nature of this kind of communications is totally asynchronous and based on events, so this is a clear example of how we can take advantage of _async_ class based views, processing video in real time and send the result to the client, I wonder what cool apps can we create applying [OpenCV](https://opencv.org/) to the web.

[Over here](https://django.readthedocs.io/en/latest/topics/async.html#async-adapter-functions) you can read about how to run _sync_ code over _async_ an other possible scenarios, this is very useful to make calls to the ORM from _async_ code since currently there is no _async_ support for it (at the time of writing is WIP), spoiler alert, you need to wrap your calls in this way:

```
from asgiref.sync import async\_to\_sync

async def get\_data(...):  
    ...

sync\_get\_data = async\_to\_sync(get\_data)

@async\_to\_sync  
async def get\_other\_data(...):  
    ...


```

If your Django application contains, _io_ intensive operations, rewriting only those _io_ intensive views in an _async_ way, it could help a lot with the performance, in the other hand if your app doesn’t actually have _io_ at all, stay _sync_. _Async_ could be complex and dangerous specially when mixing _asyn_ with _sync_ in different scenarios, so start _sync_ then after applying all possible optimization start writing little pieces of _async_ code until you reach the performance that you want.

Thanks for reading this article, if you enjoy it give it a clamp or drop me a line on twitter [@brunuxcom](https://twitter.com/brunuxcom) have a great day! 
 [https://medium.com/@bruno.fosados/django-async-class-based-views-acbv-5986c4511ae6](https://medium.com/@bruno.fosados/django-async-class-based-views-acbv-5986c4511ae6) 
 [https://medium.com/@bruno.fosados/django-async-class-based-views-acbv-5986c4511ae6](https://medium.com/@bruno.fosados/django-async-class-based-views-acbv-5986c4511ae6)

---
title: Python 实现定时任务（sleep、Timer 、sched、APScheduler） - yudis - 博客园
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

**一、循环 sleep**

![](https://common.cnblogs.com/images/copycode.gif)

from datetime import datetime import time # 每 n 秒执行一次
def timer(n): while True: print(datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
        time.sleep(n) # 2s
timer(2)

![](https://common.cnblogs.com/images/copycode.gif)

缺点：sleep 是一个阻塞函数，只能执行固定间隔时间的任务，无法完成定时任务（在 sleep 的这一段时间，啥都不能做）

**二、threading 模块中的 Timer**

![](https://common.cnblogs.com/images/copycode.gif)

from datetime import datetime from threading import Timer # 打印时间函数
def printTime(inc): print(datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    t \\= Timer(inc, printTime, (inc,))
    t.start() # 2s
printTime(2)

![](https://common.cnblogs.com/images/copycode.gif)

Timer 函数：第一个参数是时间间隔（单位是秒），第二个参数是要调用的函数名，第三个参数是调用函数的参数 (tuple)

缺点：threading 模块中的 Timer 是一个非阻塞函数，无法完成定时任务

**三、使用 sched 内置模块**

![](https://common.cnblogs.com/images/copycode.gif)

import sched import time from datetime import datetime # 初始化 sched 模块的 scheduler 类 # 第一个参数是一个可以返回时间戳的函数，第二个参数可以在定时未到达之前阻塞。
schedule = sched.scheduler(time.time, time.sleep) # 被周期性调度触发的函数
def printTime(inc): print(datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    schedule.enter(inc, 0, printTime, (inc,)) # 默认参数 60s
def main(inc=60): # enter 四个参数分别为：间隔事件、优先级（用于同时间到达的两个事件同时执行时定序）、被调用触发的函数，

    # 给该触发函数的参数（tuple形式）

 schedule.enter(0, 0, printTime, (inc,))
    schedule.run() # 10s 输出一次
main(10)

![](https://common.cnblogs.com/images/copycode.gif)

sched 模块是 Python 内置的模块，它是一个调度（延时处理机制），每次想要定时执行某任务都必须写入一个调度。

sched 使用步骤如下：

1）生成调度器：  
s = sched.scheduler(time.time,time.sleep)  
第一个参数是一个可以返回时间戳的函数，第二个参数可以在定时未到达之前阻塞。

（2）加入调度事件  
其实有 enter、enterabs 等等，我们以 enter 为例子。  
s.enter(x1,x2,x3,x4)  
四个参数分别为：间隔事件、优先级（用于同时间到达的两个事件同时执行时定序）、被调用触发的函数，给触发函数的参数（注意：一定要以 tuple 给，如果只有一个参数就 (xx,)）

（3）运行  
s.run()  
注意 sched 模块不是循环的，一次调度被执行后就 Over 了，如果想再执行，请再次 enter

**四、APScheduler 定时框架 ([原文链接](https://apscheduler.readthedocs.io/en/latest/userguide.html))**

APScheduler 是一个 Python 定时任务框架，提供了基于日期、固定时间间隔以及 crontab 类型的任务，并且可以持久化任务、并以 daemon 方式运行应用。

安装：

$ pip install apscheduler

 案例：周一到周五每天早上 6 点半执行任务

![](https://common.cnblogs.com/images/copycode.gif)

from apscheduler.schedulers.blocking import BlockingScheduler from datetime import datetime # 输出时间
def job(): print(datetime.now().strftime("%Y-%m-%d %H:%M:%S")) # BlockingScheduler
scheduler = BlockingScheduler()
scheduler.add_job(job, 'cron', day_of_week='1-5', hour=6, minute=30)
scheduler.start()

![](https://common.cnblogs.com/images/copycode.gif)

BlockingScheduler 是 APScheduler 中的调度器，APScheduler 中有两种常用的调度器，BlockingScheduler 和 BackgroundScheduler，当调度器是应用中唯一要运行的任务时，使用 BlockingSchedule，如果希望调度器在后台执行，使用 BackgroundScheduler。

BlockingSchedule：当调度器是应用中唯一要运行的任务时

BackgroundScheduler：如果希望调度器在后台执行，使用 BackgroundScheduler

APScheduler 四个组件分别为：**触发器 (trigger)，作业存储 (job store)，执行器 (executor)，调度器 (scheduler)**。

**触发器 (trigger)**：包含调度逻辑，每一个作业有它自己的触发器，用于决定接下来哪一个作业会运行。

**APScheduler 有三种内建的 trigger:**  
**date:** 特定的时间点触发：

最基本的一种调度，作业只会执行一次。它的参数如下：

-   run_date: 在某天执行任务
-   timezone: 在某段时间执行任务

![](https://common.cnblogs.com/images/copycode.gif)

from datetime import date from apscheduler.schedulers.blocking import BlockingScheduler
sched \\= BlockingScheduler() def my_job(text): print(text) # The job will be executed on November 6th, 2009
sched.add_job(my_job, 'date', run_date=date(2009, 11, 6), args=\['text'])
sched.add_job(my_job, 'date', run_date=datetime(2009, 11, 6, 16, 30, 5), args=\['text'])
sched.add_job(my_job, 'date', run_date='2009-11-06 16:30:05', args=\['text']) # The 'date' trigger and datetime.now() as run_date are implicit
sched.add_job(my_job, args=\['text'])
sched.start()

![](https://common.cnblogs.com/images/copycode.gif)

interval: 固定时间间隔触发：

-   weeks: 每隔几周执行一次 |　weeks=0
-   days: 每隔几天执行一次 | days=0
-   hours: 每隔几小时执行一次 | hours=0
-   minutes: 每隔几分执行一次 | minutes=0
-   seconds: 每隔几秒执行一次 | seconds=0
-   start_date: 最早执行时间 | start_date=None
-   end_date: 最晚执行时间 | end_date=None
-   timezone: 执行时间区间 | timezone=None

![](https://common.cnblogs.com/images/copycode.gif)

from datetime import datetime from apscheduler.schedulers.blocking import BlockingScheduler def job_function(): print("Hello World") # BlockingScheduler
sched = BlockingScheduler() # Schedule job_function to be called every two hours
sched.add_job(job_function, 'interval', hours=2) # The same as before, but starts on 2010-10-10 at 9:30 and stops on 2014-06-15 at 11:00
sched.add_job(job_function, 'interval', hours=2, start_date='2010-10-10 09:30:00', end_date='2014-06-15 11:00:00')
sched.start()

![](https://common.cnblogs.com/images/copycode.gif)

cron: 在特定时间周期性地触发：

-   year: 4 位数字
-   month: 月 (1-12)
-   day: 天 (1-31)
-   week: 标准周 (1-53)
-   day_of_week: 周中某天 (0-6 or mon,tue,wed,thu,fri,sat,sun)
-   hour: 小时 (0-23)
-   minute: 分钟 (0-59)
-   second: 秒 (0-59)
-   start_date: 最早执行时间
-   end_date: 最晚执行时间
-   timezone: 执行时间区间

表达式:

![](https://lz5z.com/assets/img/python_timer_expression.png)

![](https://common.cnblogs.com/images/copycode.gif)

from apscheduler.schedulers.blocking import BlockingScheduler def job_function(): print("Hello World") # BlockingScheduler
sched = BlockingScheduler() # Schedules job_function to be run on the third Friday # of June, July, August, November and December at 00:00, 01:00, 02:00 and 03:00
sched.add_job(job_function, 'cron', month='6-8,11-12', day='3rd fri', hour='0-3') # Runs from Monday to Friday at 5:30 (am) until 2014-05-30 00:00:00
sched.add_job(job_function, 'cron', day_of_week='mon-fri', hour=5, minute=30, end_date='2014-05-30')
sched.start()

![](https://common.cnblogs.com/images/copycode.gif)

**作业存储 (job store)：**  
存储被调度的作业，默认的作业存储是简单地把作业保存在内存中，其他的作业存储是将作业保存在数据库中。一个作业的数据讲在保存在持久化作业存储时被序列化，并在加载时被反序列化。调度器不能分享同一个作业存储。  
APScheduler 默认使用 MemoryJobStore，可以修改使用 DB 存储方案

**执行器 (executor)：** 

处理作业的运行，他们通常通过在作业中提交制定的可调用对象到一个线程或者进程池来进行。当作业完成时，执行器将会通知调度器。  
最常用的 executor 有两种：  
ProcessPoolExecutor（进程池）  
ThreadPoolExecutor（线程池，max:10）

**调度器 (scheduler)：**  
通常在应用中只有一个调度器，应用的开发者通常不会直接处理作业存储、调度器和触发器，相反，调度器提供了处理这些的合适的接口。配置作业存储和执行器可以在调度器中完成，例如添加、修改和移除作业。

配置调度器：  
APScheduler 提供了许多不同的方式来配置调度器，你可以使用一个配置字典或者作为参数关键字的方式传入。

![](https://common.cnblogs.com/images/copycode.gif)

from apscheduler.schedulers.blocking import BlockingScheduler from datetime import datetime def job(): print(datetime.now().strftime("%Y-%m-%d %H:%M:%S")) # 定义 BlockingScheduler
sched = BlockingScheduler()
sched.add_job(job, 'interval', seconds=5)
sched.start()

![](https://common.cnblogs.com/images/copycode.gif)

\# 设置 job store(使用 mongo 存储) 和 executor

![](https://common.cnblogs.com/images/copycode.gif)

from datetime import datetime from pymongo import MongoClient from apscheduler.schedulers.blocking import BlockingScheduler from apscheduler.jobstores.memory import MemoryJobStore from apscheduler.jobstores.mongodb import MongoDBJobStore from apscheduler.executors.pool import ThreadPoolExecutor, ProcessPoolExecutor # MongoDB 参数
host = '127.0.0.1' port \\= 27017 client \\= MongoClient(host, port) # 输出时间
def job(): print(datetime.now().strftime("%Y-%m-%d %H:%M:%S")) # 存储方式
jobstores = { 'mongo': MongoDBJobStore(collection='job', database='test', client=client), 'default': MemoryJobStore()
}
executors \\= { 'default': ThreadPoolExecutor(10), 'processpool': ProcessPoolExecutor(3)
}
job_defaults \\= { 'coalesce': False, 'max_instances': 3 }
scheduler \\= BlockingScheduler(jobstores=jobstores, executors=executors, job_defaults=job_defaults)
scheduler.add_job(job, 'interval', seconds=5, jobstore='mongo')
scheduler.start()

![](https://common.cnblogs.com/images/copycode.gif)

**添加 job：**  
add_job()  
scheduled_job()  
第一种方法返回一个 apscheduler.job.Job 的实例，可以用来改变或者移除 job，第二种方法只适用于应用运行期间不会改变的 job。

![](https://common.cnblogs.com/images/copycode.gif)

from apscheduler.schedulers.blocking import BlockingScheduler
sched \\= BlockingScheduler() # 装饰器
@sched.scheduled_job('interval', id='my_job_id', seconds=5) def job_function(): print("Hello World") # 开始
sched.start()

![](https://common.cnblogs.com/images/copycode.gif)

**移除 job：**  
remove_job 使用 jobID 移除  
job.remove() 使用 add_job() 返回的实例

job = scheduler.add_job(myfunc, 'interval', minutes=2)
job.remove() # id
scheduler.add_job(myfunc, 'interval', minutes=2, id='my_job_id')
scheduler.remove_job('my_job_id')

**暂停一个 job：** 

apscheduler.job.Job.pause()
apscheduler.schedulers.base.BaseScheduler.pause_job()

**恢复一个 job：** 

apscheduler.job.Job.resume()
apscheduler.schedulers.base.BaseScheduler.resume_job()

**获取 job 列表：** 

**修改 job：** 

 apscheduler.job.Job.modify() 或者 modify_job() 修改一个 job 的属性

job.modify(max_instances=6, name='Alternate name')
modify_job('my_job_id', trigger='cron', minute='\*/5')

**关闭 job:**

默认情况下调度器会等待所有的 job 完成后，关闭所有的调度器和作业存储。将 wait 选项设置为 False 可以立即关闭。

scheduler.shutdown()
scheduler.shutdown(wait\\=False)

scheduler 可以添加事件监听器，并在特殊的时间触发

![](https://common.cnblogs.com/images/copycode.gif)

def my_listener(event): if event.exception: print('The job crashed :(') else: print('The job worked :)') # 添加监听器
scheduler.add_listener(my_listener, EVENT_JOB_EXECUTED | EVENT_JOB_ERROR)

![](https://common.cnblogs.com/images/copycode.gif) 
 [https://www.cnblogs.com/yudis/articles/9790035.html](https://www.cnblogs.com/yudis/articles/9790035.html) 
 [https://www.cnblogs.com/yudis/articles/9790035.html](https://www.cnblogs.com/yudis/articles/9790035.html)

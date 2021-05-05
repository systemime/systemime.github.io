---
title: Django asyncio 配合使用
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

被问到如何在django中使用asyncio , 突然闷比, 没学过django, <br />快速入门后 , 搞了一下, 发现还是可以配合使用,<br />至于效果就不知道了 ,没并发测试过<br />具体方法是动态添加协程; [动态添加协程](https://blog.csdn.net/dashoumeixi/article/details/86698350)<br />只是给出一个思路:<br />就只放视图函数了,  路由那些自己随意配把; <br />下面代码中用了aiomysql 
```
1. from django.http import HttpRequest,HttpResponse
2. from django.shortcuts import render,redirect
3. import aiomysql
4. import asyncio
5. import threading
6. import time
7. thread_handler = None
8. from concurrent.futures import ThreadPoolExecutor,as_completed
9. 
10. #创建一个ioloop给线程用
11. lp = asyncio.new_event_loop() #type:asyncio.AbstractEventLoop
12. #mysql pool
13. pool = None
14. 
15. #线程函数, 在线程中启动一个ioloop
16. def ioloop(lp : asyncio.AbstractEventLoop):
17.     print("thread id:" , threading.currentThread().ident)
18.     asyncio.set_event_loop(lp)
19.     lp.run_forever()
20. 
21. #启动线程
22. def start_ioloop():
23.     thread_handler = threading.Thread(target=ioloop,args=(lp,))
24.     thread_handler.start()
25. 
26. #这里用了aiomysql
27.     fu = asyncio.run_coroutine_threadsafe(init_mysql_pool(lp),lp)
28.     fu.result() #等待直到mysql初始化完
29.     print("初始化mysql -> ok")
30. 
31. 
32. 
33. #视图函数 
34. def classes(req:HttpRequest):
35. 
36. #select_from_db()创建生成器对象, 仍进ioloop中
37.     fu = asyncio.run_coroutine_threadsafe(select_from_db(),lp)
38. 
39. #这个 furture对象是concurrent.futures中的, 因此将阻塞,我这里只是测试
40. #你可以完全不等待
41.     ret = fu.result()
42. return render(req,"classes.html",{"class_list" : ret})
43. 
44. #视图函数 , 测试插入一个数据
45. def addclass(req:HttpRequest):
46. if req.method == "GET":
47. return render(req,"addclass.html")
48. elif req.method == "POST":
49.         classname = req.POST.get("cls",None)
50.         d = {
51. "title" : classname
52.         }
53. 
54. # 动态添加一个生成器对象
55.         fu = asyncio.run_coroutine_threadsafe(insert_into_db(d),lp)
56.         fu.result()
57. return redirect("/classes/")
58. 
59. 
60. #插入mysql用的
61. async def insert_into_db(d : dict , table="classes"):
62.     keys =  ",".join(d.keys())
63.     values = ",".join(["%s"] * len(d))
64.     sql = "insert into {table}({keys}) VALUES ({values})".format(table=table,
65.                                                                  keys=keys,
66.                                                                  values=values)
67. async  with pool.acquire() as conn:
68. async  with conn.cursor() as cur:
69. await cur.execute(sql,tuple(d.values()))
70. await conn.commit()
71. 
72. 
73. #查询mysql
74. async def select_from_db():
75.     arr = []
76. async  with pool.acquire() as conn:
77. async  with conn.cursor() as cur:
78. await cur.execute("select id,title from classes")
79.             row = await cur.fetchone()
80. while row:
81.                 arr.append(row)
82.                 row = await cur.fetchone()
83. return arr
84. 
85. #关闭用的
86. async def close_mysql():
87.     pool.close()
88. await pool.wait_closed()
89. 
90. 
91. #初始化mysql pool
92. async def init_mysql_pool(lp:asyncio.AbstractEventLoop):
93. global  pool
94.     mysql_settings = {
95. 'db': 'testdb',
96. 'host': '127.0.0.1',
97. 'port': 3306,
98. 'user': 'root',
99. 'password': 'fuck',
100. 'charset': 'utf8',
101. 'maxsize': 50
102.     }
103.     pool = await aiomysql.create_pool(**mysql_settings)
104. 
105. 
106. 
107. #启动ioloop
108. start_ioloop()
```
 

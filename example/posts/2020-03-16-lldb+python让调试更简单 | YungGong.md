---
title: lldb+python让调试更简单 | YungGong
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

\# !/usr/bin/env python

\# -\*- coding: utf-8 -\*-

import lldb

import re

\# 获取 ASLR 偏移地址

def fy_get_ASLR(debugger, command, result, internal_dict):

\# 获取'image list -o'命令的返回结果

    interpreter = lldb.debugger.GetCommandInterpreter()

    returnObject = lldb.SBCommandReturnObject()

    interpreter.HandleCommand('image list -o', returnObject)

    output = returnObject.GetOutput()

\# 正则匹配出第一个 0x 开头的 16 进制地址

    match = re.match(r'.+(0x\[0-9a-fA-F\]+)', output)

if match:

print match.group(1)

else:

return None

def get_ASLR():

\# 获取'image list -o'命令的返回结果

    interpreter = lldb.debugger.GetCommandInterpreter()

    returnObject = lldb.SBCommandReturnObject()

    interpreter.HandleCommand('image list -o', returnObject)

    output = returnObject.GetOutput();

\# 正则匹配出第一个 0x 开头的 16 进制地址

    match = re.match(r'.+(0x\[0-9a-fA-F\]+)', output)

if match:

return match.group(1)

else:

return None

def process_conn(debugger, command, result, internal_dict):

\# 获取'image list -o'命令的返回结果

    interpreter = lldb.debugger.GetCommandInterpreter()

    returnObject = lldb.SBCommandReturnObject()

    interpreter.HandleCommand('process connect connect://127.0.0.1:12345', returnObject)

    output = returnObject.GetOutput()

\# Super breakpoint

def sbr(debugger, command, result, internal_dict):

\#用户是否输入了地址参数

if not command:

print >>result, 'Please input the address!'

return

    ASLR = get\_ASLR()

if ASLR:

\#如果找到了 ASLR 偏移，就设置断点

        debugger.HandleCommand('br set -a "%s+0x%s"' % (ASLR, command))

else:

print >>result, 'ASLR not found!'

def nop_add(debugger, command, result, internal_dict):

\#用户是否输入了地址参数

if not command:

print >>result, 'Please input the address!'

return

    ASLR = get\_ASLR()

if ASLR:

\#如果找到了 ASLR 偏移，就设置断点

        debugger.HandleCommand('memory write "%s+0x%s" 0x1F 0x20 0x03 0xD5' % (ASLR, command))

else:

print >>result, 'ASLR not found!'

def get_base_add(debugger, command, result, internal_dict):

\#用户是否输入了地址参数

if not command:

print >>result, 'Please input the address!'

return

    ASLR = get\_ASLR()

if ASLR:

\#如果找到了 ASLR 偏移，就设置断点

print hex(int(command, 16) - int(ASLR, 16))

else:

print >>result, 'ASLR not found!'

def watch_point(debugger, command, result, internal_dict):

\#用户是否输入了地址参数

if not command:

print >>result, 'Please input the address!'

return

    debugger.HandleCommand('watchpoint set expression "%s"' % (command))

def watch_read_point(debugger, command, result, internal_dict):

\#用户是否输入了地址参数

if not command:

print >>result, 'Please input the address!'

return

    debugger.HandleCommand('watchpoint set expression -w read -- "%s"' % (command))

def \_\_lldb_init_module(debugger, internal_dict):

\#获取偏移地址

    debugger.HandleCommand('command script add -f helloworld.fy\_get\_ASLR pianyi')

\# 'command script add sbr' : 给 lldb 增加一个'sbr'命令

\# '-f sbr.sbr' : 该命令调用了 sbr 文件的 sbr 函数

    debugger.HandleCommand('command script add sbr -f helloworld.sbr')

\#挂载进程连接

    debugger.HandleCommand('command script add -f helloworld.process\_conn pp')

\#内存读断点

    debugger.HandleCommand('command script add mw -f helloworld.watch\_point')

\#内存访问断点

    debugger.HandleCommand('command script add mr -f helloworld.watch\_read\_point')

\#获取实际地址

    debugger.HandleCommand('command script add gba -f helloworld.get\_base\_add')

\#nop 汇编指令

    debugger.HandleCommand('command script add nop -f helloworld.nop\_add') 

 [https://yunnigu.dropsec.xyz/2020/05/29/lldb-python%E8%AE%A9%E8%B0%83%E8%AF%95%E6%9B%B4%E7%AE%80%E5%8D%95/](https://yunnigu.dropsec.xyz/2020/05/29/lldb-python%E8%AE%A9%E8%B0%83%E8%AF%95%E6%9B%B4%E7%AE%80%E5%8D%95/) 
 [https://yunnigu.dropsec.xyz/2020/05/29/lldb-python%E8%AE%A9%E8%B0%83%E8%AF%95%E6%9B%B4%E7%AE%80%E5%8D%95/](https://yunnigu.dropsec.xyz/2020/05/29/lldb-python%E8%AE%A9%E8%B0%83%E8%AF%95%E6%9B%B4%E7%AE%80%E5%8D%95/)

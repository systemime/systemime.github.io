---
title: 使用gdb调试Python程序 | 逸思杂陈
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

由于 Python 解释器是由 C 语言编写，我们可以使用 GDB 来调试 Python 进程，对于程序卡死等异常情况调试比较有帮助。

用 gdb 调试 Python 程序，主要有两个部分

1.  原生的 gdb 命令，调试的的 Python 解释器的 C 代码
2.  `py-bt`等以 py - 为前缀的 Python 扩展命令，可以调试 Python 程序

我们需要通过原生 gdb 命令，如`n`(next)，`b`(break) 等，使 Python 程序运行到我们需要调试的位置。  
然后，通过`py-print`等命令输出我们想要的变量信息

## [](#环境配置 "环境配置")环境配置

不同的 Python 环境，配置方法不太一样，这里推荐 ubuntu 20.04 以上版本

### [](#ubuntu-20-04 "ubuntu 20.04")ubuntu 20.04

```vim
sudo apt install gdb python3 python3-dbg
```

复制

## [](#gdb命令速查 "gdb 命令速查")gdb 命令速查

### [](#gdb原生命令 "gdb 原生命令")gdb 原生命令

run or r –> executes the program from start to end.  
break or b –> sets breakpoint on a particular line.  
disable -> disable a breakpoint.  
enable –> enable a disabled breakpoint.  
next or n -> executes next line of code, but don’t dive into functions.  
step –> go to next instruction, diving into the function.  
list or l –> displays the code.  
print or p –> used to display the stored value.  
quit or q –> exits out of gdb.  
clear –> to clear all breakpoints.  
continue –> continue normal execution.

### [](#gdb-python命令 "gdb python 命令")gdb python 命令

py-bt: 输出 Python 调用栈  
py-bt-full: 输出 Python 调用栈  
py-down: 在调用栈向下一级  
py-list: 显示代码  
py-locals: 输出 locals 变量  
py-print: 输出  
py-up: 在调用栈向上一级

## [](#使用示例 "使用示例")使用示例

### [](#测试代码 "测试代码")测试代码

一个斐波那契数列函数`fib.py`  

```python
import time
def fib(n):
    time.sleep(0.01)
    if n == 1 or n == 0:
        return 1
    for i in range(n):
        return fib(n-1) + fib(n-2)

fib(100)
```

复制

### [](#启动程序 "启动程序")启动程序

1.  `python3 fib.py &`
2.  `gdb python3 148`, 148 为 Python 的进程 id

gdb 输出，注意所需要的 symbols 是否都加载了  

```crystal
GNU gdb (Ubuntu 9.2-0ubuntu1~20.04) 9.2
Copyright (C) 2020 Free Software Foundation, Inc.
License GPLv3+: GNU GPL version 3 or later <http://gnu.org/licenses/gpl.html>
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.
Type "show copying" and "show warranty" for details.
This GDB was configured as "x86_64-linux-gnu".
Type "show configuration" for configuration details.
For bug reporting instructions, please see:
<http://www.gnu.org/software/gdb/bugs/>.
Find the GDB manual and other documentation resources online at:
    <http://www.gnu.org/software/gdb/documentation/>.

For help, type "help".
Type "apropos word" to search for commands related to "word"...
Reading symbols from python3...
Reading symbols from /usr/lib/debug/.build-id/02/526282ea6c4d6eec743ad74a1eeefd035346a3.debug...
Attaching to program: /usr/bin/python3, process 148
Reading symbols from /lib/x86_64-linux-gnu/libc.so.6...
Reading symbols from /usr/lib/debug//lib/x86_64-linux-gnu/libc-2.31.so...
Reading symbols from /lib/x86_64-linux-gnu/libpthread.so.0...
Reading symbols from /usr/lib/debug/.build-id/4f/c5fc33f4429136a494c640b113d76f610e4abc.debug...
[Thread debugging using libthread_db enabled]
Using host libthread_db library "/lib/x86_64-linux-gnu/libthread_db.so.1".
Reading symbols from /lib/x86_64-linux-gnu/libdl.so.2...
Reading symbols from /usr/lib/debug//lib/x86_64-linux-gnu/libdl-2.31.so...
Reading symbols from /lib/x86_64-linux-gnu/libutil.so.1...
Reading symbols from /usr/lib/debug//lib/x86_64-linux-gnu/libutil-2.31.so...
Reading symbols from /lib/x86_64-linux-gnu/libm.so.6...
Reading symbols from /usr/lib/debug//lib/x86_64-linux-gnu/libm-2.31.so...
Reading symbols from /lib/x86_64-linux-gnu/libexpat.so.1...
(No debugging symbols found in /lib/x86_64-linux-gnu/libexpat.so.1)
Reading symbols from /lib/x86_64-linux-gnu/libz.so.1...
(No debugging symbols found in /lib/x86_64-linux-gnu/libz.so.1)
Reading symbols from /lib64/ld-linux-x86-64.so.2...
(No debugging symbols found in /lib64/ld-linux-x86-64.so.2)
0x00007fec057c10da in __GI___select (nfds=nfds@entry=0, readfds=readfds@entry=0x0, writefds=writefds@entry=0x0, exceptfds=exceptfds@entry=0x0, timeout=timeout@entry=0x7fff99ce33a0) at ../sysdeps/unix/sysv/linux/select.c:41
41	../sysdeps/unix/sysv/linux/select.c: No such file or directory.
```

复制

### [](#调试 "调试")调试

gdb 调试 Python 没有 pdb 那么方便，主要是没法直接给 python 代码打断点，断点都是打在解释器代码中的。  
所以，定位到脚本对应位置比较麻烦，需要一点耐心。

```maxima
(gdb) py-list
   1    import time
   2    def fib(n):
  >3        time.sleep(0.01)
   4        if n == 1 or n == 0:
   5            return 1
   6        for i in range(n):
   7            return fib(n-1) + fib(n-2)
   8
(gdb) n
4970	in ../Python/ceval.c
(gdb) py-locals
n = 4
(gdb) b
Breakpoint 2 at 0x56acbe: file ../Include/object.h, line 459.
(gdb) c
Continuing.

Breakpoint 2, _PyEval_EvalFrameDefault (f=<optimized out>, throwflag=<optimized out>) at ../Include/object.h:459
459	in ../Include/object.h
... # 省略一些c命令
(gdb) py-locals
n = 3
(gdb) py-bt
Traceback (most recent call first):
  File "fib.py", line 4, in fib
    if n == 1 or n == 0:
  File "fib.py", line 7, in fib
    return fib(n-1) + fib(n-2)
   ... 省略一些输出
(gdb)
(gdb) py-up
#6 Frame 0x7fec0531a580, for file fib.py, line 7, in fib (n=4, i=0)
    return fib(n-1) + fib(n-2)
(gdb) py-locals
n = 4
i = 0
(gdb) py-up
#18 Frame 0x7fec0531c040, for file fib.py, line 7, in fib (n=7, i=0)
    return fib(n-1) + fib(n-2)
(gdb) py-print i
local 'i' = 0
(gdb) py-print n
local 'n' = 7
(gdb) py-down
#12 Frame 0x7fec0531a900, for file fib.py, line 7, in fib (n=6, i=0)
    return fib(n-1) + fib(n-2)
(gdb) py-print n
local 'n' = 6
```

复制

## [](#参考 "参考")参考

1.  [https://wiki.python.org/moin/DebuggingWithGdb](https://wiki.python.org/moin/DebuggingWithGdb)
2.  [https://www.geeksforgeeks.org/gdb-step-by-step-introduction/](https://www.geeksforgeeks.org/gdb-step-by-step-introduction/) 
    [http://ponder.work/2020/12/29/debug-python-with-gdb/](http://ponder.work/2020/12/29/debug-python-with-gdb/) 
    [http://ponder.work/2020/12/29/debug-python-with-gdb/](http://ponder.work/2020/12/29/debug-python-with-gdb/)

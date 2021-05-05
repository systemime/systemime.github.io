---
title: Tornado IOLoop - 简书
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

## 事件驱动编程

事件驱动编程是一种网络编程范式，程序的执行流由外部事件来决定，特点是包含一个事件循环，当外部事件发生时会使用回调机制来触发相应的处理。与传统线性的编程模式相比而言，事件驱动程序在启动后就会进入等待，那么等待什么呢？等待被事件触发。

与传统的单线程（同步）和多线程编程范式相比，三种模式下程序执行效率各不相同。

-   单进程：服务器每接收到一个请求就会创建一个新的进程来处理该请求
-   多线程：服务器每接收到一个请求就会创建一个新的线程来处理该请求
-   事件驱动：服务器每接收到一个请求首先放入事件列表，然后主进程通过非阻塞 IO 的方式来处理请求。

![](https://upload-images.jianshu.io/upload_images/4933701-f261879c33ce54ce.png)

三种编程范式比较

上图可知：程序有三个任务需要完成，每个任务都在等待 IO 操作时阻塞，阻塞在 IO 操作上所耗费的时间使用灰色标注。经过比对可以发现，事件驱动模型对 CPU 的使用率时最高的，它不会因为某个任务的阻塞而导致整个进程的阻塞，从开始到结束，总是有一个可以运行的任务在执行。

Tornado 是基于事件驱动模型实现的，IOLoop 是 Tornado 的事件循环，也是 Tornado 的核心。

Tornado 的事件循环机制是根据系统平台来选择底层驱动的，如果是 Linux 系统则使用的是 Epoll，如果是类 UNIX 如 BSD 或 MacOS 系统则使用的是 Kqueue，如果都不支持的话则会回退到 Select 模式。

## IO 多路复用

准确来说，Epoll 是 Linux 内核升级的多路复用 IO 模型，在 UNIX 和 MacOS 上类似则是 Kqueue。

IO 多路复用

IO 多路复用机制有`select`、`poll`、`epoll`三种，所谓的 IO 多路复用是通过某种机制监听多个文件描述符，一旦文件描述符就绪（读就绪或写就绪），能够通知程序进行相应的读写操作。本质上`select`、`poll`、`epoll`都是同步 IO，因为他们都需要在读写事件就绪后自己负责读写，也就是说读写过程是阻塞的。异步 IO 无需自己进行读写，异步 IO 的实现会负责将数据从内核拷贝到用户空间。

-   select


    int select(
      int nfds,
      fd_set *restrict readfds,
      fd_set *restrict writefds,
      fd_set *restrict errorfds,
      struct timeval *restrict timeout
    ) 

`select`函数负责监视的文件描述符可分为三类，分别是`writefds`、`readfds`、`exceptfds`。调用`select`函数会阻塞直到有描述符就绪，即有数据可读、可写或者有异常。或者超时，函数返回。当`select`函数返回时可以通过遍历所有描述符来寻找就绪的描述符。

目前几乎在所有的平台上都支持`select`，另外`select`对于超时提供了微秒级别的精度控制。

`select`的缺点在于单个进程能够监视的文件描述符的数量有有限的，在 Linux 中一般是 1024，可通过修改宏定义重新编译内核的方式来提升，但同时会带来效率的降低。

`select`对 Socket 扫描时是线性的，也就是采用轮询的方式，效率低下。当 Socket 比较多的时候，每次`select`函数都需要通过遍历`FD_SIZE`个 Socket 来完成调度，不管 Socket 是否活跃都会遍历一次，这会浪费大量 CPU 时间。如果能给 Socket 注册某个回调函数，当 Socket 活跃时自动完成相关操作，就可以避免轮询，这也正是 Epoll 和 Kqueue 所做的。

`select`需要维护一个用来存放大量文件描述符的数据结构，这使得用户空间和内核空间在传递该数据结构时存在巨大的复制开销。

`select`是几乎所有的 UNIX 或 Linux 都支持的一种 IO 多路复用的方式，通过`select`函数发出 IO 请求后，县城会阻塞直到有数据准备完毕才能把数据从内核空间拷贝到用户空间，所以`select`是同步阻塞的方式。

-   poll


    int poll(
      struct pollfd fd[],
      nfds_t nfds,
      int timeout
    );

    struct pollfd(
      int fd; 
      short events;
      short revents;
    ) 

`poll`不要求开发者计算最大文件描述符的大小，在应付大数量的文件描述符时比`select`效率更高，而且`poll`没有最大连接数的限制，因为`poll`采用的是基于链表来存储的。

`poll`的缺点在于包含大量文件描述符的数组会被整体复制于用户态和内核的地址空间之间，不论文件描述符是否就绪，开销随着文件描述符数量的增加线性增大。另外与`select`一样，`poll`返回后需要轮询所有的描述符来获取就绪的描述符。

通过`poll`函数发出 IO 请求后，线程会阻塞直到数据准备完毕，`poll`函数在`pollfd`中通过`revents`返回事件，然后线程会将数据从内核空间拷贝到用户空间，所以`poll`同样是同步阻塞方式，性能与`select`相比并没有改进。

-   epoll


    int epoll_create(int size);

    int epoll_ctl(int epfd, int op, int fd, struct epoll_event *event);

    int epoll_wait(int epfd, struct epoll_event * events, int maxevents, int timeout); 

`epoll`对文件描述符的操作有两种模式分别是水平触发和边缘触发

水平触发`LT, Level Trigger`

当被监控的文件描述符`fd`上有可读写事件发生时，`epoll_wait()`函数会通知处理程序读写。如果本次没有将数据一次性全部读写完毕，比如读写缓冲区太小。那么下次再调用`epoll_wait()`函数时，会通知你在上次没有读写完的文件描述符`fd`上继续进行读写。如果一直不去读写，那它会一直通知你。如果系统中有大量不需要读写的就绪文件描述符`fd`，并且它们每次都会返回，这样会大大降低处理程序检索自己关系的就绪文件描述符的效率。

边缘触发`ET, Edge Trigger`

边缘触发是当被监控的文件描述符`fd`上有可读写事件发生时，`epoll_wait()`函数会通知处理程序去读写。如果本次没有将数据全部读写，比如读写缓冲区太小。那么下次调用`epoll_wait()`时，它就不会通知你，也就是说它只会通知你一次，知道该文件描述符出现第二次可读写事件时才会通知你。这种模式比水平触发模式效率更高，系统中不会充斥大量你所不关心的就绪文件描述符。

`epoll`支持阻塞和非阻塞两种方式，而边缘模式只能配合非阻塞使用。

Python 中 Epoll 的事件默认使用的是水平触发`LT`(Level Trigger) 模式，Python 中的 Epoll 可通过`select.EPOLLET`设置为 ET 模式。

    epoll.register(connection.fileno(), select.EPOLLIN)

    epoll.register(connection.fileno(), select.EPOLLIN | select.EPOLLET) 

## Epoll

Tornado 优秀的大并发处理能力得益于 Web 服务器从底层开始就实现了一整套基于 Epoll 的单线程异步架构，而`tornado.ioloop`就是 Web 服务器最底层的实现。IOLoop 是对 IO 多路复用的封装，其实现为一个单例并保存在`IOLoop._instance`中。

Epoll 是 Linux 内核中实现的一种可扩展的 IO 事件通知机制，是对 POSIX 系统中`select`和`poll`的替代，具有更高的性能和扩展性。FreeBSD 中类似的实现是 Kqueue。

Tornado 中基于 Python C 扩展实现的 Epoll 模块对 Epoll 的使用进行了封装，使得 IOLoop 对象可通过相应的事件处理机制对 IO 进行调度。

IOLoop 的实现是基于 Epoll 的，那么什么是 Epoll 呢？

Epoll 是 Linux 内核为处理大批量文件描述符`fd`而做了改进后的 Poll，那什么又是 Poll 呢？

Socket 通信时的服务器在接受`accept`客户端连接并建立通信后`connection`才会开始通信，而此时服务器并不知道连接的客户端有没有将数据发送完毕，此时有两种选择方案：

-   第一种是一直在这里等待直到收发数据结束
-   第二种是每隔一段时间来查看是否存在数据。

第一种方案虽然可以解决问题，但需要注意的是对于一个线程或进程，同时是只能处理一个 Socket 通信，与此同时其他连接只能被阻塞，显然这种方式在单进程情况下是不现实的。

第二种方案比第一种方案相对要好一些，多个连接可以统一在一定时间段内轮流查看是否有数据需要读写，看上去是可以同时处理多个连接了，这种方式也就是 Poll/Select 的解决方案。

第二种方案的问题是随着连接越来越多，轮询所耗费的时间将会越来越长，然而服务器连接的 Socket 大多不是活跃的，因此轮询所耗费的大部分时间将是无用的。为了 解决这个问题，Epoll 被创建了出来，Epoll 的概念和 Poll 类似，不过每次轮询时只会将有数据活跃的 Socket 挑选出来进行轮询，这样在大量连接时会节省大量时间。

对于 Epoll 的操作主要是通过 4 个 API 完成的

-   `epoll_create` 用于创建一个 Epoll 描述符
-   `epoll_ctl` 用于操作 Epoll 中的事件`Event`
-   `epoll_wait` 用于让 Epoll 开始工作，参数 timeout 为 0 时会立即返回，timeout 为 - 1 时会一直监听，timeout 大于 0 时为监听阻塞时长。在监听时若有数据活跃的连接时，会返回活跃的文件句柄列表。
-   `close`用于关闭 Epoll

Epoll 中的事件包括

-   `EPOLL_CTL_ADD` 添加一个新的 Epoll 事件
-   `EPOLL_CTL_DEL` 删除一个 Epoll 事件
-   `EPOLL_CTL_MOD` 修改一个事件的监听方式

Epoll 事件的监听方式可分为七种，重点关注其中的三种。

-   `EPOLLIN` 缓冲区满，此时有数据可读。
-   `EPOLLOUT` 缓冲区空，此时可写数据。
-   `EPOLLERR` 发生错误

* * *

## IOLoop

-   IOLoop 对 Epoll 的封装和 I/O 调度的具体实现
-   IOLoop 模块对网络事件类型的封装与 Epoll 一致，分别为`READ` / `WRITE` / `ERROR` 三种类型。

IOLoop 是基于 Epoll 实现的底层网络 IO 的核心调度模块，用于处理 Socket 相关的连接、响应、异步读写等网络事件。每个 Tornado 进程都会初始化一个全局的 IOLoop 实例，在 IOLoop 中通过静态方法`instance()`进行封装，获取 IOLoop 实例后直接调用`instance()`方法即可。

IOLoop 实现了 Reactor 模型，将所有需要处理的 IO 事件注册到一个中心 IO 多路复用器上，同时主线程 / 进程阻塞在多路复用器上。一旦有 IO 事件到来或是准备就绪，即文件描述符或 Socket 可读写时，多路复用器会返回并将事先注册的相应 IO 事件分发到对应的处理器上。

Tornado 服务器启动时会创建并监听 Socket，并将 Socket 的文件描述符`fd, file descriptor`注册到 IOLoop 实例中，IOLoop 添加对 Socket 的`IOLoop.READ`事件监听并传入回调处理函数。当某个 Socket 通过`accept`接收连接请求后调用注册的回调函数进行读写。

`tornado.ioloop`表示主事件循环，典型的应用程序将使用单个 IOLoop 对象并在`IOLoop.instance`单例中。通常在`main()`函数结束时调用`IOLoop.start()`方法。非典型应用可以使用多个 IOLoop，比如每个线程一个`IOLoop`。

IOLoop 的核心调度集中在`start()`方法中，IOLoop 实例对象调用`start`后开始 Epoll 事件循环机制，`start()`方法会一直运行直到 IOLoop 对象调用`stop`函数、当前所有事件循环完成。`start()`方法中主要分为三部分：

-   对超时的相关处理
-   Epoll 事件通知阻塞和接收
-   Epoll 返回 IO 事件的处理

Tornado 在 IOLoop 中会去循环检查三类事件：

-   可立即执行的事件`ioloop._callbacks`

可立即执行的事件一般是 Future 在`set_result`时将 Future 中的所有`call_back`以这种类型的事件添加到 IOLoop 中。IOLoop 中当存在可立即执行的事件时会立即调度它们的回调函数。

添加可立即执行的事件的接口：`ioloop.add_callback(callback)`

-   定时器事件`ioloop.timer`

IOLoop 中维护了一个定时器事件列表，按照`timeout`超时时间以最小堆的形式存储，在 IOLoop 循环至定时器事件时，会不断地判断堆顶的定时器是否会超时，如果超时则取出，直到取出所有超时的定时器，之后会调度定时器对应的回调函数。

添加定时器事件的接口：`ioloop.call_at(deadline, callback)`

-   IO 事件

当可立即执行的事件、定时器事件的回调函数都执行完毕后，IOLoop 会检查是否有新的可立即执行的事件加入，如果有则 IO 事件的阻塞事件会设置为 0 即非阻塞，否则检查距离最近的一个定时器超时还有多长事时间，将该时间设置为 IO 事件的阻塞时间。

IO 事件的接口：

-   `ioloop.add_handle(fd, handler_event)`
-   `ioloop.update_handler(fd, events)`
-   `ioloop.remove_handler(fd)`

例如：阻塞的 HTTP 服务器

     import socket

    HOST = "127.0.0.1"
    PORT = 8000
    PROCESS = 1
    EOL = b"\n\n"

    response = b"HTTP/1.0 200 OK\r\nDate:Mon, 1 Jan 1996 01:01:01 GMT\r\n"
    response += b"Content-Length:text/plain\r\nContent-Length:13\r\n\r\n"
    response += b"hello world"

    sdf = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sdf.bind((HOST, PORT))
    sdf.listen(PROCESS)

    try:
        while True:
            connection, address = sdf.accept()
            request = b""
            while EOL not in request:
                request += connection.recv(1024)
            connection.send(response)
            connection.close()
    finally:
        sdf.close() 

上述阻塞的 HTTP 服务器中，请求是顺序被处理的，当流程到达`request += connection.recv(1024)`时会发生阻塞，因为`recv`函数会不停的从缓冲区中读取数据，如果网络数据还没有到达时，就会阻塞在等待数据的到来。

当程序使用阻塞 Socket 的时候，通常会使用以一个线程甚至是专用连接在每个 Socket 上执行通信。主程序线程会监听服务器 Socket，服务器端的 Socket 会接受来自客户端传入的连接。服务器每次都会创建有一个新的 Socket 用于接受客户端的连接，并将新建的 Socket 传递给一个单独的线程，然后该线程将会与客户端进行交互。因为一个连接都具有一个新的线程进行通信，所以任何阻塞都不会影响到其他线程执行的任务。这就是最传统的 IO 模型 PPC`process per connection`和 TPC`thread per connection`。

实时的 Web 应用程序通常会针对每个用户创建一个持久化的连接，对于传统的同步服务器，这意味着需要给每个用户单独创建一个线程，不过这样做的代价是非常大得。为了减少并发连接得消耗，Tornado 采用了单线程事件循环模型`IOLoop`，这也就意味着所有得应用代码都必须是异步非阻塞得，因为一次只能由一个活跃的操作。

Tornado 本身是一个异步非阻塞的 Web 框架，强大的异步 IO 机制可提高服务器的响应能力。

例如：简单的 HTTPServer

     from tornado.options import define, options
    from tornado.httpserver import HTTPServer
    from tornado.web import Application, RequestHandler
    from tornado.ioloop import IOLoop

    define("port", type=int, default=8000)

    class IndexHandler(RequestHandler):
        def get(self):
            self.write("hello world")

    class App(Application):
        def __init__(self):
            handlers = [
                (r"/", IndexHandler)
            ]
            settings = dict(
                debug = True
            )
            Application.__init__(self, handlers, **settings)

    def main():
        app = App()
        server = HTTPServer(app)
        server.listen(options.port)
        IOLoop.instance().start()

    if __name__ == "__main__":
        main() 

Tornado 的核心 IO 循环模块封装了 Linux 的 Epoll 和 BSD 的 kqueue，这是 Tornado 高性能的基石。

![](https://upload-images.jianshu.io/upload_images/4933701-7c13d0569ff3714b.png)

Tornado IOLoop

在 Tornado 服务器中 IOLoop 是调度的核心模块，Tornado 服务器会将所有的 Socket 描述符都注册到 IOLoop 上，注册的时候需要在指明回调处理函数，IOLoop 内部不断的监听 IO 事件，一旦发现某个 Socket 可读写就可以调用其在注册时指定的回调函数。

![](https://upload-images.jianshu.io/upload_images/4933701-1015417368992287.png)

IOLoop

Nginx 和 Lighthttpd 都是高性能的 Web 服务器，而 Tornado 也是著名的高抗负载的应用，它们之间有说明相似之处呢？

首先需要明白的是在 TCPServer 三段式`create-bind-listen`阶段，效率时很低的，为什么呢？因为只有当一个连接被断开后新连接才能被接收。因此，想要开发高性能的服务器，就必须在`accept`阶段上下功夫。

新连接得到来一般是经典的三次握手，只有当服务器收到一个`SYN`时才说明有一个新连接出现但还没有建立，此时监听的文件描述符`fd`是可读的，可以调用`accept`。在此之前服务器是可以干点儿别的事儿的，这有就是 Linux 中`SELECT/POLL/EPOLL`网络 IO 模式的思路。

只有等到 TCP 的三次握手成功后，`accept`才会返回，此时监听文件描述符`fd`是读完成状态，似乎服务器再次之前可以转身去干别的，等到都完成后再调用`accept`就不会有延迟了，这也就是异步网络 IO`AIO`的思路，不过在`*nix`平台上支持的并不是很广泛。

另外，`accept`得到的新文件描述符`fd`不一定是可读的，因为客户端请求可能还没有到达，所以可以在等待新文件描述符`fd`可读时在`read`，但可能会存在一点儿的延迟。也可以用异步网络 IO`AIO`等读完后在`read`读取，就不会产生延迟了。同样类似的，对于`write`和`close`也有类似的事件。

总的来说，在我们关心的文件描述符`fd`上注册需关注的多个事件，事件发生了就启动回调，没有发生就看点别的。这是单线程的，多线程的相对复杂一点，但原理相似。Nginx 和 Lighttpd 以及 Tornado 都使用了类似的方式，只不过是多进程和多线程或单线程之间的区别而已。 
 [https://www.jianshu.com/p/2c62d4e082a1](https://www.jianshu.com/p/2c62d4e082a1)

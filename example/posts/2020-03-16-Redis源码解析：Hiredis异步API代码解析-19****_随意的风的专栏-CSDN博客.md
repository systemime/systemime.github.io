---
title: Redis源码解析：Hiredis异步API代码解析-19****_随意的风的专栏-CSDN博客
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

         Hiredis 中的异步 API 函数需要与事件库（libevent,libev, ev）一起工作。因为事件循环的机制，异步环境中的命令是自动管道化的。因为命令是异步发送的，因此发送命令时，必要情况下，需要提供一个回调函数，以便在收到命令回复时调用该函数。

         异步 API 涉及到的函数分别是：

1.  ```python
    redisAsyncContext *redisAsyncConnect(const char *ip, int port);int redisAsyncCommand(redisAsyncContext *ac, redisCallbackFn *fn, void *privdata, const char *format, ...);int redisAsyncCommandArgv(redisAsyncContext *ac, redisCallbackFn *fn, void *privdata, int argc, const char **argv, const size_t *argvlen);void redisAsyncDisconnect(redisAsyncContext *ac);```

    以上函数分别对应TCP建链、发送命令和TCP断链。

    ````

         类似于同步操作 API，异步操作 API 中也有一个**上下文结构 redisAsyncContext**，用于维护异步链接中的各种状态。

         redisAsyncContext 结构在同步上下文结构 redisContext 的基础上，增加了一些异步属性，它的定义如下：

1.  ```python
    typedef struct redisAsyncContext void (*addRead)(void *privdata);void (*delRead)(void *privdata);void (*addWrite)(void *privdata);void (*delWrite)(void *privdata);void (*cleanup)(void *privdata);redisDisconnectCallback *onDisconnect;redisConnectCallback *onConnect;redisCallbackList replies;    redisCallbackList invalid;```

    ````

         该结构的第一个属性就是同步上下文结构 redisContext c，剩下的就是一些异步属性：

         结构体 ev 中包含了，当**Hiredis 异步 API 与事件库（libev,libevent, Redis ev）一起工作时，用于注册和删除读写事件的函数**；

         **回调函数 onDisconnect，表示断链时会调用的函数，该属性可以通过 redisAsyncSetDisconnectCallback 函数设置**；

         **回调函数 onConnect，表示 TCP 建链成功或失败之后会调用的函数，该属性可以通过 redisAsyncSetConnectCallback 函数设置；**

         **replies 属性是一个 redisCallbackList 结构，也就是由回调结构 redisCallback 组成的单链表。当发送普通命令时，会依次将该命令对应的回调结构追加到链表中，当 Redis 服务器回复普通命令时，会依次调用该链表中的每个 redisCallback 结构中的回调函数；**

         结构体 sub 用于处理订阅模式，其中的字典 channels，以频道名为 key，以回调结构 redisCallback 为 value。当客户端使用 Hiredis 异步 API 发送”subscribe” 命令后，服务器产生回复时，就会根据回复信息中的频道名查询字典 channels，找到对应的回调结构，调用其中的回调函数。字典 patterns 与 channels 类似，只不过它用于”psubscirbe” 命令，其中的 key 是频道名模式；回调链表 invalid，当客户端处于订阅模式下，服务器发来了意想不到的回复时，会依次调用该链表中，每个回调结构中的回调函数。

         函数 redisAsyncConnect 执行**异步操作**中的 TCP 建链。

1.  ```python
    redisAsyncContext *redisAsyncConnect(const char *ip, int port) {c = redisConnectNonBlock(ip,port);ac = redisAsyncInitialize(c);__redisAsyncCopyError(ac);```

    ````

         该函数首先根据 ip 和 port，调用**redisConnectNonBlock 函数**向 Redis 服务器发起**非阻塞**的建链操作，然后调用 redisAsyncInitialize 函数创建异步上下文结构 redisAsyncContext。

         redisAsyncSetConnectCallback 函数用于设置异步上下文中的建链回调函数。其代码如下：

1.  ```python
    int redisAsyncSetConnectCallback(redisAsyncContext *ac, redisConnectCallback *fn) {if (ac->onConnect == NULL) {```

     该函数中，如果之前已经设置过建链回调函数了，则直接返回REDIS\_ERR。

    ````

         该函数除了设置异步上下文中的建链回调函数之外，还会调用**\_EL_ADD_WRITE，注册可写事件**。对于使用 Redis 的 ae 事件库的客户端来说，该宏定义实际上就是调用 redisAeAddWrite 函数：

1.  ````python
    static void redisAeAddWrite(void *privdata) {redisAeEvents *e = (redisAeEvents*)privdata;aeEventLoop *loop = e->loop;aeCreateFileEvent(loop,e->fd,AE_WRITABLE,redisAeWriteEvent,e);```

    可写事件的回调函数是redisAeWriteEvent，该函数调用**redisAsyncHandleWrite实现**。redisAsyncHandleWrite中，处理建链的代码如下：

    ````

2.  ````python
    void redisAsyncHandleWrite(redisAsyncContext *ac) {redisContext *c = &(ac->c);if (!(c->flags & REDIS_CONNECTED)) {if (__redisAsyncHandleConnect(ac) != REDIS_OK)if (!(c->flags & REDIS_CONNECTED))
    ```

    ```
    在该函数中，如果上下文标志位中还没有设置REDIS\_CONNECTED标记，说明目前还没有检测是否建链成功，因此调用**\_\_redisAsyncHandleConnect**，判断建链是否成功，如果建链成功，则会在异步上下文的标志位中增加REDIS\_CONNECTED标记，如果还没有建链成功，则直接返回。

    ```

         \_\_redisAsyncHandleConnect 的代码如下：

1.  ```
    static int __redisAsyncHandleConnect(redisAsyncContext *ac) {redisContext *c = &(ac->c);if (redisCheckSocketError(c) == REDIS_ERR) {if (errno == EINPROGRESS)if (ac->onConnect) ac->onConnect(ac,REDIS_ERR);__redisAsyncDisconnect(ac);c->flags |= REDIS_CONNECTED;if (ac->onConnect) ac->onConnect(ac,REDIS_OK);```

             该函数中，首先调用redisCheckSocketError判断当前TCP是否建链成功，如果该函数返回REDIS\_ERR，在errno为EINPROGRESS的情况下，说明TCP尚在建链中，这种情况直接返回REDIS\_OK，等待下次处理；其他情况说明建链失败，以REDIS\_ERR为参数，调用异步上下文中的建链回调函数，然后调用\_\_redisAsyncDisconnect做清理工作，最后返回REDIS\_ERR；

    ````

         如果 redisCheckSocketError 函数返回 REDIS_OK，则将 REDIS_CONNECTED 标记增加到上下文标志位中，并以 REDIS_OK 为参数调用异步上下文中的建链回调函数；最后返回 REDIS_OK；

         **redisAsyncCommand 函数，是异步 API 中用于向 Redis 发送命令的函数**。该函数与同步 API 中发送命令的函数 redisCommand 类似，同样支持 printf 式的可变参数。该函数的原型如下：

````
int redisAsyncCommand(redisAsyncContext *ac, redisCallbackFn *fn, void *privdata, const char *format, ...);```

         这里的**fn**和**privdata**分别表示收到命令回复后要调用的**回调函数**及其**参数**。因为Redis是**单线程处理命令**，因此当客户端使用异步API与事件库的结合之后，命令就自动的**管道化**了。也就是客户端在**单线程模式下**，**发送**命令的顺序和**接收**回复的**顺序**是**一致的**。因此，当发送命令时，就会将**回调函数fn和参数privdata**封装成回调结构redisCallback，并将该结构记录到单链表或者字典中。当收到回复后，就会依次得到链表或者字典中的redisCallback结构，调用其中的回调函数。

        **redisAsyncCommand函数**主要是调用**redisvAsyncCommand**实现，而redisvAsyncCommand函数又是通过调用**redisvFormatCommand**和**\_\_redisAsyncCommand函数**实现的。

         **redisvFormatCommand，解析用户输入的命令，转换成统一请求协议格式的字符串cmd**，然后调用**\_\_redisAsyncCommand函数，将cmd发送给Redis，并且记录相应的回调函数**。

         \_\_redisAsyncCommand函数的代码如下：

1.  ```
    static int __redisAsyncCommand(redisAsyncContext *ac, redisCallbackFn *fn, void *privdata, char *cmd, size_t len) {redisContext *c = &(ac->c);if (c->flags & (REDIS_DISCONNECTING | REDIS_FREEING)) return REDIS_ERR;p = nextArgument(cmd,&cstr,&clen);pvariant = (tolower(cstr[0]) == 'p') ? 1 : 0;if (hasnext && strncasecmp(cstr,"subscribe\r\n",11) == 0) {c->flags |= REDIS_SUBSCRIBED;while ((p = nextArgument(p,&astr,&alen)) != NULL) {sname = sdsnewlen(astr,alen);dictReplace(ac->sub.patterns,sname,&cb);dictReplace(ac->sub.channels,sname,&cb);} else if (strncasecmp(cstr,"unsubscribe\r\n",13) == 0) {if (!(c->flags & REDIS_SUBSCRIBED)) return REDIS_ERR;} else if(strncasecmp(cstr,"monitor\r\n",9) == 0) {c->flags |= REDIS_MONITORING;__redisPushCallback(&ac->replies,&cb);if (c->flags & REDIS_SUBSCRIBED)__redisPushCallback(&ac->sub.invalid,&cb);__redisPushCallback(&ac->replies,&cb);__redisAppendCommand(c,cmd,len);```
    

         在函数中，首先将**回调函数fn**，以及用户提供的该回调函数的**私有参数privdata**，封装到**redisCallback回调结构的cb**中。当然，用户如果没有提供回调函数和参数，则cb中相应的属性为NULL。

         然后解析用户输入命令，根据不同的命令，将回调函数追加到不同的链表或字典中：

         如果用户输入命令为"subscribe"或者"psubscribe"，首先将REDIS\_SUBSCRIBED标记增加到上下文标志中，表示当前客户端进入订阅模式；

         然后循环解析命令中的后续参数，这些参数表示订阅的频道名（"subscribe"），或者订阅的频道名的匹配模式（"psubscribe"）。以这些频道名或匹配模式为key，以回调结构cb为value，插入到异步上下文的字典ac->sub.patterns或ac->sub.channels中。

         如果用户输入命令为"unsubscribe"，这种情况无需记录回调函数。但是该命令只有客户端处于订阅模式下才有效，否则直接返回REDIS\_ERR；

         如果用户输入命令为"monitor"，则将REDIS\_MONITORING标记增加到上下文标志位中，表示客户端进入monitor模式，然后调用\_\_redisPushCallback，将回调结构cb追加到上下文的回调链表ac->replies中；

         如果用户输入的是其他命令，则若当前客户端处于订阅模式，因处于订阅模式中，客户端只能发送”subscribe/psubscribe/unsubscribe/punsubscribe”命令，走到这一步，说明客户端发送了其他命令，因此将回调结构cb追加到链表ac->sub.invalid中；

         其他情况，将回调结构cb追加到链表ac->replies中；

         **记录完回调函数之后，剩下的，就是调用\_\_redisAppendCommand，将cmd追加到上下文的输出缓存中**。

         然后调用**\_EL\_ADD\_WRITE，注册可写事件**。对于使用Redis的ae事件库的客户端来说，该宏定义实际上就是调用**r**edisA**eAddWrite函数**，可写事件的回调函数是**redisAeWriteEvent**，该函数**调用redisAsyncHandleWrite实现**。

         redisAsyncHandleWrite函数的全部代码如下：

1.  ```
    void redisAsyncHandleWrite(redisAsyncContext *ac) {redisContext *c = &(ac->c);if (!(c->flags & REDIS_CONNECTED)) {if (__redisAsyncHandleConnect(ac) != REDIS_OK)if (!(c->flags & REDIS_CONNECTED))if (redisBufferWrite(c,&done) == REDIS_ERR) {__redisAsyncDisconnect(ac);```
    
     首先处理建链尚未成功的情况，之前已经讲过，不在赘述。
    

         建链成功之后，**调用redisBufferWrite**，将**上下文中输出****缓存的内容****通过****socket描述符发送****出去**。

         **全部发送成功之后，调用\_EL\_DEL\_WRITE**，**删除注册的可写事件**。对于使用Redis的ae事件库的客户端来说，这里就是调用redisAeDelWrite函数，删除注册的可写事件。

         然后，**调用\_EL\_ADD\_READ，注册可读事件**。对于使用Redis的ae事件库的客户端来说，这里就是调用redisAeAddRead函数，注册可读事件。事件回调函数为redisAeReadEvent。该回调函数主要是调用**redisAsyncHandleRead实现**。

         redisAsyncHandleRead函数的代码如下：

1.  ```
    void redisAsyncHandleRead(redisAsyncContext *ac) {redisContext *c = &(ac->c);if (!(c->flags & REDIS_CONNECTED)) {if (__redisAsyncHandleConnect(ac) != REDIS_OK)if (!(c->flags & REDIS_CONNECTED))if (redisBufferRead(c) == REDIS_ERR) {__redisAsyncDisconnect(ac);redisProcessCallbacks(ac);```
    
    该函数中，首先处理未建链的情况，与redisAsyncHandleWrite中的处理方式一致，不在赘述。
    

         建链成功之后，**首先调用****redisBufferRead**，**从****socket中读取数据****，并追加到解析器的****输入缓存****中**，这在同步操作API中已讲过，不再赘述。

         **读取成功之后，调用redisProcessCallbacks函数进行处理**。**该函数就是根据回复信息找到相应的回调结构，然后调用其中的回调函数**。redisProcessCallbacks函数的代码如下：

1.  ```
    void redisProcessCallbacks(redisAsyncContext *ac) {redisContext *c = &(ac->c);redisCallback cb = {NULL, NULL, NULL};while((status = redisGetReply(c,&reply)) == REDIS_OK) {if (c->flags & REDIS_DISCONNECTING && sdslen(c->obuf) == 0) {__redisAsyncDisconnect(ac);if(c->flags & REDIS_MONITORING) {__redisPushCallback(&ac->replies,&cb);if (__redisShiftCallback(&ac->replies,&cb) != REDIS_OK) {if (((redisReply*)reply)->type == REDIS_REPLY_ERROR) {c->err = REDIS_ERR_OTHER;snprintf(c->errstr,sizeof(c->errstr),"%s",((redisReply*)reply)->str);c->reader->fn->freeObject(reply);__redisAsyncDisconnect(ac);assert((c->flags & REDIS_SUBSCRIBED || c->flags & REDIS_MONITORING));if(c->flags & REDIS_SUBSCRIBED)__redisGetSubscribeCallback(ac,reply,&cb);__redisRunCallback(ac,&cb,reply);c->reader->fn->freeObject(reply);if (c->flags & REDIS_FREEING) {c->reader->fn->freeObject(reply);__redisAsyncDisconnect(ac);```
    
     该函数循环调用redisGetReply，将解析器中输入缓存中的内容，组织成redisReply结构树，树的根节点通过参数reply返回。
    

         在循环中，如果取得的reply为NULL，说明输入缓存已空，这种情况下，如果当前上下文标志位中设置了REDIS\_DISCONNECTING，说明之前某个命令的回调函数中，调用了redisAsyncDisconnect函数设置了该标记，因此在输出缓存为空，并且输入缓存也为空（reply为NULL）的条件下，调用\_\_redisAsyncDisconnect开始执行断链操作，释放清理内存，最后返回。

         如果取得的reply为NULL，并且当前处于监控模式下，则将上次取出的回调结构cb，重新插入到链表ac->replies中。最后退出循环。

         如果取得的reply非空，则首先调用\_\_redisShiftCallback，尝试从链表ac->replies中取出第一个回调结构cb。

         如果链表ac->replies已空，这种情况下，客户端要么是处于订阅模式下，要么就是服务器主动向客户端发送了某个错误信息，比如该客户端向服务器建链，服务器中已经超过了最大的客户端数，或者是服务器正在加载转储数据，而向客户端返回一个错误信息。

         如果回复类型为REDIS\_REPLY\_ERROR，则调用\_\_redisAsyncDisconnect断链；如果回复类型不是REDIS\_REPLY\_ERROR，则当前客户端只能处于订阅模式或者监控模式，如果当前处于订阅模式下，则调用\_\_redisGetSubscribeCallback，根据reply，从相应的字典中取出回调结构cb；

         **取得回调结构cb之后，只要其中的回调函数不为空，就调用\_\_redisRunCallback函数，调用其中的回调函数；对于回调函数为空的回调结构，直接释放reply即可**。

         \_\_redisGetSubscribeCallback函数根据回复信息，在字典结构中找到对应的回调结构并返回该结构。它的代码如下：

1.  ```
    static int __redisGetSubscribeCallback(redisAsyncContext *ac, redisReply *reply, redisCallback *dstcb) {redisContext *c = &(ac->c);if (reply->type == REDIS_REPLY_ARRAY) {assert(reply->elements >= 2);assert(reply->element[0]->type == REDIS_REPLY_STRING);stype = reply->element[0]->str;pvariant = (tolower(stype[0]) == 'p') ? 1 : 0;callbacks = ac->sub.patterns;callbacks = ac->sub.channels;assert(reply->element[1]->type == REDIS_REPLY_STRING);sname = sdsnewlen(reply->element[1]->str,reply->element[1]->len);de = dictFind(callbacks,sname);memcpy(dstcb,dictGetEntryVal(de),sizeof(*dstcb));if (strcasecmp(stype+pvariant,"unsubscribe") == 0) {dictDelete(callbacks,sname);assert(reply->element[2]->type == REDIS_REPLY_INTEGER);if (reply->element[2]->integer == 0)c->flags &= ~REDIS_SUBSCRIBED;__redisShiftCallback(&ac->sub.invalid,dstcb);```
    
      正常情况下，处于订阅模式下的客户端，接收到的消息类型应该是REDIS\_REPLY\_ARRAY类型，比如：
    

1.  根据回复信息第一行的首字节是否为”p”，找到不同的字典结构callbacks。然后根据reply->element\[1\]的内容，也就是频道名或者频道名模式，从字典中找到相应的回调结构。
    

         如果Redis回复的信息是"unsubscribe"，则从字典中删除相应的回调结构，此时reply->element\[2\]中的信息应该是个整数，表示当前客户端目前还订阅了多少频道，如果该值为0，表示客户端已经从最后一个频道中退订了，因此将REDIS\_SUBSCRIBED标记从标志位c->flags中删除，表示该客户端退出订阅模式；

         如果Redis的回复信息不是REDIS\_REPLY\_ARRAY类型，说明发生了异常，此时从链表ac->sub.invalid中取出下一个回调结构即可。

         客户端可以通过调用redisAsyncDisconnect函数主动断链。该函数的代码如下：

1.  ```
    void redisAsyncDisconnect(redisAsyncContext *ac) {redisContext *c = &(ac->c);c->flags |= REDIS_DISCONNECTING;if (!(c->flags & REDIS_IN_CALLBACK) && ac->replies.head == NULL)__redisAsyncDisconnect(ac);```
    
     一般情况下，该函数是在某个命令回调函数中被调用。当调用该函数时，并不一定会立即进行断链操作，该函数将REDIS\_DISCONNECTING标记增加到上下文的标志位中。只有当**输出缓存中所有命令都发送完毕**，并且收到他们的回复，调用了**回调函数之后，才会真正的执行断链操作**，这是在函数redisProcessCallbacks中处理的。
    

         设置了REDIS\_DISCONNECTING标记后，在\_\_redisAsyncCommand函数中，会直接返回REDIS\_ERR，表示不再发送新的命令。

         真正的断链操作由函数\_\_redisAsyncDisconnect实现。

         当客户与服务器之间的交互过程中发生了错误，或者是服务器主动断链时，就会调用\_\_redisAsyncDisconnect进入断链流程。该函数代码如下：

1.  ```
    static void __redisAsyncDisconnect(redisAsyncContext *ac) {redisContext *c = &(ac->c);__redisAsyncCopyError(ac);assert(__redisShiftCallback(&ac->replies,NULL) == REDIS_ERR);c->flags |= REDIS_DISCONNECTING;```
    

         首先调用\_\_redisAsyncCopyError，得到异步上下文中的err，如果err为0，则说明是客户端主动断链，这种情况下，链表ac->replies应该为空才对；否则，将上下文标志位中增加REDIS\_DISCONNECTING标记，表明这是由于错误引起的断链，设置该标记后，不再发送新的命令给Redis。

         最终调用\_\_redisAsyncFree函数，进行最后的清理。在\_\_redisAsyncFree函数中，会议NULL为reply，调用所有异步上下文中尚存的回调函数。然后调用断链回调函数，最后调用redisFree关闭socket描述符，清理释放空间。

//----------------------------------------------------------------------------------------------------------------------------------------

    一般情况下我们**使用的都是hiredis的同步通信机制**，这种机制下每当你向服务器发送命令请求，程序都会阻塞直到收到服务器的回复并处理。而如果采用异步通信，程序就不需要阻塞等待服务器的回复，而是直接继续执行后边的代码，当服务器回复到来后由程序中预先注册的回调函数来处理回复。

    同步通信下程序写起来逻辑更清晰，代码量也少，但是由于每次请求都要停下来等待回复，可能会影响程序的运行速度。异步通信下程序逻辑会变得很复杂，你必须考虑回调函数的编写，并且需要多开一个线程来实现异步事件的处理，但是异步通信下程序在发送完redis命令请求后不需要等待回复，可以继续做其他事，程序速度的提升自然不言而喻。异步通信比较适合程序对速度要求比较高的情况下。

hiredis中的异步api
--------------

    hiredis中有一套异步api可供我们使用。要使用hiredis中的异步api你必须先了解hiredis中的异步实现。hiredis的异步主要是**通过libevent等异步事件触发库来实现的**。hiredis可以通过以下事件触发库：**libae(redis自带的异步事件触发库）、libev、libuv、libevent中的一个实现**。在我的实际使用中，**libae库出现了头文件问题**，**libev出现了异步消息无法接受的问题**，**libuv没有安装成功，所有我最终选择了libevent库，而这个库的表现也非常稳定**。

    要使用redis客户端的异步通信，单靠hiredis自带的那几个api是不够的，还需要事件触发库的支持。这里要黑一下hiredis的github主页，上边的异步api说明中没有讲解hiredis异步api所需的那些事件触发库，让我想当然的以为单单依靠hiredis的自带api就可以实现异步，结果浪费了大量时间去调试错误的程序，希望大家引以为戒。下边就以libevent为例讲一下hiredis异步api用到的事件触发库。

所需资源之-事件触发库libevent
-------------------

    libevent是一个成熟事件触发库，**分布式缓存软件memcached就使用了这个库**。libevent可以实现对多种事件的触发管理。详细的说，你可以通过libevent去对各种IO事件进行触发注册，之后如果该IO事件发生，libevent就会直接调用你之前为IO事件注册的函数来处理这个事件。除了**IO事件外，libevent还可以管理定时器事件、信号事件，**功能非常的强大。

    下边简单讲一下libevent的使用。libevent本身的使用是比较复杂的，考虑到我们的重点是hiredis，所以这里只讲hiredis中要用到的。libevent首先要设置并添加你要监听的异步事件，这一步hiredis已经为你做好了，只需要两步：   

```
 redisLibeventAttach(ac, base);event_base_dispatch(base);hiredis用到的libevent函数就这么几个，是不是觉得很简单！
```

hiredis异步APi的使用
---------------

    下边才是重点，如何使用hiredis的异步API来实现我们要做的redi异步通信。

    首先要创建连接：

```
 redisAsyncContext *c = redisAsyncConnect("127.0.0.1", 6379);
```

    这里的创建连接跟同步下区别不大。但是需要注意的是异步的连接函数会立刻返回，不论你的程序是否真的连上了redis服务器。是否成功连接只能在连接回调函数中确定。所以不要指望依靠这个函数去检查你的连接是否成功建立。

    可以通过这个函数注册连接回调函数：

```
 redisAsyncSetConnectCallback(c, ccdbRedisAsync::connectCallback);```

    回调函数需要是下边的格式：

```
  void ccdbRedisAsync::connectCallback(const redisAsyncContext *c, int status)```

    其中参数status会告诉你连接是否成功。

    以下函数实现断开连接以及相应的回调函数：

    redisAsyncDisconnect(c);//断开连接

    redisAsyncSetDisconnectCallback(c, ccdbRedisAsync::disconnectCallback);//回调函数的格式和使用同连接回调函数

    如果你想实现redis的断线重连，那么就可以考虑在上边的回调函数中实现。

        **注意创建连接后还要进行之前的libevent事件注册过程。** 

    连接创建好后解可以发送命令了。异步命令的发送方式和同步很像，区别在于**异步发送函数执行后只能得到****该命令是否成功过加入发送队列的返回****，而无法确定这个命令是否发送成功以及命令的返回**。

    int redisAsyncCommand(

    redisAsyncContext \*ac, redisCallbackFn \*fn, void \*privdata, const char \*format, ...);//参数fn是回调函数的地址，privdate可以用来存储            任意的用户指针，这个指针可以在回调函数调用的时候得到

    一般你需要设置一个回调函数来处理命令的返回：

    void(redisAsyncContext \*c, void \*reply, void \*privdata);

    其中的reply参数指向的是与同步下有相同定义的reply结构。注意此处的reply占用的空间是会在回调函数执行后被自动释放的，这点要区别于同步。private参数是你发送命令时所指定的指针，你可以把一些信息，例如所执行的命令保存在这个指针的空间中，这样回调函数被调用的时候你才能判断这个回复是由之前执行的哪个命令产生的。

    上边就是异步redis所需的主要API了

例程

下边的例程来自hiredis的作者。注意这个历程里边没有为libevent事件处理单开线程，这在实际运用中是不多见的

```
#include <adapters/libevent.h>void getCallback(redisAsyncContext *c, void *r, void *privdata) {if (reply == NULL) return;printf("argv[%s]: %s\n", (char*)privdata, reply->str);void connectCallback(const redisAsyncContext *c, int status) {if (status != REDIS_OK) {printf("Error: %s\n", c->errstr);printf("Connected...\n");void disconnectCallback(const redisAsyncContext *c, int status) {if (status != REDIS_OK) {printf("Error: %s\n", c->errstr);printf("Disconnected...\n");int main (int argc, char **argv) {    signal(SIGPIPE, SIG_IGN);struct event_base *base = event_base_new();    redisAsyncContext *c = redisAsyncConnect("127.0.0.1", 6379);printf("Error: %s\n", c->errstr);    redisLibeventAttach(c,base);    redisAsyncSetConnectCallback(c,connectCallback);    redisAsyncSetDisconnectCallback(c,disconnectCallback);    redisAsyncCommand(c, NULL, NULL, "SET key %b", argv[argc-1], strlen(argv[argc-1]));    redisAsyncCommand(c, getCallback, (char*)"end-1", "GET key");    event_base_dispatch(base);```

[https://blog.csdn.net/lls2012/article/details/71087123](https://blog.csdn.net/lls2012/article/details/71087123) 
 [https://blog.csdn.net/Windgs_YF/article/details/88804228](https://blog.csdn.net/Windgs_YF/article/details/88804228) 
 [https://blog.csdn.net/Windgs_YF/article/details/88804228](https://blog.csdn.net/Windgs_YF/article/details/88804228)
````

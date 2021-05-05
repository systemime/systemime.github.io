---
title: golang 面试题 - Go语言中文网 - Golang中文社区
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

golang 面试题 - Go 语言中文网 - Golang 中文社区               

[![](https://static.studygolang.com/static/img/logo.png)
](/ "Go 语言中文网")  

-   [主题](/topics)

-   [文章](/articles)

-   [项目](/projects)

-   [资源](/resources)

-   [图书](/books)

-   [Go 周刊](/go/weekly)

-   [下载](/dl)

-   [官方文档](#)

    -   [英文文档](http://docs.studygolang.com)

    -   [中文文档](http://docscn.studygolang.com)

    -   [标准库中文版](/pkgdoc)

    -   [Go 指南](http://tour.studygolang.com)

-   [注册](/account/register)

-   [登录](/account/login)

分享

1.  [首页](/)
2.  [文章](/articles)

# golang 面试题

诺唯 · 2017-06-19 02:28:00 · 25832 次点击 · 预计阅读时间 3 分钟 · 2 分钟之前 开始浏览    

这是一个创建于 2017-06-19 02:28:00 的文章，其中的信息可能已经有所发展或是发生改变。

[PHP+GO 进阶一线大厂挑战 50 万年薪路线 >>>](https://www.sixstaredu.com/go-php/index.html)

* * *

**分享出来几个 go 面试题，都非常简单，如果您有一些开发时候使用到的小技巧欢迎评论。** 

**目前我写出来 11 个 (再更新一道题目)，未来会不定期更新。。。** 

> **1、写出下面代码输出内容。** 

    package main

    import (
    	"fmt"
    )

    func main() {
    	defer_call()
    }

    func defer_call() {
    	defer func() { fmt.Println("打印前") }()
    	defer func() { fmt.Println("打印中") }()
    	defer func() { fmt.Println("打印后") }()

    	panic("触发异常")
    } 

> **2、 以下代码有什么问题，说明原因**

    type student struct {
    	Name string
    	Age  int
    }

    func pase_student() {
    	m := make(map[string]*student)
    	stus := []student{
    		{Name: "zhou", Age: 24},
    		{Name: "li", Age: 23},
    		{Name: "wang", Age: 22},
    	}
    	for _, stu := range stus {
    		m[stu.Name] = &stu
    	}
    } 

> **3、下面的代码会输出什么，并说明原因**

    func main() {
    	runtime.GOMAXPROCS(1)
    	wg := sync.WaitGroup{}
    	wg.Add(20)
    	for i := 0; i < 10; i++ {
    		go func() {
    			fmt.Println("i: ", i)
    			wg.Done()
    		}()
    	}
    	for i := 0; i < 10; i++ {
    		go func(i int) {
    			fmt.Println("i: ", i)
    			wg.Done()
    		}(i)
    	}
    	wg.Wait()
    } 

> **4、下面代码会输出什么？**

    type People struct{}

    func (p *People) ShowA() {
    	fmt.Println("showA")
    	p.ShowB()
    }
    func (p *People) ShowB() {
    	fmt.Println("showB")
    }

    type Teacher struct {
    	People
    }

    func (t *Teacher) ShowB() {
    	fmt.Println("teacher showB")
    }

    func main() {
    	t := Teacher{}
    	t.ShowA()
    } 

> **5、下面代码会触发异常吗？请详细说明**

    func main() {
    	runtime.GOMAXPROCS(1)
    	int_chan := make(chan int, 1)
    	string_chan := make(chan string, 1)
    	int_chan <- 1
    	string_chan <- "hello"
    	select {
    	case value := <-int_chan:
    		fmt.Println(value)
    	case value := <-string_chan:
    		panic(value)
    	}
    } 

> **6、下面代码输出什么？**

    func calc(index string, a, b int) int {
    	ret := a + b
    	fmt.Println(index, a, b, ret)
    	return ret
    }

    func main() {
    	a := 1
    	b := 2
    	defer calc("1", a, calc("10", a, b))
    	a = 0
    	defer calc("2", a, calc("20", a, b))
    	b = 1
    } 

> **7、请写出以下输入内容**

    func main() {
    	s := make([]int, 5)
    	s = append(s, 1, 2, 3)
    	fmt.Println(s)
    } 

> **8、下面的代码有什么问题?**

    type UserAges struct {
    	ages map[string]int
    	sync.Mutex
    }

    func (ua *UserAges) Add(name string, age int) {
    	ua.Lock()
    	defer ua.Unlock()
    	ua.ages[name] = age
    }

    func (ua *UserAges) Get(name string) int {
    	if age, ok := ua.ages[name]; ok {
    		return age
    	}
    	return -1
    } 

> **9、下面的迭代会有什么问题？**

    func (set *threadSafeSet) Iter() <-chan interface{} {
    	ch := make(chan interface{})
    	go func() {
    		set.RLock()

    		for elem := range set.s {
    			ch <- elem
    		}

    		close(ch)
    		set.RUnlock()

    	}()
    	return ch
    } 

> **10、以下代码能编译过去吗？为什么？**

    package main

    import (
    	"fmt"
    )

    type People interface {
    	Speak(string) string
    }

    type Stduent struct{}

    func (stu *Stduent) Speak(think string) (talk string) {
    	if think == "bitch" {
    		talk = "You are a good boy"
    	} else {
    		talk = "hi"
    	}
    	return
    }

    func main() {
    	var peo People = Stduent{}
    	think := "bitch"
    	fmt.Println(peo.Speak(think))
    } 

> **11、以下代码打印出来什么内容，说出为什么。。。** 

    package main

    import (
    	"fmt"
    )

    type People interface {
    	Show()
    }

    type Student struct{}

    func (stu *Student) Show() {

    }

    func live() People {
    	var stu *Student
    	return stu
    }

    func main() {
    	if live() == nil {
    		fmt.Println("AAAAAAA")
    	} else {
    		fmt.Println("BBBBBBB")
    	}
    } 

* * *

有疑问加站长微信联系（非本文作者）

![](https://static.studygolang.com/static/img/footer.png?imageView2/2/w/280)

本文来自：[知乎专栏](/wr?u=http://zhuanlan.zhihu.com "知乎专栏")

感谢作者：诺唯

查看原文：[golang 面试题](/wr?u=https%3a%2f%2fzhuanlan.zhihu.com%2fp%2f26972862 "golang 面试题")

入群交流（和以上内容无关）：加入 Go 大咖交流群，或添加微信：liuxiaoyan-s 备注：入群；或加 QQ 群：701969077

 ![](https://static.studygolang.com/static/img/detail-qrcode.png) 

25832 次点击  ∙  1 赞  

[加入收藏](javascript:; "加入收藏") [微博](javascript:)

[赞](javascript:; "赞")

被以下专栏收入，发现更多相似内容

[![](https://static.studygolang.com/logo/green-logo-1.png)
 Go 笔试面试 ](/subject/10 "Go 笔试面试") [ 收入我的专栏](javascript:)

上一篇：[Simplicity Debt Redux](/articles/10064)

下一篇：[ngrok 服务器搭建步骤 - 测试成功](/articles/10066)

\[

面试题](/tag/%e9%9d%a2%e8%af%95%e9%a2%98)\[

迭代](/tag/%e8%bf%ad%e4%bb%a3)\[

panic](/tag/panic)\[

defer](/tag/defer)

30 回复  **\|**  直到 2021-03-02 09:09:53

[![](https://static.studygolang.com/avatar/gopher25.png?imageView2/2/w/48)
](/user/hmly "hmly")

[hmly](/user/hmly) · #1 · 4 年之前

问题 8 真没发现什么问题啊？

-   [编辑](#)
-   [预览](#)

问题 8 真没发现什么问题啊？

提交 取消

[![](https://static.studygolang.com/avatar/gopher08.png?imageView2/2/w/48)
](/user/channel "channel")

[channel](/user/channel) · #2 · 4 年之前

对 [![](https://static.studygolang.com/avatar/gopher25.png?imageView2/2/w/48)
hmly ](/user/hmly) [#1](#reply-1) 回复

问题 8 真没发现什么问题啊？

Set 加锁了，Get 也得加锁。这里最好使用 sync.RWMutex

-   [编辑](#)
-   [预览](#)

Set 加锁了，Get 也得加锁。这里最好使用 sync.RWMutex

提交 取消

[![](https://avatars2.githubusercontent.com/u/7369903?v=3)
](/user/proudlily "proudlily")

[proudlily](/user/proudlily) · #3 · 4 年之前

第九题问题在哪？我可以编译过去。但是没有解决处理 interface 类型的 chan. 可否解下迷惑？谢谢。

-   [编辑](#)
-   [预览](#)

第九题问题在哪？我可以编译过去。但是没有解决处理 interface 类型的 chan. 可否解下迷惑？谢谢。

提交 取消

[![](https://static.studygolang.com/avatar/gopher08.png?imageView2/2/w/48)
](/user/channel "channel")

[channel](/user/channel) · #4 · 4 年之前

对 [![](https://avatars2.githubusercontent.com/u/7369903?v=3)
proudlily ](/user/proudlily) [#3](#reply-3) 回复

第九题问题在哪？我可以编译过去。但是没有解决处理 interface 类型的 chan. 可否解下迷惑？谢谢。

没看出有啥问题

-   [编辑](#)
-   [预览](#)

没看出有啥问题

提交 取消

[![](https://static.studygolang.com/avatar/gopher21.png?imageView2/2/w/48)
](/user/gwll "gwll")

[gwll](/user/gwll) · #5 · 4 年之前

3 题 结果是 9 10 10 10 10 10 10 10 10 10 10 0 1 2 3 4 5 6 7 8 单不知道为什么 9 在最前面请高手指点

-   [编辑](#)
-   [预览](#)

3 题 结果是 9 10 10 10 10 10 10 10 10 10 10 0 1 2 3 4 5 6 7 8 单不知道为什么 9 在最前面请高手指点

提交 取消

[![](https://static.studygolang.com/avatar/gopher25.png?imageView2/2/w/48)
](/user/hmly "hmly")

[hmly](/user/hmly) · #6 · 4 年之前

对 [![](https://static.studygolang.com/avatar/gopher08.png?imageView2/2/w/48)
channel ](/user/channel) [#2](#reply-2) 回复

\#1 楼 @hmly Set 加锁了，Get 也得加锁。这里最好使用 sync.RWMutex

是这个意思啊，明白了。

-   [编辑](#)
-   [预览](#)

是这个意思啊，明白了。

提交 取消

[![](https://static.studygolang.com/avatar/gopher27.png?imageView2/2/w/48)
](/user/elvindu "elvindu")

[elvindu](/user/elvindu) · #7 · 4 年之前

2 题，哪里有问题?

-   [编辑](#)
-   [预览](#)

2 题，哪里有问题?

提交 取消

[![](https://static.studygolang.com/avatar/gopher08.png?imageView2/2/w/48)
](/user/channel "channel")

[channel](/user/channel) · #8 · 4 年之前

对 [![](https://static.studygolang.com/avatar/gopher27.png?imageView2/2/w/48)
elvindu ](/user/elvindu) [#7](#reply-7) 回复

2 题，哪里有问题?

range 循环，会重用地址，也就是说，`for _, stu := range stus` 中的 stu 总是在同一个地址（你可以 fmt.Printf("%p\\n", &stu) 试试) 。这样，最终所有的结果都只是最后一个了。

-   [编辑](#)
-   [预览](#)

range 循环，会重用地址，也就是说，\`for \_, stu := range stus\` 中的 stu 总是在同一个地址（你可以 fmt.Printf("%p\\n", &stu) 试试) 。这样，最终所有的结果都只是最后一个了。

提交 取消

[![](https://static.studygolang.com/avatar/gopher25.png?imageView2/2/w/48)
](/user/hmly "hmly")

[hmly](/user/hmly) · #9 · 4 年之前

对 [![](https://avatars2.githubusercontent.com/u/7369903?v=3)
proudlily ](/user/proudlily) [#3](#reply-3) 回复

第九题问题在哪？我可以编译过去。但是没有解决处理 interface 类型的 chan. 可否解下迷惑？谢谢。

我也没看出有问题，难道是这样？ for \_, elem := range set.s {ch &lt;- elem}

-   [编辑](#)
-   [预览](#)

我也没看出有问题，难道是这样？ for \_, elem := range set.s {ch &lt;- elem}

提交 取消

[![](https://static.studygolang.com/avatar/gopher25.png?imageView2/2/w/48)
](/user/hmly "hmly")

[hmly](/user/hmly) · #10 · 4 年之前

对 [![](https://avatars2.githubusercontent.com/u/7369903?v=3)
proudlily ](/user/proudlily) [#3](#reply-3) 回复

第九题问题在哪？我可以编译过去。但是没有解决处理 interface 类型的 chan. 可否解下迷惑？谢谢。

我也没看出有问题，难道是这样？ for \_, elem := range set.s {ch &lt;- elem}

-   [编辑](#)
-   [预览](#)

我也没看出有问题，难道是这样？ for \_, elem := range set.s {ch &lt;- elem}

提交 取消

[![](https://static.studygolang.com/avatar/gopher27.png?imageView2/2/w/48)
](/user/elvindu "elvindu")

[elvindu](/user/elvindu) · #11 · 4 年之前

对 [![](https://static.studygolang.com/avatar/gopher08.png?imageView2/2/w/48)
channel ](/user/channel) [#8](#reply-8) 回复

\#7 楼 @elvindu range 循环，会重用地址，也就是说，\`for \_, stu := range stus\` 中的 stu 总是在同一个地址（你可以 fmt.Printf("%p\\n", &stu) 试试) 。这样，最终所有的结果都只是最后一个了。

擦，，果然如此，这个可以说是 golang 的 bug 吧．一定要如下所示用指针才行啊 stus := \[]\*student{&student{Name: "zhou", Age: 24}, &student{Name: "li", Age: 23}, &student{Name: "wang", Age: 22}, }

-   [编辑](#)
-   [预览](#)

擦，，果然如此，这个可以说是 golang 的 bug 吧．一定要如下所示用指针才行啊 stus := \[]\*student{&student{Name: "zhou", Age: 24}, &student{Name: "li", Age: 23}, &student{Name: "wang", Age: 22}, }

提交 取消

[![](https://static.studygolang.com/avatar/gopher08.png?imageView2/2/w/48)
](/user/channel "channel")

[channel](/user/channel) · #12 · 4 年之前

对 [![](https://static.studygolang.com/avatar/gopher27.png?imageView2/2/w/48)
elvindu ](/user/elvindu) [#11](#reply-11) 回复

\#8 楼 @channel 擦，，果然如此，这个可以说是 golang 的 bug 吧．一定要如下所示用指针才行啊 stus := \[]\*student{&student{Name: "zhou", Age: 24}, &student{Name: "li", Age: 23}, &student{Name: "wang", Age: 22}, }

不是 bug 吧，特意这么弄的，可以有效避免重复分配内存。

-   [编辑](#)
-   [预览](#)

不是 bug 吧，特意这么弄的，可以有效避免重复分配内存。

提交 取消

[![](https://static.studygolang.com/avatar/gopher27.png?imageView2/2/w/48)
](/user/elvindu "elvindu")

[elvindu](/user/elvindu) · #13 · 4 年之前

对 [![](https://static.studygolang.com/avatar/gopher08.png?imageView2/2/w/48)
channel ](/user/channel) [#12](#reply-12) 回复

\#11 楼 @elvindu 不是 bug 吧，特意这么弄的，可以有效避免重复分配内存。

是的，可以避免重复分配内存，但是出现这样利用它指针的时候，编译器应该给个警告吧，或者 vet 等代码静态监测工具给个提示也行啊，不然这个样的 bug 一定出现．天坑啊

-   [编辑](#)
-   [预览](#)

是的，可以避免重复分配内存，但是出现这样利用它指针的时候，编译器应该给个警告吧，或者 vet 等代码静态监测工具给个提示也行啊，不然这个样的 bug 一定出现．天坑啊

提交 取消

[![](https://avatars2.githubusercontent.com/u/7369903?v=3)
](/user/proudlily "proudlily")

[proudlily](/user/proudlily) · #14 · 4 年之前

第九题有什么问题？可以解释下吗？ [@channel](/user/channel "@channel")

-   [编辑](#)
-   [预览](#)

@channel</a> "name="content"class="comment-textarea"rows="8"style="width: 100%;"> 第九题有什么问题？可以解释下吗？ <a href="/user/channel" title="@channel">@channel</a>

提交 取消

[![](https://static.studygolang.com/avatar/gopher08.png?imageView2/2/w/48)
](/user/channel "channel")

[channel](/user/channel) · #15 · 4 年之前

对 [![](https://avatars2.githubusercontent.com/u/7369903?v=3)
proudlily ](/user/proudlily) [#14](#reply-14) 回复

第九题有什么问题？可以解释下吗？ @channel

我也没看出有啥问题，感觉没问题啊

-   [编辑](#)
-   [预览](#)

我也没看出有啥问题，感觉没问题啊

提交 取消

[![](https://avatars2.githubusercontent.com/u/7369903?v=3)
](/user/proudlily "proudlily")

[proudlily](/user/proudlily) · #16 · 4 年之前

嘿嘿 ![](https://cdnjs.cloudflare.com/ajax/libs/emojify.js/1.1.0/images/basic/smile.png)

[@channel](/user/channel "@channel")

-   [编辑](#)
-   [预览](#)

@channel</a> "name="content"class="comment-textarea"rows="8"style="width: 100%;"> 嘿嘿 :smile: <a href="/user/channel" title="@channel">@channel</a>

提交 取消

[![](https://static.studygolang.com/avatar/gopher24.png?imageView2/2/w/48)
](/user/danbeiti "danbeiti")

[danbeiti](/user/danbeiti) · #17 · 4 年之前

我也疑惑，感觉是不是 golang 的 sync.WaitGroup 使用 wait 的时候，会把最后的 routine 直接调度到主线程中了。也就是 wg.Add(10) 时，其实只创建 9 个 routine，最后一个直接由主线程执行，所以就每次都是最后创建的最先执行，其他的就按创建顺序加入调度队列

-   [编辑](#)
-   [预览](#)

我也疑惑，感觉是不是 golang 的 sync.WaitGroup 使用 wait 的时候，会把最后的 routine 直接调度到主线程中了。也就是 wg.Add(10) 时，其实只创建 9 个 routine，最后一个直接由主线程执行，所以就每次都是最后创建的最先执行，其他的就按创建顺序加入调度队列

提交 取消

[![](https://static.studygolang.com/avatar/gopher24.png?imageView2/2/w/48)
](/user/danbeiti "danbeiti")

[danbeiti](/user/danbeiti) · #18 · 4 年之前

对 [![](https://static.studygolang.com/avatar/gopher24.png?imageView2/2/w/48)
danbeiti ](/user/danbeiti) [#17](#reply-17) 回复

我也疑惑，感觉是不是 golang 的 sync.WaitGroup 使用 wait 的时候，会把最后的 routine 直接调度到主线程中了。也就是 wg.Add(10) 时，其实只创建 9 个 routine，最后一个直接由主线程执行，所以就每次都是最后创建的最先执行，其他的就按创建顺序加入调度队列

第 3 题，求解惑

-   [编辑](#)
-   [预览](#)

第 3 题，求解惑

提交 取消

[![](https://static.studygolang.com/avatar/gopher22.png?imageView2/2/w/48)
](/user/marlonche "marlonche")

[marlonche](/user/marlonche) · #19 · 4 年之前

第 3 题这种除非使用规范里面明确说明的 goroutine 间的同步方式，不应该根据执行结果来假定 goroutine 间的执行顺序，规范之外的东西都应当当作不确定的

-   [编辑](#)
-   [预览](#)

第 3 题这种除非使用规范里面明确说明的 goroutine 间的同步方式，不应该根据执行结果来假定 goroutine 间的执行顺序，规范之外的东西都应当当作不确定的

提交 取消

[![](https://avatars0.githubusercontent.com/u/17105034?v=4)
](/user/slidoooor "slidoooor")

[slidoooor](/user/slidoooor) · #20 · 4 年之前

没答案吗. 楼主

-   [编辑](#)
-   [预览](#)

没答案吗. 楼主

提交 取消

[![](https://static.studygolang.com/avatar/d395fa5d4a97a9e99a3a7b1a2e73c34c.png?imageView2/2/w/48)
](/user/polaris "polaris")

[polaris](/user/polaris) · #21 · 4 年之前

对 [![](https://avatars0.githubusercontent.com/u/17105034?v=4)
slidoooor ](/user/slidoooor) [#20](#reply-20) 回复

没答案吗. 楼主

这里有解析：[Golang 面试题解析（一）](/articles/11003)、[Golang 面试题解析（二）](/articles/10746)、[Golang 面试题解析（三）](/articles/10994)、

-   [编辑](#)
-   [预览](#)

这里有解析：\[Golang 面试题解析（一）](/articles/11003)、\[Golang 面试题解析（二）](/articles/10746)、\[Golang 面试题解析（三）](/articles/10994)、

提交 取消

[![](https://avatars0.githubusercontent.com/u/17105034?v=4)
](/user/slidoooor "slidoooor")

[slidoooor](/user/slidoooor) · #22 · 4 年之前

对 [![](https://static.studygolang.com/avatar/d395fa5d4a97a9e99a3a7b1a2e73c34c.png?imageView2/2/w/48)
polaris ](/user/polaris) [#21](#reply-21) 回复

\#20 楼 @slidoooor 这里有解析：\[Golang 面试题解析（一）](/articles/11003)、\[Golang 面试题解析（二）](/articles/10746)、\[Golang 面试题解析（三）](/articles/10994)、

太感谢啦,

-   [编辑](#)
-   [预览](#)

太感谢啦,

提交 取消

[![](https://static.studygolang.com/avatar/gopher05.png?imageView2/2/w/48)
](/user/hwp195 "hwp195")

[hwp195](/user/hwp195) · #23 · 3 年之前

对 [![](https://static.studygolang.com/avatar/gopher21.png?imageView2/2/w/48)
gwll ](/user/gwll) [#5](#reply-5) 回复

3 题 结果是 9 10 10 10 10 10 10 10 10 10 10 0 1 2 3 4 5 6 7 8 单不知道为什么 9 在最前面请高手指点

我也没弄明白这个 9 为啥先打出来，你弄明白没？求解

-   [编辑](#)
-   [预览](#)

我也没弄明白这个 9 为啥先打出来，你弄明白没？求解

提交 取消

[![](https://avatars1.githubusercontent.com/u/17443072?v=4)
](/user/wang469427318 "wang469427318")

[wang469427318](/user/wang469427318) · #24 · 3 年之前

对 [![](https://static.studygolang.com/avatar/gopher25.png?imageView2/2/w/48)
hmly ](/user/hmly) [#1](#reply-1) 回复

问题 8 真没发现什么问题啊？

第八题的那个 map 没有初始化就直接复制，回报错

-   [编辑](#)
-   [预览](#)

第八题的那个 map 没有初始化就直接复制，回报错

提交 取消

[![](https://static.studygolang.com/avatar/gopher16.png?imageView2/2/w/48)
](/user/fwhez "fwhez")

[fwhez](/user/fwhez) · #25 · 3 年之前

对 [![](https://static.studygolang.com/avatar/gopher21.png?imageView2/2/w/48)
gwll ](/user/gwll) [#5](#reply-5) 回复

3 题 结果是 9 10 10 10 10 10 10 10 10 10 10 0 1 2 3 4 5 6 7 8 单不知道为什么 9 在最前面请高手指点

顺序不保证一致性。和当前活跃核数和 cpu 时间片策略有关吧

-   [编辑](#)
-   [预览](#)

顺序不保证一致性。和当前活跃核数和 cpu 时间片策略有关吧

提交 取消

[![](https://avatars0.githubusercontent.com/u/18096911?v=4)
](/user/n0trace "n0trace")

[n0trace](/user/n0trace) · #26 · 3 年之前

对 [![](https://static.studygolang.com/avatar/gopher16.png?imageView2/2/w/48)
fwhez ](/user/fwhez) [#25](#reply-25) 回复

\#5 楼 @gwll 顺序不保证一致性。和当前活跃核数和 cpu 时间片策略有关吧

你把上面那段代码改成这样试试就明白了

```
for i := 0; i < 10; i++ {
        go func() {
            fmt.Println("i: ", i)
            wg.Done()
        }()
        time.Sleep(time.Second)
    }

```

-   [编辑](#)
-   [预览](#)

你把上面那段代码改成这样试试就明白了 \`\`\` for i := 0; i &lt;10; i++ { go func() { fmt.Println("i:", i) wg.Done() }() time.Sleep(time.Second) } \`\`\`

提交 取消

[![](https://avatars2.githubusercontent.com/u/250500?v=4)
](/user/georgetso "georgetso")

[georgetso](/user/georgetso) · #27 · 3 年之前

第九题答案, 用 [https://studygolang.com/articles/11003](https://studygolang.com/articles/11003) 的补充代码也是有问题的. 试试把 th:=threadSafeSet{ s:\[]interface{}{"1","2"}, } 改成 th:=threadSafeSet{ s:\[]interface{}{1,2,3,4,5,6,7,8,9}, } 你会发现, 并不是所有内容都可以打印出来, 因为 main 函数结束得很快.

我认为第九题的问题, 或者说可能的隐患, 可能在于 Iter() 函数每次都返回不同的 channel. 这可能是故意如此设计, 也可能是某个隐患, 主要还是要看作者的意图.

试想: 如果 set.s 并不是一个 array, 而是一个 chan, 那 range set.s 就有阻塞的可能性 (阻塞不是问题). 因为 threadSafeSet 顾名思义就是分享给多个调用者共同使用的, 于是就出现了多个调用者都在 range set.s, 那数据到底发给谁, 就是未定义的了.

[@polaris](/user/polaris "@polaris") 您觉得呢

-   [编辑](#)
-   [预览](#)

@polaris</a> 您觉得呢 "name="content"class="comment-textarea"rows="8"style="width: 100%;"> 第九题答案, 用 [https://studygolang.com/articles/11003](https://studygolang.com/articles/11003) 的补充代码也是有问题的. 试试把 th:=threadSafeSet{ s:\[]interface{}{"1","2"}, } 改成 th:=threadSafeSet{ s:\[]interface{}{1,2,3,4,5,6,7,8,9}, } 你会发现, 并不是所有内容都可以打印出来, 因为 main 函数结束得很快. 我认为第九题的问题, 或者说可能的隐患, 可能在于 Iter() 函数每次都返回不同的 channel. 这可能是故意如此设计, 也可能是某个隐患, 主要还是要看作者的意图. 试想: 如果 set.s 并不是一个 array, 而是一个 chan, 那 range set.s 就有阻塞的可能性 (阻塞不是问题). 因为 threadSafeSet 顾名思义就是分享给多个调用者共同使用的, 于是就出现了多个调用者都在 range set.s, 那数据到底发给谁, 就是未定义的了. <a href="/user/polaris" title="@polaris">@polaris</a> 您觉得呢

提交 取消

[![](https://avatars1.githubusercontent.com/u/3455675?v=4)
](/user/iBreaker "iBreaker")

[iBreaker](/user/iBreaker) · #28 · 2 年之前

这明明是笔试题不是面试题

-   [编辑](#)
-   [预览](#)

这明明是笔试题不是面试题

提交 取消

[![](https://static.studygolang.com/avatar/gopher_gentlemen.jpg?imageView2/2/w/48)
](/user/TryHenry "TryHenry")

[TryHenry](/user/TryHenry) · #29 · 2 年之前

对 [![](https://static.studygolang.com/avatar/gopher08.png?imageView2/2/w/48)
channel ](/user/channel) [#2](#reply-2) 回复

\#1 楼 @hmly Set 加锁了，Get 也得加锁。这里最好使用 sync.RWMutex

用的 go 1.12，跑了几次，都没出现报错，是版本迭代做了优化么？

-   [编辑](#)
-   [预览](#)

用的 go 1.12，跑了几次，都没出现报错，是版本迭代做了优化么？

提交 取消

[![](https://static.studygolang.com/avatar/9fb84b474729f8619b1a2bc3cc580631.png?imageView2/2/w/48)
](/user/Seek "Seek")

[Seek](/user/Seek) · #30 · 27 天之前

对 [![](https://static.studygolang.com/avatar/gopher25.png?imageView2/2/w/48)
hmly ](/user/hmly) [#1](#reply-1) 回复

问题 8 真没发现什么问题啊？

Set 加锁了，Get 也得加锁。这里最好使用 sync.RWMutex

-   [编辑](#)
-   [预览](#)

Set 加锁了，Get 也得加锁。这里最好使用 sync.RWMutex

提交 取消

添加一条新回复 （您需要 [登录](javascript:openPop('#login-pop');) 后才能回复 [没有账号](/user/register) ？）

-   [编辑](#)
-   [预览](#)

.  
.

-   请尽量让自己的回复能够对别人有帮助
-   支持 Markdown 格式, **\*\*粗体\*\***、~~删除线~~、`` ` 单行代码 ` ``
-   支持 @ 本站用户；支持表情（输入 : 提示），见 [Emoji cheat sheet](http://www.emoji-cheat-sheet.com/)
-   图片支持拖拽、截图粘贴等方式上传

提交

### 用户登录

 记住登录状态 

没有账号？[注册](/account/register)

[忘记密码？](/account/forgetpwd)

或

[GitHub 登录](/oauth/github/login)

[Gitea 登录](/oauth/gitea/login)

###  今日阅读排行

-   ![](https://static.studygolang.com/static/img/rank_medal1.png)
    [Golang 简单写文件操作的四种方法](/articles/2073?fr=sidebar "Golang 简单写文件操作的四种方法") - 171 阅读
-   ![](https://static.studygolang.com/static/img/rank_medal2.png)
    [golang 语言中 map 的初始化及使用](/articles/2379?fr=sidebar "golang 语言中 map 的初始化及使用") - 158 阅读
-   ![](https://static.studygolang.com/static/img/rank_medal3.png)
    [golang fmt 格式 “占位符”](/articles/2644?fr=sidebar "golang fmt 格式 “占位符”") - 123 阅读
-   _4_[GO 语言下载、安装、配置](/articles/6165?fr=sidebar "GO 语言下载、安装、配置") - 116 阅读
-   _5_[golang 面试题](/articles/10065?fr=sidebar "golang 面试题") - 110 阅读
-   _6_[Linux 下安装 Go 环境](/articles/13957?fr=sidebar "Linux 下安装 Go 环境") - 101 阅读
-   _7_[golang 的强制类型转换](/articles/21591?fr=sidebar "golang 的强制类型转换") - 101 阅读
-   _8_[Go 封装、继承、多态](/articles/34202?fr=sidebar "Go 封装、继承、多态") - 95 阅读
-   _9_[为何我们用 Go 而非 Python 来部署机器学习模型？](/articles/34214?fr=sidebar "为何我们用 Go 而非 Python 来部署机器学习模型？") - 91 阅读
-   _10_[开发者的福音，go 也支持 linq 了](/articles/34219?fr=sidebar "开发者的福音，go 也支持 linq 了") - 90 阅读

###  站长公众号

![](https://static.studygolang.com/static/img/polarisxu-qrcode-m.jpg?imageView2/2/w/280)

###  一周阅读排行

-   ![](https://static.studygolang.com/static/img/rank_medal1.png)
    [Golang 简单写文件操作的四种方法](/articles/2073?fr=sidebar "Golang 简单写文件操作的四种方法") - 1467 阅读
-   ![](https://static.studygolang.com/static/img/rank_medal2.png)
    [golang 语言中 map 的初始化及使用](/articles/2379?fr=sidebar "golang 语言中 map 的初始化及使用") - 1045 阅读
-   ![](https://static.studygolang.com/static/img/rank_medal3.png)
    [golang fmt 格式 “占位符”](/articles/2644?fr=sidebar "golang fmt 格式 “占位符”") - 831 阅读
-   _4_[Golang 字符串切割函数 Split](/articles/5049?fr=sidebar "Golang 字符串切割函数 Split") - 798 阅读
-   _5_[GO 语言下载、安装、配置](/articles/6165?fr=sidebar "GO 语言下载、安装、配置") - 719 阅读
-   _6_[golang 面试题](/articles/10065?fr=sidebar "golang 面试题") - 716 阅读
-   _7_[6 款最棒的 Go 语言 Web 框架简介](/articles/11897?fr=sidebar "6 款最棒的 Go 语言 Web 框架简介") - 700 阅读
-   _8_[golang 向上取整、向下取整和四舍五入](/articles/12965?fr=sidebar "golang 向上取整、向下取整和四舍五入") - 668 阅读
-   _9_[Linux 下安装 Go 环境](/articles/13957?fr=sidebar "Linux 下安装 Go 环境") - 629 阅读
-   _10_[golang 的强制类型转换](/articles/21591?fr=sidebar "golang 的强制类型转换") - 617 阅读

###   关注我

-   扫码关注领全套学习资料 ![](https://static.studygolang.com/static/img/wx_sg_qrcode.jpg?imageView2/2/w/280)
-   加入 QQ 群：

    -   192706294（已满）
    -   731990104（已满）
    -   798786647（已满）
    -   729884609（已满）
    -   977810755（已满）
    -   815126783（已满）
    -   812540095（已满）
    -   1006366459（已满）
    -   701969077
-   ![](https://static.studygolang.com/static/img/polarisxu-qrcode-m.jpg?imageView2/2/w/280)
-   加入微信群：liuxiaoyan-s，备注入群
-   也欢迎加入知识星球 [Go 粉丝们（免费）](https://t.zsxq.com/r7AUN3B)

×

#### 给该专栏投稿 [写篇新文章](/articles/new)

每篇文章有总共有 5 次投稿机会

×

#### 收入到我管理的专栏 [新建专栏](/subject/new)

**[关于](/wiki/about)   •   [FAQ](/wiki/faq)   •   [贡献者](/wiki/contributors)   •   [晨读](/readings)   •   [Github](https://github.com/studygolang)   •   [新浪微博](http://weibo.com/studygolang)   •   [Play](https://play.studygolang.com)   •   [免责声明](/wiki/duty)   •   [联系我们](/wiki/contact)   •   [捐赠](/wiki/donate)   •   [酷站](/wiki/cool)   •   [Feed 订阅](/feed.html)   •   3276 人在线**  最高记录 5390

©2013-2021 studygolang.com Go 语言中文网，中国 Golang 社区，致力于构建完善的 Golang 中文社区，Go 语言爱好者的学习家园。

Powered by [StudyGolang(Golang + MySQL)](https://github.com/studygolang/studygolang)  • · CDN 采用 [七牛云](https://portal.qiniu.com/signup?code=3lfz4at7pxfma "七牛云")

VERSION: V4.0.0 · 19.948561ms · **为了更好的体验，本站推荐使用 Chrome 或 Firefox 浏览器**

[京 ICP 备 14030343 号 - 1](https://beian.miit.gov.cn/)

X

登录和大家一起探讨吧

用户名

密码

 记住登录状态 登录

[GitHub 登录](/oauth/github/login)

[忘记密码？](/account/forgetpwd "点击找回密码")

还不是会员[现在注册](/account/register) 
 [https://studygolang.com/articles/10065?fr=sidebar](https://studygolang.com/articles/10065?fr=sidebar)

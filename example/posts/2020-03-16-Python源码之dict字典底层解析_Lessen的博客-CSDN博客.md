---
title: Python源码之dict字典底层解析_Lessen的博客-CSDN博客
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

  python 中的 dict 可能我们最常用的容器之一了，它是一种用来存储某种关系映射的数据对的集合。在其他语言中例如 Java 也有相应的容器类型，例如 map。它们底层实现的方式也不尽相同，而我们 Python 中的 dict 底层怎么实现的呢？实际上它就是一个 Hash Table，由于其查找效率非常高所以在实际开发中，我们经常使用这个中数据容器。关于 hash table 我们在这里就不展开取讲述了，如果不清楚的可以去看数据结构的 Hash Table 原理。  
  关于 Hash Table 我们这里只提一点，我们知道在将键通过 hash function 散列的时候，不同的对象可能会生成相同的 hash 值，也就是 “哈希冲突”，显然这是我们所不允许的。因此我们需要对这种冲突进行处理，在 Python 中选择的处理方式是 “开放定址法” 所采用的策略是 “二次探测再散列” 。也就是说当出现哈希冲突的时候，会通过一个 “二次数列” 的地址偏量再次进行探测直到找到一个可以放下元素的位置。在这个再次探测的过程中就会形成一个探测序列，可以试想一下这个问题，假如探测序列上的某个元素被删除了会出现什么问题？没错，这个探测序列就被中断了，假如我们需要查找的元素在这个被删除的元素之后，那么我们就 search 不到这个元素了。这显然是不行的，因此在采用开放定址发的策略中必须解决这个问题，而 Python 的解决方式就是使用 dummy 的删除方式。这个我们后面再讲。

  PyDictObject 对象包含很多子结构，整个结构相对比较复杂，因此我们有必要先了解清楚整个 PyDictObject 的内存构造以及子结构。

-   ## 1.2 PyDictKeyEntry

  我们知道 dict 中实际上存储的是键值对，那么这个键值对是以什么样的形式存在的呢？接下来就看一看键值对在底层是如何定义的

```c

typedef struct {
    
    Py_hash_t me_hash;
    PyObject *me_key;
    PyObject *me_value; 
} PyDictKeyEntry;

```

  可以看到这里面有三个变量，me_hash 是用来缓存键的哈希值，这样可以避免每次查询的时候重复计算。me_key 和 me_value 这两个域用来存储键和值，可以看见它们都是 PyObject \* 类型，因此 dict 可以存储各种类型对象。

-   ## 1.3PyDictKeysObject

  从命名我们就知道它是和字典中的 key 相关的一个结构体，我们看看它的定义

```c


typedef Py_ssize_t (*dict_lookup_func)
(PyDictObject *mp, PyObject *key, Py_hash_t hash, PyObject ***value_addr,
 Py_ssize_t *hashpos);
 
struct _dictkeysobject {
    Py_ssize_t dk_refcnt;
    Py_ssize_t dk_size;
    dict_lookup_func dk_lookup;
    Py_ssize_t dk_usable;
    Py_ssize_t dk_nentries;
    
    union {
        int8_t as_1[8];
        int16_t as_2[4];
        int32_t as_4[2];
#if SIZEOF_VOID_P > 4
        int64_t as_8[1];
#endif
    } dk_indices;
};

```

  是不是看着有点懵圈？别急我们慢慢解读。  
dk_refcnt 是指引用计数；  
dk_size 是指 hash table 的大小，也就是 dk_indices 的大小，它的值必须为 2 的幂；  
dk_lookup 是哈希表的操作相关的函数，它被定义为一个函数指针，内部间接调用了 search 相关操作以及处理冲突的策略；  
dk_usable 指 dk_entries 中的可用的键值对数量；  
dk_nentries 指 dk_entries 中已经使用的键值对数量；  
dk_indices 是一个共用体，其内部成员变量共享一片内存，其成员变量是一个数组，用于存储 dk_entries 的哈希索引，它具体结构是什么可先不用管，后面我们会详细解析。需要注意的是数组中的元素类型会随着 hash table 的大小变化，代码注释中也显示了当哈希表大小 &lt;= 128 时，索引数组的元素类型为 int_8_t, 这是 C 语言中的一种结构标注，并非新的数据类型，它使用 typedef 定义的，它代表了一个有符号的 char 类型占用一个字节。int_16_t 表示当哈希表大小 &lt;=0xffff 时用两个字节，也就是 short，以此类推。这样做可以节省内存使用；  
我们看到的 dk_entries 是个什么东西？为什么一直说到它？它实际上也是一个数组，数组的元素类型就是 PyDictKeysEntry，一个键值对就是一个 entry。

-   ## 1.4 PyDictObject

PyDictObject 就是 dict 的底层实现啦，我们也来看看它的定义

```c

typedef struct _dictkeysobject PyDictKeysObject;

typedef struct {
    PyObject_HEAD
    
    Py_ssize_t ma_used;
    
    uint64_t ma_version_tag;
    PyDictKeysObject *ma_keys;
    
    PyObject **ma_values;
} PyDictObject;

```

  ma_used 字段用以存储字典中元素的个数；ma_version_tag 字段代表字典的版本，全局唯一，每一次字典改变它的值都会改变；如果 ma_values 的值为 NULL，这张表为 combained，此时 key 和 value 的值都存储在 ma_keys 中，如果 ma_values 的值不为 NULL，这张表为 split，key 都存在 ma_keys 中，而 value 存储在 ma_values 这个数组中。我们用一张图来增加我们的理解  
![](https://img-blog.csdnimg.cn/20200514030159635.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L0xlY2Nlbg==,size_16,color_FFFFFF,t_70#pic_center)

是不是突然就恍然大悟了，一张图胜过千言万语，哈哈哈。

  在操作系统中我们知道进程有三种存活的状态：运行状态，阻塞状态，就绪状态。在 Python 中，当 PyDictObject 发生变化时，entry 会在三种状态中切换，那么这三种 entry 的状态究竟是怎么样一回事呢？我们来看看。

-   unused 态：当 entry 中的 me_key 字段和 me_value 字段都为 NULL 时，此时的 entry 处于 unsed 态，处于此状态的 entry 表明这个 entry 没有存储任何键值对，并且之前也没有存储过键值对。任何 entry 在初始化的时候都处于这个状态，而且 me_key 只有在这个状态下才为 NULL，而 me_value 都可能为 0，这取决于表的方式是 combined 还是 split。
-   active 态：当 entry 中存储了键值对时，entry 的状态就从 unused 态切换为 active 态，此状态下 me_key 和 me_value 都不能为 NULL
-   dummy 态：当 dict 中的 entry 被删除后，此 entry 的状态就从 active 态变为了 dummy 态，它并不是在被删除后就直接变为了 unused 态，因为在开篇我们提到过，当发生哈希冲突时，Python 会沿着探测序列继续探测下一个位置，如果此时的 entry 变为 unused 态则探测序列就中断了。当 Python 沿着一条探测序列 search 时，如果探测到某个 entry 处于 dummy 态，就说明此 entry 是一个无效的 entry 但是后面可能还存在着有效的 entry，因此就保证了探测的连续性而不会导致中断。当 search 到某个处于 unused 态的 entry 时，证明确实不存在这样的一个 key.  
    我们用一个图示来简单表示三种状态以及它们之间的转换关系。  
    ![](https://img-blog.csdnimg.cn/20200514142031461.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L0xlY2Nlbg==,size_16,color_FFFFFF,t_70#pic_center)


-   ## 3.1 PyDictObject 的创建

  在内部，Python 通过 PyDict_New() 函数来创建一个新的 PyDictObject 对象，其函数原型如下。

```c

PyObject *
PyDict_New(void)
{
    PyDictKeysObject *keys = new_keys_object(PyDict_MINSIZE);
    if (keys == NULL)
        return NULL;
    return new_dict(keys, NULL);
}

```

  从代码中可看出，在创建 PyDictObject 对象时会先通过 new_keys_object() 函数创建一个 PyDictKeysObject 对象，并通过宏传入一个大小，它表示 dict 的初始大小也就是哈希表的大小，指定为 8. 然后再通过 new_dict() 函数创建一个 Dict 对象。我们再来看看 new_keys_object() 的原型。

```c

static PyDictKeysObject *new_keys_object(Py_ssize_t size)
{
    PyDictKeysObject *dk;
    Py_ssize_t es, usable;
    assert(size >= PyDict_MINSIZE);
    assert(IS_POWER_OF_2(size));
    
    usable = USABLE_FRACTION(size);
    if (size <= 0xff) {
        es = 1;
    }
    else if (size <= 0xffff) {
        es = 2;
    }
#if SIZEOF_VOID_P > 4
    else if (size <= 0xffffffff) {
        es = 4;
    }
#endif
    else {
        es = sizeof(Py_ssize_t);
    }
    
    if (size == PyDict_MINSIZE && numfreekeys > 0) {
        dk = keys_free_list[--numfreekeys];
    }
    
    else {
        dk = PyObject_MALLOC(sizeof(PyDictKeysObject)
                             - Py_MEMBER_SIZE(PyDictKeysObject, dk_indices)
                             + es * size
                             + sizeof(PyDictKeyEntry) * usable);
        if (dk == NULL) {
            PyErr_NoMemory();
            return NULL;
        }
    }
    DK_DEBUG_INCREF dk->dk_refcnt = 1;
    
    dk->dk_size = size;
    
    dk->dk_usable = usable
    
    dk->dk_lookup = lookdict_unicode_nodummy;
    
    dk->dk_nentries = 0;
    memset(&dk->dk_indices.as_1[0], 0xff, es * size);
    memset(DK_ENTRIES(dk), 0, sizeof(PyDictKeyEntry) * usable);
    return dk;
}

```

  我们可以看见在代码中插入了一些断言语句，主要用于做一些检查，首先会检查传入的 size 也就是 entry 的容量是否大于等于 8，并且检查 size 的大小是否为 2 的幂。es 变量主要是用来确定 hash table 的索引占用多少字节，可以看到当 size 的值小于等于 0xff 也就是十进制的 255 时，es 为一个字节，以此类推。**USABLE_FRACTION() 函数用于指定哈希表的可用容量大小，其内部做了这样一个运算：(((n) &lt;&lt; 1)/3)，实际上就是将 size 乘以一个 2/3, 为什么要乘 2/3 呢？前面我们也提到过，因为通过研究表明当 hash table 中的元素数量达到总容量的三分之二时，就很容易出现 hash 冲突。**  
  接下来开始创建对象，可以看到 dict 也使用了缓冲池的技术，当缓冲池中有可用的对象时直接取出即可，如果没有可用的对象则调用 malloc() 函数在堆内存中分配空间用以创建新的对象。创建完对象后开始调整引用计数，并设置 hash table 的容量。dk_lookup 中包含了 hash function 以及当出现 hash conflict 时二次探测函数的具体实现，其默认的 search 方式为 Unicode，它实际上只是通用搜索的一个特例，我们后面会详细讲解。最后调用万能函数 memset() 来初始化内存，**第一个 memset() 函数调用是指将 dk->dk_indices.as_1\[0]所在的内存初始化为 0xff，由于这个函数是以字节为单位 copy，所以第三个参数是总的字节数，这点很重要**。它实际上完成的工作就是将哈希表中的 dk_indices 索引数组初始化，而第二个函数调用是将 hash table 中真正存储键值对的数组初始化。这与这一点您先记住，看不懂也没关系，后面我们会讲解这个东西，我可以告诉你的是它是在 Python3.6 之后对 hash table 进行了优化方式。  
  回到 PyDict_New() 函数中，当创建完 PyDictKeysObject 对象后接着调用 new_dict() 函数，其原型如下。

```c

static PyObject *
new_dict(PyDictKeysObject *keys, PyObject **values)
{
    PyDictObject *mp;
    assert(keys != NULL);
    if (numfree) {
        mp = free_list[--numfree];
        assert (mp != NULL);
        assert (Py_TYPE(mp) == &PyDict_Type);
        _Py_NewReference((PyObject *)mp);
    }
    else {
        mp = PyObject_GC_New(PyDictObject, &PyDict_Type);
        if (mp == NULL) {
            DK_DECREF(keys);
            free_values(values);
            return NULL;
        }
    }
    mp->ma_keys = keys;
    mp->ma_values = values;
    mp->ma_used = 0;
    mp->ma_version_tag = DICT_NEXT_VERSION();
    assert(_PyDict_CheckConsistency(mp));
    return (PyObject *)mp;
}

```

  接下来开始创建 PyDictObject 对象，首先会检查 keys 是否为一个有效对象，紧接着在检查缓冲池中是否有可用的对象，如果有就直接取出即可，如果没有就调用 PyObject_GC_New() 函数为对象在系统堆内存中分配内存用以创建对象，并为 key 和 value 设置值。

-   ## 3.2 谈谈 PyDictObject 中的 hash table

  在上一节的解析中我提出了一个问题，在调用 memset() 函数时具体做的事情。现在我就来讲解一下关于 hash table 的结构。假如说让你自己来设计一个 hash table 用来实现 dict 你会怎么做呢? 首先用一个指针指向 dict 内部的 hash table，它实际上是一个二维数组，数组的每一行代表着存储一个键值对以及 key 的哈希值。于是乎，它的结构就成了下图中上面的那张图所示的结构。  
  当我们添加一个元素 &lt;key1, value1> 时，会首先计算 key 的哈希值，**由于计算出来的哈希值可能很大超过 hash table 的长度，因此我们可以对它取模（实际上在 Python 内部是将哈希值和表的长度进行 “与” 运算，我们只是为了简单阐述这个问题所以取模），将哈希值映射到有效长度，找到合适的位置后将其放入指定位置，当添加第二个元素的时候也一样。** 由于 key 的哈希值取模后大小不一定，因此有可能放在任何位置，这也是为什么 Python 中的 dict 中的元素是无序的原因。但是这样存储会有一个问题，你有没有发现这张 hash table 有点过于稀疏，如果有很多这样的 hash table，这样就会造成空间的浪费（看来时间和空间的开销是程序中绕不开的点啊）。此外当 hash table 中的元素数量超过表容量的 2/3 时，hash table 会进行扩容，根据之前说的，当 hash table 的长度改变后再取模运算的时候原来元素的位置就会发生变化，因此就需要将原来的元素做移动的操作，而这样就会导致插入的效率变低。但是情况在 Python3.6 以后发生了改变。  
  Python3.6 之后，对 hash table 的结构做了部分优化，怎么优化的呢？将 hash table 的哈希索引和真正的键值对分开存储，首先有两个数组—indices 和 entries，indices 值存储 hash table 的索引，而真正的 hash table 存储在 entries 中。如下图中第二张表所示，当插入元素 &lt;key1, value1> 时，按照上面的方法计算哈希值并取模运算，将得到的值作为 indices 数组的下标，并在这个位置存储哈希表中元素的索引（就是 entries 数组中的该键值对存放的位置就是数组下标），然后在 entries 数组中插入键值对即可。依此类推，当插入下一个元素时，就将其放入下一个位置，用这样的方式，哈希表就非常紧凑，空间利用率就非常高。**而且由于在插入元素时是严格按照递增的规则插入，因此它保证了插入元素的有序性。** 注意，下图所列举的数据只是为了说明其存储的方式，并不代表其真正存放的位置。  
![](https://img-blog.csdnimg.cn/20200513230818717.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L0xlY2Nlbg==,size_16,color_FFFFFF,t_70#pic_center)

-   ## 3.3 PyDictobject 对象的元素搜索

  注意这里说的搜索并非仅仅指查找，其实无论插入元素，查找元素或是删除元素都要经过搜索策略。python 为哈希表搜索提供了多种函数，lookdict、lookdict_unicode、lookdict_index，一般通用的是 lookdict，lookdict_unicode 则是专门针对 key 为 unicode 的 entry，lookdict_index 针对 key 为 int 的 entry，可以把 lookdict_unicode、lookdict_index 看成 lookdict 的特殊实现，只不过这两种可以非常的常用，因此单独实现了一下。我们来看看 look_dict 的实现。

```c

static Py_ssize_t
lookdict(PyDictObject *mp, PyObject *key,
         Py_hash_t hash, PyObject ***value_addr, Py_ssize_t *hashpos)
{
    size_t i, mask;
    Py_ssize_t ix, freeslot;
    int cmp;
    PyDictKeysObject *dk;
    PyDictKeyEntry *ep0, *ep;
    PyObject *startkey;

top:
    dk = mp->ma_keys;
    mask = DK_MASK(dk);
    ep0 = DK_ENTRIES(dk);
    i = (size_t)hash & mask;
    
    ix = dk_get_index(dk, i);
    
    if (ix == DKIX_EMPTY) {
        if (hashpos != NULL)
            *hashpos = i;
        *value_addr = NULL;
        return DKIX_EMPTY;
    }
    
    if (ix == DKIX_DUMMY) {
        
        
        freeslot = i;
    }
    
    else {
    	
        ep = &ep0[ix];
        assert(ep->me_key != NULL);
        
        
        if (ep->me_key == key) {
            *value_addr = &ep->me_value;
            if (hashpos != NULL)
                *hashpos = i;
            return ix;
        }
        
        if (ep->me_hash == hash) {
            startkey = ep->me_key;
            Py_INCREF(startkey);
            
            cmp = PyObject_RichCompareBool(startkey, key, Py_EQ);
            Py_DECREF(startkey);
            
            
            if (cmp < 0) {
                *value_addr = NULL;
                return DKIX_ERROR;
            }
            
            if (dk == mp->ma_keys && ep->me_key == startkey) {
            	
                if (cmp > 0) {
                    *value_addr = &ep->me_value;
                    if (hashpos != NULL)
                        *hashpos = i;
                    return ix;
                }
            }
            
            else {
                
                goto top;
            }
        }
        freeslot = -1;
    }

    
    for (size_t perturb = hash;;) {
    	
        perturb >>= PERTURB_SHIFT;
        
        i = ((i << 2) + i + perturb + 1) & mask;
        ix = dk_get_index(dk, i);
        
        if (ix == DKIX_EMPTY) {
            if (hashpos != NULL) {
                
                
                *hashpos = (freeslot == -1) ? (Py_ssize_t)i : freeslot;
            }
            *value_addr = NULL;
            return ix;
        }
        
        if (ix == DKIX_DUMMY) {
        	
            if (freeslot == -1)
                freeslot = i;
            continue;
        }
        
        ep = &ep0[ix];
        assert(ep->me_key != NULL);
        if (ep->me_key == key) {
            if (hashpos != NULL) {
                *hashpos = i;
            }
            *value_addr = &ep->me_value;
            return ix;
        }
        if (ep->me_hash == hash) {
            startkey = ep->me_key;
            Py_INCREF(startkey);
            
            cmp = PyObject_RichCompareBool(startkey, key, Py_EQ);
            Py_DECREF(startkey);
            if (cmp < 0) {
                *value_addr = NULL;
                return DKIX_ERROR;
            }
            if (dk == mp->ma_keys && ep->me_key == startkey) {
                if (cmp > 0) {
                    if (hashpos != NULL) {
                        *hashpos = i;
                    }
                    *value_addr = &ep->me_value;
                    return ix;
                }
            }
            else {
                
                goto top;
            }
        }
    }
    assert(0);          
    return 0;
}

```

  一看代码就晕？别急，我们慢慢开抽丝剥茧。首先通过一个宏 DK_MASK 做一些操作，这个宏就做了一件事情，就是将 dk 中的 size 减 1 然后赋值给 mask 变量。然后再通过 DK_ENTRIES 这个宏对 dk 做处理，这个宏做了什么事情呢？我们来看看它的定义

```c
#define DK_SIZE(dk) ((dk)->dk_size)
#if SIZEOF_VOID_P > 4
#define DK_IXSIZE(dk)                          \
    (DK_SIZE(dk) <= 0xff ?                     \
        1 : DK_SIZE(dk) <= 0xffff ?            \
            2 : DK_SIZE(dk) <= 0xffffffff ?    \
                4 : sizeof(int64_t))
#else
#define DK_IXSIZE(dk)                          \
    (DK_SIZE(dk) <= 0xff ?                     \
        1 : DK_SIZE(dk) <= 0xffff ?            \
            2 : sizeof(int32_t))
#endif
#define DK_ENTRIES(dk) \
    ((PyDictKeyEntry*)(&(dk)->dk_indices.as_1[DK_SIZE(dk) * DK_IXSIZE(dk)]))

```

看着这么多的东西，实际上它就做了两件事情，**其一是根据 hash table 的大小动态调整 indices 数组中的元素的数据类型；其二是将 dk_entries 数组中的首地址取出赋值给 ep0. 是不是突然就简单了？** OK 我们接着聊，接下来将 hash 这个变量和 mask 做了一个 “与” 的操作，这样就将 key 在哈希表中的位置计算出来。我们知道哈希值是一个非常大的数字，而 hash table 的大小可能远远没有这么大，因此将两者做一个 “与” 运算可就能将结果映射到表的大小以内了。需注意计算迟来的结果仅仅是 indices 这个数组中的位置而非键值对的数组的位置，在上面我们已经分析过了。接着就开始通过 dk_get_index() 这个函数作用是根据上述步骤计算出来的值，在 dk_entries 数组中找到所对应的键值对在数组中的位置索引。它的具体实现我们就不赘述了，很简单，有兴趣可以参考源码。  
  继续回到 lookdict() 函数中，由于我已经在代码中对一些重要的地方做了注释，因此我接下来只是阐述整个函数所做的操作而不再详细地分析。OK，当计算出该 key 所对应的 hash table 的索引 ix 后，如果其值为 DKIX_EMPTY，也就是说该 entry 处于 unused 态，则搜索失败。则记录下该 entry 对象在 indices 数组中的位置，表示它是一个立即可用的 entry，并返回 DKIX_EMPTY. 如果该 entry 处于 dummy 态，则标记该 entry 在 indices 数组中的位置，这里用 freeslot 变量，这个 freeslot 变量就是用来记录探测链上可用的 entry. 如果该 entry 处于 active 态，则将指定的 key 和待搜索的 key 做比较，如果相同则将该 entry 中的值取出，并标记它在哈希表中的位置并返回索引。注意，这里的相同有两个衡量标准，一是它们是同一个对象也就是它们的地址是相同的，二是它们不是同一个对象但是它们的 “值” 是相等的。因此总结起来探测过程如下步骤：

-   通过哈希值来获取探测链上第一个 entry 的索引
-   当满足两种情况结束搜索  
      - 如果冲突链上该 entry 助于 unused 态，搜索完成，表明搜索失败  
      - 如果该 entry 处于 active 态，且它们的 key 为同一个对象
-   如果该 entry 处于 dummy 态，则设置 freeslot
-   检查处于 active 态的 entry 的 key 与待检查的 key 是否 “值” 相等，如果相等则搜索成功  
      当探测链上第一个 entry 的 key 与待查找的 key 不匹配时，会继续遍历下一个 entry，其方式一样，也就是代码中的 for 语句代码块，我们也来看看它的步骤
-   根据探测函数，获取下一个待探测的 entry
-   当检查到处于 unused 态的 entry 时，有两种情况：一是 freeslot 没有被标记，则将新计算出来的位置标记；二是 freeslot 已经标记过了，则直接将之前的 freeslot 标记。
-   检查处于 active 态的 entry 的 key 是否 “相同” （两个衡量标准）
-   如果有处于 dummy 态的 entry，且没有被标记则设置 freeslot.  
    花了好大功夫终于说完了搜索原理了，需要注意的是，搜索几乎涵盖了字典的很多操作，插入，删除都离不开它，都是给予此基础上的。因此，写下俩的内容我会尽量简单地阐述，因为现在已经一万三千多字了，太多了（捂脸）。
-   ## 3.4 PyDictObject 的元素插入

  插入操作也是需要通过搜索来实现的，在内部通过 insertdict() 函数来实现，我们来看看它的源码

```c
dictobject.c
static int
insertdict(PyDictObject *mp, PyObject *key, Py_hash_t hash, PyObject *value)
{
    PyObject *old_value;
    PyObject **value_addr;
    PyDictKeyEntry *ep, *ep0;
    Py_ssize_t hashpos, ix;
    
    Py_INCREF(key);
    Py_INCREF(value);
    
    if (mp->ma_values != NULL && !PyUnicode_CheckExact(key)) {
        if (insertion_resize(mp) < 0)
            goto Fail;
    }
    
    
    ix = mp->ma_keys->dk_lookup(mp, key, hash, &value_addr, &hashpos);
    if (ix == DKIX_ERROR)
        goto Fail;
    
    assert(PyUnicode_CheckExact(key) || mp->ma_keys->dk_lookup == lookdict);
    MAINTAIN_TRACKING(mp, key, value);

    
     
    if (_PyDict_HasSplitTable(mp) &&
        ((ix >= 0 && *value_addr == NULL && mp->ma_used != ix) ||
         (ix == DKIX_EMPTY && mp->ma_used != mp->ma_keys->dk_nentries))) {
        if (insertion_resize(mp) < 0)
            goto Fail;
        find_empty_slot(mp, key, hash, &value_addr, &hashpos);
        ix = DKIX_EMPTY;
    }
    
    if (ix == DKIX_EMPTY) {
        
        
        if (mp->ma_keys->dk_usable <= 0) {
            
            if (insertion_resize(mp) < 0)
                goto Fail;
            find_empty_slot(mp, key, hash, &value_addr, &hashpos);
        }
        
        
        ep0 = DK_ENTRIES(mp->ma_keys);
        ep = &ep0[mp->ma_keys->dk_nentries];
        
        
        dk_set_index(mp->ma_keys, hashpos, mp->ma_keys->dk_nentries);
        ep->me_key = key;
        ep->me_hash = hash;
        
        if (mp->ma_values) {
            assert (mp->ma_values[mp->ma_keys->dk_nentries] == NULL);
            mp->ma_values[mp->ma_keys->dk_nentries] = value;
        }
        
        else {
            ep->me_value = value;
        }
        mp->ma_used++;
        mp->ma_version_tag = DICT_NEXT_VERSION();
        mp->ma_keys->dk_usable--;
        mp->ma_keys->dk_nentries++;
        assert(mp->ma_keys->dk_usable >= 0);
        assert(_PyDict_CheckConsistency(mp));
        return 0;
    }

    assert(value_addr != NULL);
    
    
    
    old_value = *value_addr;
    if (old_value != NULL) {
        *value_addr = value;
        mp->ma_version_tag = DICT_NEXT_VERSION();
        assert(_PyDict_CheckConsistency(mp));

        Py_DECREF(old_value); 
        Py_DECREF(key);
        return 0;
    }

    
    assert(_PyDict_HasSplitTable(mp));
    assert(ix == mp->ma_used);
    *value_addr = value;
    mp->ma_used++;
    mp->ma_version_tag = DICT_NEXT_VERSION();
    assert(_PyDict_CheckConsistency(mp));
    Py_DECREF(key);
    return 0;

Fail:
	
    Py_DECREF(value);
    Py_DECREF(key);
    return -1;
}

```

  我在代码中也进行了详细的注释，所以在这里我尽可能简单地叙述。在插入一个 entry 时，也就是在字典中进行插入操作，会首先调用搜索函数，如果搜索函数通过哈希映射找到一个 unused 态的 entry，则直接插入即可，并将哈希表中的该 entry 的索引存储在索引数组 indices 中；如果搜索函数找到一个处于 active 态的 entry 则直接将原来的值替换掉即可。其实我们可以看见，整个过程最主要的还是依赖于搜索函数，所以对前面所讲的搜索函数它的原理一定要非常清楚。叙述虽然简单，但是其中的细节与处理过程，可参考代码中的注释。  
  在调用 insertdict 函数时，传入了一个哈希值，这个哈希值是在什么地方生成的呢？它实际上是在 PyDict_SetItem() 函数中生成的，其原型如下所示。

```c
dictobject.c
int PyDict_SetItem(PyObject *op, PyObject *key, PyObject *value)
{
    PyDictObject *mp;
    Py_hash_t hash;
    
    
    if (!PyUnicode_CheckExact(key) ||
        (hash = ((PyASCIIObject *) key)->hash) == -1)
    {
        hash = PyObject_Hash(key);
        if (hash == -1)
            return -1;
    }
    return insertdict(mp, key, hash, value);
}

```

  原来如此，在这个函数内部会先通过 PyObject_Hash() 函数生成一个哈希值，然后再将这个哈希值通过参数传递给 insertdict() 函数。  
  在插入操作中，当 dk_usable&lt;=0 时，也就是说明此时 dict 中的 item 数量达到了总容量的 2/3, 此时需要对 dict 扩容，也就是对哈希表扩容啦。那么对于 dict 的内部内存如何管理的呢？在内部通过调用 insertion_resize() 函数来实现，其原型如下

```c
dictobject.c
#define GROWTH_RATE(d) (((d)->ma_used *2) + ((d)->ma_keys->dk_size >> 1))
static int
insertion_resize(PyDictObject *mp)
{
    return dictresize(mp, GROWTH_RATE(mp));
}

```

  可以看到在函数内部间接调用了 dictresize() 函数，它需要传递两个参数，其中一个是增长率，这个宏实际上就是将 dict 中的 item 数量乘以 2 再和哈希表的大小的 1/2 做一个加运算。

```c
dictobject.c
static int dictresize(PyDictObject *mp, Py_ssize_t minsize)
{
    Py_ssize_t i, newsize;
    PyDictKeysObject *oldkeys;
    PyObject **oldvalues;
    PyDictKeyEntry *ep0;

    
    
    for (newsize = PyDict_MINSIZE;
         newsize < minsize && newsize > 0;
         newsize <<= 1)
        ;
    if (newsize <= 0) {
        PyErr_NoMemory();
        return -1;
    }
    
    oldkeys = mp->ma_keys;
    oldvalues = mp->ma_values;
    
    
    mp->ma_keys = new_keys_object(newsize);
    
    
    
    if (mp->ma_keys == NULL) {
        mp->ma_keys = oldkeys;
        return -1;
    }
    
    
    assert(mp->ma_keys->dk_usable >= mp->ma_used);
    if (oldkeys->dk_lookup == lookdict)
    	
        mp->ma_keys->dk_lookup = lookdict;
    
    
    mp->ma_values = NULL;
    ep0 = DK_ENTRIES(oldkeys);
    
    if (oldvalues != NULL) { 
        for (i = 0; i < oldkeys->dk_nentries; i++) {
            if (oldvalues[i] != NULL) {
                Py_INCREF(ep0[i].me_key);
                
                ep0[i].me_value = oldvalues[i];
            }
        }
    }
    
    
    for (i = 0; i < oldkeys->dk_nentries; i++) {
        PyDictKeyEntry *ep = &ep0[i];
        if (ep->me_value != NULL) {
            insertdict_clean(mp, ep->me_key, ep->me_hash, ep->me_value);
        }
    }
    mp->ma_keys->dk_usable -= mp->ma_used;
    if (oldvalues != NULL) {
        
        for (i = 0; i < oldkeys->dk_nentries; i++)
            ep0[i].me_value = NULL;
        DK_DECREF(oldkeys);
        if (oldvalues != empty_values) {
            free_values(oldvalues);
        }
    }
    else {
        assert(oldkeys->dk_lookup != lookdict_split);
        assert(oldkeys->dk_refcnt == 1);
        DK_DEBUG_DECREF PyObject_FREE(oldkeys);
    }
    return 0;
}

```

  如果需要扩容则我们必须先确定扩容后的哈希表的大小，这里根据增长率先确定哈希表的大小。在确定了哈希表大小后，为新的哈希表分配内存并创建 PyDictKeysObject 对象，如果内存分配失败则将 PyDictObject 对中的 ma_keys 指回原来的内存地址。如果分配成功，下一步就是进行内存的搬运工作，将原来的数据搬运到新开辟的内存中。这里需要注意的是在搬运时，之 copy 那些处于 active 态的 entry 而对于那些处于 dummy 态的 entry 则直接丢弃，因为 dummy 的存在是为了保证探测链的连续性，当所有的 active 态的 entry 都已经搬运到新内存中后就形成了一条新的探测链，原来的探测链就不需要了，此外如果原表指向堆内存的一片区域还需要释放掉，否则会造成内存泄漏。

-   ## 3.5 PyDictObject 元素删除操作

  当你明白插入元素的底层实现后，举一反三你应该也大致清楚，删除时大概的操作了。其实我觉得我应该都可以不用讲了，但是为了让文章更加完整，我还是说说吧。删除操作是通过 PyDictDelItem() 函数来实现的，先计算 key 的哈希值，内部再间接调用了\_PyDict_DelItem_KnownHash() 函数，这个函数真正实现了删除操作，show code

```c
dictobject.c
int
_PyDict_DelItem_KnownHash(PyObject *op, PyObject *key, Py_hash_t hash)
{
    Py_ssize_t hashpos, ix;
    PyDictObject *mp;
    PyObject **value_addr;

    if (!PyDict_Check(op)) {
        PyErr_BadInternalCall();
        return -1;
    }
    assert(key);
    assert(hash != -1);
    mp = (PyDictObject *)op;
    ix = (mp->ma_keys->dk_lookup)(mp, key, hash, &value_addr, &hashpos);
    if (ix == DKIX_ERROR)
        return -1;
    if (ix == DKIX_EMPTY || *value_addr == NULL) {
        _PyErr_SetKeyError(key);
        return -1;
    }
    assert(dk_get_index(mp->ma_keys, hashpos) == ix);

    
    if (_PyDict_HasSplitTable(mp)) {
        if (dictresize(mp, DK_SIZE(mp->ma_keys))) {
            return -1;
        }
        ix = (mp->ma_keys->dk_lookup)(mp, key, hash, &value_addr, &hashpos);
        assert(ix >= 0);
    }
    return delitem_common(mp, hashpos, ix, value_addr);
}

```

  我靠，终于见到少点的代码了，少吗？实际上也不少，因为内部还有很多间接调用 (捂脸) 。同样内部先进行一系列的类型检查。调用搜索函数沿着探测链探测, 如果发现存在 unused 态的 entry，则返回错误值，说明 key 设置错误，未找到正确的 entry. 如果是找到这个 entry 需要进行一个判断，如果此表是 split 表，他是不支持删除操作的，需要转换成 combined 表。可以看到最后又调用了一个 delitem_common() 函数。我们也来看看其原型

```c
dictobject.c
static int
delitem_common(PyDictObject *mp, Py_ssize_t hashpos, Py_ssize_t ix,
               PyObject **value_addr)
{
    PyObject *old_key, *old_value;
    PyDictKeyEntry *ep;

    old_value = *value_addr;
    assert(old_value != NULL);
    *value_addr = NULL;
    mp->ma_used--;
    mp->ma_version_tag = DICT_NEXT_VERSION();
    ep = &DK_ENTRIES(mp->ma_keys)[ix];
    dk_set_index(mp->ma_keys, hashpos, DKIX_DUMMY);
    ENSURE_ALLOWS_DELETIONS(mp);
    old_key = ep->me_key;
    ep->me_key = NULL;
    Py_DECREF(old_key);
    Py_DECREF(old_value);
    assert(_PyDict_CheckConsistency(mp));
    return 0;
}

```

  在这个函数中，确定要删除这个 item，先将 ma_used 的值减 1，因为删除一个 entry 后，字典中的已经存在的 item 数量就少 1，此外将字典版本减 1. DK_ENTRIES(mp->ma_keys) 这个宏是将 PyDictKeysObject 对象中的存储 entry 的数组的内存地址取出来然后通过搜索得到的索引，就可以定位到这个 entry。通过调用 dk_set_index() 函数将此 entry 的状态设置为 dummy 态，并在哈希索引表中记录下。然后将 key 的值设置为 NULL，并使原来的 key 和 value 的引用计数减少。是不是很简单？没错，当你搞清楚之前的原理，不用说你也能知道删除操作。花了这么大的篇幅终于讲完了。

  在创建对象时，我们看到 dict 同样也使用了缓冲池的技术，实际上 dict 所用的缓冲池技术和 list 相同。

```c


#define PyDict_MAXFREELIST 80
#endif
static PyDictObject *free_list[PyDict_MAXFREELIST];
static int numfree = 0;
static PyDictKeysObject *keys_free_list[PyDict_MAXFREELIST];
static int numfreekeys = 0;

```

  可以看到 PyDictObject 对象和 PyDictKeysObject 对象都维护了一个缓冲池，其大小为 80。它和 list 的缓冲池一样，开始时缓冲池中并没有任何对象。这里以 PyDictObject 为例讲解，当创建对象时，会先在缓冲池中查找是否有可用的对象，如果有则取出使用，如果没有则新创建一个对象。可是，缓冲池中的对象是什么时候放进去的呢？我想你也应该猜到了，没错，就是在对象被销毁时。对象被销毁时会调用 dict_dealloc() 函数，其原型如下所示。

```c
dictobject.c
static void
dict_dealloc(PyDictObject *mp)
{
    PyObject **values = mp->ma_values;
    PyDictKeysObject *keys = mp->ma_keys;
    Py_ssize_t i, n;

    
    PyObject_GC_UnTrack(mp);
    Py_TRASHCAN_SAFE_BEGIN(mp)
    if (values != NULL) {
        if (values != empty_values) {
            for (i = 0, n = mp->ma_keys->dk_nentries; i < n; i++) {
                Py_XDECREF(values[i]);
            }
            free_values(values);
        }
        DK_DECREF(keys);
    }
    else if (keys != NULL) {
        assert(keys->dk_refcnt == 1);
        DK_DECREF(keys);
    }
    if (numfree < PyDict_MAXFREELIST && Py_TYPE(mp) == &PyDict_Type)
        free_list[numfree++] = mp;
    else
        Py_TYPE(mp)->tp_free((PyObject *)mp);
    Py_TRASHCAN_SAFE_END(mp)
}

```

  在销毁一个 dict 对象时，底层函数主要做了几件事。第一，检查此 dict 对象中的哈希表是否为一张 split 表，如果是则将 ma_value 数组中的元素对象的引用计数减少，并通过调用 freevalue() 函数，这个函数是通过宏定义的 python/c API 中的 Py_MEM_FREE() 来释放在对内存中申请的内存块。然后通过 DK_DECREF() 这个宏来处理 PyDictKeysObject 对象，这个宏的定义如下  
#define DK_DECREF(dk) if (DK_DEBUG_DECREF (–(dk)->dk_refcnt) == 0) free_keys_object(dk)  
可以看到最后也会通过调用 free_keys_object() 函数来释放 keys 对象的空间。接着会检查缓冲池中的对象数量是否超过阈值，如果没有超过则将这个 PyDictObject 对象放入到缓冲池中，如果超过了则直接将这块内存释放归还给系统。  
  因此我们可以看出，整个对象缓冲池的机制和 list 几乎一样，缓冲池中仅仅保存了 PyDictObject 对象，而它里面所维护的哈希表的内存已经被释放掉归还给系统了。对于 keys 对象也是一样的道理。所以我们能得出一个结论，无论是 PyDictObject 对象还是 PyDictKeysObject 对象，缓冲池中存储的仅仅是这个对象本身。  
  终于写完了一共两万多字的解析，花了很多时间和精力研究源码终于也算是弄清楚了底层的原理，当然这只是一部分，字典的功能相当丰富，其底层实现也大同小异，有兴趣可以去看其他部分的底层实现。创作不易，希望能帮助到你，如有错误还请指出！ 
 [https://blog.csdn.net/leccen/article/details/106097100](https://blog.csdn.net/leccen/article/details/106097100)

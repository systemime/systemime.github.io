---
title: scrapy-redis + Bloom Filter分布式爬取tencent社招信息 - leffss - 博客园
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

-   -   scrapy-redis + Bloom Filter 分布式爬取 tencent 社招信息
        -   什么是 scrapy-redis
        -   什么是 Bloom Filter
        -   为什么需要使用 scrapy-redis + Bloom Filter
        -   目标任务
        -   安装爬虫
        -   创建爬虫
        -   编写 `items.py`
        -   编写 `spiders/tencent.py`
        -   编写 `pipelines.py`
        -   编写 `middlewares.py`
        -   编写 `settings.py`
        -   搭建 `redis`
        -   运行爬虫
        -   结语
        -   备注

### 什么是 scrapy-redis

虽然 `scrapy` 框架是异步加多线程的，但是我们只能在一台主机上运行，爬取效率还是有限的，`scrapy-redis` 库是基于 `scrapy` 修改，为我们提供了 `scrapy`分布式的队列，调度器，去重等等功能，并且原有的 `scrapy` 单机版爬虫代码只需做很小的改动。有了它，就可以将多台主机组合起来，共同完成一个爬取任务，抓取的效率又提高了。再配合 `Scrapyd` 与 `Gerapy` 可以很方便的实现爬虫的分布式部署与运行。

### 什么是 Bloom Filter

Bloom Filter，中文名称叫作布隆过滤器，是 1970 年由 Bloom 提出的，它可以被用来检测一个元素是否在一个集合中。Bloom Filter 的空间利用效率很高，使用它可以大大节省存储空间。Bloom Filter 使用位数组表示一个待检测集合，并可以快速地通过概率算法判断一个元素是否存在于这个集合中。利用这个算法我们可以实现去重效果。

### 为什么需要使用 scrapy-redis + Bloom Filter

Scrapy-Redis 的去重机制是将 Request 的指纹存储到了 Redis 集合中，每个指纹的长度为 40，例如 27adcc2e8979cdee0c9cecbbe8bf8ff51edefb61 就是一个指纹，它的每一位都是 16 进制数。我们计算一下用这种方式耗费的存储空间。每个十六进制数占用 4 b，1 个指纹用 40 个十六进制数表示，占用空间为 20 B，1 万个指纹即占用空间 200 KB，1 亿个指纹占用 2 GB。当爬取数量达到上亿级别时，Redis 的占用的内存就会变得很大，而且这仅仅是指纹的存储。Redis 还存储了爬取队列，内存占用会进一步提高，更别说有多个 Scrapy 项目同时爬取的情况了。当爬取达到亿级别规模时，Scrapy-Redis 提供的集合去重已经不能满足我们的要求。所以我们需要使用一个更加节省内存的去重算法 Bloom Filter。

### 目标任务

使用 scrapy-redis 爬取 `https://hr.tencent.com/position.php?&start=` 招聘信息，爬取的内容包括：职位名、详情连接 、职位类别、招聘人数、工作地点、发布时间、具体要求信息。

### 安装爬虫

```python
pip install scrapy
pip install scrapy-redis-bloomfilter
```

-   `python` 版本 `3.7`， `scrapy` 版本 `1.6.0`，`scrapy-redis-bloomfilter` 版本 `0.7.0`

### 创建爬虫

-   爬虫名称 `tencent` , 作用域 `tencent.com`，爬虫类型 `crawl`

### 编写 `items.py`

```python






import scrapy


class TencentspiderItem(scrapy.Item):



    positionname = scrapy.Field()

    positionlink = scrapy.Field()

    positionType = scrapy.Field()

    peopleNum = scrapy.Field()

    workLocation = scrapy.Field()

    publishTime = scrapy.Field()

    positiondetail = scrapy.Field()
    
```

-   定义需求爬取的 `item` 项

### 编写 `spiders/tencent.py`

```python

import scrapy

from scrapy_redis_bloomfilter.spiders import RedisCrawlSpider

from scrapy.spiders import CrawlSpider, Rule

from scrapy.linkextractors import LinkExtractor
from TencentSpider.items import TencentspiderItem


class TencentSpider(RedisCrawlSpider):	
    name = 'tencent'
    
    allowed_domains = ['hr.tencent.com']
    
    
    
    redis_key = 'tencent:start_urls'
    
    
    pagelink = LinkExtractor(allow=("start=\d+"))
    
    rules = (
        
        Rule(pagelink, callback='parse_item', follow=True),
    )
    
    
    
    
    
    
    
    
    def parse_item(self, response):
   	    
        items = []
        url1 = "https://hr.tencent.com/"
        for each in response.xpath("//tr[@class='even'] | //tr[@class='odd']"):
            
            item = TencentspiderItem()
            
            try:
                item['positionname'] = each.xpath("./td[1]/a/text()").extract()[0].strip()
            except BaseException:
                item['positionname'] = ""
                
            
            try:
                item['positionlink'] = "{0}{1}".format(url1, each.xpath("./td[1]/a/@href").extract()[0].strip())
            except BaseException:
                item['positionlink'] = ""
            
            
            try:
                item['positionType'] = each.xpath("./td[2]/text()").extract()[0].strip()
            except BaseException:
                item['positionType'] = ""
            
            
            try:
                item['peopleNum'] = each.xpath("./td[3]/text()").extract()[0].strip()
            except BaseException:
                item['peopleNum'] = ""

            
            try:
                item['workLocation'] = each.xpath("./td[4]/text()").extract()[0].strip()
            except BaseException:
                item['workLocation'] = ""
            
            
            try:
                item['publishTime'] = each.xpath("./td[5]/text()").extract()[0].strip()
            except BaseException:
                item['publishTime'] = ""
            
            items.append(item)
            
        for item in items:
            yield scrapy.Request(url=item['positionlink'], meta={'meta_1': item}, callback=self.second_parseTencent)
            
    def second_parseTencent(self, response):
        item = TencentspiderItem()
        meta_1 = response.meta['meta_1']
        item['positionname'] = meta_1['positionname']
        item['positionlink'] = meta_1['positionlink']
        item['positionType'] = meta_1['positionType']
        item['peopleNum'] = meta_1['peopleNum']
        item['workLocation'] = meta_1['workLocation']
        item['publishTime'] = meta_1['publishTime']
        
        tmp = []
        tmp.append(response.xpath("//tr[@class='c']")[0])
        tmp.append(response.xpath("//tr[@class='c']")[1])
        positiondetail = ''
        for i in tmp:
            positiondetail_title = i.xpath("./td[1]/div[@class='lightblue']/text()").extract()[0].strip()
            positiondetail = positiondetail + positiondetail_title
            positiondetail_detail = i.xpath("./td[1]/ul[@class='squareli']/li/text()").extract()
            positiondetail = positiondetail + ' '.join(positiondetail_detail) + ' '
        
        
        
        
        
        item['positiondetail'] = positiondetail.strip()
        
        yield item

```

-   爬虫的主逻辑

### 编写 `pipelines.py`

```python






import json


class TencentspiderPipeline(object):
    """
    功能：保存item数据
    """
    def __init__(self):
        self.filename = open("tencent.json", "w", encoding='utf-8')

    def process_item(self, item, spider):
        try:
            text = json.dumps(dict(item), ensure_ascii=False) + "\n"
            self.filename.write(text)
        except BaseException as e:
            print(e)
        return item

    def close_spider(self, spider):
        self.filename.close()

```

-   处理每个页面爬取得到的 `item` 项

### 编写 `middlewares.py`

```python







import scrapy
from scrapy import signals
from scrapy.downloadermiddlewares.useragent import UserAgentMiddleware
import random


class TencentspiderSpiderMiddleware(object):
    
    
    

    @classmethod
    def from_crawler(cls, crawler):
        
        s = cls()
        crawler.signals.connect(s.spider_opened, signal=signals.spider_opened)
        return s

    def process_spider_input(self, response, spider):
        
        

        
        return None

    def process_spider_output(self, response, result, spider):
        
        

        
        for i in result:
            yield i

    def process_spider_exception(self, response, exception, spider):
        
        

        
        
        pass

    def process_start_requests(self, start_requests, spider):
        
        
        

        
        for r in start_requests:
            yield r

    def spider_opened(self, spider):
        spider.logger.info('Spider opened: %s' % spider.name)


class TencentspiderDownloaderMiddleware(object):
    
    
    

    @classmethod
    def from_crawler(cls, crawler):
        
        s = cls()
        crawler.signals.connect(s.spider_opened, signal=signals.spider_opened)
        return s

    def process_request(self, request, spider):
        
        

        
        
        
        
        
        
        return None

    def process_response(self, request, response, spider):
        

        
        
        
        
        return response

    def process_exception(self, request, exception, spider):
        
        

        
        
        
        
        pass

    def spider_opened(self, spider):
        spider.logger.info('Spider opened: %s' % spider.name)


class MyUserAgentMiddleware(UserAgentMiddleware):
    """
    随机设置User-Agent
    """
    def __init__(self, user_agent):
        self.user_agent = user_agent

    @classmethod
    def from_crawler(cls, crawler):
        return cls(
            user_agent=crawler.settings.get('MY_USER_AGENT')
        )

    def process_request(self, request, spider):
        agent = random.choice(self.user_agent)
        request.headers['User-Agent'] = agent

```

### 编写 `settings.py`

```python











BOT_NAME = 'TencentSpider'

SPIDER_MODULES = ['TencentSpider.spiders']
NEWSPIDER_MODULE = 'TencentSpider.spiders'
















DUPEFILTER_CLASS = "scrapy_redis_bloomfilter.dupefilter.RFPDupeFilter"
SCHEDULER = "scrapy_redis_bloomfilter.scheduler.Scheduler"
SCHEDULER_PERSIST = True
REDIS_HOST = '127.0.0.1' 
REDIS_PORT = 6379



BLOOMFILTER_HASH_NUMBER = 6
BLOOMFILTER_BIT = 20    
DUPEFILTER_DEBUG = True










MY_USER_AGENT = [
    "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36",
    "Mozilla/5.0 (Windows; U; Windows NT 6.1; zh-CN; rv:1.9.2.4) Gecko/20100611 Firefox/3.6.4",
    "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.21 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.21",
    "Mozilla/4.0 (compatible; MSIE 9.0; Windows NT 6.1)",
    "Mozilla/5.0 (Windows NT 6.2; rv:30.0) Gecko/20150101 Firefox/32.0",
    "Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.92 Safari/537.36",
    "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36",
    "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.2)",
    "Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1)",
    "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:43.0) Gecko/20100101 Firefox/43.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.109 Safari/537.36",
    "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36",
    "Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko",
    "Mozilla/4.0 (compatib1e; MSIE 6.1; Windows NT)",
    "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36",
    "Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0; SLCC1; .NET CLR 2.0.50727; InfoPath.2; .NET CLR 3.5.21022; .NET CLR 3.5.30729; .NET CLR 3.0.30618)",
    "Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/6.0)",
    "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/30.0.1599.101 Safari/537.36",
    "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36",
    "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36",
    "Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36",
    "Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.1; WOW64; Trident/7.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; .NET4.0C; .NET4.0E; Media Center PC 6.0)",
    "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.93 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:23.0) Gecko/20100101 Firefox/23.0",
    "Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2)",
    "Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.31 (KHTML, like Gecko) Chrome/26.0.1410.64 Safari/537.31",
    "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36",
    "Mozilla/5.0 (Windows NT 6.1; rv:17.0) Gecko/20100101 Firefox/17.0",
    "Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.112 Safari/537.36",
    "Mozilla/5.0 (compatible; MSIE 6.0; Windows NT 5.1)",
    "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)",
    "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.108 Safari/537.36",
    "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:53.0) Gecko/20100101 Firefox/53.0",
    "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; InfoPath.2)",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36 Edge/17.17134",
    "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 SE 2.X MetaSr 1.0",
    "Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0)",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36",
    "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:47.0) Gecko/20100101 Firefox/47.0",
    "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; WOW64; rv:54.0) Gecko/20100101 Firefox/54.0",
    "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36 Edge/18.17763",
    "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.10 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36",
    "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0)",
    "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 SE 2.X MetaSr 1.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:66.0) Gecko/20100101 Firefox/66.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.106 Safari/537.36",
    "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 SE 2.X MetaSr 1.0",
    "Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1; Trident/4.0; SE 2.X MetaSr 1.0; SE 2.X MetaSr 1.0; .NET CLR 2.0.50727; SE 2.X MetaSr 1.0)",
    "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.101 Safari/537.36",
    "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12) AppleWebKit/602.1.21 (KHTML, like Gecko) Version/9.2 Safari/602.1.21",
    "Mozilla/5.0 (Windows NT 6.1; Trident/7.0; rv:11.0) like Gecko",
    "Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 10.0; WOW64; Trident/7.0; .NET4.0C; .NET4.0E; .NET CLR 2.0.50727; .NET CLR 3.0.30729; .NET CLR 3.5.30729)",
    "Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.152 Safari/537.36"
]


ROBOTSTXT_OBEY = True


CONCURRENT_REQUESTS = 32













TELNETCONSOLE_ENABLED = False






DEFAULT_REQUEST_HEADERS = {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'Accept-Encoding': 'gzip,deflate,br',
    'accept-language': 'zh-CN,zh;q=0.9',
    'cache-control': 'no-cache',
    'pragma': 'no-cache',
    'upgrade-insecure-requests': '1',
    'host': 'hr.tencent.com'
}









DOWNLOADER_MIDDLEWARES = {
    'TencentSpider.middlewares.TencentspiderDownloaderMiddleware': None,
    'TencentSpider.middlewares.MyUserAgentMiddleware': 543，
    'scrapy.downloadermiddlewares.useragent.UserAgentMiddleware': None
}









ITEM_PIPELINES = {
    'TencentSpider.pipelines.TencentspiderPipeline': 300,
    
    'scrapy_redis.pipelines.RedisPipeline': 100
}





















LOG_LEVEL = 'DEBUG'

```

### 搭建 `redis`

这里搭建单机版 `windows` 版本，需要 `linux` 版本的自行百度。 下载地址：[https://github.com/rgl/redis/downloads](https://github.com/rgl/redis/downloads) 选择最新版和你电脑的对应版本下载安装，这里我选择 `redis-2.4.6-setup-64-bit.exe`，双击安装，然后将 `C:\Program Files\Redis` 加入系统环境变量。配置文件为 `C:\Program Files\Redis\conf\redis.conf` 运行 `redis` 服务器的命令： redis-server 运行 `redis` 客户端的命令： redis-cli

### 运行爬虫

启动爬虫

```python
cd TencentSpider
scrapy crawl tencent
```

-   `TencentSpider` 为项目文件夹， `tencent` 为爬虫名
-   这时候爬虫会处于等待状态。
-   可以在本机或者其他主机启动多个爬虫实例，只有所处的主机能够连接 `redis` 即可

设置 `start_urls`

````python

redis 127.0.0.1:6379> lpush tencent:start_urls https:```

或者运行以下脚本:

```python







import redis

if __name__ == '__main__':
    conn = redis.Redis(host='127.0.0.1',port=6379)
    
    
    
    conn.lpush('tencent:start_urls','https://hr.tencent.com/position.php?&start=0#a')
    
    
    
    
    

````

-   `tencent:start_urls` 为 `spiders/tencent.py` 中变量 `redis_key` 的值
-   稍等片刻后，所有爬虫会运行，爬取完成后 `ctrl + c` 停止

结果会保存在 `redis` 数据库的 key `tencent:items` 中与项目文件夹根目录下的 `tencent.json` 文件中，内容如下：

```python
{"positionname": "29302-服务采购商务岗", "positionlink": "https://hr.tencent.com/position_detail.php?id=49345&keywords=&tid=0&lid=0", "positionType": "职能类", "peopleNum": "1", "workLocation": "深圳", "publishTime": "2019-04-12", "positiondetail": "工作职责：• 负责相关产品和品类采购策略的制订及实施； • 负责相关产品及品类的采购运作管理，包括但不限于需求理解、供应商开发及选择、供应资源有效管理、商务谈判、成本控制、交付管理、组织验收等 • 支持业务部门的采购需求； • 收集、分析市场及行业相关信息，为采购决策提供依据。 工作要求：• 认同腾讯企业文化理念，正直、进取、尽责；  • 本科或以上学历，管理、传媒、经济或其他相关专业，市场营销及内容类产品运营工作背景者优先； • 五年以上工作经验，对采购理念和采购过程管理具有清晰的认知和深刻的理解；拥有二年以上营销/设计采购、招标相关类管理经验； • 熟悉采购运作及管理，具有独立管理重大采购项目的经验，具有较深厚的采购专业知识；  • 具备良好的组织协调和沟通能力、学习能力和团队合作精神强，具有敬业精神，具备较强的分析问题和解决问题的能力；  • 了解IP及新文创行业现状及发展，熟悉市场营销相关行业知识和行业运作特点； • 具有良好的英语听说读写能力，英语可作为工作语言；同时有日语听说读写能力的优先； • 具备良好的文档撰写能力。计算机操作能力强，熟练使用MS OFFICE办公软件和 ERP 等软件的熟练使用。"}
{"positionname": "CSIG16-自动驾驶高精地图（地图编译）", "positionlink": "https://hr.tencent.com/position_detail.php?id=49346&keywords=&tid=0&lid=0", "positionType": "技术类", "peopleNum": "1", "workLocation": "北京", "publishTime": "2019-04-12", "positiondetail": "工作职责：地图数据编译工具软件开发 工作要求： 硕士以上学历，2年以上工作经验，计算机、测绘、GIS、数学等相关专业；  精通C++编程，编程基础扎实；  熟悉常见数据结构，有较复杂算法设计经验；  精通数据库编程，如MySQL、sqlite等；  有实际的地图项目经验，如地图tile、大地坐标系、OSM等；   至少熟悉一种地图数据规格，如MIF、NDS、OpenDrive等；   有较好的数学基础，熟悉几何和图形学基本算法，；   具备较好的沟通表达能力和团队合作意识。"}
{"positionname": "32032-资深特效美术设计师（上海）", "positionlink": "https://hr.tencent.com/position_detail.php?id=49353&keywords=&tid=0&lid=0", "positionType": "设计类", "peopleNum": "1", "workLocation": "上海", "publishTime": "2019-04-12", "positiondetail": "工作职责：负责游戏3D和2D特效制作，制作规范和技术标准的制定； 与项目组开发人员深入沟通，准确实现项目开发需求。 工作要求：5年以上端游、手游特效制作经验，熟悉UE4引擎； 能熟练使用相关软件和引擎工具制作高品质的3D特效； 善于使用第三方软件制作高品质序列资源，用于引擎特效； 可以总结自己的方法论和经验用于新人和带领团队； 对游戏开发和技术有热情和追求，有责任心，善于团队合作，沟通能力良好，应聘简历须附带作品。"}
......
......
......
```

### 结语

> 参考链接： [https://github.com/Python3WebSpider/ScrapyRedisBloomFilter](https://github.com/Python3WebSpider/ScrapyRedisBloomFilter)

### 备注

-   此爬虫不保证时效性，源站做调整就会失效。
-   默认的 `ScrapyRedisBloomFilter`去重时只支持 redis 的 1 个内存块，最大 512MB，可能无法满足上亿或者更多 URL 去重，并且不支持 redis-cluster，本人在大神的基础上修改了一个支持分配多个内存块，支持 redis 单机和 redis-cluster 版本：[https://github.com/leffss/ScrapyRedisBloomFilterBlockCluster](https://github.com/leffss/ScrapyRedisBloomFilterBlockCluster) 
    [https://www.cnblogs.com/leffss/p/11003098.html](https://www.cnblogs.com/leffss/p/11003098.html) 
    [https://www.cnblogs.com/leffss/p/11003098.html](https://www.cnblogs.com/leffss/p/11003098.html)

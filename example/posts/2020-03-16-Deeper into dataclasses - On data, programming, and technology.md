---
title: Deeper into dataclasses - On data, programming, and technology
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

Usually, examples using the `dataclasses` module in Python are rather simple in the use of its features. That by itself is completely fine, but sometimes the implementation can be very tedious and cumbersome. However, the `dataclasses` module offers ways to be smarter, which are rarely talked about. With this article, I want to change that. Thus, this article doesn’t cover topics like when and how to use them. There is plenty of material on the Internet to learn about that.

The following code represents a 3D point which can be added to another point and multiplied by a number element-wise. (Note: this makes this object more akin to a vector in my view). An extra feature is that it also supports iteration and unpacking via the `__iter__` method, making the point and a number [commutative](https://en.wikipedia.org/wiki/Commutative_property).

\# Baseline solution
from dataclasses import astuple, dataclass

@dataclass
class Point:
    x: float
    y: float
    z: float

    def \_\_add\_\_(self, other):
        x1, y1, z1 \= self
        x2, y2, z2 \= other
        return Point(x1+x2, y1+y2, z1+z2)

    def \_\_sub\_\_(self, other):
        x1, y1, z1 \= self
        x2, y2, z2 \= other
        return Point(x1\-x2, y1\-y2, z1\-z2)

    def \_\_mul\_\_(self, scalar):
        x, y, z \= self
        return Point(scalar\*x, scalar\*y, scalar\*z)

    def \_\_rmul\_\_(self, scalar):
        return self.\_\_mul\_\_(scalar)

    def \_\_iter\_\_(self):
        return iter(astuple(self))   

This is a good implementation, but even when using the fact that the point can be unpacked, it is quite tedious and repetitive. Typing `x1, y1, z1 = self` for every method is less than ideal. Also, what if we want to also have points in 2D, 4D or 6D? Well, that’s straightforward but error-prone. We have to add/delete attributes/fields definitions and all references to them in the relevant methods. In this particular case, that would be six lines modified. The first part is the easy and the second one (very) annoying. We could do slightly better and only having to care for the first part if we want to address other dimensions.

## Using `dataclasses` introspection

Let’s be slightly smarter and use more of the tools available in the `dataclasses` module. In particular, the function `fields()` which exposes the fields defined in a `dataclass`. Thus, instead of having to name each coordinate of the point in the different operation methods, we can iterate over them.

\# Introspection based solution
from dataclasses import astuple, dataclass, fields

@dataclass
class Point:
    x: float
    y: float
    z: float

    def \_\_add\_\_(self, other):
        return Point(\*(getattr(self, dim.name)+getattr(other, dim.name) for dim in fields(self)))

    def \_\_sub\_\_(self, other):
        return Point(\*(getattr(self, dim.name)\-getattr(other, dim.name) for dim in fields(self)))

    def \_\_mul\_\_(self, other):
        return Point(\*(getattr(self, dim.name)\*other for dim in fields(self)))

    def \_\_rmul\_\_(self, other):
        return self.\_\_mul\_\_(other)

    def \_\_iter\_\_(self):
        return iter(astuple(self))

To understand how it works, I will focus on the `__add__` method. There is quite a bit to unpack. At the core is the call to `fields()` function, which returns a tuple of 3 `field` objects, a `field` object being how a `dataclass` represents an attribute. You can (and should) go and check it out in a REPL, this can be done on the class itself or an instance of it. Since we have a tuple, we can iterate over it and access the name of each attribute.

\>>> for field in fields(Point):
...     print(field.name)
...
x
y
z

Then, the next step is to use this to get the values associated with each attribute from the instance as follows

\>>> p \\= Point(1,2,3)
\>>>list(getattr(p, field.name) for field in fields(p))
\[1,2,3]

Now we can do the operation between the two point instances that are being operated, and we unpack the generator expression into the arguments of the `Point` initialization

Point(\*(getattr(self, dim.name)+getattr(other, dim.name) for dim in fields(self))

The last step is to put this as the return value of the `__add__` method and then to implement the same strategy for the other methods. With this, we achieved the first step in removing the annoyance of having to touch every method if we change the number of dimensions of the point class. As a bonus, we also got to reduce the total amount of lines of code involved slightly.

## An alternative solution

I have to agree that using this level of introspection of a `dataclass` might be a bit cumbersome, particularly by the use of the `getattr` function. This would be the solution if we weren’t implementing the `__iter__` method. But since we’re supporting the iterator protocol, we can do something that perhaps is smarter. Thus, instead of having to iterate over the defined fields, we can iterate over the point object itself!

\# Iterator based solution
import operator

from dataclasses import astuple, dataclass, fields

@dataclass
class Point:
    x: float
    y: float
    z: float

    def \_\_iter\_\_(self):
        return iter(astuple(self))

    def \_\_add\_\_(self, other):
        return Point(\*(operator.add(\*pair) for pair in zip(self,other)))

    def \_\_sub\_\_(self, other):
        return Point(\*(operator.sub(\*pair) for pair in zip(self,other)))

    def \_\_mul\_\_(self, other):
        return Point(\*(operator.mul(\*pair) for pair in zip(self,other)))

    def \_\_rmul\_\_(self, other):
        return self.\_\_mul\_\_(other)

To highlight the pivotal piece that the `__iter__` method plays in this solution, I moved it to the top. For the rest, the code should be pretty much self-explanatory. I’d say that the use of the functions defined in the `operator` module also makes the code clearer.

## Code quality metrics

Lately, I’ve also been tangentially interested in code quality metrics. I have a hypothesis regarding the standard metrics to quantify code quality, namely, that they are not well-tailored for dynamic languages like Python. In particular with features like decorators.

Let’s explore some statistics for the three solutions covered before plus a solution without using `dataclasses` (classic) which is not shown but easy to get from the naive dataclass based solution.

|               | SLOC | MI    | Rank |
| ------------- | ---- | ----- | ---- |
| Classic       | 24   | 53.41 | A    |
| Baseline      | 21   | 54.28 | A    |
| Introspection | 16   | 60.22 | A    |
| Iterator      | 17   | 100   | A    |

Without diving too deep, the maintainability index increases as we move through the different implementations. This result was something that I intuitively expected. What it’s shocking is the value of 100 for the iterator based solution. This warrants a deeper dive into this later on, as it seems unlikely it’s a bug in the `radon` library and right now I’m too ignorant about this topic to be able to have an idea why this is the case.

Somehow I would have expected a more significant step between the classic and baseline dataclass solutions. But given that the methods we do implement are the same and the ones we didn’t have to write (`__init__`, `__eq__`, `__repr__`) are rather simple it is understandable that they don’t differ much.

## Performance

Using `%timeit` on my laptop, I ran a quick benchmark of the addition of two points

\>>> p1 \\= Point3D(1,2,3)
\>>> p2 \\= Point3D(4,5,6)
\>>> %timeit p1+p2

for the three solutions implemented in this article, with the following results

|               | mean (µs) | std     |
| ------------- | --------- | ------- |
| Baseline      | 33        | 5.18 µs |
| Introspection | 6.04      | 450 ns  |
| Iterator      | 30.4      | 3.34 µs |

We can say that the introspection based solution is considerably more performant than the other two. Would be interesting to understand better where the win (loses) for the introspection (iterator) based solution come from.

In any case, this example shows something interesting, we can increase the maintainability index while also increasing the performance. This fact is not necessarily a given, as usually performance comes at the cost of readability.

## What about nD points?

But the situation could still be improved. Let’s say you want to be able to have 2D and 3D point living along. We could copy and paste the whole definition, give each class a different name, and be sure to have the correct number of attributes. But that’d be extremely silly and we could (and should) use inheritance (see the [previous post](https://ivergara.github.io/ABC-and-dataclasses.html) which explores abstract base classes and dataclasses) and reuse all the code for the operations since we just made them independent of the dimension the point lives in. Since we’re exploring `dataclasses`, I’ll return to the first solution.

from abc import ABC

from dataclasses import astuple, dataclass, fields

@dataclass
class BasePoint(ABC):

    def \_\_add\_\_(self, other):
        return self.\_\_class\_\_(\*(getattr(self, dim.name)+getattr(other, dim.name) for dim in fields(self)))

    def \_\_sub\_\_(self, other):
        return self.\_\_class\_\_(\*(getattr(self, dim.name)\-getattr(other, dim.name) for dim in fields(self)))

    def \_\_mul\_\_(self, other):
        return self.\_\_class\_\_(\*(getattr(self, dim.name)\*other for dim in fields(self)))

    def \_\_rmul\_\_(self, other):
        return self.\_\_mul\_\_(other)

    def \_\_iter\_\_(self):
        return iter(astuple(self))

@dataclass
class Point2D(BasePoint):
    x: float
    y: float

@dataclass
class Point3D(BasePoint):
    x: float
    y: float
    z: float

Excellent, we have now points in any dimension we want with little effort!

## A factory of points

But is there a way to make even less work than this? The `dataclasses` module has a nifty function called `make_dataclass` which, as its name says, makes dataclasses based on its arguments.

We can try and create a point in 1D

\>>> Point1D \\= make_dataclass('Point1D', \[('x',float)], bases\\=(BasePoint,))
\>>> Point1D(1)
Point1D(x\\=1)

Compared to defining the class in a normal way this doesn’t seem to be a big win. But what if we want to create an exotic point in 5 dimensions? Well, first we create a list of tuples with the field names and types and then we use `make_dataclass` with it.

\>>> dims \\= 5
\>>> fields_definition \\= ((f'x{i}', float) for i in range(dims))
\>>> Point5D \\= make_dataclass('Point5D', fields_definition, bases\\=(BasePoint,))
\>>> Point5D(\*range(5))
Point5D(x0\\=0, x1\\=1, x2\\=2, x3\\=3, x4\\=4)

I move from the naming `xyz` to `x{i}` in a more “mathematical” notation which for computers also works much better.

This sets the stage up to create a whole family of points. For this we create a function which will create them (a Factory)

def PointFactory(dim):
     fields_definition \\= ((f'x{i}', float) for i in range(dim))
     return make_dataclass(f'Point{dims}D', fields_definition, bases\\=(BasePoint,))

Making use of this factory a series of classes representing points in different dimensions can be easily created

\>>> point_classes \\= \[PointFactory(dim) for dim in range(5)]
\>>> point_classes
\[&lt;class 'abc.Point0D'>, &lt;class 'abc.Point1D'>, &lt;class 'abc.Point2D'>, &lt;class 'abc.Point3D'>, &lt;class 'abc.Point4D'>]
\>>> point_classes\[3](1,2,3)
Point3D(x0\\=1, x1\\=2, x2\\=3)

## Conclusion

Besides the boilerplate reduction that the `dataclasses` module provides, it offers some powerful tooling to work with them. As an example, I showed how to create a factory of n-dimensional points.

Moreover, I discovered that using the introspection machinery of `dataclasses` leads to a higher performant code. Not that this was a goal of this article, but it’s always nice to get a boost. Keep in mind that **introspection**, in this case, might be a slightly wrong term, as it would make people believe it should be less performant, particularly those coming from Go.

After seeing the performance of each implementation, the question arises if the iterator based could be improved by being smarter. At least my first exploratory attempt by moving from `import operator` to `from operator import add, mul, sub` did not show any change. Perhaps this would be a good exercise for the reader ;)

### Acknowledgments

I want to thank Nour Faroua for her contribution leading to simplification on the code, and to Bryan Reynaert for his thorough review and input improving organization, explanations, and language of the article. 
 [https://ivergara.github.io/deeper-dataclasses.html](https://ivergara.github.io/deeper-dataclasses.html) 
 [https://ivergara.github.io/deeper-dataclasses.html](https://ivergara.github.io/deeper-dataclasses.html)

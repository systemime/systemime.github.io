---
title: How to Loop Through Your Own Objects in Python | by Stephen Fordham | Towards Data Science
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

## Iterables, Iteration and iterating through your custom Python Objects

[![](https://miro.medium.com/fit/c/56/56/1*4-DIjB5ZOAVpLPbCXVVO1Q.jpeg)
](https://medium.com/@stephenfordham?source=post_page-----1609c81e11ff--------------------------------)

![](https://miro.medium.com/max/1060/1*XDcSOvDWz52jTUJecGDYGw.png)

Image Courtesy of [istock](https://www.istockphoto.com/au/vector/infinity-symbol-of-multiple-thin-black-lines-concept-of-infinite-limitless-and-gm1197949392-342198911)

## Aim

This tutorial will aim to help you understand what iterables and iterators are, and their relationship with each other. Secondary to this, understanding how a Python for loop works under the hood will ultimately help in designing a user-defined custom-object that can be iterated over.

## Iterables

An iterable is an object capable of returning its members one by one. Simply put, an iterable is anything that you can loop over using a for loop in Python. Sequences are a very common type of iterable. Examples of built-in sequence types include lists, strings, and tuples.

## Iterators

An iterator is an object representing a stream of data. You can create an iterator object by implementing the **iter** built-in function to an iterable.

An iterator can be used to manually loop over the items in the iterable. The repeated passing of the iterator to the built-in **next** function returns successive items in the stream. When the item is consumed from the iterator, it is gone, and eventually, when no more data is available to retrieve, a **StopIteration exception** is raised.

## Understanding the Python for Loop

Central to developing knowledge on iterables and iterators is understanding how a Python for loop works under the hood. To best illustrate this, lets define a function that can take any iterable, and loop through it _without_ using a for loop.

Our function needs to be able to achieve the following:

· Create an iterator from an iterable

· Repeatedly retrieve the next item from the iterator

· Execute any intended action

· Raise a StopIteration exception when there are no more items to retrieve.

_Under the hood, an iterable is being converted into an iterator in a Python for loop._

Our custom function first converts any iterable to an iterator. In the while loop, we then get the next item from the iterator, and execute any action on this item. In this case, I have chosen to write a function to raise the number in the iterator by the power of 2, but any action can be taken, for example, we can even choose to simply print out the numbers in our container or collection.

All forms of looping over iterables in Python work in this way.

## Key Definitions

To better differentiate an iterable from an iterator, it can be helpful to further refine their definitions, and note their differences. Iterators cannot be indexed /sliced(as they can be infinitely long). In addition, unlike iterables, they do not they have a length. In the example below, attempting to get the length of the iterator object, my_iter_list raises a **TypeError exception**.

**> An iterable is something you can loop over.**

**> An iterator is an object representing a stream of data. It does the iterating over an iterable.**

A nice and concise definition for iterators, sourced from [StackOverflow](https://stackoverflow.com/questions/2776829/difference-between-pythons-generators-and-iterators#:~:text=Every%20generator%20is%20an%20iterator,paragraph's%20definition%20of%20an%20iterator%20.), whilst researching for this article, is the following:

> `iterator` is a more general concept: any object whose class has a `next` method (`__next__` in Python 3) and an `__iter__` method that does `return self`

Iterators permit users to work with and create lazy iterables. Lazy iterables do not do any work until we ask them for their next item. This feature can help us deal with infinitely long iterables which cannot fit into memory. This is called **lazy evaluation** and can help save both memory and CPU time.

## The iterator Protocol

As discussed above, the iterator objects are required to support the following 2 methods, which combined, comprise the Python iterator protocol:

**The dunder/magic iter method:**

-   iterator.\_\_iter\_\_()  
    Return the iterator object itself. This is required to allow both containers (also called collections) and iterators to be used with the `for` and `in` statements.

**The dunder/magic next method:**

-   iterator.\_\_next\_\_()  
    Return the next item from the container. If there are no more items, raise the StopIteration exception.

We may want to create a **custom iterator**. In order to do that, we need a class that has **\_\_init\_\_**, **\_\_next\_\_**, and **\_\_iter\_\_** methods defined.

## CustomIterTeams

First, lets define a custom class called CustomIterTeams. This class has no in-built iterable behaviour, but we can implement code in our class to make our custom user-defined object behave like an iterable.

There are two ways to get a custom user-defined object to behave like an iterable. The first way involves defining two dunder or magic methods, namely \_\_iter\_\_() and \_\_next\_\_(). The dunder iter method simply needs to return the object itself. This is because, when we write a for loop, this will be the object we intend to iterate over. This iter method returns an **iterator**.

**Under the hood, Python’s for loop use iterators.**

Our custom object is now an iterator, and can work with the dunder next method to return successive items in the stream. These two methods work together to enable the iterator protocol.

In the \_\_init\_\_constructor, we set the index in the object with a value of -1. When the next method is called, i.e. as happens during the first iteration in a for loop for example, the index’s value is incremented by 1. We then check to see if the index value is greater than the length of the list of teams that the user decided to add when the object was first created. If the index is less than the length of the teams, we simply return the team with the in-range index from the list of teams.

Once the index is either the same or greater than the length of the team list, we reset the index back to -1 once more (as it was originally set in the init constructor), and raise a **StopIteration exception**.

The user now has the ability to iterate through the teams created. The CustomIterTeams object, prem_teams is now an iterator, that we can iterate through.

![](https://miro.medium.com/max/2558/1*yfOu8f4UyxVytRYFTZTwhQ.png?q=20)

The index is deliberately re-set to its original value once the index reaches the length of the list, before a StopIteration exception is raised. This feature is implemented in order for the user to perform multiple iterations of the object if they want to in the same session, as shown in the python prompt shown below.

![](https://miro.medium.com/max/1248/1*yZpNx1ftxkjzd-Lo_CMSNw.png?q=20)

We can also now reverse the ordering of the teams, by simply implementing the dunder reserved method.

![](https://miro.medium.com/max/2488/1*GhcPQo9LTRfhsNqpIKWTKg.png?q=20)

## A simpler way to define a custom iterable type

It is not necessary to define a dunder next method in order to make a user-defined object iterable. Rather, we get just get the dunder iter method to return a generator, that loops through our teams. **Every generator is an iterator**. Generators have a built in next method, so there is no requirement to implement the next method in your custom python class.

![](https://miro.medium.com/max/2496/1*qImZYBbdCNuXMwpK51mMfg.png?q=20)

The github gist for this code snippet can be found [here](https://gist.github.com/StephenFordham/6d5a250bd2b721b6099ab650a481f1d5), and is shown below:

## Summary:

Iteration can be achieved in your custom defined classes either by including both the iter and next methods, or simply returning a generator in the iter method. The choice is up to programmer, but whilst the iter and next method implementation is a little longer, more finely defined behaviour can be added. 
 [https://towardsdatascience.com/how-to-loop-through-your-own-objects-in-python-1609c81e11ff](https://towardsdatascience.com/how-to-loop-through-your-own-objects-in-python-1609c81e11ff)

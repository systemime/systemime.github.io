---
title: Crack the top 50 Golang interview questions | Better Programming
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

## Ace your next coding interview by mastering these questions

\[

![](https://miro.medium.com/fit/c/96/96/2*sbWiZ06-xW2LYq2srihW2Q.png)

]([https://educative-inc.medium.com/?source=post_page-----a94396d6c808--------------------------------](https://educative-inc.medium.com/?source=post_page-----a94396d6c808--------------------------------))

![](https://miro.medium.com/max/2048/1*7XM4m2xt_Lkdvj9EemjbOg.png?q=20)

![](https://miro.medium.com/max/2048/1*7XM4m2xt_Lkdvj9EemjbOg.png)

Image Source: Author

The [Go](https://golang.org/) programming language, or Golang, is an open source programming language similar to C but optimized for quick compiling, seamless concurrency, and developer ease of use.

This language was created and adopted by Google but has been gaining popularity in other companies in recent years as the demand for concurrent, networked programs is increasing.

Whether you’re preparing for a Google job interview or just want to remain a cutting-edge developer, Go is the right choice for you. Today, we’ll help you practice your Go skills with 25 of the most important Go questions and answers.

**Here’s what we’ll cover today:**

-   Questions on Golang basics
-   Intermediate Golang questions
-   Coding challenges in Golang
-   Golang concurrency questions
-   Next steps for your learning

## 1. What are the benefits of using Go compared to other languages?

-   Unlike other languages that started as academic experiments, Go code is pragmatically designed. Every feature and syntax decision is engineered to make life easier for the programmer.
-   Golang is optimized for concurrency and works well at scale.
-   Golang is often considered more readable than other languages due to a single standard code format.
-   Automatic garbage collection is notably more efficient than iin Java or Python because it executes concurrently alongside the program.

## 2. What are string literals?

A _string literal_ is a string constant formed by concatenating characters. The two forms of string literal are raw and interpreted string literals.

Raw string literals are written within backticks (`foo`) and are filled with uninterpreted UTF-8 characters. Interpreted string literals are what we commonly think of as strings, written within double quotes and containing any character except newline and unfinished double quotes.

## 3. What data types does Golang use?

Golang uses the following types:

-   Method
-   Boolean
-   Numeric
-   String
-   Array
-   Slice
-   Struct
-   Pointer
-   Function
-   Interface
-   Map
-   Channel

## 4. What are packages in a Go program?

_Packages_ (`pkg`) are directories within your Go workspace that contain Go source files or other packages. Every function, variable, and type from your source files is stored in the linked package. Every Go source file belongs to a package, which is declared at the top of the file using:

    package <packagename>

You can import and export packages to reuse exported functions or types using:

    import <packagename>

Golang’s standard package is `fmt`, which contains formatting and printing functionalities like `Println()`.

## 5. What form of type conversion does Go support? Convert an integer to a float

Go supports explicit type conversion to satisfy its strict typing requirements.

    i := 55      //intj := 67.8    //float64sum := i + int(j) //j is converted to int

## 6. What is a goroutine? How do you stop it?

A _goroutine_ is a function or method that executes concurrently alongside any other goroutines using a special goroutine thread. Goroutine threads are more lightweight than standard threads, with most Golang programs using thousands of goroutines at once.

To create a goroutine, add the `go` keyword before the function declaration.

    go f(x, y, z)

You can stop a goroutine by sending it a signal channel. Goroutines can only respond to signals if told to check, so you’ll need to include checks in logical places such as at the top of your `for` loop.

## 7. How do you check a variable type at runtime?

The Type Switch is the best way to check a variable’s type at runtime. The Type Switch evaluates variables by type rather than value. Each Switch contains at least one `case`, which acts as a conditional statement, and a `default` case, which executes if none of the cases are true.

For example, you could create a Type Switch that checks if the interface value `i` contains the type `int` or `string`:

## 8. How do you concatenate strings?

The easiest way to concatenate strings is to use the concatenation operator (`+`), which allows you to add strings as you would numerical values.

## 9. Explain the steps of testing with Golang

Golang supports automated testing of packages with custom testing suites.

To create a new suite, create a file that ends with `_test.go` and includes a `TestXxx` function, where `Xxx` is replaced with the name of the feature you're testing. For example, a function that tests login capabilities would be called `TestLogin`.

You then place the testing suite file in the same package as the file you wish to test. The test file will be skipped on regular execution but will run when you enter the `go test` command.

## 10. What are function closures?

_A function closure_ is a function value that references variables from outside its body. The function may access and assign values to the referenced variables.

For example: `adder()` returns a closure, which is bound to its own referenced `sum` variable.

## 11. How do we perform inheritance with Golang?

This is a bit of a trick question: There is no inheritance in Golang because it does not support classes.

However, you can mimic inheritance behavior using composition to use an existing struct object to define a starting behavior of a new object. Once the new object is created, functionality can be extended beyond the original struct.

The `Animal` struct contains `Eat()`, `Sleep()`, and `Run()` functions. These functions are embedded into the child struct `Dog` by simply listing the struct at the top of the implementation of `Dog`.

## 12. Explain Go interfaces. What are they and how do they work?

_Interfaces_ are a special type in Go that define a set of method signatures but do not provide implementations. Values of type `interface` can hold any value that implements those methods.

Interfaces essentially act as placeholders for methods that will have multiple implementations based on what object is using them.

For example, you could implement a `geometry` interface that defines that all shapes that use this interface must have an implementation of `area()` and `perim()`.

    type geometry interface {  
        area() float64  
        perim() float64  
    }

## 13. What are lvalue and rvalue in Golang?

**Lvalue**

-   Refers to a memory location
-   Represents a variable identifier
-   Mutable
-   May appear on the left or right side of the `=` operator

For example, in the statement `x =20`, `x` is an lvalue and `20` is an rvalue.

**Rvalue**

-   Represents a data value stored in memory
-   Represents a constant value
-   Always appears on the `=` operator's right side.

For example, the statement `10 = 20` is invalid because there is an rvalue (`10`) left of the `=` operator.

## 14. What are the looping constructs in Go?

Go has only one looping construct: the `for` loop. The `for` loop has three components separated by semicolons:

-   The `Init` statement, which is executed before the loop begins. It's often a variable declaration only visible within the scope of the `for` loop.
-   The condition expression, which is evaluated as a boolean before each iteration to determine whether the loop should continue.
-   The `post` statement, which is executed at the end of each iteration.

![](https://miro.medium.com/max/1034/0*rfpeK-EC7CWHI5EQ.PNG?q=20)

Image Source: Author

## 15. Can you return multiple values from a function?

Yes. A Go function can return multiple values, each separated by commas in the `return` statement.

## 16. Implement a stack (LIFO)

Implement a stack structure with pop, append, and print top functionalities.

**Solution**

You can implement a stack using a slice object.

First, we use the built-in `append()` function to implement the append behavior. Then we use `len(stack)-1` to select the top of the stack and print.

For pop, we set the new length of the stack to the position of the printed top value, `len(stack)-1`.

## 17. Print all permutations of a slice characters or string

Implement the `perm()` function, which accepts a slice or string and prints all possible combinations of characters.

**Solution**

We use `rune` types to handle both slices and strings. Runes are Unicode code points and can therefore parse strings and slices equally.

## 18. Swap the values of two variables without a temporary variable

Implement `swap()`, which swaps the value of two variables without using a third variable.

**Solution**

While this may be tricky in other languages, Go makes it easy.

We can simply include the statement `b, a = a, b`, what data the variable references without engaging with either value.

## 19. Implement min and max behavior

Implement `Min(x, y int)` and `Max(x, y int)` functions that take two integers and return the lesser or greater value, respectively.

**Solution**

By default, Go only supports min and max for floats using `math.min` and `math.max`. You'll have to create your own implementations to make it work for integers.

## 20. Reverse the order of a slice

Implement function `reverse` that takes a slice of integers and reverses the slice in place without using a temporary slice.

**Solution**

Our `for` loop swaps the values of each element in the slice. Values will slide from left to right. Eventually, all elements will be reversed.

## 21. What is the easiest way to check if a slice is empty?

Create a program that checks if a slice is empty. Find the simplest solution.

**Solution**

The easiest way to check if a slice is empty is to use the built-in `len()` function, which returns the length of a slice. If `len(slice) == 0`, then you know the slice is empty.

For example:

## 22. Format a string without printing it

Find the easiest way to format a string with variables without printing the value.

**Solution**

The easiest way to format without printing is to use the `fmt.Sprintf()`, which returns a string without printing it.

For example:

    package mainimport "fmt"func main() {  
      s := fmt.Sprintf("Size: %d MB.", 85)  
      fmt.Println(s)  
    }

## 23. Explain the difference between concurrent and parallelism in Golang

_Concurrency_ is when your program can handle multiple tasks at once while _parallelism_ is when your program can execute multiple tasks at once using multiple processors.

In other words, concurrency is a property of a program that allows you to have multiple tasks in progress at the same time but not necessarily executing at the same time. Parallelism is a runtime property where two or more tasks are executed at the same time.

Parallelism can therefore be a means to achieve the property of concurrency, but it is just one of many means available to you.

The key tools for concurrency in Golang are _goroutines_ and _channels_. Goroutines are concurrent lightweight threads, while channels allow goroutines to communicate with each other during execution.

## 24. Merge sort

Implement a concurrent merge sort solution using goroutines and channels.

You can use this sequential merge sort implementation as a starting point:

**Solution**

Firstly, in merge sort, we keep dividing our array recursively into the `right` side and the `left` side and call the `MergeSort` function on both sides from **line 30** to **line 34**.

Now we have to make sure that `Merge(left,right)` is executed after we get return values from both the recursive calls, i.e., both the `left` and `right` must be updated before `Merge(left,right)` can be executable. Hence, we introduce a channel of type `bool` on **line 26** and send `true` on it as soon as `left = MergeSort(data[:mid])` is executed (**line 32**).

The `<-done` operation blocks the code on **line 35** before the statement `Merge(left,right)` so that it does not proceed until our goroutine has finished. After the goroutine has finished and we receive `true` on the `done` channel, the code proceeds forward to `Merge(left,right)` statement on **line 36**.

## 25. Sum of squares

Implement the `SumOfSquares` function, which takes an integer `c` and returns the sum of all squares between 1 and `c`. You'll need to use `select` statements, goroutines, and channels.

For example, entering `5` would return `55` because $1^2 + 2^2 + 3^2 + 4^2 + 5^2 = 55$

You can use the following code as a starting point:

**Solution**

Take a look at our `SumOfSquares` function. First, on **line 4**, we declare a variable `y` and then jump to the `For-Select` loop. We have two cases in our select statements:

-   `case c <- (y*y)`: This is to send the square of `y` through the channel `c`, which is received in the goroutine created in the main routine.
-   `case <-quit`: This is to receive a message from the main routine that will return from the function.

Great job on those practice questions! Go is a rising language, and hands-on practice like this is the key to picking it up fast. To best prepare for interviews, you’ll want to:

-   Develop a detailed study plan
-   Practice Go problems on a whiteboard
-   Learn how to articulate your thought process aloud
-   Prepare for behavioral interviews

_Happy learning!_ 
 [https://betterprogramming.pub/how-to-crack-the-top-25-golang-interview-questions-a94396d6c808](https://betterprogramming.pub/how-to-crack-the-top-25-golang-interview-questions-a94396d6c808) 
 [https://betterprogramming.pub/how-to-crack-the-top-25-golang-interview-questions-a94396d6c808](https://betterprogramming.pub/how-to-crack-the-top-25-golang-interview-questions-a94396d6c808)

---
title: Post
date: 2018-10-02 13:43:09
tags: test, new
---

# This a Title

[[toc]]

## Math Block

When $a \ne 0$, there are two solutions to $ax^2 + bx + c = 0$ and they are
 $$x = {-b \pm \sqrt{b^2-4ac} \over 2a}.$$

## Table
| Left-Aligned  | Center Aligned  | Right Aligned |
| :------------ |:---------------:| -----:|
| col 3 is      | some wordy text | $1600 |
| col 2 is      | centered        |   $12 |
| zebra stripes | are neat        |    $1 |

## Code Block

```python
def func(x):
    return x+1
```

```javascript
console.log('Hello');
```

### without specified language
```
def func(x):
    return x+1
```

```
int func(int x):
    return x+1
```

### auto
```auto
def func(x):
    return x+1
```

### uml
```uml
Alice -> Bob : Hello
Alice <- Bob : Hi 
```
```uml
class Dummy {
  + String data
  + methods(a, b): void
}

class Flight {
    flightNumber : Integer
    departureTime : Date
    void getSMT() {return d;}
}

Dummy <|-- Flight

Bob->Alice : hello
Alice->Bob : hi
```

### inline code
This is a test code: `return f(x)` done.

## List
un-ordered list
- Red
- Green
- Blue

ordered list
1. Red
2. Green
3. Blue

Task list
- [ ] a task
- [ ] b task
- [x] c task

## Blockquotes

> this is a quote.
> -- by me

>> hello
>> fuck

## HTML/JS

### Colored words
<span style="color:red">this text is red</span>

### Embed Contents

<iframe height="265" scrolling="no" title="Fancy Animated SVG Menu" src="http://codepen.io/jeangontijo/embed/OxVywj/?height=265&amp;theme-id=0&amp;default-tab=css,result&amp;embed-version=2" frameborder="no" allowtransparency="true" allowfullscreen="true" style="width: 100%;"></iframe>


### Image

#### Images with relative path
![](assets/dojocat.jpg)
![](./minion.png)

<img src='minion.png'>

#### Images with absolute path
![](/mdblog/source/TestFolder/assets/stormtroopocat.jpg)

#### External images

![Minion](https://octodex.github.com/images/minion.png)
![Stormtroopocat](https://octodex.github.com/images/stormtroopocat.jpg "The Stormtroopocat")

### Link
[xspin](https://github.com/xspin)

## Typing

### Emphasis

*single asterisks*

_single underscores_

### Strong
**double asterisks**

__double underscores__

### Strikethrough

~~Mistaken text.~~ 

### Underlines
<u>Underline</u>

### Reference

- ref1 [ref1]
- [Marked]
- [Markdown]

[ref1]: https://baidu.com
[Marked]: https://github.com/markedjs/marked/
[Markdown]: http://daringfireball.net/projects/markdown/
---
categories: []
date: "2023-01-23T23:49:36.259Z"
devto: true
devto_id: 1339075
draft: true
slug: html-dom-loves-javascript-tla-3dnb
summary: 'Our target: DOM. Yes, that. I don''t know what it is, you don''t know what it is, who gives a f---?...'
tags:
    - programming
    - discuss
title: "HTML DOM ️loves Javascript! \U0001F495 #TLA \U0001F618"
---
> Our target: DOM. Yes, that. I don't know what it is, you don't know what it is, who gives a f---? Javascript is to be learned.

## DHTML couldn't cut the mustard!

**Dynamic HTML** is like DOM's daddy if **SGML** were his mum.

And **Javascript** joined in for a 011 way while Netscape watched...

Anyway, 

* **D**ocument
* **O**bject
* **M**odel

It's a programming interface... or a way to make your webpages juicy with **Javascript**!

*Horses mouth: https://www.w3.org/TR/WD-DOM/introduction.html*

## W3.org

We luh-luh-luv you! They gestated and nurtured the [spec](https://dom.spec.whatwg.org/). They fought over bike sheds! All for us!!

## DOCUMENT

* A **DOCUMENT** is an **HTML** webpage
* A **DOCUMENT** is also an **XML** document (but we won't talk about that right now!)

## OBJECT MODEL

It's like looking under a TABLE's dress, or under a table wearing a dress...?

![<table> DOM](https://www.w3.org/TR/WD-DOM/table.gif)
## So what?

Well, now you can contrive up a little action:

```js
let  content  =  "";
const  myObj  =  { foo:  "bar"  };
myObj.fooBar  =  ()  =>  {
content  =  myObj.foo;
};
myObj.fooBar();

document.getElementById("app").innerHTML  =  content;
```
If only you had a `<div id="app"></div>`...

https://codesandbox.io/s/zen-fog-u1748f?file=/index.html:105-125

## Javascript looks at DOM seductively...

![Kickass geocities site](https://i0.wp.com/boingboing.net/wp-content/uploads/2018/05/chronos_the_cat-1.jpg?fit=1&resize=620,4000&ssl=1)

> Written with [StackEdit](https://stackedit.io/).

![Goodbye Ace](https://media.tenor.com/BvjrlmCtgCEAAAAC/jim-carrey-ace-ventura.gif)

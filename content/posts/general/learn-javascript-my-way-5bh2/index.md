---
categories: []
date: "2023-03-20T19:14:34.857Z"
devto: true
devto_id: 1408235
draft: true
slug: learn-javascript-my-way-5bh2
summary: Living playlist                                                                             ...
tags:
    - webdev
    - javascript
    - beginners
    - tutorial
title: Learn Javascript My Way
---
## Living playlist

{% embed https://www.youtube.com/playlist?list=PLGOhKz8ZRJwC3I-x4y2W__HxpMDKaI9X_ %}

---

## Hello World!

{% embed https://youtu.be/Ypba1NPpjEQ %}

### What is it?

* JavaScript is the programming language of the web, with most websites using it.

* It's the most-deployed and most-used programming language.

* Prior knowledge of other languages is not required to learn JavaScript.

* Despite its name, JavaScript is not related to Java.

* Javascript is a robust, efficient general-purpose language.

### Experimenting

There are many ways to experiment with JavaScript:

* code can be saved to an .html file in a &lt;script&gt; tag

* code can be dealt with in many ways but let’s keep it simple

### Try it

To print out a message like "Hello World!" in a web browser, create a new file named hello.html and paste in:

`<script>window.alert(‘Hello World!’);</script>`

Save, then load it into the browser using a file:/// URL. Or find the file and double click.

---

## console.log()

{% embed https://youtu.be/RPSEu_S6xD4 %}

Step 1 was great. alert()'s are cool. But when debugging, console.log() is better.

### Devtools

I use Firefox:

> You can open the Firefox Developer Tools from the menu by selecting Tools > Web Developer > Web Developer Tools or use the keyboard shortcut Ctrl + Shift + I or F12 on Windows and Linux, or Cmd + Opt + I on macOS.

When you first open the Devtools you will likely see the Inspector tab. Click the "Console" tab.

Devtools is essential in web devlopment.

### Experiment

* Change alert to console.log in hello.html

```
<!DOCTYPE html>
<html>
<head>
    <script>
        console.log('Hello World!');
    </script>
</head>
</html>
```

* Reload the browser and look at the Devtools

---

## Lexical Structure of Javascript

{% embed https://youtu.be/7jEGEOanyBg %}

The lexical structure of a programming language is like the basic building blocks and rules you need to follow when writing programs in that language.

It's like learning the alphabet, grammar, and punctuation when learning to read and write in a new language.

For JavaScript, the lexical structure covers the following

#### Case sensitivity, spaces, and line breaks

JavaScript is case-sensitive, which means that uppercase and lowercase letters are treated as distinct characters.

Spaces and line breaks are used to make the code more readable and organized.

```
let myVariable = 5;
let MyVariable = 10;

console.log(myVariable); // Output: 5 (different from MyVariable)
console.log(MyVariable); // Output: 10

// Spaces and line breaks
let sum = 1 + 2 +
          3 + 4;
console.log(sum); // Output: 10
```

### Comments

Comments are notes in the code that help you and others understand what's going on.

In JavaScript, you can write single-line comments using "//" and multi-line comments using "/* ... */".

```
// This is a single-line comment

/*
  This is a
  multi-line
  comment
*/
```

### Literals

Literals are fixed values in your code, like numbers or text strings.

For example, 42 is a numeric literal, and "hello" is a string literal.

```
let num = 42; // Numeric literal
let str = 'Hello, world!'; // String literal
let bool = true; // Boolean literal
```

#### Identifiers and reserved words

Identifiers are names you give to variables, functions, and other elements in your code.

There are some rules for creating identifiers, like starting with a letter, underscore (_), or dollar sign ($).

Reserved words are special words in the language that you cannot use as identifiers because they have a specific meaning, like "if", "else", or "function".

```
let myVar = 10; // Valid identifier
let _myVar2 = 20; // Valid identifier
let $myVar3 = 30; // Valid identifier

// Invalid identifiers (using reserved words)
// let if = 40;
// let function = 50;
```

### Unicode

JavaScript supports Unicode, an international standard for representing characters and symbols from many languages.

This means you can use a wide range of characters in your code, including letters from different alphabets or special symbols.

```
let greeting = 'こんにちは'; // Japanese characters
console.log(greeting);

let mathSymbol = '√'; // Unicode math symbol
console.log(mathSymbol);
```

### Optional semicolons

In JavaScript, you can use semicolons to separate statements, but they are often optional.

However, it's still a good practice to use semicolons to avoid confusion or errors.

```
// Using semicolons
let a = 1;
let b = 2;
let c = a + b;

// Without semicolons (JavaScript will automatically insert them)
let d = 1
let e = 2
let f = d + e

console.log(c); // Output: 3
console.log(f); // Output: 3
```

---

## JavaScript Types: Primitives

{% embed https://youtu.be/JE4-4y_Hpfw %}

Primitive types are the basic building blocks of data in JavaScript. They represent simple data types that hold a single value.

*   Numbers
    
    ```javascript
    let num = 42;
    ```

In the above code block, we declare a variable `num` and assign it the numeric value 42. Numbers can be integers or floating-point values. Although the value 42 is immutable, the variable `num` is mutable and can be reassigned a new value.

*   Strings
    
    ```javascript
    let str = "Hello World!";
    ```
    

In this code block, we declare a variable `str` and assign it the string value "Hello, World!". Strings are used to represent text and can be created using single or double quotes. Similar to numbers, the string value is immutable, but the variable `str` is mutable and can be reassigned a new value.

*   Booleans
    
```javascript
let bool = true;
```

In this example, we declare a variable `bool` and assign it the boolean value `true`. Booleans represent either `true` or `false` and are commonly used for conditional statements. The boolean value is immutable, but the variable `bool` can be reassigned.

*   Null
    
```javascript
let n = null;
```
    
Here, we declare a variable `n` and assign it the value `null`. `null` represents the intentional absence of any object value. It is an immutable value, but the variable `n` is mutable and can be reassigned.

* Undefined
    
```javascript
let u;
```

In this code block, we declare a variable `u` without assigning it a value. By default, uninitialized variables have the value `undefined`. Like other primitive types, `undefined` is an immutable value, but the variable `u` is mutable and can be assigned a new value.

*   Symbols
    
```javascript
let sym = Symbol("example");
```

In this example, we declare a variable `sym` and assign it a unique `Symbol` value. Symbols are unique, immutable identifiers primarily used as object property keys. Even though the symbol value itself is immutable, the variable `sym` can be reassigned a new value.

---

### Object Types:

*   Objects

```javascript
let obj = { key: "value" };
```

In this code block, we declare a variable `obj` and assign it an object with a key-value pair. Objects in JavaScript are mutable, meaning that their properties can be added, modified, or deleted.

*   Arrays

```javascript
let arr = [1, 2, 3];
```
    
In this example, we declare a variable `arr` and assign it an array containing the elements 1, 2, and 3. Arrays are ordered, mutable collections of elements. They can be modified, and their elements can be changed, added, or removed.

*   Set

```javascript
let s = new Set([1, 2, 3]);
```

Here, we declare a variable `s` and assign it a new `Set` containing the elements 1, 2, and 3. Sets are mutable collections of unique elements, meaning that each element can only appear once in the set.

*   Map

```javascript
let m = new Map([["key", "value"]]);
```

In this code block, we declare a variable `m` and assign it a new `Map` with a single key-value pair. Maps are mutable collections of key-value pairs, and the keys can be any data type.

---

#### Regular Expressions

{% embed https://youtu.be/lgFrXXW1BqY %}

*   RegExp

In JavaScript, a regular expression is a pattern that can be used to match text.

It is created using the [RegExp constructor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/RegExp) or by using a literal syntax enclosed in forward slashes, like this:

```javascript
let pattern = /hello/;
```

Here it is in practice:

```javascript
let regex = /^\d{3}-\d{2}-\d{4}$/;

let testString1 = "123-45-6789";
let testString2 = "12-3456-7890";

console.log(regex.test(testString1)); // Output: true
console.log(regex.test(testString2)); // Output: false
```

In this example, we declare a variable regex and assign it a regular expression containing the pattern \d{3}-\d{2}-\d{4}. This pattern matches strings in the format "123-45-6789", commonly used for Social Security numbers (SSN). Regular expressions are utilized for pattern matching and manipulation within strings.

We then create two test strings: testString1, which follows the correct SSN format, and testString2, which does not. Using the test() method on our regex variable, we check if each test string matches the pattern. The output is true for testString1 and false for testString2.

---

#### Date Objects

Date objects in JavaScript allow you to create and manipulate dates and times.

The Date object provides numerous methods for working with dates, such as retrieving the current date and time, extracting individual date components, and performing calculations with dates.

```javascript
// Creating a new Date object representing the current date and time
let currentDate = new Date();
console.log("Current date and time:", currentDate);

// Creating a custom Date object using the format: new Date(year, monthIndex, day, hours, minutes, seconds, milliseconds)
let customDate = new Date(2023, 0, 1, 12, 30, 0, 0); // January 1, 2023, 12:30:00 PM
console.log("Custom date and time:", customDate);

// Extracting individual components of a Date object
console.log("Year:", currentDate.getFullYear());
console.log("Month (0-based index):", currentDate.getMonth());
console.log("Day of the month:", currentDate.getDate());
console.log("Day of the week (0 for Sunday, 1 for Monday, etc.):", currentDate.getDay());
console.log("Hours:", currentDate.getHours());
console.log("Minutes:", currentDate.getMinutes());
console.log("Seconds:", currentDate.getSeconds());
console.log("Milliseconds:", currentDate.getMilliseconds());

// Manipulating Date objects
let tomorrow = new Date(currentDate);
tomorrow.setDate(currentDate.getDate() + 1);
console.log("Tomorrow's date:", tomorrow);

// Comparing Date objects
let isFuture = customDate > currentDate;
console.log("Is customDate in the future?", isFuture);

// Formatting Date objects
let formattedDate = currentDate.toLocaleDateString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit'
});
console.log("Formatted date and time:", formattedDate);
```

In this example, we demonstrate how to create and manipulate Date objects in JavaScript. We create a Date object representing the current date and time, as well as a custom Date object. We then extract individual date components, manipulate the Date object to represent tomorrow's date, compare Date objects, and format the Date object for display.

The upcoming [Temporal API](https://tc39.es/proposal-temporal/docs/index.html) will be much easier to work with.

If you're keen on jumping ahead check out a polyfill like https://www.npmjs.com/package/@js-temporal/polyfill.

---

#### Error

```javascript
let err = new Error("An error occurred");
```

In this code block, we declare a variable `err` and assign it a new `Error` object with the message "An error occurred". Error objects are used to handle errors and exceptions in JavaScript.

*   Functions

```javascript
function example() {
  return "Hello, World!";
}
```
    
In this example, we declare a function named `example` that returns the string "Hello, World!". Functions are first-class objects in JavaScript, meaning that they can be assigned to variables, passed as arguments, or returned from other functions.

*   Classes

```javascript
class Example {
  constructor(value) {
    this.value = value;
  }
}
```

Here, we declare a class named `Example` with a constructor that takes a `value` parameter and assigns it to the `value` property of the class instance. Classes are used to define custom data types and encapsulate related data and behavior.

Types can be further separated by Mutability. Most object types are mutable, meaning that their properties or contents can be modified after they are created.

However, some object types like RegExp and Error are typically treated as immutable, even though they technically can be changed.

### JavaScript performs automatic type conversion.

JavaScript is a dynamically-typed language, which means it performs automatic type conversion, also known as type coercion.

This means JavaScript converts data types when necessary, allowing for more flexibility compared to statically-typed languages like C.

```javascript
let number = 42;
let string = "8";
let result = number + string;
```

Here, we have a number (number) and a string (string). When we try to add them together, JavaScript automatically converts one of the data types to be compatible with the other. In this case, JavaScript will convert the number 42 to a string "42" and then concatenate it with the string "8". The resulting value of result will be the string "428".

### Constants and Variables:

*   Declared with `const` and `let` (or `var` in older code)
    
*   Untyped declarations
        
```javascript
const PI = 3.14159;
let count = 0;
```

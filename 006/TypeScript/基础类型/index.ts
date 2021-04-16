// 布尔值
let isDone: boolean = false;
console.log('isDone ==> ', isDone);

// 数字
let decLiteral: number = 6;
console.log('decLiteral ==> ', decLiteral);

// 字符串
let names: string = "bob";
// name = "smith";

// 你还可以使用模版字符串，它可以定义多行文本和内嵌表达式。 这种字符串是被反引号包围（ `），并且以${ expr }这种形式嵌入表达式
let names1: string = `Gene`;
let age: number = 37;
let sentence: string = `Hello, my name is ${ names1 }.I'll be ${ age + 1 } years old next month.`;

// 数组
// TypeScript像JavaScript一样可以操作数组元素。 有两种方式可以定义数组。 

// 第一种，可以在元素类型后面接上 []，表示由此类型元素组成的一个数组：
let list: number[] = [1, 2, 3];

// 第二种方式是使用数组泛型，Array<元素类型>：
let list1: Array<number> = [1, 2, 3];


// 元组 Tuple
// 元组类型允许表示一个已知元素数量和类型的数组，各元素的类型不必相同。 比如，你可以定义一对值分别为 string和number类型的元组。

// Declare a tuple type
let x: [string, number];
// Initialize it
x = ['hello', 10]; // OK
// Initialize it incorrectly
// x = [10, 'hello']; // Error 匹配类型不正确
// 当访问一个已知索引的元素，会得到正确的类型：

console.log(x[0].substr(1)); // OK
// console.log(x[1].substr(1)); // Error, 'number' does not have 'substr'
// 当访问一个越界的元素，会使用联合类型替代：

// x[3] = 'world'; // OK, 字符串可以赋值给(string | number)类型

// console.log(x[5].toString()); // OK, 'string' 和 'number' 都有 toString

// x[6] = true; // Error, 布尔不是(string | number)类型



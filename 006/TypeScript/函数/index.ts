// 和JavaScript一样，TypeScript函数可以创建有名字的函数和匿名函数。 你可以随意选择适合应用程序的方式，不论是定义一系列API函数还是只使用一次的函数。

// 通过下面的例子可以迅速回想起这两种JavaScript中的函数：

// Named function
function add(x, y) {
    return x + y;
}

// Anonymous function
let myAdd = function(x, y) { return x + y; };
// 在JavaScript里，函数可以使用函数体外部的变量。 当函数这么做时，我们说它‘捕获’了这些变量。 至于为什么可以这样做以及其中的利弊超出了本文的范围，但是深刻理解这个机制对学习JavaScript和TypeScript会很有帮助。

let z = 100;

function addToZ(x, y) {
    return x + y + z;
}

// 函数类型

// 为函数定义类型, 为上面的函数添加类型

function add1(x: number, y: number) {
  return x + y;
}
let myAdd1 = function(x: number, y: number) : number{ return x + y};

// 我们可以给每个参数添加类型之后再为函数本身添加返回值类型。 TypeScript能够根据返回语句自动推断出返回值类型，因此我们通常省略它。


// 可选参数和默认参数

// TypeScript里的每个函数参数都是必须的。 这不是指不能传递 null或undefined作为参数，而是说编译器检查用户是否为每个参数都传入了值。 编译器还会假设只有这些参数会被传递进函数。 简短地说，传递给一个函数的参数个数必须与函数期望的参数个数一致。

function buildName(firstName: string, lastName: string) {
  return firstName + '' + lastName;
}
let result1 = buildName("Bob");                  // error, too few parameters  应有两个参数，但获得一个
let result2 = buildName("Bob", "Adams", "Sr.");  // error, too many parameters  应有两个参数，但获得三个
let result3 = buildName("Bob", "Adams");         // ah, just right
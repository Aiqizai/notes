// 布尔值
var isDone = false;
console.log('isDone ==> ', isDone);
// 数字
var decLiteral = 6;
console.log('decLiteral ==> ', decLiteral);
// 字符串
var names = "bob";
// name = "smith";
// 你还可以使用模版字符串，它可以定义多行文本和内嵌表达式。 这种字符串是被反引号包围（ `），并且以${ expr }这种形式嵌入表达式
var names1 = "Gene";
var age = 37;
var sentence = "Hello, my name is " + names1 + ".I'll be " + (age + 1) + " years old next month.";
// 数组
// TypeScript像JavaScript一样可以操作数组元素。 有两种方式可以定义数组。 
// 第一种，可以在元素类型后面接上 []，表示由此类型元素组成的一个数组：
var list = [1, 2, 3];
// 第二种方式是使用数组泛型，Array<元素类型>：
var list1 = [1, 2, 3];

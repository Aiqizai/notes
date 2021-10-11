if (!Object.is) {
  Object.is = function (x, y) {
    if (x === y) {
      return x !== 0 || 1 / x === 1 / y;
    } else {
      return x !== x && y !== y;
    }
  };
}


Object.is(+0, -0); // false
Object.is(NaN, NaN); // true
Object.is(0, 0); // true

//-----------------------------------

const obj1 = {
  a: 1,
  b: 2
};
const obj2 = {
  b: 3,
  d: 4
};

const Target = Object.assign(obj1, obj2);

console.log(obj1); // { a: 1, b: 3, c: 4 }

console.log(Target); // { a: 1, b: 3, c: 4 }

//-----------------------------------
/* 
  拷贝源对象的所有属性到目标对象中

  使用：Object.assign(目标对象, 源对象1, 源对象2, 源对象3...);
  如果存在重复属性, 按照顺序, 则后者会把前者覆盖;
*/

var obj = {
  a: 1,
  b: 2,
  c: 3
};
var res = Object.values(obj);
console.log(res); // [1, 2, 3]

//----------------------------------- getOwnPropertyDescriptor

var obj = {
  name: 'jack',
  age: 18
};
// 定义一个对象
var res = Object.getOwnPropertyDescriptor(obj, 'name')
console.log(res);
// 获取指定对象的指定属性描述

//----------------------------------- Object.defineProperty

var obj = {
  name: 'jack',
  age: 18
};
// 定义一个对象
// 配置属性描述  
Object.defineProperty(obj, 'name', {
  value: 'rose', // 控制属性取值
  writable: false, // 控制是否允许重写 false: 该属性值无法修改
  enumerable: false, // 是否可被枚举, for in 遍历, 不会被遍历到
  configurable: false // 是否可配置 如果设置为false, 则无法进行二次配置修改
})

// 设置新的值
obj.name = 'Tom'; 

console.log(obj) // {age: 18, name: "rose"}  因为设置了不可写，所以Tom不生效

function Person (name, age) {
  this.name = name;
  this.age = age;
}

var p = new Person('jack', 18);
var res = Object.getPrototypeOf(p);
console.log(res);

//----------------------------------- prototype.isPrototypeOf(s)

function Cat(){
	this.name = "花花";
	this.sex = "girl";

	this.sayHello = function(){
		console.log("我叫" + this.name);
	};
}

var c =  new Cat();
console.log( Cat.prototype.isPrototypeOf(c) ); // true

var obj = {
	weight: "2kg",
  sayHi: function(){
		console.log("你好，我是" + this.sex);
	}
};
// 使用对象obj覆盖Cat本身的prototype属性
Cat.prototype = obj;

var c2 =  new Cat();
console.log( obj.isPrototypeOf(c2) ); // true

//----------------------------------- prototype.isPrototypeOf(s)
var obj = { name: 'jack' };
obj.toString();

var arr = ['1', '2', '3']
arr.toString();

var fun = function () {}
fun.toString();

//----------------------------------- valueOf()

// Array：返回数组对象本身
var array = ["ABC", true, 12, -5];
console.log(array.valueOf() === array);   // true

// Date：当前时间距1970年1月1日午夜的毫秒数
var date = new Date(2021, 8, 13, 14, 00, 23, 200);
console.log(date.valueOf());   // 1631512823200

// Number：返回数字值
var num =  15.26540;
console.log(num.valueOf());   // 15.2654

// 布尔：返回布尔值true或false
var bool = true;
console.log(bool.valueOf() === bool);   // true

// new一个Boolean对象
var newBool = new Boolean(true);
// valueOf()返回的是true，两者的值相等
console.log(newBool.valueOf() == newBool);   // true
// 但是不全等，两者类型不相等，前者是boolean类型，后者是object类型
console.log(newBool.valueOf() === newBool);   // false

// Function：返回函数本身
function foo(){}
console.log( foo.valueOf() === foo );   // true
var foo2 =  new Function("x", "y", "return x + y;");
console.log( foo2.valueOf() );


// Object：返回对象本身
var obj = {name: "张三", age: 18};
console.log( obj.valueOf() === obj );   // true

// String：返回字符串值
var str = "testString";
console.log( str.valueOf() === str );   // true

// new一个字符串对象
var str2 = new String("testString");
// 两者的值相等，但不全等，因为类型不同，前者为string类型，后者为object类型
console.log( str2.valueOf() === str2 );   // false

//----------------------------------- String类型
var str1 = "foo";
var str2 = new String(str1);

console.log(typeof str1); //  string
console.log(typeof str2);  //  object
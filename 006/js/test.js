/* 例如小明，他有升高，体重，年龄，性别等等，他还会干嘛啊，会吃饭，跑步，睡觉 */

var person = {
  // 属性
  height: '180cm',
  weight: '70kg',
  age: 18,
  sex: 'man',

  // 行为
  eat: function () {
    console.log('小明会吃饭！');
  },
  run: function () {
    console.log('小明会跑步！');
  },
  sleep: function () {
    console.log('小明会睡觉！');
  }
}

/*
   那我们有怎么样才能访问对象的属性和方法呢？

   两种方法：
      点表示法
      括号表示法（是中括号[]）

   举个例子啊：就是你吃饭然后就洗碗，是不是先得做饭然后再干嘛干嘛是吧。这里我们贴图方便理解一点。

   那我们可以发现啊，面向过程就是有个先后顺序，一步接着一步。而面向对象呢，是把某一部分集中到一个对象中，然后再把属于当前版块的在一起进行操作

   那我们总结一下，面向对象的好处是什么？
*/

function Person(name, age) {
  //默认隐含的操作：把刚才用new新创建出来的对象赋值给this
  this.name = name;
  this.age = age;
  this.sayHello = function () {
    console.log("Hello World");
  }
  // return null;  // return空、null、基本数据类型，都不会起作用。会默认return this;  return object类型才会起作用。
}

var p = new Person('Jack', 20); //new Object(); 如果构造函数没有参数那么小括号可以省略。
console.log('p ==> ', p);
p.sayHello();
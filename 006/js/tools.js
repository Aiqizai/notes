//判断是否是对象
export const isObject = target => {
  return Object.prototype.toString.call(target) === "[object Object]";
};

//判断是否是空对象
export const isEmptyObject = obj => {
  for (let key in obj) {
      return false;
  }
  return true;
};
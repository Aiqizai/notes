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

// 验证是否包含中文
export const errIsIncludeChinese = (str, tip) => {
  if (undefined !== str && str !== '' && /.*[\u4e00-\u9fa5]+.*$/.test(str)) {
    console.log(tip + '不能包含中文')
    return true
  }
  return false
}
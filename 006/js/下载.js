let exportres = await this.$api.get(
  `xxxx`,
  {
      params: this.queryConditions,
      responseType: "blob",
      timeout: 60000 * 3,
  }
);

console.log(exportres);

const { data, headers } = exportres;
const fileName = headers["content-disposition"].replace(
  /\w+;filename=(.*)/,
  "$1"
);
// 此处当返回json文件时需要先对data进行JSON.stringify处理，其他类型文件不用做处理
//const blob = new Blob([JSON.stringify(data)], ...)
const blob = new Blob([data], {
  type: headers["content-type"],
});
// const fileName = `result_${this.projectKey}.csv`
// const blob = new Blob([data], {type: "text/csv,charset=UTF-8"});
// console.log(blob);
let dom = document.createElement("a");
let url = window.URL.createObjectURL(blob);
dom.href = url;
dom.download = decodeURI(fileName);
dom.style.display = "none";
document.body.appendChild(dom);
dom.click();
dom.parentNode.removeChild(dom);
window.URL.revokeObjectURL(url);
<template>
  <div id="app">
      <VirtualList :listData="data" :itemSize="100"/>
  </div>
</template>

<script>
import VirtualList from './component/VirtualList.vue'
let d = []
for (let i = 0 ; i < 1000; i++) {
    d.push({ id: i, value: i })
}

export default {
    name: 'App',
    data() {
        return {
            data: d
        }
    },
    component: {
        VirtualList
    }
    /* 
    
        https://juejin.cn/post/6844903982742110216

    */
}
</script>

<style>
html{
  height: 100%;
}
body{
  height: 100%;
  margin:0;
}
#app{
  height:100%;
}
</style>
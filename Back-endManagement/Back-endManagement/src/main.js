import { createApp } from 'vue'
import ElementPlus from 'element-plus' // 引入Element Plus
import 'element-plus/dist/index.css' // 引入样式
import App from './App.vue'
import router from './router'
// 👇 关键：导入所有Element Plus图标，并命名为ElementPlusIconsVue
import * as ElementPlusIconsVue from '@element-plus/icons-vue' 

import zhCn from 'element-plus/dist/locale/zh-cn.mjs'  // 正确路径

const app = createApp(App)

//注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(ElementPlus,{
  locale:zhCn,//启用中文国际化
})// 使用Element Plus
app.use(router)
// app.use(ElementPlus)
app.mount('#app')
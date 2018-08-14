import Vue from 'vue';
import VueRouter from 'vue-router';
import VueResource from 'vue-resource';
import App from './App';
import goods from './components/goods/goods';
import ratings from './components/ratings/ratings';
import seller from './components/seller/seller';

import 'common/stylus/index.styl';

Vue.use(VueRouter);             /* 安装路由*/
Vue.use(VueResource);           /* 注册*/

// /* eslint-disable no-new */     /* 跳过es6检测*/
// new Vue({
//   el: 'body',
//   components: { App }, /* //es6简写App:App */
// });
//

// 需要一个根组件
const app = Vue.extend(App);

// 创建一个路由器实例
const router = new VueRouter({
    linkActiveClass: 'active' // 点击高亮
});
// 定义路由规则
router.map({
    '/goods': {
        component: goods
    },
    '/ratings': {
        component: ratings
    },
    'seller': {
        component: seller
    }
});
router.start(app, '#app');
// 默认路由
// router.go('/ratings');


<template>
 <div>
    <div class="shopCart">
        <div class="content" @click="toggleList">
            <div class="content-left">
                <div class="logo-wrapper">
                    <div class="logo" :class="{'highlight':totalCount>0}">
                        <i class="icon-shopping_cart" :class="{'highlight':totalCount>0}"></i>
                    </div>
                    <div class="num" v-show="totalCount>0">{{totalCount}}</div>
                </div>
                <div class="price" :class="{'highlight':totalPrice>0}">￥{{totalPrice}}元</div>
                <div class="desc">另需配送费￥{{deliveryPrice}}元</div>
            </div>
            <div class="content-right" @click.stop.prevent="pay">
                <div class="pay1" v-show="totalPrice<20">￥差{{minPrice-totalPrice}}起送</div>
                <div class="pay2" v-show="totalPrice>=20">去结算</div>
            </div>
        </div>
       <div class="ball-container" v-for="(ball,index) of balls" :key= index>
       <transition 
          v-on:before-enter="beforeEnter"
          v-on:enter="enter"
          v-on:after-enter="afterEnter"
          name="drop">
         <div class="ball" v-show="ball.show">
             <div class="inner inner-hook">
             </div>
         </div>
       </transition>
       </div>
       <transition name="fold">
      <div class="shopcart-list" v-show="listShow">
        <div class="list-header">
          <h1 class="tittle">购物车</h1>
          <span class="empty" @click="empty">清空</span>
        </div>
        <div class="list-content" ref="listContent">
          <ul>
            <li class="food" v-for="(food,index) of selectFoods" :key="index">
              <span class="name">{{food.name}}</span>
              <div class="price">
                <span>￥{{food.price*food.count}}</span>
              </div>
              <div class="cartcontrol-wrapper">
                <cartControl :food = 'food'></cartControl>
              </div>
            </li>
          </ul>
        </div>
      </div>
     </transition>
    </div>
    <transition name="fade">
      <div class="list-mask" v-show="listShow" @click="hiddenList">
      </div>
   </transition>
  </div>
</template>

<script>
 import BScroll from 'better-scroll'; 
 import cartControl from '../cartControl/cartControl';
export default {
    props:{
        selectFoods:{
            type:Array,
            default(){
                return [
                ];
            }
        },
       deliveryPrice:{
           type :Number,
           default:0
       },
       minPrice:{
           type :Number,
           default:0
       }
   },
    data(){
            return{
               balls: [
          {
            show: false
          },
          {
            show:false
          },
          {
            show: false
          },
          {
            show: false
          },
          {
            show: false
          }
        ],
        dropBalls:[],
        fold:true
            }
        },
   computed:{
       totalPrice(){
           let total = 0;
           this.selectFoods.forEach((food)=> {
               total += food.price*food.count; 
           });
           return total
       },
       totalCount(){
           let count = 0;
           this.selectFoods.forEach((food)=>{
               count += food.count
           });
           return count;
       },
       listShow(){
         if(!this.totalCount>0){
           this.fold = true;
           return false;
         }
         let show = !this.fold;
         if(show){
           this.$nextTick(()=>{
             if(!this.scroll){
               this.scroll = new BScroll(this.$refs.listContent,{
               click:true
             })
             }else{
               this.scroll.refresh();
             }
             
           })
         }
         return show;
       }
   },
   components: {
      cartControl
    },
     methods: {
      _drop(el) { 
      //触发一次事件就会将所有小球进行遍历
        for (let i = 0; i < this.balls.length; i++) {
          let ball = this.balls[i];
          if (!ball.show) { //将false的小球放到dropBalls
            ball.show = true;
            ball.el = el; //设置小球的el属性为一个dom对象
            this.dropBalls.push(ball);    
            return;
          }
        }
      },
      empty(){
        this.selectFoods.forEach((food)=>{
          food.count = 0;

        })
      },
      pay(){
        if(this.totalPrice<20){
          return;
        }
         window.alert(`支付${this.totalPrice}元`);
      },
      toggleList(){
        if(!this.totalCount){
          return;
        }
        this.fold = !this.fold;
      },
      hiddenList(){
         this.fold = true;
      },
      beforeEnter(el){ //这个方法的执行是因为这是一个vue的监听事件
        let count = this.balls.length;
        while (count--) {
          let ball = this.balls[count];
          if (ball.show) {
            let rect = ball.el.getBoundingClientRect(); //获取小球的相对于视口的位移(小球高度)
            let x = rect.left - 32;
            let y = -(window.innerHeight - rect.top - 22); //负数,因为是从左上角往下的的方向
            el.style.display = ''; //清空display
            el.style.webkitTransform = `translate3d(0,${y}px,0)`; 
            el.style.transform = `translate3d(0,${y}px,0)`;
            //处理内层动画
            let inner = el.getElementsByClassName('inner-hook')[0]; //使用inner-hook类来单纯被js操作
            inner.style.webkitTransform = `translate3d(${x}px,0,0)`;
            inner.style.transform = `translate3d(${x}px,0,0)`;
          }
        }
      },
      enter(el, done) { //这个方法的执行是因为这是一个vue的监听事件
        /* eslint-disable no-unused-vars */
        let rf = el.offsetHeight; //触发重绘html
        this.$nextTick(() => { //让动画效果异步执行,提高性能
          el.style.webkitTransform = 'translate3d(0,0,0)';
          el.style.transform = 'translate3d(0,0,0)';
          //处理内层动画
          let inner = el.getElementsByClassName('inner-hook')[0]; //使用inner-hook类来单纯被js操作
          inner.style.webkitTransform = 'translate3d(0,0,0)';
          inner.style.transform = 'translate3d(0,0,0)';
          el.addEventListener('transitionend', done); //Vue为了知道过渡的完成，必须设置相应的事件监听器。
        });
      },

      afterEnter(el) { //这个方法的执行是因为这是一个vue的监听事件
        let ball = this.dropBalls.shift(); //完成一次动画就删除一个dropBalls的小球
        if (ball) {
          ball.show = false;
          el.style.display = 'none'; //隐藏小球
        }
      }
    }

   }
</script>
<style lang="stylus" rel='stylesheet/stylus'>
  @import '../../common/stylus/mixin.styl';
 .shopCart
  position fixed
  left 0px
  bottom 0
  z-index 50
  width 100%
  height 48px
  .content
   display flex
   height 48px
   font-size 0px
   margin-left 0px
   background #141d27
   .content-left 
    flex 1
    .logo-wrapper
      display inline-block
      position relative
      top  -10px
      margin 0px 12px 0px 12px 
      padding 6px
      width 56px
      height 56px
      box-sizing border-box
      vertical-align top
      border-radius 50%
      background #141d27
      .logo 
       width 100%
       height 100%
       border-radius 50%
       background #2b343c
       text-align center
       &.highlight
        background rgb(0,160,220)
       .icon-shopping_cart
        font-size 24px
        color #80858a
        line-height 44px
        &.highlight
         color #fff
      .num
        position absolute
        top 0
        right 0
        width 24px
        height 16px
        line-height 16px
        text-align center
        border-radius 16px
        color #ffffff
        font-size 9px
        background rgb(240,20,20)
        box-shadow 0px 4px 8px 0 rgba(0,0,0,0.4)
    .price
       display inline-block
       vertical-align top
       line-height 24px
       margin-top 12px 
       font-size 0px
       padding-right 12px
       border-right 1px solid rgba(255,255,255,0.1)
       font-size 16px
       font-weight 700
       color rgba(255,255,255,0.4)
       &.highlight
         color #fff
    .desc
       display inline-block
       vertical-align top
       line-height 24px
       margin 12px 0 0 12px
       font-size 10px
       font-weight 700
       color rgba(255,255,255,0.4)
   .content-right
    flex 0 0 105px
    width 105px
    .pay1 
     height 48px
     line-height 48px
     text-align center
     font-size 12px
     color rgba(255,255,255,0.4)
     font-weight 700
     background #2b333b
    .pay2
     height 48px
     line-height 48px
     text-align center
     font-size 10px
     color #fff
     font-weight 700
     background green
  .ball-container
      .ball
        position: fixed
        left: 32px
        bottom: 22px
        z-index: 200
        transition: all 0.4s cubic-bezier(0.49, -0.29, 0.75, 0.41)
        .inner
          width: 16px
          height: 16px
          border-radius: 50%
          background: rgb(0, 160, 220)
          transition: all 0.4s linear

  .shopcart-list
    position absolute
    left 0
    top 0
    z-index -1
    width 100%
    transform: translate3d(0, -100%, 0)
    &.fold-enter-active, &.fold-leave-active
     transition all 0.5s
    &.fold-enter, &.fold-leave-active
     transform: translate3d(0, 0, 0)
    .list-header
     height 40px
     line-height 40px
     padding 0px 18px
     background #f3f5f7
     border-border 1px solid rgba(7,17,27,0.1)
     .tittle
      float left
      font-size 14px
      color rgb(7,17,27)
     .empty
      float right 
      font-size 12px
      color rgb(0,160,220)
    .list-content
     padding 0px 18px
     max-height 217px
     overflow hidden
     background #fff
     .food
      position relative
      padding 12px 0
      box-sizing border-box 
      border-1px(rgba(7,17,27,0.1))
      .name 
       line-height 24px
       font-size 14px
       color rgb(7,17,27)
      .price 
        position absolute
        right 90px
        bottom 12px
        line-height 24px
        font-size 14px
        font-weight 700
        color rgb(240,20,20)
      .cartcontrol-wrapper
       position absolute
       right 0
       bottom 6px
 .list-mask
  position fixed
  top 0
  left 0
  width 100%
  height 100%
  z-index 40
  backdrop-filter blur(10px)
  opacity 1
  background rgba(7,17,27,0.6)
  &.fade-enter-active,&.fade-leave-active
   transition: all 0.5s
  &.fade-enter, &.fade-leave-active
      opacity: 0
      background: rgba(7, 17, 27, 0)








     


</style>
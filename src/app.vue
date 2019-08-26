<template>
<div>
  <Index />
</div>
</template>
<script>
  config = {
    pages: [
      'pages/index/index'
    ],
    window: {
      backgroundTextStyle: 'light',
      navigationBarBackgroundColor: '#fff',
      navigationBarTitleText: 'WeChat',
      navigationBarTextStyle: 'black'
    }
  }
  import Index from './pages/index/index'
  export default {
    data() {
        const now = Date.now();
        return {
            list: [1, 2, 3],
            html: '<div>1111<span>222</span>333<p>ssssss</p></div>',
            error: false,
            time: now
        }
    },
  }

</script>
<style>
div{
    text-align: center;
  }
  div{
    text-align: center;
  }
</style>


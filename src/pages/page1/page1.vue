<template>
    <div class="wrap">
         <div>time: {{time}}</div>
         <p v-if="error">some error happend</p>
         <p v-else class="name">your msg: {{msg}}</p>
         <p v-show="msg" class="shown">test v-show</p>
         <p v-on:click="clickMethod">test v-on</p>
         <img v-bind:src="imageSrc" />
         <ul class="test-list">
             <li v-for="(value, index) in list" v-bind:key="index" class="list-item">
                 <div v-if="value">{{value}}</div>
                 <span>{{msg}}</span>
             </li>
         </ul>
         <to-do v-bind:msg="msg" v-bind:list="list"></to-do>
    </div>
</template>

<script>
    import './your.less';
    import ToDo from './todo';
    export default {
        name: 'test-sfc',
        props: {
            msg: {
                type: String,
                default: 'hello, sfc'
            },
            imageSrc: String
        },
        data () {
            const now = Date.now();
            return {
                list: [1, 2, 3],
                html: '<div>1111<span>222</span>333<p>ssssss</p></div>',
                error: false,
                time: now
            }
        },
        computed: {
            text () {
                console.log('from computed', this.msg);
                return `${this.time}: ${this.html}`;
            }
        },
        components: {
            ToDo
        },
        methods: {
            clickMethod () {
                console.log('click method');
            },
            testMethod () {
                console.log('call test');
            }
        },
        created () {
            const prevTime = this.time;
            this.testMethod();
            const msg = 'this is a test msg';
            this.time = Date.now();
            console.log('mounted', msg, this.time);
        }
    }
</script>
<style>
.div {
  color: red;
}
</style>

let sharem = new Vue({
    el: "#sharem",
    mounted(){
        mui.init();
        mui(".mui-scroll-wrapper").scroll();
    },
    methods: {
        back() {
            backRoute();
        }
    }
});
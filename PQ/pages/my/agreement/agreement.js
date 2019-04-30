let agreement = new Vue({
    el: "#agreement",
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
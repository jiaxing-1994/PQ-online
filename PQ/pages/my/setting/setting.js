let setting = new Vue({
    el: "#setting",
    mounted(){
        mui.init();
    },
    methods: {
        goPage(url, type) {
            pushRoute({page: url, params: {type: type}})
        },
        back() {
            backRoute();
        }
    }
});
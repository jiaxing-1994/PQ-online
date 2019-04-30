var rede = new Vue({
    el: "#rede",
    data: {
        selectType: 0
    },
    mounted(){
        mui.init();
        mui(".mui-scroll-wrapper").scroll();
    },
    methods: {
        changeRedType(type) {
            this.selectType = type;
            $(".rede-type label").removeClass("active");
            $(".rede-type label").eq(type).addClass("active");
            if(type == 0){
                $("#cash").show();
                $("#discount").hide();
            } else {
                $("#cash").hide();
                $("#discount").show();
            }
        },
        back() {
            backRoute();
        }
    }
});
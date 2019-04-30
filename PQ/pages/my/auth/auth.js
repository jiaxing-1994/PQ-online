let auth = new Vue({
    el: "#auth",
    data: {
        form: {
            name: "",
            card: ""
        },
        isAuthAble: true
    },
    mounted() {
        mui.init();
        layui.use(['layer'], function () {
            let layer = layui.layer;
        });
    },
    methods: {
        auth() {
            if (this.isAuthAble) {
                checkUser(this.form, res => {
                    route.splice(route.length - 1, 1);
                    localStorage.setItem("routePage", JSON.stringify(route));
                    pushRoute({page: "/PQ/pages/my/bank/bank.html"});
                }, err => {
                    err && layer.msg(err.message);
                    if (err.code == "060") {
                        this.isAuthAble = false;
                    }
                });
            } else {
                layer.msg("超过认证失败次数，请联系客服");
            }
        },
        back() {
            backRoute();
        }
    }
});

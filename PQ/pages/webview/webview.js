var webview = new Vue({
    el: '#webview',
    data: {
        headerTitle: '第三方',
        webviewUrl: '',//链接
        urlParams: {},
    },
    mounted() {
        this.urlParams = GetURLParam();
        if (this.urlParams.money) {
            this.urlParams.url = this.urlParams.url + "?token=" + localStorage.getItem("token") + "&returnUrl=" + this.urlParams.returnUrl + "&money=" + this.urlParams.money;
        }
    },
    methods: {
        backBtn() {
            if (!mui.os.plus) {
                // alert(urlParams);
                backRoute();
                return;
            }
            mui.back();
        },
    }
})
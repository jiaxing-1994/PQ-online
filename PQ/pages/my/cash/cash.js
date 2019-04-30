let cash = new Vue({
    el: "#cash",
    data: {
        bankList: [],
        balance: 0,
        freeFee: 0,
        feeRate: 1,
        cash: "",
        form: {
            money: "",
            withdrawPwd: "",
            fee: "",
            bankId: ""
        },
        isShowPassword: false,
        isAuth: "",
        customContact:[],
        wxUrl:"",
        wxPic:""
    },
    watch: {
        'form.money'(n) {
            let v = n == '' ? 0 : parseInt(n);
            this.form.fee = ((v - this.freeFee) * this.feeRate).toFixed(2);
            this.cash = v - this.form.fee;
        },
		'withdrawPwd'(){
			this.$nextTick(function(){
				mui(".mui-scroll-wrapper").scroll();
			});
		}
    },
    mounted() {
        mui.init();
        mui(".mui-scroll-wrapper").scroll();
        layui.use(['layer'], () => {
            let layer = layui.layer;
            this.getData();
        });
        getCustom(res=>{
            this.customContact = setCustomData(res);
            this.customContact.forEach(item=>{
                if(item.customerName == '微信客服'){
                    this.wxUrl = item.contactWay.split(",")[1];
                    this.wxPic = item.contactWay.split(",")[0];
                }
            });
        });
    },
    methods: {
        getData() {
            this.form.bankId = -1;
            initCash(res => {
                this.isAuth = userInfo.isAuth;
                if (res.data.bankList) {
                    res.data.bankList.forEach(i => {
                        if (i.defaulted == "020")
                            this.form.bankId = i.id;
                    });
                    this.bankList = res.data.bankList;
                }
                this.feeRate = parseFloat(res.data.feeRate);
                this.balance = res.data.balance ? res.data.balance : 0;
            }, err => {
                err && layer.msg(err.message);
            });
        },
        showPassword() {
            this.isShowPassword = !this.isShowPassword;
        },
        applyCash(e) {
            if (parseInt(this.form.money) > this.balance)
                layer.msg("提现金额不能大于余额");
            else if (this.form.bankId == -1)
                layer.msg("请选择提现银行卡");
            else if (this.form.money == "")
                layer.msg("请输入提现金额");
            else if (this.form.withdrawPwd == "")
                layer.msg("请输入提现密码");
            else {
                checkRequest(e, call => {
                    applyCash(this.form, res => {
                        layer.msg("提现申请成功，请耐心等待1或2个工作日");
                        call();
                    }, err => {
                        err && layer.msg(err.message);
                        call();
                    });
                });
            }
        },
        goPage(url, type) {
            pushRoute({
                page: url,
                params: {type: type}
            });
        },
        back() {
            backRoute();
        },
        showService() {
            showService();
        },
        goCheck() {
            if (this.isAuth == '020')
                pushRoute({page: "/PQ/pages/my/bank/bank.html"});
            else
                pushRoute({page: "/PQ/pages/my/auth/auth.html"});
        },
        customService(data) {
            if (data.type == 0)
                window.location.href = 'tel://' + data.contactWay;
            else if (data.type == 3)
                this.wx = layer.open({
                    type: 1,
                    content: $('#wxLayer'),
                    area: ['8rem', '9rem'],
                    shadeClose: true,
                    shade: 0.5,
                    title: false,
                    closeBtn: 0
                });
            else
                window.location.href = data.contactWay;
        },
        openWX(){
            if (navigator.userAgent.match(/(iPhone|iPod|iPad);?/i)) { //区分iPhone设备
                var input = document.createElement("input");
                input.value = this.wxUrl;
                document.body.appendChild(input);
                input.select();
                input.setSelectionRange(0, input.value.length);
                document.execCommand('Copy');
                document.body.removeChild(input);
                layer.msg("复制成功");
            } else {
                var ele = document.getElementById("wxUrl");
                ele.select();
                document.execCommand("Copy");
                layer.msg("复制成功");
            }
            window.location.href = "weixin://";
        },
        hideWX(){
            layer.close(this.wx);
        }
    }
});

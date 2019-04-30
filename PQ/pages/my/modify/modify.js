let modify = new Vue({
    el: "#modify",
    data: {
        type: 0,
        modifyTitle: "",
        mobile: "",
        newMobile: "",
        codeOldText: "获取验证码",
        oldTimer: null,
        oldCode: "",
        codeNewText: "获取验证码",
        newTimer: null,
        newCode: "",
        code: "",
        codeText: "获取验证码",
        codeTimer: null,
        oldPassword: "",
        newPassword: "",
        surePassword: "",
        isShowNewPassword: false,
        isShowSurePassword: false,
        isShowOldPassword: false,
        cashCode: "",
        cashCodeText: "获取验证码",
        cashCodeTimer: "",
        cashPassword: "",
        cashSurePassword: "",
        isShowCashPassword: false,
        isShowCashSurePassword: false,
        customContact: [],
        wxUrl:"",
        wxPic:""
    },
    watch: {
        newMobile(val) {
            this.$nextTick(() => {
                this.newMobile = filterInput(val);
            });
        },
        oldCode(val) {
            this.$nextTick(() => {
                this.oldCode = filterInput(val);
            });
        },
        newCode(val) {
            this.$nextTick(() => {
                this.newCode = filterInput(val);
            });
        },
        code(val) {
            this.$nextTick(() => {
                this.code = filterInput(val);
            });
        },
        oldPassword(val) {
            this.$nextTick(() => {
                this.oldPassword = filterInput(val);
            });
        },
        newPassword(val) {
            this.$nextTick(() => {
                this.newPassword = filterInput(val);
            });
        },
        surePassword(val) {
            this.$nextTick(() => {
                this.surePassword = filterInput(val);
            });
        },
        cashCode(val) {
            this.$nextTick(() => {
                this.cashCode = filterInput(val);
            });
        },
        cashPassword(val) {
            this.$nextTick(() => {
                this.cashPassword = filterInput(val);
            });
        },
        cashSurePassword(val) {
            this.$nextTick(() => {
                this.cashSurePassword = filterInput(val);
            });
        }
    },
    mounted() {
        mui.init();
        layui.use(['layer'], function () {
            let layer = layui.layer;
        });
        let loginInfo = localStorage.getItem("loginInfo");
        if (loginInfo) {
            loginInfo = JSON.parse(loginInfo);
            this.mobile = loginInfo.loginName;
        }
        this.type = GetURLParam()["type"];
        if (this.type == 1)
            document.title = "修改手机号";
        else if (this.type == 2)
            document.title = "修改密码";
        else
            document.title = "修改提现密码";
        getCustom(res => {
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
        getCode(type) {
            if (type == 1) {
                if (this.oldTimer)
                    return;
                let count = 60;
                this.oldTimer = setInterval(() => {
                    if (count === 0) {
                        clearInterval(this.oldTimer);
                        this.oldTimer = null;
                        this.codeOldText = "重新发送";
                    } else {
                        this.codeOldText = count;
                        count--;
                    }
                }, 1000);
                let data = {type: "060", mobile: this.mobile};
                checkCode(data, res => {
                    layer.msg("短信验证码发送成功");
                }, err => {
                    err && layer.msg(err.message);
                });
            } else if (type == 2) {
                if (this.newTimer)
                    return;
                if (!PHONE_NUMBER_REG.test(this.newMobile)) {
                    layer.msg("请输入正确的手机号码");
                    return;
                }
                let count = 60;
                this.newTimer = setInterval(() => {
                    if (count === 0) {
                        clearInterval(this.newTimer);
                        this.newTimer = null;
                        this.codeNewText = "重新发送";
                    } else {
                        this.codeNewText = count;
                        count--;
                    }
                }, 1000);
                let data = {type: "050", mobile: this.newMobile};
                checkCode(data, res => {
                    layer.msg("短信验证码发送成功");
                }, err => {
                    err && layer.msg(err.message);
                });
            } else if (type == 3) {
                if (this.codeTimer != null)
                    return;
                let count = 60;
                let data = {type: "030", mobile: this.mobile};
                checkCode(data, res => {
                    layer.msg("短信验证码发送成功");
                    this.codeTimer = setInterval(() => {
                        if (count === 0) {
                            clearInterval(this.codeTimer);
                            this.codeTimer = null;
                            this.codeText = "重新发送";
                        } else {
                            this.codeText = count;
                            count--;
                        }
                    }, 1000);
                }, err => {
                    err && layer.msg(err.message);
                });
            } else if (type == 4) {
                if (this.cashCodeTimer)
                    return;
                let count = 60;
                this.cashCodeTimer = setInterval(() => {
                    if (count === 0) {
                        clearInterval(this.cashCodeTimer);
                        this.cashCodeTimer = null;
                        this.cashCodeText = "重新发送";
                    } else {
                        this.cashCodeText = count;
                        count--;
                    }
                }, 1000);
                let data = {type: "040", mobile: this.mobile};
                checkCode(data, res => {
                    layer.msg("短信验证码发送成功");
                }, err => {
                    err && layer.msg(err.message);
                });
            }
        },
        changeShow(type) {
            switch (type) {
                case 1:
                    this.isShowOldPassword = !this.isShowOldPassword;
                    break;
                case 2:
                    this.isShowNewPassword = !this.isShowNewPassword;
                    break;
                case 3:
                    this.isShowSurePassword = !this.isShowSurePassword;
                    break;
                case 4:
                    this.isShowCashPassword = !this.isShowCashPassword;
                    break;
                case 5:
                    this.isShowCashSurePassword = !this.isShowCashSurePassword;
                    break;
            }
        },
        okClick(e) {
            if (this.type == 1) {
                let data = {
                    "newMobile": this.newMobile,
                    "oldCode": this.oldCode,
                    "newCode": this.newCode
                };
                checkRequest(e, call => {
                    updatePhone(data, res => {
                        layer.msg("电话号码修改成功，请重新登录", {shift: 1, time: 1000}, function () {                           
							localStorage.removeItem("userInfo");
                            localStorage.removeItem("token");
                            localStorage.removeItem("secret");
							backRoute({
                                backPage: '/PQ/pages/my/login/login.html',
                                params: {backPage: '/PQ/pages/my/my.html', loginBackPage: "/PQ/pages/my/my.html"}
                            });
                        });
                    }, err => {
                        typeof call == 'function' && call();
                        err && layer.msg(err.message);
                    });
                });
            } else if (this.type == 2) {
                if (this.newPassword != this.surePassword) {
                    layer.msg("两次输入密码不一致，请重新输入");
                    this.newPassword = this.surePassword = "";
                    return;
                }
                let data = {
                    "newPassword": this.newPassword,
                    "code": this.code,
                    "oldPassword": this.oldPassword
                };
                checkRequest(e, call => {
                    updatePassword(data, res => {
                        layer.msg("密码修改成功，请重新登录", {shift: 0, time: 1000}, () => {
                            let loginInfo = {loginName: this.mobile, password: ""};
                            localStorage.setItem("isLogin", 0);
                            localStorage.setItem("loginInfo", JSON.stringify(loginInfo));
							localStorage.removeItem("userInfo");
							localStorage.removeItem("token");
							localStorage.removeItem("secret");
                            backRoute({
                                backPage: '/PQ/pages/my/login/login.html',
                                params: {backPage: '/PQ/pages/my/my.html', loginBackPage: "/PQ/pages/my/my.html"}
                            });
                        });
                    }, err => {
                        typeof call == 'function' && call();
                        err && layer.msg(err.message);
                    });
                });
            } else {
                if (this.cashPassword != this.cashSurePassword) {
                    layer.msg("两次输入密码不一致，请重新输入");
                    this.cashPassword = this.cashSurePassword = "";
                    return;
                }
                let data = {
                    "password": this.cashPassword,
                    "code": this.cashCode
                };
                checkRequest(e, call => {
                    setCashPassword(data, res => {
                        layer.msg("提现密码设置成功", {shift: 0, time: 1000}, () => {
                            backRoute();
                        });
                    }, err => {
                        typeof call == 'function' && call();
                        err && layer.msg(err.message);
                    });
                });
            }
        },
        back() {
            backRoute();
        },
        showService() {
            showService();
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

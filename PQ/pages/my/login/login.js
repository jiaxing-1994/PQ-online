var loginIn = new Vue({
    el: '#login',
    data: {
        form: {
            loginName: "",
            password: ""
        },
        imgCode: "",
        isShowPassword: false,
        errorNumber: localStorage.getItem("errNumber") ? localStorage.getItem("errNumber") : 0,
        checkCall: null,
        customContact: [],
		isGet: false,
        wxUrl:"",
        wxPic:""
    },
    mounted() {
        mui.init();
        layui.use('layer', function () {
            let layer = layui.layer;
        });
        let loginData = localStorage.getItem("loginInfo");
        if (loginData) {
            loginData = JSON.parse(loginData);
            this.form.loginName = loginData.loginName;
            this.form.password = loginData.password;
        }
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
    watch: {
        'form.loginName'(val) {
            this.$nextTick(() => {
                this.form.loginName = filterInput(val);
            });
        },
        'form.password'(val) {
            this.$nextTick(() => {
                this.form.password = filterInput(val);
            });
        }
    },
    methods: {
		changeImageCode() {
			if (this.isGet)
				return;
			this.isGet = true;
			setTimeout(() => {
				this.isGet = false;
			}, 1000);
			$("#imageCode").attr("src", getImageCode(this.form.loginName, "010"));
		},
        goPage(url) {
            pushRoute({
                page: url
            });
        },
        btnCallback(event, type) {
            if (type === 1) {
                this.goPage("/PQ/pages/my/forget/forget.html");
            } else if (type === 2) {
                checkRequest(event, call => {
                    this.checkCall = call;
                    if (!PHONE_NUMBER_REG.test(this.form.loginName)) {
                        layer.msg("手机号错误，请重新填写");
                        this.checkCall();
                        return;
                    }
                    if (this.form.password === "" || this.form.password.length < 6 || this.form.password.length > 16) {
                        layer.msg("密码格式错误，请重新填写");
                        this.checkCall();
                        return;
                    }
                    if (this.errorNumber >= 3) {
                        $("#imageCode").attr("src", getImageCode(this.form.loginName, "070"));
                        layer.open({
                            type: 1,
                            content: $('.chart-dialog'),
                            area: ['8rem', '5.33rem'],
                            shadeClose: true,
                            shade: 0.5,
                            title: false,
                            closeBtn: 0
                        });
                    } else
                        this.login();
                });
            } else if (type === 3) {
                this.goPage("/PQ/pages/my/register/register.html");
            }
        },
        login() {
            if (this.errorNumber >= 3) {
                layer.closeAll();
                this.form.code = this.imgCode;
                this.imgCode = "";
            }
            login(this.form, res => {
                layer.msg("登录成功", {shift: 0, time: 1000}, () => {
                    localStorage.removeItem("errNumber");
                    //判断在我的页面退出登录
                    localStorage.setItem("isLogin", 1);
                    //判断是否需要在我的页面查询余额
                    localStorage.setItem("isBalance", 0);
                    localStorage.setItem("token", res.data.token);
                    localStorage.setItem("secret", res.data.secret);
                    localStorage.setItem("loginInfo", JSON.stringify(this.form));
                    localStorage.setItem("userInfo", JSON.stringify(res.data));
                    let params = GetURLParam();
                    if (params && params.loginBackPage) {
                        if (params.loginBackPage.indexOf("quatoDetail.html") != -1) {
                            route.push({page: "/PQ/pages/quato/quato.html"});
                            localStorage.setItem("routePage", JSON.stringify(route));
                        }
                        backRoute({backPage: params.loginBackPage, params: params});
                    } else
                        backRoute({backPage: '/PQ/pages/my/my.html'});
                });
            }, err => {
                if (err) {
					if(err.data && err.data.num)
						this.errorNumber = err.data.num;
					else
						this.errNumber = 0;
                    localStorage.setItem("errNumber", this.errNumber);
                    layer.msg(err.message);
                }
                typeof this.checkCall == 'function' && this.checkCall();
            });
        },
        hideDialog() {
            typeof this.checkCall == 'function' && this.checkCall();
            layer.closeAll();
        },
        showPassword() {
            this.isShowPassword = !this.isShowPassword;
        },
        clearInput() {
            this.form.loginName = "";
        },
        showService() {
            showService();
        },
        back() {
            let params = GetURLParam();
            if (params) {
                if (params.backPage)
                    backRoute({backPage: params.backPage, params: params});
                else
                    backRoute({params: params});
            } else
                backRoute();
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
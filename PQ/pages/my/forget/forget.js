let forget = new Vue({
    el: '#forget',
    data: {
        isShowPassword: false,
        isShowNewPwd: false,
        codeText: "获取验证码",
        codeTimer: null,
        imgCode: "",
        form: {
            mobile: "",
            code: "",
            password: ""
        },
        password: "",
        customContact: [],
        wxUrl:"",
        wxPic:""
    },
    watch: {
        'form.mobile'(val) {
            this.$nextTick(() => {
                this.form.mobile = filterInput(val);
            });
        },
        'form.code'(val) {
            this.$nextTick(() => {
                this.form.code = filterInput(val);
            });
        },
        'form.password'(val) {
            this.$nextTick(() => {
                this.form.password = filterInput(val);
            });
        },
        password(val) {
            this.$nextTick(() => {
                this.password = filterInput(val);
            });
        }
    },
    mounted() {
        mui.init();
        layui.use('layer', function () {
            let layer = layui.layer;
        });
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
        showPassword() {
            this.isShowPassword = !this.isShowPassword;
        },
        showNewPassword() {
            this.isShowNewPwd = !this.isShowNewPwd;
        },
        clearInput() {
            this.form.phone = "";
        },
        hideDialog() {
            layer.closeAll();
        },
        okClick() {
            layer.closeAll();
            let count = 60;
            let data = {
                mobile: this.form.mobile,
                type: "020",
                imgCode: this.imgCode
            };
            freeCode(data, res => {
                layer.msg("验证码发送成功");
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
            }, msg => {
                layer.msg(msg.message);
            });
        },
        getCode() {
            if (!PHONE_NUMBER_REG.test(this.form.mobile)) {
                layer.msg("手机号错误，请重新填写");
                return;
            }
            if (this.codeTimer !== null)
                return;
            $("#imageCode").attr("src", getImageCode(this.form.mobile, "020"));
            layer.open({
                type: 1,
                content: $('.chart-dialog'),
                area: ['8rem', '5.33rem'],
                shadeClose: true,
                shade: 0.5,
                title: false,
                closeBtn: 0
            });
        },
        btnCallback() {
            if (this.password != this.form.password) {
                layer.msg("两次输入密码不一致，请重新输入");
                this.password = "";
                this.form.password = "";
            } else {
                resetPassword(this.form, res => {
                    layer.msg("密码重置成功，请重新登录", {shift: 0, time: 1000}, () => {
                        backRoute();
                    });
                }, err => {
                    err && layer.msg(err.message);
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

var registerIn = new Vue({
	el: '#register',
	data: {
		form: {
			mobile: "",
			code: "",
			password: "",
			inviteCode: ""
		},
		codeText: "获取验证码",
		codeTimer: null,
		isShowPassword: false,
		isShowChartDialog: false,
		imgCode: "",
		registerRed: {},
		customContact: [],
		simAmount: 0,
		isGet: false,
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
		'form.inviteCode'(val) {
			this.$nextTick(() => {
				this.form.inviteCode = filterInput(val);
			});
		},
	},
	mounted() {
		mui.init();
		layui.use(['layer'], () => {
			let layer = layui.layer;
			getCustom(res => {
				this.customContact = setCustomData(res);
				this.customContact.forEach(item=>{
					if(item.customerName == '微信客服'){
						this.wxUrl = item.contactWay.split(",")[1];
						this.wxPic = item.contactWay.split(",")[0];
					}
				});
			});
		});
		var params = GetURLParam();
		if (params)
			this.form.inviteCode = params.shareCode;
	},
	methods: {
		loginSuccess(data, ret) {
			layer.msg("开户成功", {
				shift: 0,
				time: 500
			}, ()=> {
				//用户的登录信息
				localStorage.setItem("loginInfo", JSON.stringify(data));
				//判断在我的页面退出登录
				localStorage.setItem("isLogin", 1);
				//判断是否需要在我的页面查询余额
				localStorage.setItem("isBalance", 0);
				//用户信息
				localStorage.setItem("userInfo", JSON.stringify(ret.data));
				localStorage.setItem("token", ret.data.token);
				localStorage.setItem("secret", ret.data.secret);
				
				//如果两个活动都没有则直接返回我的页面;
				if (!this.registerRed && !this.simAmount)
					backRoute({
						backPage: "/PQ/pages/my/my.html"
					});
				else
					layer.open({
						type: 1,
						content: $('#registerActivity'),
						area: ['8rem', '9rem'],
						shadeClose: false,
						shade: 0.5,
						title: false,
						closeBtn: 0
					});
			});
		},
		changeImageCode() {
			if (this.isGet)
				return;
			this.isGet = true;
			setTimeout(() => {
				this.isGet = false;
			}, 1000);
			$("#imageCode").attr("src", getImageCode(this.form.mobile, "010"));
		},
		btnCallback(e, type) {
			//1开户，2获取验证码
			if (type === 1) {
				let check = document.getElementById("check").checked;
				let isRegister = true;
				if (check) {
					for (let i in this.form)
						if (i != "inviteCode" && this.form[i] == "")
							isRegister = false;
					if (!PHONE_NUMBER_REG.test(this.form.mobile)) {
						layer.msg("手机号错误，请重新填写");
						return;
					}
					if (!this.form.inviteCode)
						this.form.inviteCode = "";
					if (isRegister) {
						checkRequest(e, call => {
							register(this.form, res => {
								this.registerRed = res.data.coupon;
								this.simAmount = res.data.simAmount;
								let data = {
									loginName: this.form.mobile,
									password: this.form.password
								};
								login(data, ret => {
									if (ret.code == "070")
										layer.msg(ret.message, {
											shift: 0,
											time: 1000
										}, () => {
											this.loginSuccess(data, ret);
										});
									else
										this.loginSuccess(data, ret);
								}, err => {
									call();
								});
							}, err => {
								call();
								layer.msg(err.message,{time:1500});
							});
						});
					} else
						layer.msg("请填写完整信息");
				} else
					layer.msg("请先同意用户注册协议");
			} else if (type === 2) {
				if (!PHONE_NUMBER_REG.test(this.form.mobile)) {
					layer.msg("手机号错误，请重新填写");
					return;
				}
				if (this.codeTimer !== null)
					return;
				$("#imageCode").attr("src", getImageCode(this.form.mobile, "010"));
				layer.open({
					type: 1,
					content: $('.chart-dialog'),
					area: ['8rem', '5.33rem'],
					shadeClose: true,
					shade: 0.5,
					title: false,
					closeBtn: 0
				});
			} else if (type === 3) {
				layer.closeAll();
				let count = 60;
				let data = {
					mobile: this.form.mobile,
					type: "010",
					imgCode: this.imgCode
				};
				freeCode(data, res => {
					layer.msg("验证码发送成功");
					this.imgCode = "";
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
					this.imgCode = "";
					err && layer.msg(err.message);
				});
			} else if (type === 4) {
				layer.closeAll();
			}
		},
		showPassword() {
			this.isShowPassword = !this.isShowPassword;
		},
		clearInput() {
			this.form.mobile = "";
		},
		goPage(url, params) {
			pushRoute({
				page: url,
				params: params
			});
		},
		back(params) {
			if (params) {
				backRoute({
					params: params
				});
			} else
				backRoute();
		},
		showService() {
			showService();
		},
		hideDialog() {
			layer.closeAll();
		},
		goTrade(type) {
			localStorage.setItem("tradeType", type);
			route.push({
				page: "/PQ/pages/quato/quato.html"
			});
			localStorage.setItem("routePage", JSON.stringify(route));
			pushRoute({
				page: "/PQ/pages/quato/quatoDetail/quatoDetail.html",
				params: {
					tradeTabIndex: 5
				}
			});
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

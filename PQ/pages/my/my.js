let my = new Vue({
	el: "#my",
	data: {
		isLogin: false,
		userInfo: {
			mobile: "",
			balance: "0.00",
			signIn: false,
			isAuth: false,
			photoUrl: "/PQ/static/img/logo.png"
		},
		customContact: [],
		wxUrl:"",
		wxPic:"",
		isSuccess:true
	},
	mounted() {
		mui.init();
		mui('.mui-scroll-wrapper').scroll();
		mui('body').on('tap', '.mui-tab-item', function() {
			if (this.href) {
				if (this.href.indexOf('trade.html') != -1) {
					if (localStorage.getItem('userInfo') && localStorage.getItem('chooseContract')) {
						localStorage.setItem('tradeType', 1);
						pushRoute({
							page: '/PQ/pages/quato/quatoDetail/quatoDetail.html',
							params: {
								tradeTabIndex: 5
							}
						});
					} else {
						localStorage.setItem('tradeType',1);
						pushRoute({
							page: this.href
						});
					}
				} else {
					localStorage.setItem('tradeType',1);
					pushRoute({
						page: this.href
					});
				}
			}
		});
		layui.use(['layer'], () => {
			let layer = layui.layer;
			let userInfo = localStorage.getItem("userInfo");
			let isLogin = localStorage.getItem("isLogin");
			if (userInfo && (isLogin && isLogin == 1)) {
				userInfo = JSON.parse(userInfo);
				this.isLogin = true;
				this.userInfo.mobile = userInfo.mobile;
				this.userInfo.isAuth = userInfo.isAuth;
				this.userInfo.photoUrl = (userInfo.photoUrl == "" || userInfo.photoUrl == null) ? this.userInfo.photoUrl :
					userInfo.photoUrl;
				this.getUserInfo();
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
		});
	},
	methods: {
		getUserInfo() {
			getUserInfo(res => {
				this.userInfo.balance = res.data.balance ? res.data.balance : "0.00";
				this.userInfo.isAuth = res.data.isAuth;
				//是否签到
				this.userInfo.signIn = res.data.register;
				this.isSuccess = false;
				if (res.code == '070') {
					layer.msg(res.message);
					this.isSuccess = false;
				} else 
					this.isSuccess = true;
			}, err => {
				err && layer.msg(err.message);
			});
		},
		goPage(url, params) {
			localStorage.setItem("tradeType", 1);
			pushRoute({
				page: url,
				params: params
			});
		},
		bankPage() {
			if (this.userInfo.isAuth == '010') {
				this.goPage("/PQ/pages/my/auth/auth.html");
			} else {
				this.goPage("/PQ/pages/my/bank/bank.html", {
					type: 0
				});
			}
		},
		btnCallback(type) {
			if (type === 1)
				this.goPage("/PQ/pages/my/login/login.html");
			else if (type === 2)
				this.goPage("/PQ/pages/my/register/register.html", {
					backPage: "/PQ/pages/my/my.html"
				});
			else if (type === 3) {
				this.isLogin = false;
				this.userInfo.balance = "0.00";
				localStorage.setItem("isLogin", 0);
				localStorage.removeItem("userInfo");
				localStorage.removeItem("token");
				localStorage.removeItem("secret");
				mui('.mui-scroll-wrapper').scroll().scrollTo(0, 0, 100); //100毫秒滚动到顶
			}
		},
		showService() {
			showService();
		},
		sign() {
			signIn({
				signinDate: moment().format("YYYY-MM-DD")
			}, res => {
				this.userInfo.signIn = "020";
				if (res.data.faceValue) {
					// if(res.data.activeStatus == '020'){
					let type = res.data.couponType == "010" ? "现金红包" : "手续费红包";
					layer.msg("签到成功,获得" + res.data.faceValue + "元" + type);
					// } else 
					// layer.msg("签到成功");
				} else
					layer.msg("签到成功");
			}, err => {
				err && layer.msg(err.message);
			});
		},
		hideDialog() {
			layer.closeAll();
		},
		showBalanceNote() {
			var index = layer.open({
				type: 1,
				content: $('#customBalance'),
				area: ['8rem', '5.33rem'],
				shadeClose: true,
				title: false,
				closeBtn: 0
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

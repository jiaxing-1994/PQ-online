let rechargeIn = new Vue({
	el: "#recharge",
	data: {
		money: 0,
		balance: 0,
		exchangeRate: 0,
		amountList: [],
		contractList: [],
		params: null,
		isRequest: true,
		couponValue: 0,
		couponName: "",
		isCompleted: "010",
		contractType: 1,
		internationalList: [],
		chinaList: [],
		iHeight: 0,
		cHeight: 0
	},
	mounted() {
		var tabNav = mui('#tab1-nav').scroll({
			scrollY: false,
			scrollX: false,
			indicators: false,
			bounce: false,
		});
		var tabList = mui('#tab1-list').scroll({
			scrollY: false,
			scrollX: true,
			indicators: false,
			bounce: false,
		});
		document.querySelector('#tab1-list').addEventListener('scroll', function(e) {
			mui('#tab1-nav').scroll().scrollTo(tabList.x, 0);
		});
		mui.init();
		mui(".mui-scroll-wrapper").scroll();
		layui.use(['layer'], () => {
			let layer = layui.layer;
			initRecharge(res => {
				this.amountList = res.data.amountList;
				this.exchangeRate = res.data.exchangeRate;
				this.balance = res.data.balance ? res.data.balance : 0;
				this.money = this.amountList[0];
				let count = 0;
				let count1 = 0;
				let count2 = 0;
				let count3 = 0;
				let c0 = 0;
				let c1 = 0;
				let c2 = 0;
				let c3 = 0;
				let cny = 1;
				getRate(ret => {
					res.data.contractList.forEach(item => {
						ret.data.forEach(child => {
							if (child.currencyNo == 'CNY')
								cny = child.exchangeRate;
							if (item.currencyNo == child.currencyNo) {
								item.currencyName = child.currencyName;
								if (item.currencyNo == 'USD')
									item.rate = this.exchangeRate;
								else
									item.rate = child.exchangeRate;
								item.cnyFee = ((item.fee * child.exchangeRate) / cny).toFixed(2);
							}
						});
						if (item.tradingTime.split("，").length == 1 && item.typeCode == "1")
							count++;
						if (item.tradingTime.split("，").length == 2 && item.typeCode == "1")
							count1++;
						if (item.tradingTime.split("，").length == 3 && item.typeCode == "1")
							count2++;
						if (item.tradingTime.split("，").length == 4 && item.typeCode == "1")
							count3++;

						if (item.tradingTime.split("，").length == 1 && item.typeCode == "2")
							c0++;
						if (item.tradingTime.split("，").length == 2 && item.typeCode == "2")
							c1++;
						if (item.tradingTime.split("，").length == 3 && item.typeCode == "2")
							c2++;
						if (item.tradingTime.split("，").length == 4 && item.typeCode == "2")
							c3++;

						if (item.typeCode == "2")
							this.chinaList.push(item);
						else if (item.typeCode == "1")
							this.internationalList.push(item);
					});

					this.iHeight = 40 * count + 42 * count1 + 58 * count2 + 74 * count3;
					this.cHeight = 40 * c0 + 42 * c1 + 58 * c2 + 74 * c3;

					if (this.contractType == 1) {
						this.contractList = this.internationalList;
						$("#layer6").css({
							"height": this.iHeight + 'px'
						});
					} else {
						this.contractList = this.chinaList;
						$("#layer6").css({
							"height": this.cHeight + 'px'
						});
					}

					setTimeout(() => {
						let height = $("#tab1-list .mui-scroll").height();
						$("#layer6").css({
							"height": height + 30 + 'px'
						});
					}, 0);
				});
			}, err => {
				this.isRequest = false;
			});
			getActivityList({
				activityType: "021"
			}, res => {
				if (res.data[0].activeStatus == '010') {
					this.isCompleted = "020";
					return;
				}
				this.isCompleted = res.data[0].complatedStatus ? res.data[0].complatedStatus : "010";
				ajaxPost("/activitiesCoupon", {
					activityId: res.data[0].id
				}, ret => {
					this.couponValue = ret.data.amount;
					this.couponName = ret.data.typeName;
				});
			});
		});
		let params = GetURLParam();
		if (params && params.money) {
			this.params = params;
			this.money = params.money;
		}
	},
	methods: {
		changeType(type) {
			this.contractType = type;
			if (this.contractType == 1) {
				this.contractList = this.internationalList;
				$("#layer6").css({
					"height": this.iHeight + 'px'
				});
			} else {
				this.contractList = this.chinaList;
				$("#layer6").css({
					"height": this.cHeight + 'px'
				});
			}
			setTimeout(() => {
				let height = $("#tab1-list .mui-scroll").height();
				$("#layer6").css({
					"height": height + 30 + 'px'
				});
			}, 0);
		},
		changeMoney(money) {
			this.money = money;
		},
		hideDialog() {
			layer.closeAll();
		},
		goRecharge() {
			if (this.isCompleted == "010")
				layer.open({
					type: 1,
					content: $('#rechargeActivity'),
					area: ['8rem', '7rem'],
					shadeClose: false,
					shade: 0.5,
					title: false,
					closeBtn: 0
				});
			else
				this.recharge();
		},
		recharge() {
			let data = {
				money: this.money,
				token: localStorage.getItem("token"),
				returnUrl: "http://" + window.location.host + "/static/html/paySuccess.html"
			};
			if (!this.isRequest)
				return;
			pushRoute({
				page: "/PQ/pages/webview/webview.html",
				params: {
					title: "充值",
					url: payHttp + "/toRecharge.html",
					returnUrl: data.returnUrl,
					money: data.money
				}
			});
		},
		back() {
			if (this.params)
				backRoute({
					params: this.params
				});
			else
				backRoute();
		},
		showContract() {
			if ($("#showContract").attr("class")) {
				$("#showContract").removeAttr("class");
				$("#layer6").show();
			} else {
				$("#showContract").attr("class", "close");
				$("#layer6").hide();
			}
		}
	}
});

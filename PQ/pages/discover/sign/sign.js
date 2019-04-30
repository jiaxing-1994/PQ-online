const sign = new Vue({
	el: "#sign",
	data: {
		form: {
			beginDate: moment().startOf('month').format("YYYY-MM-DD"),
			endDate: moment().format("YYYY-MM-DD"),
		},
		currentYear: moment().format("YYYY"), //当前年
		currentMonth: moment().format("MM"), //当前月
		currentDay: "", //当前日
		calendarData: [], //日历数据
		selectItem: -1,
		isTodayMark: false,
		totalDays: 0,
		signinList: [],
		useStatus: '010',
		noUseRecord: [],
		usedRecord: [],
		signData: [],
		activityId: "",
		activity: {}
	},
	watch: {
		signRecord() {
			this.$nextTick(() => {
				mui(".mui-scroll-wrapper").scroll();
			});
		}
	},
	mounted() {
		mui.init();
		mui('.mui-scroll-wrapper').scroll();
		mui('body').on('tap', '.mui-tab-item', function() {
			if (this.href) {
				pushRoute({
					page: this.href
				});
			}
		});
		layui.use('layer', () => {
			let layer = layui.layer;
			this.getData();
		});
	},
	methods: {
		getData() {
			signDetail(this.form, res => {
				this.totalDays = res.data.totalDays;
				calendarData.forEach(c => {
					res.data.signinList.forEach(s => {
						if (c.time.replace(/\//g, "-") == s.signinDate) {
							c.isMark = true;
							if (s.signinDate == this.form.endDate)
								this.isTodayMark = true;
						}
					});
				});
				this.calendarData = calendarData;
			}, err => {
				err && layer.msg(err.message);
			});
			getActivityList({
				activityType: "030"
			}, res => {
				res.data.forEach(i => {
					if (i.activityType == '030') {
						this.activity = i;
						this.activityId = i.id;
						// getCouponList({activityId:this.activityId},res=>{
						//
						// },err=>{
						//     err && layer.msg(err.message);
						// });
					}
				});
			}, err => {
				err && layer.msg(err.message);
			});
		},
		//切换月份
		changeMonth(index) {
			let obj = {};
			if (index === 1) {
				obj = changeMonth(1);
			} else if (index === 2) {
				obj = changeMonth(2);
			}
			this.currentYear = obj.year;
			this.currentMonth = obj.month;
			this.currentDay = obj.day;
			this.calendarData = initCalendarData();
		},
		//选择日期
		chooseDate(item, index) {
			if (!item.isMonth) {
				currentMonth = item.time.split('/')[1];
				if (currentMonth === nowMonth) {
					currentDay = nowDay;
				} else {
					currentDay = 1;
				}
				this.calendarData = initCalendarData();
				this.selectItem = -1;
			} else {
				this.selectItem = index;
			}
			this.currentYear = item.time.split('/')[0];
			this.currentMonth = item.time.split('/')[1];
			this.currentDay = item.time.split('/')[2];
		},
		//点击签到
		todaySign() {
			if (this.isTodayMark)
				layer.msg("请勿重复签到");
			else {
				this.isTodayMark = true;
				signIn({
					signinDate: this.form.endDate
				}, res => {
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
			}
		},
		back() {
			backRoute();
		},
		changeStatus(status) {
			this.useStatus = status;
			let data = {
				activityId: this.activityId,
				useStatus: this.useStatus == '030' ? '030,040' : this.useStatus
			};
			if (this.useStatus == "010" && this.noUseRecord.length != 0) {
				this.signData = this.noUseRecord;
				return;
			}
			if (this.useStatus == "030" && this.usedRecord.length != 0) {
				this.signData = this.usedRecord;
				return;
			}
			getCouponList(data, res => {
				if (this.useStatus == '010') {
					this.noUseRecord = res.data;
					this.signData = this.noUseRecord;
				} else {
					this.usedRecord = res.data;
					this.signData = this.usedRecord;
				}
			}, err => {
				err && console.log(err.message);
			});
		},
		showSign() {
			let data = {
				activityId: this.activityId,
				useStatus: this.useStatus
			};
			if (this.noUseRecord.length == 0)
				getCouponList(data, res => {
					if (this.useStatus == '010') {
						this.noUseRecord = res.data;
						this.signData = this.noUseRecord;
					} else {
						this.usedRecord = res.data;
						this.signData = this.usedRecord;
					}
					this.showDialog();
				}, err => {
					err && console.log(err.message);
				});
			else
				this.showDialog();
		},
		showDialog() {
			let index = layer.open({
				type: 1,
				content: $('#signRecord'),
				shadeClose: true,
				area: ['8rem', '11.0667rem'],
				title: false,
				closeBtn: 0
			});
		},
		hideDialog() {
			layer.closeAll();
		},
		goUseCoupon() {
			pushRoute({
				page: "/PQ/pages/my/red/red.html"
			})
		}
	}
});

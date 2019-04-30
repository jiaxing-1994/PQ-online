let search = new Vue({
    el: '#search',
    data: {
        keyword: "",
        messageDate: "",
        messageWeek: "",
        startTime: "",
        endTime: "",
        country: "",
        importance: "",
        messageList: [],
        tempList: [],
		messageNoMore: false,
		messagePage: 1,
		requestTime: 0
    },
    watch: {
        keyword(n) {
            this.tempList = [];
            this.messageList.forEach(item => {
                if (item.liveTitle.indexOf(n) != -1) {
					var reg = new RegExp("(" + n + ")", "g");
					item.liveTitle = item.liveTitle.replace(reg,"<font color='#FF6633'>$1</font>");
                    this.tempList.push(item);
                }
            });
        }
    },
    mounted() {
        mui.init();
        mui('.mui-scroll-wrapper').scroll();
        layui.use(['layer'], () => {
            let layer = layui.layer;
            this.getMessageList();
        });
        this.startTime = Math.floor(moment().startOf('day').valueOf() / 1000);
        this.endTime = Math.floor(moment().endOf('day').valueOf() / 1000);
        this.tempList = this.messageList;
        this.getNowDate();
		document.querySelector('.mui-scroll-wrapper').addEventListener('scroll', e => {
		    if (e.detail.y == e.detail.maxScrollY && e.detail.maxScrollY != 0) {
		        if (this.messageNoMore)
		            return;
		        //防止请求过快
		        let time = moment().valueOf();
		        if (time - this.requestTime < 1000)
		            return;
		        this.messagePage++;
		        this.getMessageList();
		    }
		});
    },
    methods: {
        getDay(day) {
            switch (day) {
                case 1:
                    return "一";
                case 2:
                    return "二";
                case 3:
                    return "三";
                case 4:
                    return "四";
                case 5:
                    return "五";
                case 6:
                    return "六";
                case 0:
                    return "日";
            }
        },
        getNowDate() {
            this.messageDate = moment().format('YYYY年MM月DD日');
            this.messageWeek = "星期" + this.getDay(moment().day());
        },
        showMessageMore(e) {
            let target = e.currentTarget;
            if ($(target).find("span").attr("class").indexOf("open") != -1) {
                $(target).find("span").attr("class", "close");
                $(target).find("p").css({overflow: "auto", height: "auto"});
            } else {
                $(target).find("span").attr("class", "open");
                $(target).find("p").css({overflow: "hidden", height: ""});
            }
        },
        getMessageList() {
            let data = {
                pageIndex: this.messagePage,
                size: 10,
                minTime: this.startTime,
                maxTime: this.endTime,
            };
			this.requestTime = moment().valueOf();
            messageList(data, res => {
                this.messageList = this.messageList.concat(res.data);
                this.tempList = this.messageList;
            }, err => {
                err && layer.msg(err.message);
            });
        },
        back() {
            backRoute();
        }
    }
});

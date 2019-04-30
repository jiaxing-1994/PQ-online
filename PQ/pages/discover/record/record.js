const dtPicker = new mui.DtPicker({type: 'date'});
const record = new Vue({
    el: "#record",
    data: {
        form: {
            beginDate: "",
            endDate: "",
            pageNo: 1,
            pageSize: 20
        },
        totalProfit: 0,
        profitList: [],
        isNoMore: false,
        isRequest: true
    },
    mounted() {
        let _this = this;
        layui.use(['layer'], function () {
            let layer = layui.layer;
            _this.quickDate(1);
        });
        mui(".mui-scroll-wrapper").scroll();
        document.querySelector('.mui-scroll-wrapper').addEventListener('scroll', e => {
            if (e.detail.y == e.detail.maxScrollY) {
				if (this.isNoMore)
				    return;
				if (!this.isRequest) {
				    return;
				}
				this.isRequest = false;
				setTimeout(() => {
				    this.isRequest = true;
				}, 1000);
                this.form.pageNo++;
                this.getData();
            }
        });
    },
    methods: {
        getData() {
            shareProfit(this.form, res => {
                if (res.data.profitList.length < 10)
                    this.isNoMore = true;
                this.profitList = this.profitList.concat(res.data.profitList);
                this.totalProfit = res.data.totalProfit ? res.data.totalProfit : 0;
            }, err => {
                err && layer.msg(err.message);
            });
        },
        search() {
            if (!this.isRequest) {
                return;
            }
            this.isRequest = false;
            setTimeout(() => {
                this.isRequest = true;
            }, 1000);
            this.totalProfit = 0;
            this.profitList = [];
            this.getData();
        },
        chooseDate(index) {
            dtPicker.show((e) => {
                if (index == 1) {
                    //开始时间
                    this.form.beginDate = e.text;
                    $(".record-head-date > span").removeClass("active");
                } else if (index == 2) {
                    //结束时间
                    this.form.endDate = e.text;
                    $(".record-head-date > span").removeClass("active");
                }
            });
        },
        quickDate(index) {
            if (!this.isRequest) {
                return;
            }
            this.isRequest = false;
            setTimeout(() => {
                this.isRequest = true;
            }, 1000);
            $(".record-head-date > span").removeClass("active");
            $(".record-head-date > span").eq(index).addClass("active");
            if (index == 0) {
                this.form.endDate = moment().format("YYYY-MM-DD");
                this.form.beginDate = moment().add(-7, 'd').format("YYYY-MM-DD");
            } else {
                this.form.endDate = moment().format("YYYY-MM-DD");
                // this.form.beginDate = moment().startOf('month').format("YYYY-MM-DD");
                this.form.beginDate = moment().add(-30, 'd').format("YYYY-MM-DD");
            }
			this.totalProfit = 0;
            this.profitList = [];
            this.getData();
        },
        back() {
            backRoute();
        }
    }
});

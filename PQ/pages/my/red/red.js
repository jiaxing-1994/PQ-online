const allContract = JSON.parse(localStorage.getItem("allContract"));
let red = new Vue({
    el: "#red",
    data: {
        sortable: null,
        selectType: 0,
        useStatus: "010",
        noUseList: [],
        usingList: [],
        usedList: [],
        ids: [],
        isSort: false,
        isRequest: false,
        showContract: ""
    },
    mounted() {
        mui.init();
        mui(".mui-scroll-wrapper").scroll();
        let _this = this;
        layui.use(['layer'], function () {
            let layer = layui.layer;
            _this.getRedList();
        });
    },
    watch: {
        //在判断数据改变后的，dom结构变化后，执行操作
        selectType() {
            this.$nextTick(function () {
                mui(".mui-scroll-wrapper").scroll();
            });
        },
        usingList() {
            this.$nextTick(() => {
                if (this.usingList.length > 0) {
                    let el = document.getElementById('sortable');
                    this.sortable = new Sortable(el, {
                        scroll: false,
                        handle: ".drag",
                        onChoose: () => {
                            $(".sortable").css({
                                "height": "100%"
                            });
                        },
                        onEnd: (e) => { // 拖拽结束
                            let newIndex = e.newIndex;
                            let oldIndex = e.oldIndex;
                            if (newIndex == oldIndex)
                                return;
                            let oldItem = this.ids[oldIndex];
                            let newItem = this.ids[newIndex];
                            this.ids.splice(oldIndex, 1, newItem);
                            this.ids.splice(newIndex, 1, oldItem);
                            couponSort({
                                ids: this.ids.join(",")
                            }, res => {
                                layer.msg("排序成功");
                            }, err => {
                                err && layer.msg(err.message);
                            });
                            $(".sortable").css({
                                "height": ""
                            });
                        }
                    });
                }
            });
        }
    },
    methods: {
        showNote(item) {
            this.showContract = item.useVariety ? item.useVariety.join(",") : "全部";
            var index = layer.open({
                type: 1,
                content: $('#customLayer'),
                area: ['8rem', '5.33rem'],
                shadeClose: true,
                title: false,
                closeBtn: 0
            });
        },
        hideDialog() {
            layer.closeAll();
        },
        changeRedType(type) {
            if (this.selectType == type)
                return;
            this.selectType = type;
            $(".red-type label").removeClass("active");
            $(".red-type label").eq(type).addClass("active");
            if (type == 0) {
                this.useStatus = "010";
            } else if (type == 1) {
                this.useStatus = "020";
                if (this.usingList.length == 0)
                    this.getRedList();
            } else {
                this.useStatus = "030";
                if (this.usedList.length == 0)
                    this.getRedList();
            }
        },
        changeTime(data) {
            data.forEach(i => {
                i.beginTime = moment(i.beginTime).format("YYYY-MM-DD");
                i.endTime = moment(i.endTime).format("YYYY-MM-DD");
                if (this.useStatus == "020")
                    this.ids.push(i.couponId);
                if (i.useVariety) {
                    var arr = [];
                    if (i.useVariety.indexOf(",") == -1)
                        arr.push(i.useVariety);
                    else {
                        var value = i.useVariety.split(",");
                        for (var k = 0; k < allContract.length; k++) {
                            for (var j = 0; j < value.length; j++) {
                                if (value[j] == allContract[k].contractCode)
                                    arr.push(allContract[k].contractName);
                            }
                        }
                    }
                    i.useVariety = arr;
                }
            });
            return data;
        },
        getRedList() {
            if(this.useStatus == "030")
                this.useStatus = "030,040";
            getCouponList({
                useStatus: this.useStatus
            }, res => {
                if (this.useStatus == "010")
                    this.noUseList = this.changeTime(res.data);
                else if (this.useStatus == "020") {
                    this.usingList = this.changeTime(res.data);
                } else if (this.useStatus == "030,040")
                    this.usedList = this.changeTime(res.data);
            }, err => {
                err && layer.msg(err.message);
            });
        },
        useCoupon(item, index) {
            if (!this.isRequest) {
                this.isRequest = true;
                useCoupon({
                    couponId: item.couponId
                }, res => {
                    this.usingList = [];
                    this.usedList = [];
                    this.noUseList.splice(index, 1);
                    this.isRequest = false;
                    layer.msg("优惠券使用成功");
                }, err => {
                    this.isRequest = false;
                    err && layer.msg(err.message);
                });
            }
        },
        goPage(url) {
            pushRoute({
                page: url
            });
        },
        back() {
            let params = GetURLParam();
            if (params)
                backRoute({
                    params: params
                });
            else
                backRoute();
        }
    }
});

const dtPicker = new mui.DtPicker({
    type: 'date'
});
const country = ["中国", "美国", "欧元国", "日本", "英国", "加拿大", "瑞士", "德国", "澳大利亚"];
let discover = new Vue({
    el: '#discover',
    data: {
        daysList: [],
        bannerList: [],
        bannerIndex: 0,
        selectNoticeType: 0,
        noticeTypeList: [],
        noticePages: [1],
        noticeSize: 10,
        noticeNoMore: [false],
        noticeTypeCode: "",
        tabIndex: 0,
        messageDate: "",
        messageWeek: "",
        startTime: "",
        endTime: "",
        country: country.slice(0),
        importance: 0, //3,0全部
        messageList: [],
        messagePage: 1,
        messageNoMore: false,
        calendarList: [],
        tempCalendar: [],
        countryList: [...country, "全部"],
        bannerTime: 2000,
        requestTime: 0,
        isCanRequest: true,
        isCanGet: true
    },
    mounted() {
        mui.init();
        mui('body').on('tap', '.mui-tab-item', function () {
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
                        localStorage.setItem('tradeType', 1);
                        pushRoute({
                            page: this.href
                        });
                    }
                } else {
                    localStorage.setItem('tradeType', 1);
                    pushRoute({
                        page: this.href
                    });
                }
            }
        });
        layui.use(['layer'], function () {
            let layer = layui.layer;
        });
        mui('.mui-scroll-wrapper').scroll();
        document.querySelector('#activity .mui-scroll-wrapper').addEventListener('scroll', e => {
            if (e.detail.y == e.detail.maxScrollY && e.detail.maxScrollY != 0) {
                if (this.noticeNoMore[this.selectNoticeType])
                    return;
                this.noticePages[this.selectNoticeType]++;
                this.getNotice();
            }
        });
        document.querySelector('#message .mui-scroll-wrapper').addEventListener('scroll', e => {
            if (e.detail.y == e.detail.maxScrollY && e.detail.maxScrollY != 0) {
                if (this.messageNoMore)
                    return;
                //防止请求过快
                let endTime = moment().valueOf();
                if (endTime - this.requestTime < 1000)
                    return;
                this.messagePage++;
                this.getMessage();
            }
        });
        this.getNowDate();
        this.getData();
        this.startTime = Math.floor(moment().startOf('day').valueOf() / 1000);
        this.endTime = Math.floor(moment().endOf('day').valueOf() / 1000);
    },
    watch: {
        selectNoticeType() {
            this.$nextTick(() => {
                mui('#scroll0.mui-scroll-wrapper').scroll();
                mui('#scroll0.mui-scroll-wrapper').scroll().scrollTo(0, 0, 10);
            });
        },
        bannerList() {
            this.$nextTick(() => {
                mui('.mui-slider').slider({
                    interval: this.bannerTime //自动轮播周期，若为0则不自动播放，默认为0；
                });
            });
        }
    },
    methods: {
        getData() {
            getBanner("010", res => {
                this.bannerList = res.data;
                this.bannerList.forEach(i => {
                    i.imgUrl = imgHttp + i.imgUrl;
                    this.bannerTime = i.carouselTime;
                });
            }, err => {
                err && layer.msg(err.message);
            });
            this.getNotice();
        },
        getNotice() {
            let data = {
                pageNo: this.noticePages[this.selectNoticeType],
                pageSize: this.noticeSize
            };
            if (this.noticeTypeCode != "")
                data.typeCode = this.noticeTypeCode;
            getNotice(data, res => {
                //判断公告页数
                if (res.data[0].noticeList.length < this.noticeSize)
                    this.noticeNoMore[this.selectNoticeType] = true;
                res.data.forEach((i, k) => {
                    //第一次请求全部类型，然后初始化除系统公告的所有类型page,noMore
                    if (this.noticeTypeList.length == 0 && k != 0) {
                        this.noticePages[k] = 1;
                        this.noticeNoMore[k] = false;
                    }
                    if (i.noticeList)
                        i.noticeList.forEach(k => {
                            k.noticeTime = moment(k.noticeTime).format("YYYY-MM-DD HH:mm:ss");
                        });
                });
                //如果没有则全部赋值
                //有，则赋值选中的公告
                if (this.noticeTypeList.length == 0) {
                    this.noticeTypeList = res.data;
                } else {
                    //Vue中无法进行数据深度赋值，只能使用set
                    if (this.noticeTypeList[this.selectNoticeType].noticeList) {
                        let data = this.noticeTypeList[this.selectNoticeType];
                        data.noticeList = data.noticeList.concat(res.data[0].noticeList);
                        Vue.set(this.noticeTypeList, this.selectNoticeType, data);
                    } else {
                        Vue.set(this.noticeTypeList, this.selectNoticeType, res.data[0]);
                    }
                }
            }, err => {
                err && layer.msg(err.message);
            });
        },
        goPage(url) {
            if (url.indexOf("share") != -1 && !localStorage.getItem("userInfo"))
                pushRoute({
                    page: "/PQ/pages/my/login/login.html"
                });
            else
                pushRoute({
                    page: url
                });
        },
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
        getMessage() {
            this.requestTime = moment().valueOf();
            let data = {
                pageIndex: this.messagePage,
                size: 10,
                minTime: this.startTime,
                maxTime: this.endTime,
            };
            messageList(data, res => {
                this.isRequest = false;
                if (this.messageList.length == 0)
                    this.messageList = res.data;
                else
                    this.messageList = this.messageList.concat(res.data);
            }, err => {
                err && layer.msg(err.message);
            });
        },
        getCalendar() {
            layer.closeAll();
            let data = {
                pageIndex: 0,
                size: this.noticeSize,
                startTime: this.startTime,
                endTime: this.endTime,
            };
            getCalendar(data, res => {
                this.calendarList = res.data;
                this.tempCalendar = res.data;
                this.sureChoose();
            }, err => {
                err && layer.msg(err.message);
            });
        },
        changeTab(index) {
            this.tabIndex = index;
            if (this.tabIndex == 1 && this.messageList.length == 0) {
                this.getMessage();
            } else if (this.tabIndex == 2 && this.calendarList.length == 0) {
                this.getWeek(0);
            }
        },
        changeCountry(index) {
            let obj = $(".country li");
            let value = obj.eq(index).html();
            let last = this.countryList.length - 1;
            if (obj.eq(index).attr("class") == 'country-active') {
                if (index == last) {
                    obj.removeClass("country-active");
                    this.country = [];
                } else {
                    obj.eq(last).removeClass("country-active");
                    obj.eq(index).removeClass("country-active");
                    this.country.splice(index, 1, "");
                }
            } else {
                if (index == last) {
                    obj.addClass("country-active");
                    this.country = country.slice(0);
                } else {
                    let isAll = true;
                    obj.eq(index).addClass("country-active");
                    obj.each(i => {
                        if (obj.eq(i).attr("class") != "country-active" && i != last)
                            isAll = false;
                    });
                    if (isAll) {
                        obj.eq(last).addClass("country-active");
                        this.country = country.slice(0);
                    } else
                        this.country.splice(index, 1, value);
                }
            }
            console.log(this.country)
        },
        changeMajor(index) {
            $(".major li").removeClass("major-active");
            if ($(".major li").eq(index).attr("class")) {
                $(".major li").eq(index).removeClass("major-active");
            } else
                $(".major li").eq(index).addClass("major-active");
            if (index == 0)
                this.importance = 0;
            else
                this.importance = 3;
        },
        showCountryDialog() {
            layer.open({
                type: 1,
                content: $('#country-dialog'),
                area: ['8rem', '9.33rem'],
                shadeClose: true,
                shade: 0.5,
                title: null,
                closeBtn: 0
            });
        },
        getWeek(index) {
            if (index < -7 || index > 7) {
                layer.msg("暂时仅支持最近一周内的数据");
                return;
            }
            if (!this.isCanRequest) {
                return;
            }
            this.isCanRequest = false;
            setTimeout(function () {
                this.isCanRequest = true;
            }.bind(this), 1000);
            this.daysList = [];
            for (let i = -3 + index, j = 0; i < 4 + index; j++, i++) {
                let date = moment().add(i, 'd');
                let obj = {
                    index: i,
                    time: date,
                    isSelected: false,
                    date: date.format('DD'),
                    day: this.getDay(date.day())
                };
                if (i === index) {
                    obj.isSelected = true;
                    this.selectDate = date;
                    this.startTime = Math.floor(moment(date).startOf('day').valueOf() / 1000);
                    this.endTime = Math.floor(moment(date).endOf('day').valueOf() / 1000);
                    this.getCalendar();
                }
                this.daysList.push(obj);
            }
        },
        showAll() {
            this.tempCalendar = this.calendarList;
        },
        changeNoticeType(index) {
            if (!this.isCanGet)
                return;
            this.isCanGet = false;
            setTimeout(() => {
                this.isCanGet = true;
            }, 1000);
            this.selectNoticeType = index;
            this.noticeTypeCode = this.noticeTypeList[index].typeCode;
            if (!this.noticeTypeList[index].noticeList) {
                this.getNotice();
            } else if (this.noticeTypeList[index].noticeList && this.noticeTypeList[index].noticeList.length == 0)
                this.getNotice();
        },
        showMore(e) {
            let target = e.currentTarget;
            if ($(target).parent().attr("class").indexOf("open") != -1) {
                $(target).parent().removeClass("open");
				$(target).parent().find(".notice-item-content").hide();
				$(target).parent().find("label").hide();
                mui('#scroll0.mui-scroll-wrapper').scroll().scrollTo(0, 0, 10);
            } else {
				$(".notice-item").removeClass("open");
                $(target).parent().addClass("open");
				$(target).parent().find(".notice-item-content").show();
				$(target).parent().find(".notice-item-content").find("p").css({margin:0});
				$(target).parent().find("label").show();
            }
        },
        showMessageMore(e) {
            let target = e.currentTarget;
            if ($(target).find("span").attr("class").indexOf("open") != -1) {
                $(target).find("span").attr("class", "close");
                $(target).find("p").css({
                    overflow: "auto",
                    height: "auto"
                });
            } else {
                $(target).find("span").attr("class", "open");
                $(target).find("p").css({
                    overflow: "hidden",
                    height: ""
                });
            }
        },
        showPicker() {
            dtPicker.show((e) => {
                var m1 = moment(e.text);
                var m2 = moment();
                var diff = m1.diff(m2, 'day');
                var index = diff;
                if (diff == '-0')
                    index = 0;
                if (diff >= 0)
                    index = diff + 1;
                this.getWeek(index);
            });
        },
        sureChoose() {
            let importance = this.importance;
            this.tempCalendar = [];
            if (this.country.length != 0) {
                this.calendarList.forEach(i => {
                    this.country.forEach(j => {
                        if (importance == "") {
                            if (j == i.country)
                                this.tempCalendar.push(i);
                        } else {
                            if (j == i.country && importance == i.importance)
                                this.tempCalendar.push(i);
                        }
                    });
                });
            } else {
                if (importance == 0)
                    this.tempCalendar = this.calendarList;
                else
                    this.calendarList.forEach(i => {
                        if (i.importance == importance)
                            this.tempCalendar.push(i)
                    });
            }
            this.hideDialog();
        },
        hideDialog() {
            layer.closeAll();
        },
        goSign() {
            if (!localStorage.getItem("userInfo"))
                pushRoute({
                    page: "/PQ/pages/my/login/login.html"
                });
            else
                pushRoute({
                    page: '/PQ/pages/discover/sign/sign.html'
                });
        },
        goBanner(item) {
            if ((item.imgLinkUrl).indexOf("http") > -1) {
                pushRoute({
                    page: '/PQ/pages/webview/webview.html',
                    params: {
                        title: item.title,
                        url: item.imgLinkUrl
                    }
                });
            } else {
                pushRoute({
                    page: item.imgLinkUrl
                });
            }
        }
    }
});

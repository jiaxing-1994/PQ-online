let newIn = new Vue({
    el: "#new",
    data: {
        activityList: [],
        customContact: [],
        wxUrl:"",
        wxPic:""
    },
    mounted() {
        layui.use(['layer'], function () {
            let layer = layui.layer;
        });
        this.getData();
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
        getData() {
            getActivityList({activityType: "050,020,021,022"}, res => {
                this.activityList = res.data;
                this.activityList.forEach(item => {
                    if (!item.complatedStatus)
                        item.complatedStatus = "010";
                });
            }, err => {
                err && layer.msg(err.message);
            });
        },
        back() {
            backRoute();
        },
        showService() {
            showService();
        },
        goComplete(item) {
            var userInfo = localStorage.getItem("userInfo");
            if (item.complatedStatus == '010') {
                switch (item.activityType) {
                    case '050':
                        pushRoute({page: '/PQ/pages/my/register/register.html'});
                        break;
                    case '020':
                        if (userInfo) {
                            localStorage.setItem("tradeType", 0);
                            pushRoute({
                            	page: "/PQ/pages/quato/quatoDetail/quatoDetail.html",
                            	params: {
                            		tradeTabIndex: 5
                            	}
                            });
                        } else
                            pushRoute({page: '/PQ/pages/my/login/login.html'});
                        break;
                    case '021':
                        if (userInfo)
                            pushRoute({page: '/PQ/pages/my/recharge/recharge.html'});
                        else
                            pushRoute({page: '/PQ/pages/my/login/login.html'});
                        break;
                    case '022':
                        if (userInfo){
                            localStorage.setItem("tradeType", 1);
                            pushRoute({
                            	page: "/PQ/pages/quato/quatoDetail/quatoDetail.html",
                            	params: {
                            		tradeTabIndex: 5
                            	}
                            });
                        }else
                            pushRoute({page: '/PQ/pages/my/login/login.html'});
                        break;
                }
            }
			if(item.received == '010' && item.complatedStatus == '020'){
				if(item.activityType == '020' && userInfo){
					localStorage.setItem("tradeType", 0);
					pushRoute({
						page: "/PQ/pages/quato/quatoDetail/quatoDetail.html",
						params: {
							tradeTabIndex: 5
						}
					});
				} 
				if(item.activityType == '022' && userInfo){
					localStorage.setItem("tradeType", 1);
					pushRoute({
						page: "/PQ/pages/quato/quatoDetail/quatoDetail.html",
						params: {
							tradeTabIndex: 5
						}
					});
				} 
			}
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

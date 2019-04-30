const share = new Vue({
	el: "#share",
	data: {
		mobile: "",
		shareCode: 0,
		totalProfit: 0,
		firstLevelNum: 0,
		firstLevelProfit: 0,
		secLevelNum: 0,
		secLevelProfit: 0,
		shareUrl: window.location.host
	},
	mounted() {
		mui.init();
		mui(".mui-scroll-wrapper").scroll();
		layui.use(['layer'], () => {
			let layer = layui.layer;
			shareDetail(res => {
				this.mobile = res.data.mobile;
				this.firstLevelNum = res.data.firstLevelNum;
				this.firstLevelProfit = res.data.firstLevelProfit;
				this.secLevelNum = res.data.secLevelNum;
				this.secLevelProfit = res.data.secLevelProfit;
				this.shareCode = res.data.shareCode;
				this.totalProfit = res.data.totalProfit;
				//TODO 配置分享地址，域名+注册页面+shareCode
				// this.shareUrl = this.shareUrl.indexOf("http") == -1 ? "http://" + this.shareUrl : this.shareUrl;
				// this.shareUrl = this.shareUrl + "/PQ/pages/my/register/register.html?shareCode=" + this.shareCode;
				this.shareUrl = "https://adspq.dktai.cn/?shareCode=" + this.shareCode;
				new QRCode("qrcode", {
					text: this.shareUrl,
					width: 128,
					height: 128,
					colorDark: "#000000",
					colorLight: "#ffffff",
					correctLevel: QRCode.CorrectLevel.H
				});
			}, err => {
				err && layer.msg(err.message);
			});
		});
	},
	methods: {
		goPage(url) {
			pushRoute({
				page: url
			});
		},
		back() {
			backRoute();
		},
		copyUrl() {
			if (navigator.userAgent.match(/(iPhone|iPod|iPad);?/i)) { //区分iPhone设备
				var input = document.createElement("input");
	            input.value = this.shareUrl;
	            document.body.appendChild(input);
	            input.select();
	            input.setSelectionRange(0, input.value.length);
				document.execCommand('Copy');
	            document.body.removeChild(input);
				layer.msg("复制成功");
			} else {
				var ele = document.getElementById("shareUrl");
				ele.select();
				document.execCommand("Copy");
				layer.msg("复制成功");
			}
		},
		openQRCode() {
			let index = layer.open({
				type: 1,
				content: $('#confirmOrderLayer'),
				area: ['8rem', '6rem'],
				shadeClose: true,
				title: false,
				closeBtn: 0
			});
		},
		share() {
			var ele = document.getElementById("shareUrl");
			ele.select();
			document.execCommand("Copy");
			window.location.href = "weixin://";
		},
		closeLayer() {
			layer.closeAll();
		}
	}
});

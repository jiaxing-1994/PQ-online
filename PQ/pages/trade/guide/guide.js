var guide = new Vue({
	el:'#guide',
	data:{
		phoneCustomer:'',
		onlineCustomer:'',
		qqCustomer:'',
		wechatCustomer:'',
		wxUrl:"",
		wxPic:""
	},
	mounted() {
		this.getCustomerData();
		mui.init();
		mui('.mui-scroll-wrapper').scroll();
		layui.use('layer');
	},
	methods:{
		//返回按钮
		backBtn(){
			if(!mui.os.plus){
				// alert(urlParams);
				backRoute();
				return;
			}
			mui.back();
		},
		//客服弹窗
		customLayer(){
			var index = layer.open({
				type:1,
				content:$('#customLayer'),
				area:['8rem','5.33rem'],
				shadeClose:true,
				title:false,
				closeBtn:0
			});
		},
		//获取客服地址
		getCustomerData(){
			request.post('/customerContacts')
			.then((res)=>{
				console.log(res);
				if(res.success&&res.code=='010'){
					for(var i=0;i<res.data.length;i++){
						if(res.data[i].customerName == '电话客服'){
							this.phoneCustomer = res.data[i].contactWay;
						}else if(res.data[i].customerName == '在线客服'){
							this.onlineCustomer = res.data[i].contactWay;
						}else if(res.data[i].customerName == 'qq客服'){
							this.qqCustomer = res.data[i].contactWay;
						}else if(res.data[i].customerName == '微信客服'){
							this.wechatCustomer = res.data[i].contactWay;
							this.wxUrl = res.data[i].contactWay.split(",")[1];
							this.wxPic = res.data[i].contactWay.split(",")[0];
						}
					}
				}else{
					layer.msg(res.message,{
						time:1500
					});
				}
			}).catch((err)=>{
				console.log(err);
			})
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
		},
		chooseCustomer(text){
			if(text=='电话客服'){
				if(this.phoneCustomer==''){
					layer.msg('暂无电话客服',{
						time:1500
					});
					return;
				}
				window.location.href = 'tel://' + this.phoneCustomer;
			}else if(text == '微信客服'){
				this.wx = layer.open({
					type: 1,
					content: $('#wxLayer'),
					area: ['8rem', '9rem'],
					shadeClose: true,
					shade: 0.5,
					title: false,
					closeBtn: 0
				});
			}else{
				var webviewUrl='';
				if(text=='在线客服'){
					if(this.phoneCustomer==''){
						layer.msg('暂无在线客服',{
							time:1500
						});
						return;
					}
					webviewUrl = this.onlineCustomer;
				}else if(text=='qq客服'){
					if(this.phoneCustomer==''){
						layer.msg('暂无qq客服',{
							time:1500
						});
						return;
					}
					webviewUrl = this.qqCustomer;
				}else if(text=='微信客服'){
					if(this.phoneCustomer==''){
						layer.msg('暂无微信客服',{
							time:1500
						});
						return;
					}
					webviewUrl = this.wechatCustomer;
				}
				window.location.href = webviewUrl;
				// pushRoute({
				// 	page:'/PQ/pages/webview/webview.html',
				// 	params:{
				// 		title:text,
				// 		url:webviewUrl
				// 	}
				// })
			}
		}
	}
})
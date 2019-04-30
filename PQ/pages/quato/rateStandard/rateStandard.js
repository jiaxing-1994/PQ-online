var rate =new Vue({
	el:'#rate',
	data:{
		rateTable:[],//汇率表格
		rateData:[],//汇率数据
		price:100,//输入的金额
		priceType:0,//基准 0美元 1中国
		RMBRate:1,//人民币汇率
		phoneCustomer:'',
		onlineCustomer:'',
		qqCustomer:'',
		wechatCustomer:'',
		wxUrl:"",
		wxPic:""
	},
	mounted() {
		this.getCustomerData();
		layui.use('layer', function(){
			var layer = layui.layer;
		});
		this.getRateData();
		if(GetURLParam()){
			urlParams = GetURLParam();//获取url参数
		}
	},
	methods:{
		//返回按钮
		backBtn(){
			if(!mui.os.plus){
				// alert(urlParams);
				backRoute({
					params:{
						tradeTabIndex:Number(urlParams.tradeTabIndex)
					},
				});
				return;
			}
			mui.back();
		},
		//获取汇率表
		getRateData(){
			request.post('/qryRates')
			.then((res)=>{
				if(res.success&&res.code=="010"){
					this.rateData = res.data;
					for(var i=0;i<this.rateData.length;i++){
						if(this.rateData[i].currencyNo == 'CNY'){
							this.RMBRate = this.rateData[i].exchangeRate;
							break;
						}
					}
					this.handleRate();
				}else{
					layer.msg(res.message,{
						time:1500
					})
				}
			}).catch((err)=>{
				console.log(err);
			})
		},
		//切换基准
		switchType(index){
			this.priceType = index;
			this.handleRate();
		},
		selectInput(){
			console.log(this.price);
			if(this.price == 0){
				this.price = '';
			}
		},
		//输入金额
		changePrice(){
// 			if(this.price==''){
// 				this.price = 1;
// 			}
			this.handleRate();
		},
		//计算汇率表格
		handleRate(){
			this.rateTable = [];
			if(this.price == ''){
				var price = 0;
			}else{
				var price = this.price;
			}
			for(var i=0;i<this.rateData.length;i++){
				var obj = {
					name:'',
					value:''
				}
				obj.name = this.rateData[i].currencyName;
				if(this.priceType == 0){
					//输入美元
					obj.value = price/this.rateData[i].exchangeRate;
				}else if(this.priceType == 1){
					//输入人民币
					obj.value = price*this.RMBRate/this.rateData[i].exchangeRate;
				}
				this.rateTable.push(obj);
			}
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
				// 		url:webviewUrl,
				// 		tradeTabIndex:urlParams.tradeTabIndex
				// 	}
				// })
			}
		}
	}
})
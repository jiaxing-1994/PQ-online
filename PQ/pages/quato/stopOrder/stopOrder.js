var stopOrder = new Vue({
	el:'#stopOrder',
	data:{
		showPage:1, //1:未触发 2:已触发
		selectStopIndex:-1,//选择止损单的索引
		selectContractItem:{},//选择的止损单
		layerTabIndex:0,//止盈止损切换
		selectContractLastData:[],//选择的合约的最新行情
		stopLossType:0,//止损方式 0止损价 1动态价
		stopLossPrice:0,//设置止损价
		stopLossRate:0,//止损价幅度
		stopProfitPrice:0,//止盈价格
		stopProfitRate:0,//止盈价幅度
		stopNum:0,
		confirmInfoType:1,//1暂停 2修改 3删除
		addressStatus:false,
		isNetworkConnect:false,//网络连接状态
	},
	mounted() {
		mui.init();
		this.networkChange();
		layui.use('layer', function(){
			var layer = layui.layer;
		});
		if(GetURLParam()){
			urlParams = GetURLParam();//获取url参数
		}
		this.initScroll(1);
		this.initScroll(2);
	},
	computed:{
		stopLossList:function(){
			return tradeStore.state.stopLossList;
		},
		internationalCommodity:function(){
			//订阅的合约
			return marketStore.state.internationalCommodity;
		},
		isCanConnectTrade:function(){
			return marketStore.state.isCanConnectTrade;
		},
	},
	watch:{
		isNetworkConnect:function(){
			if(this.isNetworkConnect){
				this.getAddress();
			}
		},
		internationalCommodity:function(){
			if(this.selectContractItem){
				var internationalCommodity = this.internationalCommodity;
				for(var i=0,length=internationalCommodity.length;i<length;i++){
					if(internationalCommodity[i].commodity_no == this.selectContractItem.CommodityNo){
						this.selectContractLastData = internationalCommodity[i].quatoData;
					}
				}
			}
		},
		stopLossType:function(){
			console.log(this.selectContractItem);
			if(this.stopLossType == 0){
				//止损价
				this.stopLossPrice = this.selectContractItem.StopLossPrice;
			}else if(this.stopLossType == 1){
				//动态价
				this.stopLossPrice = this.selectContractItem.StopLossDiff;
			}
		},
		isCanConnectTrade:function(){
			if(this.isCanConnectTrade){
				tradeStore.dispatch('connectTrade'); //连接交易
			}
		},
		addressStatus:function(){
			if(this.addressStatus){
				marketStore.dispatch('connectQuato');//连接行情
			}
		}
	},
	methods:{
		//网络变化
		networkChange(){
			var _this = this;
			if(window.navigator.onLine==true) {
				this.isNetworkConnect = true;
		　　}else {
				layer.msg('未连接网络',{
					time:1500
				})
				this.isNetworkConnect = false;
				this.addressStatus = false;
		　　}
		　　window.addEventListener("online", online, false);
		　　window.addEventListener("offline", offline, false);
		　　function online(){
				_this.isNetworkConnect = true;
				layer.msg('网络连接',{
					time:1500
				})
			}
		　　function offline() {
				_this.isNetworkConnect = false;
				_this.addressStatus = false;
				layer.msg('网络断开，请检查网络',{
					time:2000
				})
			}
		},
		//获取地址
		getAddress(){
			if(sessionStorage.getItem('address')){
				var list = JSON.parse(sessionStorage.getItem('address'));
				for(var i=0;i<list.length;i++){
					if(list[i].urlType == '010'){
						address1 = list[i].url;
					}else if(list[i].urlType == '020'){
						address2 = list[i].url;
					}else if(list[i].urlType == '030'){
						address3 = list[i].url;
					}else if(list[i].urlType == '040'){
						address4 = list[i].url;
					}else if(list[i].urlType == '050'){
						address5 = list[i].url;
					}
				};
				this.addressStatus = true;
			}else{
				request.post('/urlConfig',{'version':'','urlType':''})
				.then((res)=>{
					if(res.success&&res.code == '010'){
						sessionStorage.setItem('address',JSON.stringify(res.data));
						for(var i=0;i<res.data.length;i++){
							if(res.data[i].urlType == '010'){
								address1 = res.data[i].url;
							}else if(res.data[i].urlType == '020'){
								address2 = res.data[i].url;
							}else if(res.data[i].urlType == '030'){
								address3 = res.data[i].url;
							}else if(res.data[i].urlType == '040'){
								address4 = res.data[i].url;
							}else if(res.data[i].urlType == '050'){
								address5 = res.data[i].url;
							}
						};
						this.addressStatus = true;
					}else{
						layer.msg(res.message,{
							time:1500
						})
					}
				}).catch(function(err){
					console.log(err);
			;	})
			}
		},
		//返回按钮
		backBtn(){
			if(!mui.os.plus){
				backRoute({
					params:{
						tradeTabIndex:Number(urlParams.tradeTabIndex)
					}
				});
				return;
			}
			mui.back();
		},
		//切换tab
		switchTab(index){
			this.showPage = index;
		},
		//初始化滚动
		initScroll(i){
			var tabTitle = mui('#titleScroll'+i).scroll({
				scrollY:false,
				scrollX:false,
				indicators:false,
				bounce:false,
			});
			var tabList = mui('#listScroll'+i).scroll({
				scrollY:true,
				scrollX:true,
				indicators:false,
				bounce:false,
			});
			document.querySelector('#listScroll'+i).addEventListener('scroll', function (e) { 
				mui('#titleScroll'+i).scroll().scrollTo(tabList.x,0);
			});
		},
		//选择止损单
		chooseStopItem(item,index){
			if(this.selectStopIndex == index){
				this.selectStopIndex = -1;
				return;
			}
			this.selectStopIndex = index;
			this.selectContractItem = item;
		},
		//操作功能
		optionBtn(index){
			if(!this.isNetworkConnect){
				layer.msg('未连接到网络，请检查网络设置',{
					time:2000
				});
				return;
			}
			if(this.selectStopIndex == -1){
				layer.msg('请先选择一条合约',{
					time:1000,
					area:'inherit'
				});
				return;
			}
			console.log(this.selectContractItem);
			if(index == 1){
				//暂停
				this.confirmInfoType = 1;
				var method = 'ModifyStopLoss'; //调用方法
				var params = {
					StopLossNo:this.selectContractItem.StopLossNo, //止损编号
					ModifyFlag:2,//0-修改 1-删除 2-暂停 3-启动
					Num:Number(this.selectContractItem.Num),//订单数量
					StopLossType:this.selectContractItem.StopLossType,//0-限价触发止损1-限价触发止盈2-浮动止损
					OrderType:1,//市价-1，对价-2 
					StopLossPrice:this.selectContractItem.StopLossPrice,//止损(赢)价
					StopLossDiff:this.selectContractItem.StopLossDiff,//动态止损的点差
				}; 
				if(this.selectContractItem.Status == 0){
					//暂停
					params.ModifyFlag = 2;
				}else if(this.selectContractItem.Status == 1){
					//开启
					params.ModifyFlag = 3;
				}
				this.selectStopIndex = -1
				tradeStore.dispatch('sendWS',{method,params});
			}else if(index == 2){
				//修改
				if(this.selectContractItem.Status == 0){
					//运行状态
					layer.msg('运行中不可修改',{
						time:1500,
					});
					return;
				}
				this.confirmInfoType = 2;
				if(this.selectContractItem.StopLossType == 0){
					this.layerTabIndex = 0;
					this.stopLossPrice = this.selectContractItem.StopLossPrice;
					this.stopLossType = 0;
				}else if(this.selectContractItem.StopLossType == 1){
					this.layerTabIndex = 1;
					this.stopLossPrice = this.selectContractItem.StopLossPrice;
				}else if(this.selectContractItem.StopLossType == 2){
					this.stopLossType = 1;
					this.layerTabIndex = 0;
					this.stopLossPrice = this.selectContractItem.StopLossDiff;
				}
				this.stopProfitPrice = this.selectContractItem.StopLossPrice;
				this.stopNum = this.selectContractItem.Num;
				if(this.selectContractItem.HoldDirection == 0){
					//多
					this.stopProfitRate = (this.stopProfitPrice-this.selectContractItem.HoldAvgPrice)/this.selectContractItem.HoldAvgPrice*100;
					if(this.selectContractItem.StopLossType == 0){
						this.stopLossRate = (this.stopLossPrice-this.selectContractItem.HoldAvgPrice)/this.selectContractItem.HoldAvgPrice*100;
					}else if(this.selectContractItem.StopLossType == 2){
						this.stopLossRate = -this.stopLossPrice/this.selectContractItem.HoldAvgPrice*100;
					}
				}else if(this.selectContractItem.HoldDirection == 1){
					//空
					this.stopLossRate = (this.selectContractItem.HoldAvgPrice-this.stopLossPrice)/this.selectContractItem.HoldAvgPrice*100;
					if(this.selectContractItem.StopLossType == 0){
						this.stopProfitRate = (this.selectContractItem.HoldAvgPrice-this.stopProfitPrice)/this.selectContractItem.HoldAvgPrice*100;
					}else if(this.selectContractItem.StopLossType == 2){
						this.stopLossRate = -this.stopLossPrice/this.selectContractItem.HoldAvgPrice*100;
					}
				}
				layer.open({
					type:1,
					content:$('#stopProfitLossLayer'),
					area:['8.27rem','5.8666rem'],
					shadeClose:true,
					title:null,
					closeBtn:0,
				});
			}else if(index == 3){
				//删除
				this.confirmInfoType = 3;
				layer.open({
					type:1,
					content:$('#confirmInfoLayer'),
					area:['7.5rem','6.5rem'],
					shadeClose:true,
					title:null,
					closeBtn:0,
				});
			}
		},
		//弹出层确认按钮
		layerInfoBtn(index){
			if(index == 1){
				//取消
				layer.closeAll();
			}else if(index == 2){
				//确认
				if(this.confirmInfoType == 1){
					//暂停/开启
				}else if(this.confirmInfoType == 2){
					//修改
					var method = 'ModifyStopLoss'; //调用方法
					var params = {
						StopLossNo:this.selectContractItem.StopLossNo, //止损编号
						ModifyFlag:0,//0-修改 1-删除 2-暂停 3-启动
						Num:Number(this.stopNum),//订单数量
						StopLossType:this.layerTabIndex==0?this.stopLossType==0?0:2:1,//0-限价触发止损1-限价触发止盈2-浮动止损
						OrderType:1,//市价-1，对价-2 
						StopLossPrice:this.layerTabIndex==0?Number(this.stopLossPrice):Number(this.stopProfitPrice),//止损(赢)价
						StopLossDiff:Number(this.stopLossPrice),//动态止损的点差
					}; 
				}else if(this.confirmInfoType == 3){
					//删除
					var method = 'ModifyStopLoss'; //调用方法
					var params = {
						StopLossNo:this.selectContractItem.StopLossNo, //止损编号
						ModifyFlag:1,//0-修改 1-删除 2-暂停 3-启动
						Num:this.selectContractItem.Num,//订单数量
						StopLossType:this.selectContractItem.StopLossType,//0-限价触发止损1-限价触发止盈2-浮动止损
						OrderType:1,//市价-1，对价-2 
						StopLossPrice:this.selectContractItem.StopLossPrice,//止损(赢)价
						StopLossDiff:this.selectContractItem.StopLossDiff,//动态止损的点差
					}; 
				}
				this.selectStopIndex = -1
				//传入参数
				tradeStore.dispatch('sendWS',{method,params});
				layer.closeAll();
			}
		},
		//切换止盈止损
		switchLayerTab(index){
			if(this.layerTabIndex == index){
				return;
			}
			this.layerTabIndex = index;
		},
		//设置止损价格
		setStopLossPrice(){
			if(this.stopLossType == 0){
				if(this.selectContractItem.HoldDirection == 0){
					//多
					this.stopLossRate = (this.stopLossPrice-this.selectContractItem.HoldAvgPrice)/this.selectContractItem.HoldAvgPrice*100;
				}else if(this.selectContractItem.HoldDirection == 1){
					//空
					this.stopLossRate = (this.selectContractItem.HoldAvgPrice-this.stopLossPrice)/this.selectContractItem.HoldAvgPrice*100;
				}
			}else if(this.stopLossType == 1){
				this.stopLossRate = -this.stopLossPrice/this.selectContractItem.HoldAvgPrice*100;
			}
		},
		//设置止盈价格
		setStopProfitPrice(){
			if(this.selectContractItem.HoldDirection == 0){
				//多
				this.stopProfitRate = (this.stopProfitPrice-this.selectContractItem.HoldAvgPrice)/this.selectContractItem.HoldAvgPrice*100;
			}else if(this.selectContractItem.HoldDirection == 1){
				//空
				this.stopProfitRate = (this.selectContractItem.HoldAvgPrice-this.stopProfitPrice)/this.selectContractItem.HoldAvgPrice*100;
			}
		},
		closeLayer(){
			layer.closeAll();
		}
	}
})
//头部
var conditionOrder = new Vue({
	el:'#conditionOrder',
	data:{
		showPage:1, //1:未触发 2:已触发
		layerTabIndex:0,//弹出层tab
		conditionObj:{
			conditionType:0,//0:价格条件 1:时间条件
			compareType:0,//价格触发方式0-- >1-->= 2--< 3--<=
			triggerPrice:'',//触发价格
			triggerTime:'',//触发时间
			additionType:-1,//附加条件 0-- >1-->= 2--< 3--<=
			additionPrice:'',//附加价格
			direction:0,//0买 1卖
			orderType:1,//下单类型 1市价
			Num:1,//手数
		},
		selectContract:{
			commodity_name:'国际原油',
		},//选择的合约
		selectContractLastData:[],//选择的合约的最新数据
		selectConditionIndex:-1,//选择条件单索引
		selectConditionItem:{},//选择条件单
		confirmInfoType:1,//确认按钮来源 1:添加条件单 2修改条件单 3删除条件单
		contractData:[{
			Title:'',
			List:[{
				contractName:''
			}]
		}],
		contractLayer:null, //合约选择弹窗
		addressStatus:false, //地址获取状态
		timePicker:null, //时间选择器
		isNetworkConnect:false,//网络连接状态
	},
	mounted() {
		mui.init();
		//初始化交易中心滑动
		mui('#contractPopover').scroll();
		this.networkChange();
		this.timePicker = new mui.PopPicker({
			layer: 3
		});
		this.conditionObj.triggerTime = getFormalDate(new Date(),'hh:mm:ss');
		this.timePicker.setData(timeData);
		layui.use('layer', function(){
			var layer = layui.layer;
		});
		if(GetURLParam()){
			urlParams = GetURLParam();//获取url参数
		}
		marketStore.state.subscribeContract = [];
		mui('#contractScroll').scroll({
			scrollY:true,
			scrollX:true,
			indicators:false,
			bounce:false,
		});
		this.initScroll(1);
		this.initScroll(2);
	},
	computed:{
		conditionList:function(){
			return tradeStore.state.conditionList;
		},
		allCommodity:function(){
			//全部合约
			return marketStore.state.allCommodity;
		},
		allSubsCommodity:function(){
			return marketStore.state.allSubsCommodity;
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
		allSubsCommodity:function(){
			if(this.selectContract.commodity_no){
				var allSubsCommodity = this.allSubsCommodity;
				for(var i=0,length=allSubsCommodity.length;i<length;i++){
					if(allSubsCommodity[i].commodity_no == this.selectContract.commodity_no){
						this.selectContractLastData = allSubsCommodity[i].quatoData;
						if(this.conditionObj.triggerPrice == ''){
							this.conditionObj.triggerPrice = this.selectContractLastData[3];
						}
						break;
					}
				}
			}
		},
		addressStatus:function(){
			if(this.addressStatus&&this.isNetworkConnect){
				marketStore.dispatch('connectQuato');//连接行情
			}
		},
		isCanConnectTrade:function(){
			if(this.isCanConnectTrade){
				tradeStore.dispatch('connectTrade'); //连接交易
			}
		},
		allSubsCommodity:function(){
			var contractData = this.allSubsCommodity.slice(0);
			contractData = contractData.sort(compare('firstLetter'),false);
			function compare(prop){
				return function(a,b){
					var value1 = a[prop];
					var value2 = b[prop];
					return value1.charCodeAt()- value2.charCodeAt();
				}
			}
			this.contractData = formatList(contractData,'firstLetter');
			function formatList(arr,keyword) {
				let newArr1 = [];
				let tempArr = [];
				let reg = /\b(\w)|\s(\w)/g;
				let k = 0;
				let firstWord = arr[0][keyword].charAt(0).toUpperCase();//获取第一个分类字母
				arr.map((v) => {
					v[keyword] = v[keyword].replace(reg,m=>m.toUpperCase());//首字母大写
					if(firstWord == v[keyword].charAt(0)){
					  tempArr.push(v);
					  newArr1[k] = {
						Title:firstWord,
						List:tempArr
					  }
					}else{
					  //这里循环到这表示已经第二个字母了
					  firstWord = v[keyword].charAt(0);//设置第二字母
					  tempArr = [];//把之前的清除掉
					  tempArr.push(v);//添加第一个
					  newArr1[++k] = {//自增
						Title: firstWord,
						List : tempArr
					  }
					}
				});
				return newArr1;
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
					}
				}).catch(function(err){
					console.log(err);
			;	})
			}
		},
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
		//选择时间
		chooseTime(){
			this.timePicker.show(function(items) {
				this.conditionObj.triggerTime = items[0].value+':'+items[1].value+':'+items[2].value;
			}.bind(this));
		},
		//切换tab
		switchTab(index){
			this.showPage = index;
		},
		//添加条件单
		addConditionBtn(){
			if(this.allSubsCommodity.length==0){
				return;
			}
			this.selectContract=this.allSubsCommodity[0];
			this.conditionObj.triggerPrice = this.selectContract.quatoData[3];
			this.conditionObj.Num = 1; 
			this.selectContractLastData = this.selectContract.quatoData;
			this.conditionObj.compareType = 0;
			this.confirmInfoType = 1;
			layer.open({
				type:1,
				content:$('#conditionLayer'),
				area:['8.27rem','8rem'],
				shadeClose:true,
				title:false,
				closeBtn:0,
			});
		},
		//切换弹出层tab
		switchLayerTab(index){
			this.layerTabIndex = index;
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
		//选择条件单合约
		selectContractBtn(item){
			this.selectContract = item;
			for(var i=0;this.allSubsCommodity.length;i++){
				if(item.commodity_no == this.allSubsCommodity[i].commodity_no){
					if(this.allSubsCommodity[i].quatoData){
						this.selectContract.quatoData = this.allSubsCommodity[i].quatoData;
						this.selectContractLastData = this.allSubsCommodity[i].quatoData;
						this.conditionObj.triggerPrice = this.selectContractLastData[3];
					}else{
						this.selectContractLastData = '获取中';
						this.conditionObj.triggerPrice = '';
					}
					break;
				}
			}
			layer.close(this.contractLayer);
		},
		//弹窗按钮
		layerInfoBtn(index){
			if(index == 1){
				//取消
				this.layerTabIndex = 0;
				layer.closeAll();
			}else if(index == 2){
				//确认
				console.log(this.conditionObj);
				// return;
				if(this.confirmInfoType == 1){
					if(this.layerTabIndex==0&&this.conditionObj.triggerPrice == ''){
						layer.msg('请输入触发价格',{
							time:1500
						})
						return;
					}
					if(this.layerTabIndex==1&&this.conditionObj.triggerTime == ''){
						layer.msg('请输入触发时间',{
							time:1500
						})
						return;
					}
					var time = getNowFormatDate().replace(/\//g,'-') + ' ' + this.conditionObj.triggerTime;
					var method = 'InsertCondition'; //调用方法
					var params = {
						CommodityType:Number(this.selectContract.typeCode), //品种类型
						ExchangeNo:this.selectContract.exchange_no,//交易所代码
						CommodityNo:this.selectContract.commodity_no,//品种代码
						ContractNo:this.selectContract.main_contract_no,//合约代码
						Num:Number(this.conditionObj.Num),//手数 
						ConditionType:this.layerTabIndex,//止损(赢)价
						PriceTriggerPonit:Number(this.conditionObj.triggerPrice),//触发价
						CompareType:Number(this.conditionObj.compareType), //价格触发方式
						TimeTriggerPoint:time, //触发时间
						AB_BuyPoint:0,
						AB_SellPoint:0,
						OrderType:1,
						Direction:Number(this.conditionObj.direction),
						AdditionFlag:this.conditionObj.additionType==-1?false:true,
						AdditionType:this.conditionObj.additionType==-1?0:Number(this.conditionObj.additionType),
						AdditionPrice:this.conditionObj.additionType==-1?0:Number(this.conditionObj.additionPrice),
					}; 
					if(this.layerTabIndex == 0){
						//价格条件
					}else if(this.layerTabIndex == 1){
						//时间条件
					}
				}else if(this.confirmInfoType == 2){
					//修改条件单
					var method = 'ModifyCondition'; //调用方法
					var time = getNowFormatDate() + ' ' + this.conditionObj.triggerTime + ':00';
					var params = {
						ConditionNo:this.selectConditionItem.ConditionNo, //条件单编号
						ModifyFlag:0,//操作类型 0-修改 1-删除 2-暂停 3-启动
						Num:Number(this.conditionObj.Num),//手数 
						ConditionType:this.layerTabIndex,//条件单类型 0-价格条件 1-时间条件 2-（双向价格）AB单
						PriceTriggerPonit:Number(this.conditionObj.triggerPrice),//触发价
						CompareType:Number(this.conditionObj.compareType), //价格触发方式
						TimeTriggerPoint:time, //触发时间
						AB_BuyPoint:0,
						AB_SellPoint:0,
						OrderType:1,
						Direction:Number(this.conditionObj.direction),
						AdditionFlag:this.conditionObj.additionType==-1?false:true,
						AdditionType:this.conditionObj.additionType==-1?0:Number(this.conditionObj.additionType),
						AdditionPrice:this.conditionObj.additionType==-1?0:Number(this.conditionObj.additionPrice),
					}; 
				}else if(this.confirmInfoType == 3){
					//删除条件单
					var method = 'ModifyCondition'; //调用方法
					var params = {
						ConditionNo:this.selectConditionItem.ConditionNo, //条件单编号
						ModifyFlag:1,//操作类型 0-修改 1-删除 2-暂停 3-启动
						Num:Number(this.conditionObj.Num),//手数 
						ConditionType:this.layerTabIndex,//条件单类型 0-价格条件 1-时间条件 2-（双向价格）AB单
						PriceTriggerPonit:Number(this.conditionObj.triggerPrice),//触发价
						CompareType:Number(this.conditionObj.compareType), //价格触发方式
						TimeTriggerPoint:time, //触发时间
						AB_BuyPoint:0,
						AB_SellPoint:0,
						OrderType:1,
						Direction:Number(this.conditionObj.direction),
						AdditionFlag:this.conditionObj.additionType==-1?false:true,
						AdditionType:this.conditionObj.additionType==-1?0:Number(this.conditionObj.additionType),
						AdditionPrice:this.conditionObj.additionType==-1?0:Number(this.conditionObj.additionPrice),
					}; 
				}
				this.selectConditionIndex = -1;
				tradeStore.dispatch('sendWS',{method,params});
				this.layerTabIndex = 0;
				layer.closeAll();
			}
			this.selectContract = {
				commodity_name:'国际原油',
			};
		},
		//选择条件单
		chooseConditionItem(item,index){
			if(this.selectConditionIndex == index){
				this.selectConditionIndex = -1;
				this.selectConditionItem = {};
				return;
			}
			for(var i=0,len=this.allCommodity.length;i<len;i++){
				if(this.allCommodity[i].contractCode == item.CommodityNo){
					item.CommodityName = this.allCommodity[i].contractName;
					break;
				}
			}
			this.selectConditionItem = item;
			this.selectConditionIndex = index;
		},
		//底部操作按钮
		optionBtn(index){
			if(!this.isNetworkConnect){
				layer.msg('未连接到网络，请检查网络设置',{
					time:2000
				});
				return;
			}
			if(this.selectConditionIndex == -1){
				layer.msg('请先选择一条条件单',{
					time:1500
				});
				return;
			}
			if(index == 1){
				//暂停
				var method = 'ModifyCondition'; //调用方法
				var params = {
					ConditionNo:this.selectConditionItem.ConditionNo, //条件单编号
					ModifyFlag:this.selectConditionItem.Status==1?3:2,//操作类型 0-修改 1-删除 2-暂停 3-启动
					Num:Number(this.conditionObj.Num),//手数 
					ConditionType:this.layerTabIndex,//条件单类型 0-价格条件 1-时间条件 2-（双向价格）AB单
					PriceTriggerPonit:Number(this.conditionObj.triggerPrice),//触发价
					CompareType:Number(this.conditionObj.compareType), //价格触发方式
					TimeTriggerPoint:time, //触发时间
					AB_BuyPoint:0,
					AB_SellPoint:0,
					OrderType:1,
					Direction:this.conditionObj.direction,
					AdditionFlag:this.conditionObj.additionType==-1?false:true,
					AdditionType:this.conditionObj.additionType==-1?0:Number(this.conditionObj.additionType),
					AdditionPrice:this.conditionObj.additionType==-1?0:Number(this.conditionObj.additionPrice),
				};
				tradeStore.dispatch('sendWS',{method,params});
				this.selectConditionIndex = -1;
			}else if(index == 2){
				//修改
				if(this.selectConditionItem.Status == 0){
					//运行状态
					layer.msg('运行中不可修改',{
						time:1500,
					});
					return;
				}
				this.confirmInfoType = 2;
				this.selectContract={
					commodity_name:this.selectConditionItem.CommodityName,
					commodity_no:this.selectConditionItem.CommodityNo,
				};
				if(this.selectConditionItem.ConditionType == 1){
					var obj = this.selectConditionItem.TimeTriggerPoint.split(' ')[1].split(':');
					var time = obj[0] + ':' + obj[1];
				}else{
					var time = '';
				}
				this.conditionObj = {
					conditionType:this.selectConditionItem.ConditionType,//0:价格条件 1:时间条件
					compareType:Number(this.selectConditionItem.CompareType),//价格触发方式0-- >1--< 2-->= 3--<=
					triggerPrice:this.selectConditionItem.PriceTriggerPonit,//触发价格
					triggerTime:time,//触发时间
					additionType:this.selectConditionItem.AdditionFlag?this.selectConditionItem.AdditionType:-1,//附加条件 0-- >1--< 2-->= 3--<=
					additionPrice:this.selectConditionItem.AdditionFlag?this.selectConditionItem.AdditionPrice:'',//附加价格
					direction:this.selectConditionItem.Direction,//0买 1卖
					orderType:1,//下单类型 1市价
					Num:Number(this.selectConditionItem.Num),//手数
				}
				layer.open({
					type:1,
					content:$('#conditionLayer'),
					area:['8.27rem','8rem'],
					shadeClose:true,
					title:false,
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
		//切换合约
		switchContract(){
			this.contractLayer = layer.open({
				type:1,
				content:$('#contractSelect'),
				area:['8rem','10.666rem'],
				shadeClose:true,
				title:null,
				closeBtn:0,
			});
			var list = document.getElementById('list');
			//calc hieght
			list.style.height = '10.666rem';
			//create
			window.indexedList = new mui.IndexedList(list);
		},
		closeLayer(){
			layer.closeAll();
		}
	}
})
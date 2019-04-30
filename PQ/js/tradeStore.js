window.tradeStore = new Vuex.Store({
	state:{
		tradeConfig:{
			Version:'3.3',
			url_address:'ws://192.168.0.227:36999/',//5:ws://192.168.0.232:6102/ 6:ws://192.168.0.227:36999/
			ClientNo:'dev001',//5:004264 6:dev001
			PassWord:'MTIz', //5:UEVKZEJm 6:MTIz
			IsMock:1,
			Source:'N_WEB',
		},
		tradeSocket:null,//交易ws实例
		isReConnect:false,//是否重连
		isConnectTrade:false, //是否连接交易
		isTradeLogin:false,//是否登录交易
		tradeBascData:0,//风险度数据
		deposit:0,//保证金
		totalBalance:0,//总资产
		todayCanUseBalance:0,//今可用
		Balance:0,//余额
		capitalList:[],//资金列表
		orderInsertList:[],//报单提交暂存列表
		allOrderList:[],//所有订单列表
		positionList:[],//持仓列表
		templeList:[],//挂单列表
		stopLossList:[],//止损单列表
		conditionList:[],//条件单列表
		heartCheck:{
			timeout:10000,
			timeoutObj:null,
		},
		chooseContract:{}, //选择的合约
		totalPositionNum:0, //总持仓量
		tradeType:tradeType, //0模拟 1实盘
		rateList:{}, //汇率数据
		tradeLoginStatus:0, //0未尝试登录 1已尝试登录 2登录成功 3登录失败
		activityStatus:'',//010没完成 020完成
		activityId:'',//活动ID
		couponId:'',//优惠券ID
		couponName:'',//优惠券名称
		received:'010',//是否领取 010没领取 020领取
		faceValue:0,//优惠券金额
		activitiesName:'',//活动名称
	},
	mutations:{
		//初始化数据
		initData(state){
			state.orderInsertList = [];
			state.allOrderList = [];
			state.positionList = [];
			state.templeList = [];
			state.stopLossList = [];
			state.conditionList = [];//条件单列表
			state.tradeBascData = 0;//风险度数据
			state.deposit = 0;//保证金
			state.totalBalance = 0;//总资产
			state.todayCanUseBalance = 0;//今可用
			state.Balance = 0;//余额
			state.totalPositionNum = 0;
			marketStore.state.totalFloatProfit = 0;
		},
		reset:function(state){
			if(state.heartCheck.timeoutObj == null){
				return;
			}
			clearTimeout(state.heartCheck.timeoutObj);
			this.commit('start');
		},
		start:function(state){
			state.heartCheck.timeoutObj = setTimeout(function(){
				clearTimeout(state.heartCheck.timeoutObj);
				state.isReConnect = true;
				layer.msg('交易断开，正在重连',{
					time:2000
				});
				this.dispatch('connectTrade');
			}.bind(this),state.heartCheck.timeout);
		},
		//查询活动
		checkActivity(state){
			var activityType = '020';
			if(state.tradeType == 0){
				//模拟
				activityType = '020';
			}else if(state.tradeType == 1){
				//实盘
				activityType = '022,023';
			}
			request.post('/qryActivites',{
				activityType:activityType
			},{
				token:userInfo.token,
				secret:userInfo.secret
			}).then(function(res){
				if(res.success&&res.code == '010'){
					for(var i=0;i<res.data.length;i++){
						if(res.data[i].complatedStatus=='010'){
							tradeStore.state.activityStatus = res.data[i].complatedStatus;
							tradeStore.state.received = res.data[i].received;
							var a = res.data[i].id;
							tradeStore.state.activityId = res.data[i].id;
							tradeStore.state.activitiesName = res.data[i].activityName;
							request.post('/activitiesCoupon',{
								activityId: a,
							},{
								token:userInfo.token,
								secret:userInfo.secret
							}).then((res2)=>{
								if(res2.success&&res2.code=='010'){
									tradeStore.state.couponId = res2.data.couponId;
									tradeStore.state.faceValue = res2.data.amount;
									tradeStore.state.couponName = res2.data.typeName;
									tradeStore.state.activitiesName = res2.data.activitiesName;
								}else{
									layer.msg(res2.message,{
										time:1500
									})
								}
							}).catch((err)=>{
								
							})
						}
					}
				}else{
					layer.msg(res.message,{
						time:1500,
					})
				}
			}).catch(function(err){
				
			})
		},
	},
	actions:{
		connectTrade(context){
			if(context.state.heartCheck.timeoutObj!=null){
				clearTimeout(context.state.heartCheck.timeoutObj);
			}
			if(isLogin){
				//判断连接交易地址
				context.state.tradeConfig.ClientNo = userInfo.mobile;
				context.state.tradeConfig.PassWord = userInfo.password;
				//登录
				if(context.state.tradeType==0){
					//模拟
					context.state.tradeConfig.url_address = address4[0];
				}else if(context.state.tradeType==1){
					//实盘
					context.state.tradeConfig.url_address = address5[0];
				}
				if(context.state.tradeSocket){
					context.state.tradeSocket.close();
					context.state.tradeSocket = null;
				}
				context.state.tradeSocket = new WebSocket(context.state.tradeConfig.url_address);
				context.state.tradeSocket.onopen = function(){
					context.commit('start');
					context.state.isConnectTrade = true;
					context.state.tradeLoginStatus = 1;
					if(context.state.isReConnect){
						layer.msg('交易重连成功',{
							time:1000
						})
						context.state.isReConnect = false;
					}
					var loginParam = {
						Method:'Login',
						req_id:'',
						Parameters:{
							ClientNo:context.state.tradeConfig.ClientNo,
							PassWord:Base64.encode(context.state.tradeConfig.PassWord),
							IsMock:context.state.tradeConfig.IsMock,
							Version:context.state.tradeConfig.Version,
							Source:context.state.tradeConfig.Source
						}
					}
					context.state.tradeSocket.send(JSON.stringify(loginParam));
				};
				context.state.tradeSocket.onclose = function(){
					context.state.isConnectTrade = false;
					context.state.isTradeLogin = false;
					context.state.tradeLoginStatus = 3;
				}
				context.state.tradeSocket.onmessage = function(message){
					context.dispatch('WSmessage',message.data)
				};
				context.state.tradeSocket.onerror = function(){
// 					layer.msg('交易连接失败',{
// 						time:2000
// 					});
				}
			}
		},
		WSmessage(context,message){
			message = JSON.parse(message);
			if(message.Method == 'OnRspLogin'){
				if(message.Parameters.Code == 0){
					context.state.tradeLoginStatus = 2;
					context.commit('initData');
					context.state.isTradeLogin = true;
					context.state.tradeBascData = message.Parameters;
					var method = '';
					var params = {};
					if(location.pathname.indexOf('quatoDetail') != -1){
						//交易页面
						//查询订单信息
						context.dispatch('checkOrder');
						//查询汇率
						request.post('/qryRates')
						.then(function(perms){
							if(perms.success&&perms.code=='010'){
								//成功获取汇率
								marketStore.state.currencyRate = perms.data;
								for(var i=0;i<marketStore.state.currencyRate.length;i++){
									if(marketStore.state.currencyRate[i].currencyNo == 'CNY'){
										marketStore.state.RMBRate = marketStore.state.currencyRate[i].exchangeRate;
									}
								}
								localStorage.setItem('currencyRate',JSON.stringify(perms.data));
								context.dispatch('checkPosition');
							}else{
								//失败则取缓存数据
								if(localStorage.getItem('currencyRate')){
									marketStore.state.currencyRate = JSON.parse(localStorage.getItem('currencyRate'));
									for(var i=0;i<marketStore.state.currencyRate.length;i++){
										if(marketStore.state.currencyRate[i].currencyNo == 'CNY'){
											marketStore.state.RMBRate = marketStore.state.currencyRate[i].exchangeRate;
										}
									}
									context.dispatch('checkPosition');
								}else{
									layer.msg('汇率获取失败',{
										time:1500
									})
								}
							}
						});
						//查询资金账户信息
						context.dispatch('checkAccount');
					}else if(location.pathname.indexOf('stopOrder') != -1){
						//止损单页面
						context.dispatch('checkStopLoss');
					}else if(location.pathname.indexOf('conditionOrder') != -1){
						//条件单页面
						context.dispatch('checkCondition');
					}
				}else{
					//交易登录失败
					context.state.tradeLoginStatus = 3;
				}
			}else if(message.Method == 'OnRspQryHoldTotal'){
				//查询持仓合计返回
				if(message.Parameters){
					var allCommodity = marketStore.state.allSubsCommodity;
					for(var i=0,length=allCommodity.length;i<length;i++){
						if(allCommodity[i].commodity_no == message.Parameters.CommodityNo){
							message.Parameters.contractNum = allCommodity[i].contract_size/allCommodity[i].mini_ticker_size;
							message.Parameters.mini_ticker_size = allCommodity[i].mini_ticker_size; //0.000004  
							message.Parameters.CommodityName = allCommodity[i].commodity_name;
							message.Parameters.CurrencyNo = allCommodity[i].currency_no;
							if(allCommodity[i].commodity_no==message.Parameters.CommodityNo&&allCommodity[i].quatoData){
								if(message.Parameters.Direction == 0){
									//买多
									message.Parameters['floatProfit'] = ((allCommodity[i].quatoData[3]-message.Parameters.HoldAvgPrice)*message.Parameters.HoldNum*message.Parameters.contractNum).toFixed(0);
								}else{
									//卖空
									message.Parameters['floatProfit'] = ((message.Parameters.HoldAvgPrice-allCommodity[i].quatoData[3])*message.Parameters.HoldNum*message.Parameters.contractNum).toFixed(0);
								}
							}else{
								message.Parameters.floatProfit = 0;
							}
						}
					}
					for(var i=0;i<marketStore.state.currencyRate.length;i++){
						if(marketStore.state.currencyRate[i].currencyNo == message.Parameters.CurrencyNo){
							message.Parameters.currencyRate = marketStore.state.currencyRate[i].exchangeRate;
							break;
						}
					}
					marketStore.state.totalFloatProfit = marketStore.state.totalFloatProfit+message.Parameters.floatProfit*message.Parameters.currencyRate;
					context.state.totalPositionNum += message.Parameters.HoldNum;
					context.state.positionList.push(message.Parameters);
					if(marketStore.state.subscribeContract.length>0&&marketStore.state.subscribeContract.indexOf(message.Parameters.CommodityNo) == -1){
						//订阅没有订阅的持仓合约
						marketStore.state.subscribeContract.push(message.Parameters.CommodityNo);
						marketStore.dispatch('subscribeOneContract');
					}
				}
			}else if(message.Method == 'OnRspQryAccount'){
				//查询资金账户回复
				if(message.Parameters){
					message.Parameters.floatProfit = 0;
					if(message.Parameters.CurrencyNo == 'USD'){
						context.state.capitalList.unshift(message.Parameters);
					}else{
						context.state.capitalList.push(message.Parameters);
					}
					context.state.rateList[message.Parameters.CurrencyNo] = message.Parameters.CurrencyRate;
					localStorage.setItem('rateList',JSON.stringify(context.state.rateList));
					context.state.totalBalance+=message.Parameters.TodayAmount*message.Parameters.CurrencyRate;
					context.state.todayCanUseBalance+=(message.Parameters.TodayAmount-message.Parameters.FrozenMoney-message.Parameters.Deposit)*message.Parameters.CurrencyRate;
					context.state.deposit+=message.Parameters.Deposit*message.Parameters.CurrencyRate;
				}
			}else if(message.Method == 'OnRtnHoldTotal'){
				//处理暂存列表
				var orderInsertList = context.state.orderInsertList;
				for(var i=0,length=orderInsertList.length;i<length;i++){
					if(orderInsertList[i].OrderID == message.Parameters.OrderID){
						context.state.orderInsertList.splice(i,1);
						break;
					}
				}
				//持仓变化通知
				var allCommodity = marketStore.state.allSubsCommodity.slice(0);
				for(var i=0,length=allCommodity.length;i<length;i++){
					if(allCommodity[i].commodity_no == message.Parameters.CommodityNo){
						message.Parameters.contractNum = allCommodity[i].contract_size/allCommodity[i].mini_ticker_size;
						message.Parameters.mini_ticker_size = allCommodity[i].mini_ticker_size;
						message.Parameters.CommodityName = allCommodity[i].commodity_name;
						message.Parameters.CurrencyNo = allCommodity[i].currency_no;
						if(context.state.chooseContract&&context.state.chooseContract.commodity_no==message.Parameters.CommodityNo){
							if(message.Parameters.Direction == 0){
								//买多
								message.Parameters['floatProfit'] = ((marketStore.state.LastData[3]-message.Parameters.HoldAvgPrice)*message.Parameters.HoldNum*message.Parameters.contractNum).toFixed(0);
							}else{
								//卖空
								message.Parameters['floatProfit'] = ((message.Parameters.HoldAvgPrice-marketStore.state.LastData[3])*message.Parameters.HoldNum*message.Parameters.contractNum).toFixed(0);
							}
						}else{
							message.Parameters.floatProfit = 0;
						}
					}
				}
				var positionList = context.state.positionList;
				if(positionList.length == 0){
					for(var j=0;j<marketStore.state.currencyRate.length;j++){
						if(marketStore.state.currencyRate[j].currencyNo == message.Parameters.CurrencyNo){
							message.Parameters['currencyRate'] = marketStore.state.currencyRate[j].exchangeRate;
							break;
						}
					}
					context.state.positionList.push(message.Parameters);
				}else{
					for(var i=0,length=positionList.length;i<length;i++){
						if(positionList[i].CommodityNo == message.Parameters.CommodityNo){
							if(message.Parameters.HoldNum > 0){
								for(var j=0;j<marketStore.state.currencyRate.length;j++){
									if(marketStore.state.currencyRate[j].currencyNo == message.Parameters.CurrencyNo){
										message.Parameters['currencyRate'] = marketStore.state.currencyRate[j].exchangeRate;
										break;
									}
								}
								context.state.positionList.splice(i,1,message.Parameters);
							}else{
								context.state.positionList.splice(i,1);
							}
							break;
						}
						if(i==length-1){
							for(var j=0;j<marketStore.state.currencyRate.length;j++){
								if(marketStore.state.currencyRate[j].currencyNo == message.Parameters.CurrencyNo){
									message.Parameters['currencyRate'] = marketStore.state.currencyRate[j].exchangeRate;
									break;
								}
							}
							context.state.positionList.push(message.Parameters);
						}
					}
				}
				context.state.totalPositionNum = 0;
				for(var i=0,length=positionList.length;i<length;i++){
					context.state.totalPositionNum+=positionList[i].HoldNum;
				}
			}else if(message.Method == 'OnRspQryOrder'){
				//查询所有订单
				var allCommodity = marketStore.state.allCommodity;
				for(var i=0,length=allCommodity.length;i<length;i++){
					if(message.Parameters&&allCommodity[i].commodity_no == message.Parameters.CommodityNo){
						message.Parameters.contractNum = allCommodity[i].contract_size/allCommodity[i].mini_ticker_size;
						message.Parameters.mini_ticker_size = allCommodity[i].mini_ticker_size;
						message.Parameters.CommodityName = allCommodity[i].commodity_name;
						message.Parameters.CurrencyNo = allCommodity[i].currency_no;
					}
				}
				if(message.Parameters){
					context.state.allOrderList.push(message.Parameters);
				}
				if(message.Parameters&&message.Parameters.OrderStatus == 1&&message.Parameters.OrderPriceType == 0){
					context.state.templeList.push(message.Parameters);
				}
			}else if(message.Method == 'OnRspOrderInsert'){
				//报单录入请求回复
				var allCommodity = marketStore.state.allCommodity;
				for(var i=0,length=allCommodity.length;i<length;i++){
					if(allCommodity[i].commodity_no == message.Parameters.CommodityNo){
						message.Parameters.contractNum = allCommodity[i].contract_size/allCommodity[i].mini_ticker_size;
						message.Parameters.mini_ticker_size = allCommodity[i].mini_ticker_size;
						message.Parameters.CommodityName = allCommodity[i].commodity_name;
						message.Parameters.CurrencyNo = allCommodity[i].currency_no;
					}
				}
				if(message.Parameters.OrderStatus ==0||message.Parameters.OrderStatus ==1){
					//已提交 排队中
					context.state.orderInsertList.push(message.Parameters);
					context.state.templeList.unshift(message.Parameters);
				}else if(message.Parameters.OrderStatus ==2){
					//部分成交
				}else if(message.Parameters.OrderStatus ==3){
					//完成成交
				}else if(message.Parameters.OrderStatus ==4){
					//已撤单
				}else if(message.Parameters.OrderStatus ==5||message.Parameters.OrderStatus ==6){
					//下单失败 未知
				}
				context.state.allOrderList.unshift(message.Parameters);
				if(message.Parameters.OpenCloseType == 2){
					//平仓
					setTimeout(function(){
						context.commit('checkActivity');
					},1000)
				}
				context.dispatch('showMessageTip',message.Parameters);
			}else if(message.Method == 'OnRtnOrderTraded'){
				//订单成交通知
				//处理挂单
				var templeList = context.state.templeList;
				for(var i=0,length=templeList.length;i<length;i++){
					if(templeList[i].OrderID == message.Parameters.OrderID){
						context.state.templeList.splice(i,1);
						break;
					}
				}
				//处理暂存列表
				var orderInsertList = context.state.orderInsertList;
				for(var i=0,length=orderInsertList.length;i<length;i++){
					if(orderInsertList[i].OrderID == message.Parameters.OrderID){
						context.state.orderInsertList.splice(i,1);
						break;
					}
				}
			}else if(message.Method == 'OnRtnOrderState'){
				//委托状态变化通知
				var allCommodity = marketStore.state.allCommodity;
				for(var i=0,length=allCommodity.length;i<length;i++){
					if(allCommodity[i].commodity_no == message.Parameters.CommodityNo){
						message.Parameters.contractNum = allCommodity[i].contract_size/allCommodity[i].mini_ticker_size;
						message.Parameters.mini_ticker_size = allCommodity[i].mini_ticker_size;
						message.Parameters.CommodityName = allCommodity[i].commodity_name;
						message.Parameters.CurrencyNo = allCommodity[i].currency_no;
					}
				}
				if(message.Parameters.OrderStatus ==0||message.Parameters.OrderStatus ==1){
					//已提交 排队中
					var templeList = context.state.templeList;
					for(var i=0,length=templeList.length;i<length;i++){
						if(message.Parameters.OrderID == templeList[i].OrderID){
							context.state.templeList.splice(i,1,message.Parameters);
							break;
						}
					}
				}else if(message.Parameters.OrderStatus ==2){
					//部分成交
				}else if(message.Parameters.OrderStatus ==3){
					//完成成交
				}else if(message.Parameters.OrderStatus ==4){
					//已撤单
					var templeList = context.state.templeList;
					for(var i=0,length=templeList.length;i<length;i++){
						if(message.Parameters.OrderID == templeList[i].OrderID){
							context.state.templeList.splice(i,1);
							break;
						}
					}
				}else if(message.Parameters.OrderStatus ==5||message.Parameters.OrderStatus ==6){
					//下单失败 未知
				}
				//更新全部订单
				var allOrderList = context.state.allOrderList;
				for(var i=0,length=allOrderList.length;i<length;i++){
					if(allOrderList[i].OrderID == message.Parameters.OrderID){
						allOrderList[i].contractNum = message.Parameters.contractNum;
						allOrderList[i].CommodityName = message.Parameters.CommodityName;
						allOrderList[i].CurrencyNo = message.Parameters.CurrencyNo;
						allOrderList[i].TradeNum = message.Parameters.TradeNum;
						allOrderList[i].TradePrice = message.Parameters.TradePrice;
						allOrderList[i].TradeFee = message.Parameters.TradeFee;
						allOrderList[i].OrderStatus = message.Parameters.OrderStatus;
						allOrderList[i].StatusMsg = message.Parameters.StatusMsg;
						allOrderList[i].Drection = message.Parameters.Drection
						break;
					}
				}
				context.state.allOrderList = allOrderList.slice(0);
				context.dispatch('showMessageTip',message.Parameters);
			}else if(message.Method == 'OnRtnMoney'){
				//资金变化通知
				if(message.Parameters){
					var capitalList = context.state.capitalList.slice(0);
					for(var i=0,length=capitalList.length;i<length;i++){
						if(capitalList[i].CurrencyNo == message.Parameters.CurrencyNo){
							message.Parameters.CurrencyRate = capitalList[i].CurrencyRate;
							capitalList.splice(i,1,message.Parameters);
							break;
						}
					}
					var totalBalance = 0;
					var todayCanUseBalance = 0;
					var deposit = 0;
					for(var i=0,length=capitalList.length;i<length;i++){
						totalBalance+=capitalList[i].TodayAmount*capitalList[i].CurrencyRate;
						todayCanUseBalance+=(capitalList[i].TodayAmount-capitalList[i].FrozenMoney-capitalList[i].Deposit)*capitalList[i].CurrencyRate;
						deposit+=capitalList[i].Deposit*capitalList[i].CurrencyRate;
					}
					context.state.totalBalance = totalBalance;
					context.state.todayCanUseBalance = todayCanUseBalance;
					context.state.deposit = deposit;
					context.state.capitalList = capitalList.slice(0);
				}
			}else if(message.Method == 'OnRspInsertStopLoss'){
				//插入止损单返回
				context.dispatch('showMessageTip',message.Parameters);
			}else if(message.Method == 'OnRspQryStopLoss'){
				//查询止损单返回
				if(message.Parameters){
					switch(message.Parameters.StopLossType){
						case 0:message.Parameters.StopLossTypeName='止损';break;
						case 1:message.Parameters.StopLossTypeName='止盈';break;
						case 2:message.Parameters.StopLossTypeName='止损+止盈';break;
						case 3:message.Parameters.StopLossTypeName='浮动止损';break;
						case 4:message.Parameters.StopLossTypeName='不设置止损';break;
					}
					context.state.stopLossList.unshift(message.Parameters);
					if(marketStore.state.subscribeContract.indexOf(message.Parameters.CommodityNo) == -1){
						//订阅没有订阅的止损单合约
						marketStore.state.subscribeContract.push(message.Parameters.CommodityNo);
						marketStore.dispatch('subscribeOneContract');
					}
				}
			}else if(message.Method == 'OnRtnStopLossState'){
				//止损单状态改变通知
				if(message.Parameters.Status == 0){
					//运行中
				}else if(message.Parameters.Status == 1){
					//暂停
				}else if(message.Parameters.Status == 2){
					//已触发
				}else if(message.Parameters.Status == 3){
					//已取消
				}else if(message.Parameters.Status == 4){
					//插入失败
				}else if(message.Parameters.Status == 5){
					//触发失败
				}
				switch(message.Parameters.StopLossType){
					case 0:message.Parameters.StopLossTypeName='止损';break;
					case 1:message.Parameters.StopLossTypeName='止盈';break;
					case 2:message.Parameters.StopLossTypeName='止损+止盈';break;
					case 3:message.Parameters.StopLossTypeName='浮动止损';break;
					case 4:message.Parameters.StopLossTypeName='不设置止损';break;
				}
				var stopLossList = context.state.stopLossList;
				for(var i=0,length=stopLossList.length;i<length;i++){
					if(stopLossList[i].StopLossNo == message.Parameters.StopLossNo){
						context.state.stopLossList.splice(i,1,message.Parameters);
						break;
					}
				}
				context.dispatch('showMessageTip',message.Parameters);
			}else if(message.Method == 'OnRspQryCondition'){
				//查询条件单返回
				if(message.Parameters){
					var allCommodity = marketStore.state.allCommodity;
					for(var i=0,length=allCommodity.length;i<length;i++){
						if(allCommodity[i].commodity_no == message.Parameters.CommodityNo){
							message.Parameters.CommodityName = allCommodity[i].commodity_name;
						}
					}
					context.state.conditionList.unshift(message.Parameters);
				}
			}else if(message.Method == 'OnRspInsertCondition'){
				//插入条件单返回
				if(message.Parameters.Status == 0){
					//运行中
					context.state.conditionList.unshift(message.Parameters);
				}else if(message.Parameters.Status == 1){
					//暂停
				}else if(message.Parameters.Status == 2){
					//已触发
				}else if(message.Parameters.Status == 3){
					//已取消
				}else if(message.Parameters.Status == 4){
					//插入失败
				}else if(message.Parameters.Status == 5){
					//触发失败
				}
				context.dispatch('showMessageTip',message.Parameters);
			}else if(message.Method == 'OnRtnConditionState'){
				//条件单状态变化推送
				var conditionList = context.state.conditionList;
				for(var i=0,length=conditionList.length;i<length;i++){
					if(conditionList[i].ConditionNo == message.Parameters.ConditionNo){
						context.state.conditionList.splice(i,1,message.Parameters);
					}
				}
				context.dispatch('showMessageTip',message.Parameters);
			}else if(message.Method == 'OnError'){
				layer.msg(message.Parameters.Message,{
					time:2000
				});
			}else if(message.Method == 'OnError'){
				layer.msg(message.Parameters.Message,{
					time:2000
				});
			}else if(message.Method == 'OnRtnHeartBeat'){
				if(context.state.tradeLoginStatus!=3){
					context.commit('reset');
				}
			}
		},
		//查询订单
		checkOrder(context){
			method = 'QryOrder';
			params = {
				ClientNo:context.state.tradeConfig.ClientNo
			}
			context.dispatch('sendWS',{method,params});
		},
		//查询持仓
		checkPosition(context){
			var method = 'QryHoldTotal';
			params = {
				ClientNo:context.state.tradeConfig.ClientNo
			}
			context.dispatch('sendWS',{method,params});
		},
		//查询账户资金
		checkAccount(context){
			var method = 'QryAccount';
			params = {
				ClientNo:context.state.tradeConfig.ClientNo
			}
			context.dispatch('sendWS',{method,params});
		},
		//查询止损单
		checkStopLoss(context){
			var method = 'QryStopLoss';
			params = {
				ClientNo:context.state.tradeConfig.ClientNo
			}
			context.dispatch('sendWS',{method,params});
		},
		//查询条件单
		checkCondition(context){
			var method = 'QryCondition';
			params = {
				ClientNo:context.state.tradeConfig.ClientNo
			}
			context.dispatch('sendWS',{method,params});
		},
		//显示提示
		showMessageTip(context,parameter){
			var message = '';
			if(parameter.StopLossPrice||parameter.StopLossPrice==0){
				//止损止盈
				if(parameter.Status == 0&&parameter.StopLossType == 0){
					message = '设置限价止损成功';
				}else if(parameter.Status == 0&&parameter.StopLossType == 1){
					message = '设置限价止盈成功';
				}else if(parameter.Status == 0&&parameter.StopLossType == 2){
					message = '设置浮动止损成功';
				}else{
					if(parameter.Status == 0){
						message='已开启';
					}else if(parameter.Status == 1){
						message='已暂停';
					}else if(parameter.Status == 2){
						message='已触发';
					}else if(parameter.Status == 3){
						if(parameter.StatusMsg=='无对应持仓, 失效删除'){
							return;
						}
						message=(parameter.StopLossType==0||parameter.StopLossType==2?'止损单':'止盈单')+'已取消';
					}else{
						message = parameter.StatusMsg;
					}
				}
			}else if(parameter.ConditionType||parameter.ConditionType==0){
				//条件单
				if(parameter.Status == 0&&parameter.ConditionType == 0){
					message = '设置价格条件单成功';
				}else if(parameter.Status == 0&&parameter.ConditionType == 1){
					message = '设置时间条件单成功';
				}else{
					if(parameter.Status == 0){
						message='已开启';
					}else if(parameter.Status == 1){
						message='已暂停';
					}else if(parameter.Status == 2){
						message='已触发';
					}else if(parameter.Status == 3){
						message='已取消';
					}else if(parameter.Status == 4){
						message = parameter.StatusMsg;
					}else{
						message = parameter.StatusMsg;
					}
				}
			}else{
				//仓位
				if(parameter.OrderStatus == 1){
					message = `[${parameter.CommodityName}${parameter.ContractNo}],价格[${parameter.OrderPrice}],手数[${parameter.OrderNum}],方向[${parameter.Drection==0?'买':'卖'}]</br>挂单成功`;;
				}else if(parameter.OrderStatus == 2||parameter.OrderStatus == 3){
					message = `[${parameter.CommodityName}${parameter.ContractNo}],价格[${parameter.TradePrice}],手数[${parameter.OrderNum}],方向[${parameter.Drection==0?'买':'卖'}]</br>提交订单成功`;
				}else if(parameter.OrderStatus == 4){
					message = '撤单成功';
				}else if(parameter.StatusMsg == '余额不足'){
					if(context.state.tradeType == 0){
						layer.msg('余额不足，请领取模拟金',{
							time:1500
						});
					}else{
						if(document.getElementById('balanceInfoLayer')){
							layer.open({
								type:1,
								content:$('#balanceInfoLayer'),
								area:['7.3rem','6rem'],
								shadeClose:true,
								title:null,
								closeBtn:0,
							})
						}
					}
					return;
				}else{
					message = parameter.StatusMsg;
				}
			}
			layer.msg(message,{
				time:2000
			})
		},
		//发送WS
		sendWS(context,{method,params,req_id}){
			var Param = {
				Method:method,
				req_id:req_id,
				Parameters:params
			}
			if(context.state.isTradeLogin){
				context.state.tradeSocket.send(JSON.stringify(Param));
			}
		}
		
	}
})
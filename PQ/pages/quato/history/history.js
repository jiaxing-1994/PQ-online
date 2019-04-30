var history = new Vue({
	el:'#history',
	data:{
		dateIndex:0,//1 一天内 2 一周内 3 一月内
		beginTime:'',//搜索开始时间
		endTime:'', //搜索结束时间
		pageNo:1, 
		pageSize:20,
		userInfo:userInfo, //用户信息
		dtPicker:null, //时间选择器
		historyList:[], //历史数据
		allContract:[], //所有合约数据 用户翻译合约代码
		rateList:{}, //汇率数据
		RMBRate:1, //人民币汇率
		pullRefreshStatus:-1,//0到达底部 1达到刷新条件 2数据请求中 3没有更多数据
		waitTime:1000,
		isCanRequest:true,//是否可以获取数据
	},
	mounted(){
		if(!isLogin){
			this.backBtn();
		}
		layui.use('layer', function(){
			var layer = layui.layer;
		});
		this.dtPicker = new mui.DtPicker({
			type:'datetime'
		});
		mui.init();
		this.allContract = JSON.parse(localStorage.getItem('allContract'));
		if(localStorage.getItem('rateList')){
			this.rateList = JSON.parse(localStorage.getItem('rateList'));
			this.RMBRate = this.rateList.CNY;
		}else{
			this.getRate();
		}
		if(GetURLParam()){
			urlParams = GetURLParam();//获取url参数
		}
		this.initScroll(1);
		this.chooseDate(1);
	},
	methods:{
		//获取汇率
		getRate(){
			request.post('/qryRates')
			.then((res)=>{
				console.log(res);
				if(res.success&res.code == '010'){
					var list = res.data;
					for(var i=0;i<list.length;i++){
						this.rateList[list[i].currencyNo] = list[i].exchangeRate;
					}
					localStorage.setItem('rateList',JSON.stringify(this.rateList));
					this.RMBRate = this.rateList.CNY;
				}else{
					layer.msg(res.message,{
						time:1500
					})
				}
			}).catch((err)=>{
				
			})
		},
		//上拉刷新
		pullUpLoading(){
			this.pullRefreshStatus = 2;
			this.pageNo++;
			if(this.beginTime == ''){
				layer.msg('请选择开始时间',{
					time:1500,
				});
			}else if(this.endTime == ''){
				layer.msg('请选择结束时间',{
					time:1500,
				});
			}else{
				request.post('/transactionRecords',{
					beginTime:this.beginTime+':00',
					endTime:this.endTime+':59',
					pageNo:this.pageNo,
					pageSize:this.pageSize,
					urlType:tradeType==1?'050':'040'
				},{
					token:this.userInfo.token,
					secret:this.userInfo.secret,
				}).then((res)=>{
					if(res.success&&res.code == '010'){
						var list = res.data.list;
						if(list.length>0){
							for(var i=0,len=list.length;i<len;i++){
								list[i].rate = this.rateList[list[i].currency];
								for(var j=0,len2=this.allContract.length;j<len2;j++){
									if(list[i].contractCode == this.allContract[j].contractCode){
										list[i].contractName = this.allContract[j].contractName;
										break;
									}
								}
							}
							setTimeout(function(){
								this.historyList = this.historyList.concat(list);
								this.pullRefreshStatus = -1;
							}.bind(this),500);
						}else{
							this.pullRefreshStatus = 3;
						}
					}
				}).catch(function(err){
					console.log(err);
				})
			}
		},
		//返回按钮
		backBtn(){
			if(!mui.os.plus){
				var params = {};
				if(urlParams.tradeTabIndex){
					params.tradeTabIndex = Number(urlParams.tradeTabIndex);
				}
				backRoute({
					params:params,
				});
				return;
			}
			mui.back();
		},
		//初始化滚动
		initScroll(i){
			var tabNav = mui('#tab'+i+'-nav').scroll({
				scrollY:false,
				scrollX:false,
				indicators:false,
				bounce:false,
			});
			var tabList = mui('#tab'+i+'-list').scroll({
				scrollY:true,
				scrollX:true,
				indicators:false,
				bounce:true,
			});
			var _this = this;
			var a = document.getElementById('tab1-list').clientHeight;
			document.querySelector('#tab'+i+'-list' ).addEventListener('scroll', function (e) { 
				mui('#tab'+i+'-nav').scroll().scrollTo(tabList.x,0);
				if(e.target.scrollHeight>a&&_this.pullRefreshStatus != 2&&_this.pullRefreshStatus != 3){
					var bottom = a-e.target.scrollHeight;
					if(bottom - tabList.y>=0){
						_this.pullRefreshStatus = 0;
						if(bottom - tabList.y>50){
							_this.pullRefreshStatus = 1;
						}
					}
				}
			});
			document.querySelector('#tab'+i+'-list' ).addEventListener('touchend', function (e) { 
				if(_this.pullRefreshStatus == 1){
					_this.pullUpLoading();
				}else if(_this.pullRefreshStatus != 2&&_this.pullRefreshStatus != 3){
					_this.pullRefreshStatus = -1;
				}
				console.log(_this.pullRefreshStatus);
			});
		},
		//选择时间
		chooseDate(index){
			if(!this.isCanRequest){
				return;
			}
			this.isCanRequest = false;
			setTimeout(function(){
				this.isCanRequest = true;
			}.bind(this),this.waitTime);
			
			if(this.dateIndex == index){
				return;
			};
			this.dateIndex = index;
			var nowDate = new Date().getTime();
			this.endTime = getFormalDate(nowDate,'yyyy/mm/dd hh:mm');
			if(index == 1){
				//一天内
				var endDate = nowDate-1000*60*60*24*1;
				this.beginTime = getFormalDate(endDate,'yyyy/mm/dd hh:mm');
			}else if(index == 2){
				//一周内
				var endDate = nowDate-1000*60*60*24*7;
				this.beginTime = getFormalDate(endDate,'yyyy/mm/dd hh:mm');
			}else if(index == 3){
				//一月内
				var endDate = nowDate-1000*60*60*24*30;
				this.beginTime = getFormalDate(endDate,'yyyy/mm/dd hh:mm');
			}
			this.historyList = [];
			this.search();
		},
		chooseTime(index){
			
			var _this = this;
			this.dtPicker.show(function(e){
				if(index == 1){
					//开始时间
					this.beginTime = e.text;
				}else if(index == 2){
					//结束时间
					this.endTime = e.text;
				}
			}.bind(this));
		},
		confirmSearch(){
			if(!this.isCanRequest){
				return;
			}
			setTimeout(function(){
				this.isCanRequest = true;
			}.bind(this),this.waitTime);
			this.historyList = [];
			this.search();
		},
		//开始搜索
		search(){
			this.pageNo = 1;
			this.pullRefreshStatus = -1;
			mui('#tab1-list').scroll().scrollTo(0,0);
			if(this.beginTime == ''){
				layer.msg('请选择开始时间',{
					time:1500,
				});
			}else if(this.endTime == ''){
				layer.msg('请选择结束时间',{
					time:1500,
				});
			}else{
				request.post('/transactionRecords',{
					beginTime:this.beginTime+':00',
					endTime:this.endTime+':59',
					pageNo:this.pageNo,
					pageSize:this.pageSize,
					urlType:tradeType==1?'050':'040'
				},{
					token:this.userInfo.token,
					secret:this.userInfo.secret,
				},6000).then((res)=>{
					if(res.success&&res.code == '010'){
						var list = res.data.list;
						console.log(this.rateList);
						for(var i=0,len=list.length;i<len;i++){
							list[i].rate = this.rateList[list[i].currency];
							for(var j=0,len2=this.allContract.length;j<len2;j++){
								if(list[i].contractCode == this.allContract[j].contractCode){
									list[i].contractName = this.allContract[j].contractName;
									break;
								}
							}
						}
						this.historyList = this.historyList.concat(list);
					}else{
						layer.msg(res.message,{
							time:1500
						})
					}
				}).catch(function(err){
					console.log(err);
				})
			}
		}
	}
})
var contractRule = new Vue({
	el:'#contractRule',
	data:{
		staticList:[
			{
				title:'什么是保证金？',
				content:[
					'参与期货交易，交易者只需按期货合约价格的一定比率，交纳少量资金作为履行期货合约的财力担保，便可参与期货合约的买卖，这种资金就是期货保证金。您可简单理解为买卖期货要交的“本金”，如国际原油需要300美金保证金，则表示您需要至少2000人民币才可交易1手。',
				]
			},
			{
				title:'在交易时间外是否可持仓？',
				content:[
					'请注意，非交易时间不可进行持仓，交易暂不支持持仓隔夜。',
					'系统将在交易结束时间前5分钟进行强制平仓，请注意管理好您的持仓。'
				]
			},
			{
				title:'什么是买涨？',
				content:[
					'当您买涨时，价格涨了你就赚钱，跌了亏钱。',
				]
			},
			{
				title:'什么是买跌？',
				content:[
					'当您买跌时，价格跌了你就赚钱，涨了亏钱。',
				]
			},
			{
				title:'什么是止盈单？',
				content:[
					'当单笔交易盈利金额大于等于设定的止盈金额时，该笔交易会被按市价自动强制平仓。',
					'由于市场价格在实时变动，不保证最终盈利金额与止盈金额一致，有可能小于设置的止盈金额。'
				]
			},
			{
				title:'什么是止损单？',
				content:[
					'当单笔交易亏损金额大于等于指定的止损金额时，该笔交易会被按市价自动强制平仓。',
					'由于市场价格的实时变动，不保证最终亏损金额与止损金额一致，有可能大于设置的止损金额。'
				]
			},
			{
				title:'什么是时间条件单？',
				content:[
					'即预先设置某一价位（开仓或平仓），一旦触及该价格，系统自动提交您的委托，从而实现自动委托。',
					'保存于客户设备本地，当行情满足客户设定的条件，软件自动触发委托。注意：关机或者退出软件会导致条件单失效。'
				]
			},
			{
				title:'什么是价格条件单？',
				content:[
					'即预先设置某一价位（开仓或平仓），一旦触及该价格，系统自动提交您的委托，从而实现自动委托。',
					'保存于客户设备本地，当行情满足客户设定的条件，软件自动触发委托。注意：关机或者退出软件会导致条件单失效。'
				]
			},
			{
				title:'什么是持仓时间？',
				content:[
					'国际原油最后持仓时间：04:55:00；当持仓时间到点后，持仓中的交易会被强制平仓，不保证成交价格，请务必在到期前自己选择卖出。',
				]
			},
			{
				title:'什么是强平线？',
				content:[
					'平台会根据交易所提提供的结果每天对您的盈亏状况进行结算，当您的账户余额达到设置的强平线时，系统将会把账户中的持仓合约强平掉，撤销掉所有挂单合约，并冻结账户。',
					'所以您在交易时，要时刻注意自己的资金状况。'
				]
			},
			{
				title:'什么是风险度？',
				content:[
					'风险度越高标志着您距离被强平的越近，所以您在交易时，要时刻注意自己的资金状况。',
					'所以当保证金不能在规定时间内补足，期货价格波动较大的话，您可能面临强行平仓风险。'
				]
			},
			{
				title:'涨跌幅限制',
				content:[
					'交易品种涨幅≥20%时禁止买跌，跌幅≥20%时禁止买涨。',
					'交易品种涨幅≥30%时持仓中买跌的交易全部强制平仓，跌幅≥30%时持仓中买涨的交易强制平仓。'
				]
			},
			{
				title:'履约保证金',
				content:[
					'履约保证金为您委托平台冻结用于履行交易亏损赔付义务的保证金。',
					'以冻结的履约保证金作为承担交易亏损赔付，但交易亏损可能超出保证金金额，超出部分的亏损全部由您承担，平台不承担交易亏损。',
					'合作交易结束后，根据清结算结果，如交易盈利，您冻结的履约保证金全额退还。',
					'如交易亏损，从冻结的履约保证金中，扣减您所应承担的亏损赔付额，扣减后余额退还。',
					'如亏损超出保证金，则直接在您账户余额中扣除。',
				]
			},
			{
				title:'盈利如何分配？',
				content:[
					'盈利100%归用户所有，平台不参与盈利分成。若用户亏损超出保证金，平台也不承担超出部分的亏损金额。',
				]
			},
			{
				title:'实盘交易下单',
				content:[
					'您的所有国际原油交易，全部经由平台的期货交易账户，下单到纽约商业交易所',
				]
			},
		],
		urlParams:{},
		rule:{},
	},
	mounted() {
		this.urlParams = GetURLParam();//获取url参数
		this.getRule();
		console.log(this.urlParams);
		mui('.contractRule-content').scroll();
	},
	methods:{
		//返回按钮
		backBtn(){
			if(!mui.os.plus){
				// alert(urlParams);
				backRoute({
					params:{
						tradeTabIndex:Number(this.urlParams.tradeTabIndex)
					},
				});
				return;
			}
			mui.back();
		},
		//获取规则
		getRule(){
			request.post('/contractDetails',{contractNo:this.urlParams.contractNo})
			.then(res=>{
				if(res.code == "010"){
					if(res.data.currencyNo == 'USD'){
						res.data.currencyName = '美元';
					}else if(res.data.currencyNo == 'HKD-HKFE'){
						res.data.currencyName = '港币';
					}else if(res.data.currencyNo == 'JPY'){
						res.data.currencyName = '日元';
					}else if(res.data.currencyNo == 'CNY'){
						res.data.currencyName = '人民币';
					}else if(res.data.currencyNo == 'EUR'){
						res.data.currencyName = '欧元';
					}
					var tradeTimeArray = [];
					var obj = res.data.tradingTime.split('，');
					for(var i=0;i<obj.length;i++){
						var obj2 = {
							begin:'',
							end:'',
							today:true,
						};
						obj2.begin = obj[i].split('-')[0];
						obj2.end = obj[i].split('-')[1];
						if(Number(obj2.begin.split(':')[0])>=Number(obj2.end.split(':')[0])){
							obj2.today = false;
						}
						tradeTimeArray.push(obj2);
					}
					res.data.tradeTimeArray = tradeTimeArray;
					this.rule = res.data;
				}else{
					layer.msg(res.message,{
						time:1500
					})
				}
			}).catch(err=>{
				
			})
		}
	}
})
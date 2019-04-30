var risk = new Vue({
	el:'#riskNotice',
	data:{
		
	},
	mounted() {
		mui.init();
		mui('.risk-content').scroll();
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
	}
})
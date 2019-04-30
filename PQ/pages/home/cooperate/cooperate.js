var risk = new Vue({
	el:'#cooperate',
	data:{
		
	},
	mounted() {
		mui.init();
		mui('.cooperate-content').scroll();
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
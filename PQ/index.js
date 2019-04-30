var app = new Vue({
    el:'#app',
    data:{
        bannerList:[],
        imgHttp:imgHttp,
        slideNumber:-1,
    },
    mounted(){
        mui.init();
        this.getBanner();
    },
    methods:{
        goToHome(){
            if(this.slideNumber == this.bannerList.length){
                window.location.href='/PQ/pages/home/home.html';
                localStorage.setItem('isFirst',0);
            }
        },
        getBanner(){
			//banner数据
			request.post('/banner',{'type':'010'})
			.then((res)=>{
				if(res.success&&res.code == '010'){
					// banner
					var list = res.data;
					list.sort(function(a,b){
						return a.orderNo-b.orderNo;
					})
                    this.bannerList = list;
                    console.log(list);
                    var _this = this;
					this.$nextTick(function(){
                        var slider = mui("#slide");
                        slider.slider({
                            interval:0//自动轮播周期，若为0则不自动播放，默认为0；
                          });
                        // slider.slider().gotoItem(0);
                        document.querySelector('.mui-slider').addEventListener('slide', function(event) {
                            //注意slideNumber是从0开始的；
                            _this.slideNumber = event.detail.slideNumber+1;
                            console.log(_this.slideNumber)
                        });
					})
				}else{
					layer.msg(res.message,{
						time:1500
					})
				}
			}).catch(function(err){
				console.log(err);
;			})
        }

    }
})
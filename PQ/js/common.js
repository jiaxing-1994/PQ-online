//阻止浏览器默认事件
document.getElementsByTagName("body")[0].addEventListener('touchstart', function (e) {
    if (e.target.nodeName == 'INPUT' || e.target.nodeName == 'SELECT' || e.target.classList[0] == 'keyboard-item' || e.target.classList[0] == 'list-head' || e.target.classList[0] == 'list-count' || e.target.classList[0] == 'trade-list-li') {
        return;
    }
    e.preventDefault();
});

// var deviceWidth = document.getElementsByTagName('body')[0].clientWidth;
// document.getElementById('viewport').content = 'width='+deviceWidth+'px,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no';

//获取年月日
window.getNowFormatDate = function getNowFormatDate() {
    let date = new Date();
    let seperator1 = "/";
    let month = date.getMonth() + 1;
    let strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    let currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate;
    return currentdate;
}

//获取url参数
window.GetURLParam = function GetURLParam() {
    if (location.href.indexOf('?') == -1) {
        return false;
    }
    var url = decodeURI(decodeURI(location.href.split('?')[1])); //获取url中"?"符后的字串
    var theRequest = {};
    var strs = url.split("&");
    for (var i = 0; i < strs.length; i++) {
        theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
    }
    return theRequest;
}


//格式化时间
window.getFormalDate = function getFormalDate(time, type) {
    var a = new Date(time);
    var year = a.getFullYear();
    var month = a.getMonth() + 1;
    if (month < 10) {
        month = "0" + month;
    }
    var day = a.getDate();
    if (day < 10) {
        day = "0" + day;
    }
    var hour = a.getHours();
    if (hour < 10) {
        hour = "0" + hour;
    }
    var min = a.getMinutes();
    if (min < 10) {
        min = "0" + min;
    }
    var sec = a.getSeconds();
    if (sec < 10) {
        sec = "0" + sec;
    }
    var dateString = '';
    switch (type) {
        case 'yyyy/mm/dd hh:mm:ss':
            dateString = year + '/' + month + '/' + day + ' ' + hour + ':' + min + ':' + sec;
            break;
        case 'yyyy/mm/dd hh:mm':
            dateString = year + '/' + month + '/' + day + ' ' + hour + ':' + min;
            break;
        case 'yyyy/mm/dd hh':
            dateString = year + '/' + month + '/' + day + ' ' + hour;
            break;
        case 'yyyy/mm/dd':
            dateString = year + '/' + month + '/' + day;
            break;
        case 'hh:mm:ss':
            dateString = hour + ':' + min + ':' + sec;
            break;
        case 'hh:mm':
            dateString = hour + ':' + min;
            break;
        default:
            break;
    }
    ;
    return dateString;
}

//url参数
window.urlParams = {};

//用户信息
window.userInfo = {}; //用户信息
window.isLogin = false; //是否登录
//获取用户信息
(function getUseInfo() {
    if (localStorage.getItem('userInfo')) {
        userInfo = JSON.parse(localStorage.getItem('userInfo'));
        isLogin = true;
    } else {
        isLogin = false;
    }
})();

//判断模拟还是交易
window.tradeType = 1; //0模拟 1交易
(function getTradeType() {
    if (localStorage.getItem('tradeType')) {
        tradeType = localStorage.getItem('tradeType');
    } else {
        tradeType = 1;
    }
})();

//获取地址配置信息
window.address1 = [];//游客行情
window.address2 = [];//实盘行情
window.address3 = [];//历史行情
window.address4 = [];//模拟交易
window.address5 = [];//实盘交易

(function resizeLayer() {
    window.onresize = function () {
        setTimeout(function () {
            $(".layui-layer").css({
                "top": "50%",
                "left": "50%",
                "transform": "translate(-50%,-50%)"
            });
        }, 0);
    };
})();

//检测网络
window.isNetworkConnect = false;
// (function networkChange(){
// 	var EventUtil = {
// 　　　　addHandler: function (element, type, handler) {
// 　　　　　　if(element.addEventListener) { 
// 　　　　　　　　element.addEventListener(type, handler, false); 
// 　　　　　　}else if (element.attachEvent) {
// 　　　　　　　　element.attachEvent("on" + type, handler); 
// 　　　　　　}else { 
// 　　　　　　　　element["on" + type] = handler;
// 　　　　　　} 
// 　　　　}
// 　　 }; 
// 　　EventUtil.addHandler(window, "online", function () { alert("Online"); }); 
// 　　EventUtil.addHandler(window, "offline", function () { alert("Offline"); });
// })()



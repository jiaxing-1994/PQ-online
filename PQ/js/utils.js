window.PHONE_NUMBER_REG = new RegExp(/^[1][0-9]{10}$/);
window.CHARACTERS = new RegExp(/^[\u4e00-\u9fa5]+$/);
window.RESPONSE_CODE = {
    '010': "010",
    '070': "070"
};

window.loading = $(['<img class="request-loading" src="/PQ/static/js/layui/css/modules/layer/default/loading-1.gif">'].join(""));

// httpRquest = "http://192.168.0.132:8081";

/**
 010 ：请求成功返回
 100 ：请求频繁，请稍后重试
 400 ：请求处理失败，请检查请求参数
 401 ：身份认证失败，请求被拒绝
 403 ：请求来源异常，请求被拒绝
 500 ：系统异常，请联系管理员010 ：请求成功返回
 100 ：请求频繁，请稍后重试
 400 ：请求处理失败，请检查请求参数
 401 ：身份认证失败，请求被拒绝
 403 ：请求来源异常，请求被拒绝
 500 ：系统异常，请联系管理员
 分页起始页码为1，默认每页记录数为20
 */

const ApiUrl = {
    login: "/login",
    register: "/regist",
    imageCode: "/imageCode",
    freeCode: "/sendSms",
    checkCode: "/sendSecuritySms",
    customService: "/customerContacts",
    moneyDetail: "/capitalDetails",
    completeRecord: "/transactionRecords",
    checkUser: "/realnameAuth",
    bankCardList: "/addBankParams",
    addBankCard: "/addBank",
    deleteBankCard: "/deleteBank",
    getInitCash: "/withdrawParams",
    applyCash: "/withdraw",
    initRecharge: "/rechargeParams",
    recharge: "/getRechargeUrl",
    activityList: "/qryActivites",
    couponList: "/couponList",
    resetPassword: "/resetPassword",
    updatePassword: "/updatePassword",
    updatePhone: "/updateMobile",
    setCashPassword: "/setWithdrawPwd",
    banner: "/banner",
    urlConfig: "/urlConfig",
    rate: "/qryRates",
    useCoupon: "/useCoupon",
    shareDetail: "/shareDetails",
    shareProfit: "/shareProfitList",
    signDetail: "/qrySigninList",
    sign: "/signin",
    noticeList: "/noticeList",
    messageList: "/getCrawlerCalendar",
    calendar: "/getCrawler",
    setDefaultBank: "/setDefaultBank",
    balance: "/qryUserInfo",
    couponSort: "/couponSort"
};

window.filterInput = function filterInput(val) {
    // 这里过滤的是除了英文字母和数字的其他字符
    if (val)
		return val.replace(/[^A-z0-9]/, '');
    return "";
}

window.ajaxGet = function ajaxGet(action, fnSuccess, fnError) {
    let header = {};

    if (localStorage.getItem("token")) {
        header = {
            token: localStorage.getItem("token"),
            secret: localStorage.getItem("secret")
        }
    }
    request.get(action, {}, header)
        .then(response => {
            if ((response.code == "010" || response.code == "070") && response.success)
                fnSuccess(response);
            else
                fnError(response);
        }).catch(fnError);
}

window.ajaxPost = function ajaxPost(action, data, fnSuccess, fnError) {

    let header = {};

    if (localStorage.getItem("token")) {
        header = {
            token: localStorage.getItem("token"),
            secret: localStorage.getItem("secret")
        }
    }

    request.post(action, data, header, 10000).then(response => {
        if ((response.code == "010" || response.code == "070") && response.success)
            fnSuccess(response);
        else
            fnError(response);
    }).catch(err => {
        fnError && fnError();
        // layer.msg("网络连接失败，请稍后再试");
    });
}

/*
"mobile":"手机号" ,
"password":"密码",
"channel":"渠道代码",(非必传)
"code":"短信验证码"
"inviteCode":"邀请码"
 */
window.register = function register(data, fnSuccess, fnError) {
    ajaxPost(ApiUrl.register, data, fnSuccess, fnError);
}

/*
 "loginName":"登录名（手机号）" ,
 "password":"密码" ,
 "code":"图形验证码"(三次失败后，必传)
 */
window.login = function login(data, fnSuccess, fnError) {
    ajaxPost(ApiUrl.login, data, fnSuccess, fnError);
}

/**
 * phone:电话号码
 * type 010注册，020找回密码，030登录
 */

window.getImageCode = function getImageCode(phone, type) {
    return httpRquest + ApiUrl.imageCode + "?mobile=" + phone + "&type=" + type + "&t=" + Math.random() * 1000;
}

/*
"mobile":"手机号",
"type":"短信类型",010：注册短信 020：找回密码短信
"imgCode":"图形验证码"
 */
window.freeCode = function freeCode(data, fnSuccess, fnError) {
    ajaxPost(ApiUrl.freeCode, data, fnSuccess, fnError);
}

/*
"mobile": "手机号码" ,
"type": "短信类型"
 */
window.checkCode = function checkCode(data, fnSuccess, fnError) {
    ajaxPost(ApiUrl.checkCode, data, fnSuccess, fnError);
}

window.customService = function customService(fnSuccess, fnError) {
    ajaxPost(ApiUrl.customService, {}, fnSuccess, fnError);
}

window.moneyDetail = function moneyDetail(fnSuccess, fnError) {
    ajaxGet(ApiUrl.moneyDetail, fnSuccess, fnError);
}

window.completeRecord = function completeRecord(fnSuccess, fnError) {
    ajaxGet(ApiUrl.completeRecord, fnSuccess, fnError);
}

/*
"name":"姓名",
"card":"身份证号"
 */
window.checkUser = function checkUser(data, fnSuccess, fnError) {
    ajaxPost(ApiUrl.checkUser, data, fnSuccess, fnError);
}

window.bankCardList = function bankCardList(fnSuccess, fnError) {
    ajaxPost(ApiUrl.bankCardList, {}, fnSuccess, fnError);
}

/*
"bankId"：银行卡id,（修改时必传）
"bankCode":"银行代码",
"cardNum":"银行卡号",
"cityCode":"区域代码",
"address": "支行",
"realName":"持卡人姓名"
 */
window.updateBankCard = function updateBankCard(data, fnSuccess, fnError) {
    ajaxPost(ApiUrl.addBankCard, data, fnSuccess, fnError);
}

/*
"bankId":"银行卡id"
 */
window.deleteBankCard = function deleteBankCard(id, fnSuccess, fnError) {
    ajaxPost(ApiUrl.deleteBankCard, {bankId: id}, fnSuccess, fnError);
}

window.initCash = function initCash(fnSuccess, fnError) {
    ajaxPost(ApiUrl.getInitCash, {}, fnSuccess, fnError);
}

/*
"bankId":银行代码,
"money":申请提现金额,
"withdrawPwd":提现密码
"fee":手续费
 */
window.applyCash = function applyCash(data, fnSuccess, fnError) {
    ajaxPost(ApiUrl.applyCash, data, fnSuccess, fnError);
}

window.initRecharge = function initRecharge(fnSuccess, fnError) {
    ajaxPost(ApiUrl.initRecharge, {}, fnSuccess, fnError);
}

/*
"money":"充值金额"
 */
window.recharge = function recharge(fnSuccess, fnError) {
    ajaxPost(ApiUrl.recharge, {}, fnSuccess, fnError);
}

/*
"activityType":"活动类型"
 */
window.getActivityList = function getActivityList(data, fnSuccess, fnError) {
    ajaxPost(ApiUrl.activityList, data, fnSuccess, fnError);
}

/*
"activityId":"活动id",
"couponType":"优惠券类型",
"useStatus":"优惠券使用状态"
都是非必传
 */
window.getCouponList = function getCouponList(data, fnSuccess, fnError) {
    ajaxPost(ApiUrl.couponList, data, fnSuccess, fnError);
}

window.couponSort = function couponSort(data, fnSuccess, fnError) {
    ajaxPost(ApiUrl.couponSort, data, fnSuccess, fnError);
}

/*
"mobile":"手机号码",
"password":"密码",
"code":"手机验证码"
 */
window.resetPassword = function resetPassword(data, fnSuccess, fnError) {
    ajaxPost(ApiUrl.resetPassword, data, fnSuccess, fnError);
}

/*
"newPassword": "新密码",
"code":"验证码",
"oldPassword":"旧密码"
 */
window.updatePassword = function updatePassword(data, fnSuccess, fnError) {
    ajaxPost(ApiUrl.updatePassword, data, fnSuccess, fnError);
}

/*
"newMobile":"新手机号码" ,
"oldCode":"旧手机验证码" ,
"newCode":"新手机验证码"
 */
window.updatePhone = function updatePhone(data, fnSuccess, fnError) {
    ajaxPost(ApiUrl.updatePhone, data, fnSuccess, fnError);
}

/*
"password":"提现密码",
"code":"短信验证码",
 */
window.setCashPassword = function setCashPassword(data, fnSuccess, fnError) {
    ajaxPost(ApiUrl.setCashPassword, data, fnSuccess, fnError);
}

/*
"type":"banner类型" 010：引导页，020：首页，030：发现页
 */
window.getBanner = function getBanner(type, fnSuccess, fnError) {
    ajaxPost(ApiUrl.banner, {type: type}, fnSuccess, fnError);
}

window.getRate = function getRate(fnSuccess, fnError) {
    ajaxPost(ApiUrl.rate,"", fnSuccess, fnError);
}

/*
"couponId":"用户优惠券关联id "
 */
window.useCoupon = function useCoupon(data, fnSuccess, fnError) {
    ajaxPost(ApiUrl.useCoupon, data, fnSuccess, fnError);
}

window.shareDetail = function shareDetail(fnSuccess, fnError) {
    ajaxPost(ApiUrl.shareDetail, {}, fnSuccess, fnError);
}

/*
"beginDate":"查询开始时间",
"endDate":"查询结束时间"
"pageNo":"页码"
"pageSize":"每页记录数"
 */
window.shareProfit = function shareProfit(data, fnSuccess, fnError) {
    ajaxPost(ApiUrl.shareProfit, data, fnSuccess, fnError);
}

/*
"beginDate":"2019-03-03"
"endDate":"2019-03-30"
 */
window.signDetail= function signDetail(data, fnSuccess, fnError) {
    ajaxPost(ApiUrl.signDetail, data, fnSuccess, fnError);
}

/*
"signinDate":"2019-03-03"
 */
window.signIn = function signIn(data, fnSuccess, fnError) {
    ajaxPost(ApiUrl.sign, data, fnSuccess, fnError);
}

/*
"typeCode":"公告类型", 010：系统公告
"pageNo":"页码",
"pageSize":"每页记录数"
 */
window.getNotice = function getNotice(data, fnSuccess, fnError) {
    ajaxPost(ApiUrl.noticeList, data, fnSuccess, fnError);
}

/*
pageIndex: 开始页数索引
size: 每页显示的条数
startTime:开始时间（yyyy-MM-dd HH:mm:ss）
endTime:结束时间（yyyy-MM-dd HH:mm:ss）
country:国家（多个国家用,分开）
importance：重要性
 */
window.getCalendar = function getCalendar(data, fnSuccess, fnError) {
    ajaxPost(ApiUrl.messageList, data, fnSuccess, fnError);
}

/*
pageIndex：查看的页数
size：每页的条数
minTime：开始时间(yyyy-MM-dd HH:mm:ss)
maxTime：结束时间(yyyy-MM-dd HH:mm:ss)
keyword：关键字
 */
window.messageList = function messageList(data, fnSuccess, fnError) {
    ajaxPost(ApiUrl.calendar, data, fnSuccess, fnError);
}

/*
"bankId":"银行卡id"
 */
window.setDefaultBank = function setDefaultBank(data, fnSuccess, fnError) {
    ajaxPost(ApiUrl.setDefaultBank, data, fnSuccess, fnError);
}

window.getUserInfo = function getUserInfo(fnSuccess, fnError) {
    ajaxPost(ApiUrl.balance, "", fnSuccess, fnError);
}

//显示客服弹窗
window.showService = function showService() {
    var index = layer.open({
        type: 1,
        content: $('#customLayer'),
        area: ['8rem', '5.33rem'],
        shadeClose: true,
        title: false,
        closeBtn: 0
    });
}

//是否请求,是则加载loading动画
window.checkRequest = function checkRequest(e, fnSuccess) {
    var obj = $(e.currentTarget);
    var value = obj.html();
    if (CHARACTERS.test(value)) {
        obj.html("");
        obj.append(loading);
        fnSuccess(call);
    }

    function call() {
        obj.html(value);
        obj.remove(".request-loading");
    }
}

window.getCustom = function getCustom(fnSuccess) {
    request.post('/customerContacts').then(res => {
        if (res.success && res.code == '010') {
            localStorage.setItem('custom', JSON.stringify(res.data));
            fnSuccess(res.data);
        }
    }).catch(err => {
        var data = localStorage.getItem("custom");
        if (data) {
            fnSuccess(JSON.parse(data));
        }
    });
}


window.setCustomData = function setCustomData(data) {
    var img = "/PQ/static/img/custom/";
    var imgUrl = ["phone.png", "message.png", "qq.png", "wechat.png"];
    data.forEach(i => {
        if ((i.customerName).indexOf("电话") > -1) {
            i.imgUrl = img + imgUrl[0];
            i.type = 0;
			i.customerName = i.contactWay;
        } else if ((i.customerName).indexOf("在线") > -1) {
            i.imgUrl = img + imgUrl[1];
            i.type = 1;
        } else if ((i.customerName).indexOf("qq") > -1) {
            i.imgUrl = img + imgUrl[2];
            i.type = 2;
        } else if ((i.customerName).indexOf("微信") > -1) {
            i.imgUrl = img + imgUrl[3];
            i.type = 3;
        }
    });
    return data;
}



const bankPicker = new mui.PopPicker();
const provincePicker = new mui.PopPicker();
const cityPicker = new mui.PopPicker();
let bank = new Vue({
    el: "#bank",
    data: {
        form: {
            bankCode: "",
            cardNum: "",
            cityCode: "",
            address: "",
            realName: "",
            bankName: ""
        },
        bankList: [],
        supportList: [],
        provinceList: [],
        cityList: [],
        selectIndex: 0,
        bankName: "",
        cityName: "",
        provinceName: "",
        customContact: [],
        wxUrl:"",
        wxPic:""
    },
    watch: {
        'form.cardNum'(val) {
            this.$nextTick(() => {
                this.form.cardNum = filterInput(val);
            });
        }
    },
    mounted() {
        mui.init();
        mui(".mui-scroll-wrapper").scroll();
        layui.use(['layer'], () => {
            let layer = layui.layer;
            this.getData();
        });
        getCustom(res => {
            this.customContact = setCustomData(res);
            this.customContact.forEach(item=>{
                if(item.customerName == '微信客服'){
                    this.wxUrl = item.contactWay.split(",")[1];
                    this.wxPic = item.contactWay.split(",")[0];
                }
            });
        });
    },
    methods: {
        getData() {
            bankCardList(res => {
                this.changeProvinceData(res.data.provinceList);
                this.bankList = res.data.bankList ? res.data.bankList : [];
				this.form.realName = res.data.username ? res.data.username : "";
                bankPicker.setData(this.changeBankData(res.data.supportBankList));
            }, err => {
                err && layer.msg(err.message);
            });
        },
        changeBankData(data) {
            let arr = [];
            for (let i in data) {
                let obj = {};
                obj.text = data[i].bankName;
                obj.value = data[i].bankCode;
                arr.push(obj);
            }
            return arr;
        },
        changeProvinceData(data) {
            let arrP = [];
            for (let i in data) {
                let obj = {};
                obj.text = data[i].province;
                obj.value = i;
                arrP.push(obj);
                let arrC = [];
                for (let j in data[i].cityList) {
                    let city = {};
                    city.value = data[i].cityList[j].cityCode;
                    city.text = data[i].cityList[j].cityName;
                    arrC.push(city);
                }
                this.cityList.push(arrC);
            }
            this.provinceList = arrP;
            this.setDataList();
        },
        setDataList() {
            provincePicker.setData(this.provinceList);
            cityPicker.setData(this.cityList[this.selectIndex]);
        },
        selectBank() {
            bankPicker.show((item) => {
                this.bankName = item[0].text;
                this.form.bankCode = item[0].value;
            });
        },
        selectProvince() {
            provincePicker.show((item) => {
                this.selectIndex = item[0].value;
                this.provinceName = item[0].text;
                this.setDataList();
            });
        },
        selectCity() {
            cityPicker.show((item) => {
                this.cityName = item[0].text;
                this.form.cityCode = item[0].value;
            });
        },
        resetInit() {

        },
        addBank(e) {
            this.form.bankName = this.bankName;
			if(!/^(\d{16}|\d{19})$/.test(this.form.cardNum)){
				layer.msg("银行卡号填写错误");
				return;
			}
            checkRequest(e, call => {
                updateBankCard(this.form, res => {
                    layer.msg("添加银行卡成功");
                    for (let i in this.form)
                        this.form[i] = "";
                    this.cityName = "";
                    this.bankName = "";
                    this.provinceName = "";
                    this.getData();
                    call();
                }, err => {
                    call();
                    err && layer.msg(err.message);
                });
            });
        },
        deleteBank(item, index) {
            if (item.defaulted == "020") {
                layer.msg("默认银行卡，不能删除");
            } else {
                deleteBankCard(item.id, res => {
                    this.bankList.splice(index, 1);
                    layer.msg("删除成功");
                }, err => {
                    err && layer.msg(err.message);
                });
            }
        },
        setDef(item, index) {
            if (item.defaulted == "020") {
            } else {
                setDefaultBank({bankId: item.id}, res => {
                    this.bankList.forEach(i => {
                        i.defaulted = "010";
                    });
                    this.bankList[index].defaulted = "020";
                    layer.msg("默认银行卡设置成功");
                }, err => {
                    err && layer.msg(err.message);
                });
            }
        },
        back() {
            backRoute();
        },
        showService() {
            showService();
        },
        customService(data) {
            if (data.type == 0)
                window.location.href = 'tel://' + data.contactWay;
            else if (data.type == 3)
                this.wx = layer.open({
                    type: 1,
                    content: $('#wxLayer'),
                    area: ['8rem', '9rem'],
                    shadeClose: true,
                    shade: 0.5,
                    title: false,
                    closeBtn: 0
                });
            else
                window.location.href = data.contactWay;
        },
        openWX(){
            if (navigator.userAgent.match(/(iPhone|iPod|iPad);?/i)) { //区分iPhone设备
                var input = document.createElement("input");
                input.value = this.wxUrl;
                document.body.appendChild(input);
                input.select();
                input.setSelectionRange(0, input.value.length);
                document.execCommand('Copy');
                document.body.removeChild(input);
                layer.msg("复制成功");
            } else {
                var ele = document.getElementById("wxUrl");
                ele.select();
                document.execCommand("Copy");
                layer.msg("复制成功");
            }
            window.location.href = "weixin://";
        },
        hideWX(){
            layer.close(this.wx);
        }
    }
});

var list = [];
for(var i=0;i<24;i++){
	var _i=i;
	if(i<10){
		_i='0' + i;
	}else{
		_i= JSON.stringify(i);
	}
	var obj = {
		value:_i,
		text:_i+'时',
		children:[]
	};
	for(var j=0;j<60;j++){
		var _j=j;
		if(j<10){
			_j= '0' + j;
		}else{
			_j= JSON.stringify(j);
		}
		var obj2 = {
			value:_j,
			text:_j + '分',
		};
		obj.children.push(obj2);
	}
	list.push(obj);
}
var timeData = list;
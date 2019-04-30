
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
		text:_i+'点',
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
			children:[]
		};
		for(var z=0;z<60;z++){
			var _z=z;
			if(z<10){
				_z = '0'+z;
			}else{
				_z=JSON.stringify(z);
			}
			var obj3 = {
				value:_z,
				text:_z+'秒'
			}
			obj2.children.push(obj3);
		}
		obj.children.push(obj2);
	}
	list.push(obj);
}
window.timeData = list;
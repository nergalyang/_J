/*
@author Phil
@date 2017/4/20
@update 2017/4/21
*/
(function(factory) {
	//这部分参考backbone，定义全局变量root
	var root = (typeof self == 'object' && self.self === self && self) ||
	        (typeof global == 'object' && global.global === global && global);
	if (typeof define === 'function' && define.amd) {
		define(['jquery', 'exports'], function( $, exports) {
			 root._J = factory(root, exports, $);
	    });
	 } else if (typeof exports !== 'undefined') {
	    var $;
	    try { $ = require('jquery'); } catch (e) {}
	    factory(root, exports, $);
    } else {
    	root._J = factory(root, {}, (root.jQuery || root.Zepto || root.ender || root.$));
 	}
})(function(root, _J, $){
	//正式开始啦,返回this，能实现链式调用
	var previous_J = root._J;

	_J.version = '1.0.0';

	//出让_J，改名的话就var JJ = _J.noConflict();
	_J.noConflict = function() {
		root._J = previous_J;
		return this;
	};
	//创建命名空间
	_J.namespace = function (str) {
		var arr = str.split('.'),
			parent = _J,
			i,len;
		if( arr[0] === '_J') {
			arr = Array.prototype.slice.call(arr,1);
		}
		for( i=0,len=arr.length;i<len;i+=1) {
			if( typeof parent[arr[i]] === 'undefined') {
				parent[arr[i]] = {};
			}
			parent = parent[arr[i]]
		}
		return parent;
	}
	//Menu是一个类，继承了jQuery，有私有属性和方法,
	_J.namespace('_J.Menu');
	_J.Menu = (function(){
		// var dependencies

		// var private properties and method
		var html = '',
			level = 0,
			rowData;

		// public API -- constructor
		var Constr = function (selector, data) {
			if (!(this instanceof Constr)) {
			 	return new Constr(selector, data);
			 }
			$.extend(this,($.call(this,selector)))
			rowData = data;
			this.getMenu(rowData);
			this.__proto__ = $;
			this.draw = function () {
				this.append(html);
				//绑定展开缩小事件
			    $('#_Jtop ul li').hide();
			    $('#_Jtop ul').click(function(e) {
				    e.stopPropagation(); //阻止冒泡，否则有奇怪的事情发生
				    $(e.target).parent().siblings().find('li').hide()//隐藏其他菜单，注释掉则不自动隐藏
				    var el = $(e.target).children("li");
				    if(el.css('display') == 'list-item') {
					      el.hide();
				    }else {
				      el.fadeIn('slow');
				    }
				});
			    return this;
			}
		}
		// public API -- prototype
			Constr.prototype.constructor =  '_J.Menu'
			Constr.prototype.version = '1.0.0'
			Constr.prototype.getMenu= function(rowData) {
				html = '<ul id="_Jtop">';
				this.genVerticalMenu(rowData);
				html += '</ul>';
			}
			/*接收的格式
			var data1 = [{
				'商品管理':['商品分类管理@http://www.baidu.com',{'二级菜单':['二一@http://www.baidu.com','二二@http://www.baidu.com']},'商品公告审核@http://www.baidu.com'],
				'采购商管理':['采购商信息管理','采购商订单管理','二次退货'],
				'产地管理': ['产地信息管理@http://www.baidu.com',{'二级菜单':['二一@http://www.baidu.com',{'三级菜单':['三一@http://www.baidu.com','三二@http://www.baidu.com']},'二二@http://www.baidu.com']},'产地公告','产地订单管理']
			}];*/
			Constr.prototype.genVerticalMenu = function (data) {
				if ( typeof data === 'string' ) {
					if(data.indexOf('@')!== -1) {
					  var start = data.indexOf('@'),
					      end = data.length,
					      url = data.slice(start+1, end);
					  html += '<li class="_Jli'+ level +'"><a href="'+ url +'">'+ data.slice(0,start) +'</a></li>';
					}else {
					  html += '<li class="_Jli'+ level +'">'+ data +'</li>';
					}
				} else if( data instanceof Array) {
					for(var k=0,len = data.length;k<len;k+=1) {
					  this.genVerticalMenu(data[k]);
					}
				} else if(data instanceof Object) {
					for(var key in data) {
					//每次深一层加一，出来就减一
						level +=1;
						html += '<li><ul class="_JUl' + level + '">'+ key;
						this.genVerticalMenu(data[key]);
						html += "</ul></li>"
						level -=1;
					}
				}
			}
			// var data = [{id:1,name:'商品管理',children:[{id:2,name:'商品分类管理',children:[{id:4,name:'三一',children:[],url:'abc'}],url:'abc'},{id:3,name:'商品公告审核',children:[],url:'abc'}],url:'abc'}];
			// sortData的格式
			Constr.prototype.sortData = function (data) {
				if(data instanceof Array && data.length>0) {
					var tempArr = []
					for(var k=0,len=data.length;k<len;k+=1) {
						var name = data[k].name;
						var children = data[k].children;
						if (children.length!=0) {
							var tempObj = {};
							tempObj[name] = this.sortData(children);
							tempArr[k] = tempObj;
						}else {
							tempArr[k] = name+'@'+data[k].url;
						}
					}
					return tempArr;
				} else if (data instanceof Object && data.children.length > 0) {
					var tempObj = {};
					tempObj[data.name] = this.sortData(data.children);
					return tempObj;
				}else {
					return data.name+'@'+data.url;
				}
			}
			Constr.prototype.getSortData = function (data) {
				return this.sortData(data);;
			}
		return Constr;
	})();
	return _J;
})

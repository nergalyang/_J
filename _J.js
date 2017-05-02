/*
@author Phil
@date 2017/4/20
@update 2017/4/25
@update 2017/4/28
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
			arr = Array.prototype.slice.call(arr,1); //arr.slice(1);
		}
		for( i=0,len=arr.length;i<len;i+=1) {
			if( !parent[arr[i]]) {	//if( typeof parent[arr[i]] === 'undefined') {
				parent[arr[i]] = {};
			}
			parent = parent[arr[i]];
		}
		return parent;
	};
	//Menu是一个类，继承了jQuery，有私有属性和方法,
	_J.namespace('_J.Menu');
	_J.Menu = (function(){
		// var dependencies
		// var private properties and method
		var html = '',
			level = 0,
			rowData;
		// end var
		// public API -- constructor
		var Constr = function (selector) {
			if (!(this instanceof Constr)) {
			 	return new Constr(selector);
			}
			var obj = $(selector);//暂存jQuery对象
			// this.getMenu(rowData);
			this.draw = function (data) {
				this.getMenu(data);
				this.append(html);
				//绑定展开缩小事件
			    $('#_Jtop ul li').hide();
			    $('#_Jtop ul').click(function(e) {
				    e.stopPropagation(); //阻止冒泡，否则有奇怪的事情发生
				    $(e.target).parent().siblings().find('li').hide();//隐藏其他菜单，注释掉则不自动隐藏
				    var el = $(e.target).children("li");
				    if(el.css('display') == 'list-item') {
					      el.hide();
				    }else {
				      el.fadeIn('slow');
				    }
				});
				//根据当前url回选
				var currentUrl = this.getUrlRelativePath();
				$('._JUrl').each(function( i, el) {
					if($(el).attr('href') === (currentUrl)) {
						var $targetLi = $(el).parent();
						while ( $targetLi.parent().attr('id') != '_Jtop' ) {
							$targetLi.show();
							$targetLi.siblings().show();
							$targetLi = $targetLi.parent().parent();
						}
					}
				});
				// 内存回收一下咯
				html= '';
			    return this;
			};
			this.getRowData = function () {
				return rowData;
			};
			$.extend(obj,this);//完美继承jQuery，本质上是完美双重继承
			return obj;
		};
		// public API -- prototype
			// Constr.prototype = $.__proto__;
			Constr.prototype.constructor =  '_J.Menu';
			Constr.prototype.version = '1.0.0';
			Constr.prototype.getMenu= function(data) { //用prototype的话就没法用实例私有变量了，因为prototype不在构造函数里当然不能访问构造函数的变量啦
				rowData = data;	//这里的类私有变量可以用prototype.rowData替代，会省点空间？
				html = '<ul id="_Jtop">';
				this.genVerticalMenu(rowData);
				html += '</ul>';
			};
			Constr.prototype.getUrlRelativePath = function () {
				var url = document.location.toString(),
					arrUrl = url.split("//"),
					start = arrUrl[1].indexOf("/"),
					relUrl = arrUrl[1].substring(start);
				if(relUrl.indexOf("?") != -1){
					relUrl = relUrl.split("?")[0];
				}
				return relUrl;
			};
			/*接收的格式
			var data1 = [{
				'商品管理':['商品分类管理@http://www.baidu.com',{'二级菜单':['二一@http://www.baidu.com','二二@http://www.baidu.com']},'商品公告审核@http://www.baidu.com'],
				'采购商管理':['采购商信息管理','采购商订单管理','二次退货'],
				'产地管理': ['产地信息管理@http://www.baidu.com',{'二级菜单':['二一@http://www.baidu.com',{'三级菜单':['三一@http://www.baidu.com','三二@http://www.baidu.com']},'二二@http://www.baidu.com']},'产地公告','产地订单管理']
			}];*/
			Constr.prototype.genVerticalMenu = function (data) {
				if ( typeof data === 'string' ) {
					var dataArr = data.split('@'),
						id = dataArr[2] || '',
						name = dataArr[0],
						url = data.split('@')[1],
						mycontext = mycontext || '';//非单页应用的时候有路径问题，有可能需要获取一个全局变量
					if(data.indexOf('@') !== -1) {
						html += '<li id="'+ id +'" class="_Jli'+ level +'"><a class="_JUrl" href="'+ mycontext + url +'">'+ name +'</a></li>';
					}else {
					  html += '<li id="'+ id +'" class="_Jli'+ level +'">'+ data +'</li>';//有可能自定义url
					}
				} else if( data instanceof Array) {
					for(var k=0,len = data.length;k<len;k+=1) {
					  this.genVerticalMenu(data[k]);
					}
				} else if(data instanceof Object) {
					for(var key in data) {
					//每次深一层加一，出来就减一
						level +=1;
						html += '<li id="'+ key.split('@')[1] +'"><ul class="_JUl' + level + '">'+ key.split('@')[0];
						this.genVerticalMenu(data[key]);
						html += "</ul></li>"
						level -=1;
					}
				}
			};
			// var data = [{id:1,name:'商品管理',children:[{id:2,name:'商品分类管理',children:[{id:4,name:'三一',children:[],url:'abc'}],url:'abc'},{id:3,name:'商品公告审核',children:[],url:'abc'}],url:'abc'}];
			// sortData的格式
			Constr.prototype.sortData = function (data) {
				if(data instanceof Array && data.length>0) {
					var tempArr = []
					for(var k=0,len=data.length;k<len;k+=1) {
						var name = data[k].name,
							id = data[k].id,
							url = data[k].url,
							children = data[k].children;
						if (children && children.length!=0) {
							var tempObj = {};
							tempObj[name+'@'+id] = this.sortData(children);
							tempArr[k] = tempObj;
						}else {
							tempArr[k] = name+'@'+url+'@'+id;
						}
					}
					return tempArr;
				}
			};
			Constr.prototype.getSortData = function (data) {
				return this.sortData(data);;
			};
		return Constr;
	})();

/****************************************************************************************************************************************************************/
	_J.namespace('_J.Ajax');
	_J.Ajax = (function(){
		// //私有变量
		var defaults = {
		        url: '',
		        dataType: 'text',//预期返回的类型
		        params: {},
		        onSend: function (obj) { return true; },
		        success: function (e) {},
		        onProgress: function (e) {}
		    },
		    /*储存确保一个id只有一个实例*/
		    instances = {};
		//依赖或者工具库
	    function formDataSubmit(options) {
	        if (this.state === false) {
	        	//state本质上是一个锁，禁止无限制的发送请求
	        	this.state = true;
		        var options = options,
		        	fileObj = this[0].files[0],
		        	fd = new FormData(),//h5对象
		        	key,
		        	that = this;
		        //添加参数
		        for (key in options.params) {
		            if (options.params.hasOwnProperty(key)) {
		            	fd.append(key, options.params[key]);
		            }
		        }
		        var fileName = this.attr('name');
		        if (fileName == ''
		            || fileName == undefined) {
		            fileName = 'file';
		        }
		        fd.append(fileName, fileObj);
		        //异步上传
		        var xhr = new XMLHttpRequest();
		        xhr.upload.addEventListener("progress", function (evt) {
		            if (evt.lengthComputable) {
		                var percentComplete = Math.round(evt.loaded * 100 / evt.total);
		                console.log(percentComplete + "%");
		                if (options.onProgress) {
		                	//上传事件回调
		                    options.onProgress(evt);
		                }
		            }
		        }, false);
		        xhr.addEventListener("load", function (evt) {
		            that.removeAttr('disabled');
		            that.state = false;
		            that.val('');

		            if ('json' == options.dataType) {
		            	var d;
		            	try {
		                	d = window.eval('(' + evt.target.responseText + ')');
		                }catch(err)
		                {
		                	d = JSON.parse(evt.target.responseText);
		                }
		                options.success(d);
		            } else {
		            	options.success(evt.target.responseText);
		            }
		        }, false);
		        xhr.addEventListener("error", function () {
		            log("error");
		        }, false);
		        //xhr.setRequestHeader('Content-Type', 'text/html'); 
		        xhr.open("POST", options.url);
		        xhr.send(fd);
		        this.attr('disabled','disabled');
	        }
	    }
	    function iFrameUpload (options) {
	    	//如果有多个文件就生成多个iframe，用时间戳和随机数确保没有重复。要是重复那你赶紧去买彩票。
	    	//实例变量

	    	if (this.state === false) {
		    	//state本质上是一个锁，禁止无限制的发送请求
		    	this.state = true;
		    	var iframeName = '' + (new Date()).getTime()+String(Math.random()).slice(2),
		    		iframe = $('<iframe style="display:none;"></iframe>').attr('name', iframeName),
		    		//form的target属性{framename：在指定的框架中打开，_blank：在新窗口中打开，_parent：在父框架集中打开
		    		formObj = $('<form method="post" style="display:none;" enctype="multipart/form-data"></form>').attr('action', options.url).attr('id', 'form_'+iframeName).attr("target", iframeName),
	            	formContent = "";
	            /*添加参数*/
	            for (key in options.params) {
	            	if(options.params.hasOwnProperty(key)) {
	                	formContent += '<input type="hidden" name="' + key + '" value="' + options.params[key] + '">';
	            	}
	            }
	            /*append方式会把input移到form里面，所以要copy一个新的*/
	            var anotherTarget = this.clone(true);
	            formObj.append(formContent).append(anotherTarget);
	            $(document.body).append(iframe).append(formObj);
		    	var form = $('#form_'+iframeName);
		    	this.attr("disabled", "disabled");
	    		var that = this;
	            //由于我们是上传到了iframe中，所以我们只需要监听iframe的load事件，如果有返回值了，我们就能获取到，从而进行进一步处理。
	            iframe.on('load', function(e) {
		        	var contents = $(that).contents().get(0);
		            var data = $(contents).find('body').text();
	                //IE8
	                if ('json' == options.dataType.toLowerCase()) {
	                    try {
	                        data = window.eval('(' + data + ')');
	                    }
	                    catch (err) {
	                        console.error(err);
	                        data = $( contents ).find('body').text();
	                    }
	                }
	                options.success(data);
	                //清空input
			        anotherTarget.val('');
			        //清除临时的上传变量
	                iframe.remove();
	                form.remove();
	                //内外都清空
	                iframe = null;
					that.state = false;
	                //启用
	                that.removeAttr("disabled");
	                that.val('');
	            });
	            try {
	                form.submit();
	            } catch ( err ) {
	                console.error( err );
	            }
	    	}
	    }
		var AjaxConstr = function ( selector ) {
			var options,//选项及选项默认值
				obj = $(selector);//暂存jQuery对象
			if ( !( this instanceof AjaxConstr )) {
			 	return new AjaxConstr( selector );
			}
			this.options = function ( opts ) {
				options = $.extend({}, defaults, opts);
				return this;
			};
			this.state = false;//false为未上传，true为正在上传，确保同一个文件不会被多次上传
			this.upload = function () {
				var result = [],
					flag = true,
					v1 = strategies.isNotEmpty( options, '请先配置options' ),
					v2 = strategies.isNotEmpty( options.url, '无上传地址' ),
					v3 = strategies.isNotEmpty( this.val(), '请选择文件' );
				result.push(v1, v2, v3);
				result.forEach(function(el, i) {
					if(el) {
						console.error(el);alert(el);
						return flag = false;
					}
				})
				if( !flag ) {
					return;
				}
		        try {
		        	options.onSend( this );
		        } catch ( err ) {
		        	console.error( err );
		        }
		        /*判断是否可以用h5*/
		        if ( root.FormData ) {
		            formDataSubmit.call( this, options );
		        } else {
					iFrameUpload.call( this, options );
		        }
			};
			$.extend(obj,this);//继承jQuery
			return obj;
		};
		AjaxConstr.prototype.constructor = AjaxConstr;
		return {  
			name:  '_J.Ajax',
			getInstance:  function( selector ) {   
				if( instances.hasOwnProperty(selector) )  {    
					return instances[selector];
				}else {
					instances[selector] = AjaxConstr( selector );
					return instances[selector];
				}     
			}
			//类属性接口
		}; 
	})();
//例子
 /* _J.Ajax.getInstance('#tosubmit1').options({
    url: 'abc',
    dataType:'text',
    onSend: function() {
      
    },
    success: function(data) {
      console.log(data);
    }
  }).upload();*/
/*也可以return function( selector ) {   
				if( instances.hasOwnProperty(selector) )  {    
					return instances[selector]
				}else {
					instances[selector] = AjaxConstr( selector );
					return instances[selector];
				}     
			}
  new _J.Ajax('#tosubmit1').options({
    url: 'abc',
    dataType:'text',
    onSend: function() {
      
    },
    success: function(data) {
      console.log(data);
    }
  }).upload();*/



/*	_J.Ajax.getInstance = (function () {
		也可以生成类的共有属性getInstance,储存确保一个id只有一个实例
		var instances = {};
		return function( selector ) {   
			if( instances.hasOwnProperty(selector) )  {    
				return instances[selector]
			}else {
				instances[selector] = _J.Ajax( selector );
				return instances[selector];
			}     
		}
	})()*/
	var strategies = {
		isNotEmpty : function ( value, errorMsg ) {
			if(value === '') {
				return errorMsg;
			}
		},
		minLength : function ( value, length, errorMsg ) {
			if(value.length<length) {
				return errorMsg;
			}
		},
		isMobile : function (value, errorMsg) {
			if( !/(^1[3][5][8][0-9]{9}$)/.test( value ) ) {
				return errorMsg;
			}
		},
		isEmail : function ( value, errorMsg ) {
			if ( ! /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/.test( value ) ) {
				return errorMsg;
			}
		},
		isUrl : function ( value, errorMsg ) {
			if ( !/^((https|http|ftp|rtsp|mms)?:\/\/)+[A-Za-z0-9]+\.[A-Za-z0-9]+[\/=\?%\-&_~`@[\]\':+!]*([^<>\"\"])*$/.test( value) ) {
				return errorMsg;
			}
		}
	}; 
	_J.namespace('_J.Ajax');
	_J.Validator = function () {
		this.cache = [];
	};
	_J.Validator.prototype.add = function ( dom, rules ) {
		var _self = this;
		for ( var i=0,rule; rule = rules[i++]; ) {
			(function ( rule ) {
				//比较区别多个rule
				var strategyArr = rule.strategy.split(':'),	
					errorMsg = rule.errorMsg;
				_self.cache.push([dom, function(){
					var args = strategyArr.slice(0),
						strategy = args.shift();
					args.unshift(dom.val());
					args.push(errorMsg);
					return strategies[strategy].apply( dom, args );
				}]);
			})( rule );

		}
	};
	_J.Validator.prototype.start = function (callback) {
		var i,
			validatorFunc,
			errorMsg;	
		for ( i = 0; validatorFunc = this.cache[i++]; ) {
			errorMsg = validatorFunc[1]();
			if ( errorMsg && callback ) {
				callback(validatorFunc[0], errorMsg);
				return 
			}
		}
	};
	return _J;
});

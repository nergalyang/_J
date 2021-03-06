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
			if ( !(this instanceof Constr) ) {
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
			this.drawBreadcrumbs = function ($dom) {
				var currentUrl = this.getUrlRelativePath();
				$('._JUrl').each(function( i, el) {
					if($(el).attr('href') === (currentUrl)) {
						var level = $(el).parent().attr('class').slice(-1);
						var breadcrum = [];
						breadcrum.unshift($(el).parent().text());
						for (var l=1;l<=level;l+=1) {
							var text = $(el).closest('._JUl'+l)[0].innerHTML;
							if( l === 1){
								start = 	text.indexOf('</i>');
								end = text.indexOf('<li');	
								breadcrum.unshift(text.slice(start+4, end));
							}else {
								end = text.indexOf('<li');	
								breadcrum.unshift(text.slice(0, end));
							}
						}
						$dom.html(breadcrum.join('/'));
					}
				});
			};
			this.getRowData = function () {
				return rowData;
			};
			$.extend(obj,this);//完美继承jQuery
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
				'产地管理': ['产地信息管理@http://www.baidu.com',{'二级菜单':['二一@http://www.baidu.com',{'三级菜单':['三一@http://www.baidu.com','三二@http://www.baidu.com']},'二二@http://www.baidu.com']},'产地公告','产地订单管理']
			}];*/
			Constr.prototype.genVerticalMenu = function (data) {
				if ( typeof data === 'string' ) {
					var dataArr = data.split('@'),
						id = dataArr[2] || '',
						name = dataArr[0],
						url = data.split('@')[1];
						context = mycontext || '';//非单页应用的时候有路径问题，有可能需要获取一个全局变量
					if(data.indexOf('@') !== -1) {
						html += '<li id="'+ id +'" class="_Jli'+ level +'"><a class="_JUrl" href="'+ context + url +'">'+ name +'</a></li>';
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
						if( level === 1 ) {	//第一层加上icon
							html += '<li id="'+ key.split('@')[1] +'"><ul class="_JUl' + level + '"><i class="iconfont icon-nav '+ key.split('@')[2] +'"></i>'+ key.split('@')[0];
							this.genVerticalMenu(data[key]);
							html += "</ul></li>";
						}else {
							html += '<li id="'+ key.split('@')[1] +'"><ul class="_JUl' + level + '">'+ key.split('@')[0];
							this.genVerticalMenu(data[key]);
							html += "</ul></li>";
						}
						level -=1;
					}
				}
			};
			// var data = [{id:1,name:'商品管理',children:[{id:2,name:'商品分类管理',children:[{id:4,name:'三一',children:[],url:'abc'}],url:'abc'},{id:3,name:'商品公告审核',children:[],url:'abc'}],url:'abc'}];
			// sortData的格式
			Constr.prototype.sortData = function (data) {
				if(data instanceof Array && data.length>0) {
					var tempArr = [];
					for(var k=0,len=data.length;k<len;k+=1) {
						var name = data[k].name,
							id = data[k].id,
							icon = data[k].icon,
							url = data[k].url,
							children = data[k].children;
						if (children && children.length!=0) {
							var tempObj = {};
							tempObj[name+'@'+id+'@'+icon] = this.sortData(children);
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
		        for ( key in options.params ) {
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
		        //progress：xhr.upload.onprogress在上传阶段(即xhr.send()之后，xhr.readystate=2之前)触发，每50ms触发一次
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
				});
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
			if(value.length < length) {
				return errorMsg;
			}
		},
		maxLength : function (value, length, errorMsg ) {
			if(value.length > length) {
				return errorMsg;
			}
		},
		isMobile : function (value, errorMsg) {
			if( !/^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/.test( value ) ) {
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
		},
		isNumber : function ( value, errorMsg) {
			if ( !/^[0-9]+\.{0,1}[0-9]*$/.test( value ) ) {
				return errorMsg;
			}
		},
		maxNumber : function (value, max, errorMsg ) {
			if( parseFloat( value ) > parseFloat( max ) ) {
				return errorMsg;
			}
		},
		minNumber : function (value, min, errorMsg ) {
			if( parseFloat( value ) < parseFloat( min ) ) {
				return errorMsg;
			}
		},
		maxInt : function ( value, length, errorMsg ) {
			var reg = new RegExp( '^\\d{0,'+ length+'}(\\.\\d+)?$' );
			if ( !reg.test( value ) ) {
				return errorMsg;
			}
		},
		maxDecimal : function ( value, length, errorMsg ) {
			reg=new RegExp( '^[0-9]+\.{0,1}[0-9]{0,'+length+'}$' );
			if ( !reg.test( value ) ) {
				return errorMsg;
			}
		},
		isAccount : function ( value, errorMsg ) {
			if ( !/^[a-zA-Z0-9]\w{2,30}$/.test( value ) ) {
				return errorMsg;
			}
		},
		isPhone : function ( value, errorMsg ) {
			if ( !/^0\d{2,3}-?\d{7,8}$/.test( value ) ) {
				return errorMsg;
			}
		},
		hasSpecialCharater : function ( value, errorMsg ) {
			var reg = new RegExp('[`~!@#$^&*()=|{}:;,\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“。，、？]');
			if ( reg.test( value ) ) {
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
				//由于是push进去，需要用闭包区别多个rule
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
			if(!errorMsg) {
				$('._Jwarnings').remove();
			}
			if( errorMsg && (!callback)) {
				$('._Jwarnings').remove();
				validatorFunc[0].after('<span class="_Jwarnings">'+ errorMsg +'</span>');
				return true;
			}
			if ( errorMsg && callback ) {
				return callback(validatorFunc[0], errorMsg); 
			}
		}
	};
/****************************************************************************************************************************************************************/
	_J.namespace('_J.SearchInput');
	_J.SearchInput = function (selector, url, icon ) {
		if ( !( this instanceof _J.SearchInput )) {
		 	return new _J.SearchInput(selector, url );
		}
		//后台返回的结果
		var appendResult = function (data) {
			$('._JSearchUl').remove();
			mouseleave = true;//清空上次记录，添加新记录
			var html = '<ul class="_JSearchUl">';
			html+= '<li class="_JSearchLi active" value="'+data[0].id+'">'+data[0].name+'</li>';
			for ( var i =1; i<data.length;i++) {
				html+= '<li class="_JSearchLi" value="'+data[i].id+'">'+data[i].name+'</li>';
			}
			html += '</ul>';
			$(this).after(html);
		};
		var bindLiEvents = function () {
			var self = this;
			//绑定鼠标hover事件
			$(document).on('mouseover','._JSearchUl',function (e){
				lastDom = lastDom || $('._JSearchLi.active');
				lastDom.removeClass('active');
				$(e.target).addClass('active');
				lastDom= $(e.target);
			});
			//绑定鼠标点击选择事件
			$(document).on('click','#div'+ id +'>._JSearchUl',function (e){
				hiddenTarget.val(e.target.value);
				$(self).val(e.target.innerText);
				inputResult.val(e.target.innerText);
				$('._JSearchUl').remove();
				mouseleave  = true;
				$('._JInputSearch').remove();
			});
			//判断鼠标是否在Ul里面
			$(document).on('mouseleave','._JSearchUl',function (e){
				mouseleave = true;
			});
			$(document).on('mouseenter','._JSearchUl',function (e){
				mouseleave = false;
			});
		};
		var strategies = {
			13 : function (liList,current,first,last) {
				hiddenTarget.val(current.val());
				inputResult.val(current.text());
				$('._JSearchUl').remove();
				mouseleave = true;
				$('._JInputSearch').remove();
			},
			38 : function (liList,current,first, last){
				if(first) {
					liList.last().addClass('active');
					liList.first().removeClass('active');
				}else {
					current.removeClass('active');
					current.prev().addClass('active');
				}
			},
			40 : function (liList,current,first, last){
				if(last){
					liList.first().addClass('active');
					liList.last().removeClass('active');
				}else {
					current.removeClass('active');
					current.next().addClass('active');
				}
			}
		};
		var obj  = $(selector),
		    id = '' + (new Date()).getTime()+String(Math.random()).slice(2),
			inputResult = $('<input readonly>'),
			hiddenTarget = obj.clone().hide(),
			div = $('<div id="div'+ id +'" style="position:relative;float:left;"></div>'),//作为调整css的容器
		    lastDom,//记录上一个active，避免循环整个li
			first = true,//是否初始化状态，用于事件绑定
			mouseleave = true,//鼠标离开Ul区域
			timer;
		div.append(inputResult);
		div.append(hiddenTarget);
		obj.replaceWith(div);
		var id = '' + (new Date()).getTime()+String(Math.random()).slice(2);
		var searchInput = $('<input class="_JInputSearch" id="'+id+'" placeholder="请输入">');
		//鼠标点击触发下拉搜索功能
		inputResult.on('click', function (){
			//添加下拉搜索框
			$(this).after(searchInput);
			//光标事件
			$('#'+id).focus();
			searchInput.off("input propertychange blur");
			//添加下单菜单
			searchInput.on("input propertychange blur", function (e) {
				var self = this;
				if( e.type == 'blur' && mouseleave ) {
					$('._JSearchUl').remove();
					$('._JInputSearch').remove();
				}else if(e.type != 'blur'){
					//timer用于分时函数，避免高频率触发ajax
					if( timer ) {
						return;
					}else {
						timer = setTimeout(function(){
							 $.ajax({
							 	type:"get",
							 	dataType:'json',
							 	url:url+self.value,
							 	success : function (data) {
							 		if(data.items.length>0){
							 			appendResult.call(self, data.items);
							 		}else {
							 			appendResult.call(self, [{name:'没有找到内容',id:''}]);
							 		}
									timer = null;
									lastDom = undefined;
							 	}
							 });
						},150);
					}
					//绑定事件只需要绑定一次
					if(first) {
						bindLiEvents.call(self);
						first = false;
					}
				}
			});
			//键盘箭头及回车事件
			searchInput.off("keyup");
			searchInput.on('keyup', function (e) {
				if( e.keyCode in strategies) {
					var liList = $('._JSearchLi'),
						current = $('._JSearchLi.active'),
						first = current[0] === liList.first()[0],
						last = current[0] === liList.last()[0];
					strategies[e.keyCode].call(this,liList,current,first,last);
				}
			});
			
		});
		//修改的时候的回填数据
		this.setValue = function (name, id) {
			inputResult.val(name);
			hiddenTarget.val(id);
		};
	};	
	/****************************************************************************************************************************************************************/
	_J.namespace('_J.ListenerHub');
	_J.ListenerHub = function () {
		var _listen,
		_trigger,
		_remove,
		_slice = Array.prototype.slice,
		_shift = Array.prototype.shift,
		_unshift = Array.prototype.unshift,
		namespaceCache = {},
		_create,
		find,
		each = function ( arr, fn ) {
			var ret;
			for ( var i = 0, l = arr.length; i<l; i++ ) {
				var n = arr[i];
				ret = fn.call( n, i, n);
			}
			return ret;
		};
		_listen = function ( key, fn, cache ) {
			if ( !cache[key] ) {
				cache[key] = [];
			}
			cache[key].push( fn );
		};
		_remove = function ( key, cache, fn ) {
			if ( cache[key] ) {
				if ( fn ) {
					for (var i = cache[key].length; i>=0; i-- ) {
						if ( cache[key][i] === fn ) {
							cache[key].splice( i, 1 );
						}
					}
				}else {
					cache[key] = [];
				}
			}
		},
		_trigger = function () {
			var cache = _shift.call( arguments ),
				key = _shift.call( arguments ),
				args = arguments,
				_self = this,
				ret,
				stack = cache[key];
			if( !stack || stack.length === 0 ) {
				return;
			}
			return each( stack, function () {
				return this.apply( _self, args );
			});
		};
		_create = function ( namespace ) {
			var namespace = namespace || 'default';
			var cache = {},
				offlineStack = [],
				ret = {
					listen : function ( key, fn, last ) {
						_listen( key, fn, cache );
						if ( offlineStack === null ) {
							return;
						}
						if ( last === 'last' ) {
							offlineStack.length && offlineStack.pop()();
						}else {
							each( offlineStack, function (){
								this();
							});
						}
						offlineStack = null;
					},
					one : function ( key, fn ,last ) {
						_remove( key, cache ); //清所有
						this.listen( key, fn, last );
					},
					remove : function  ( key, fn ) {
						_remove( key, cache, fn );
					},
					trigger : function () {
						var fn,
							args,
							_self = this;
						_unshift.call( arguments, cache );
						args = arguments;
						fn = function () {
							return _trigger.apply( _self, args );
						};
						if ( offlineStack ) {
							return offlineStack.push(fn);
						}
						return fn();
					}
				};
				return namespace? (namespaceCache[namespace]? namespaceCache[namespace] : namespaceCache[namespace] = ret ) : ret;
		};

			this.create = _create;
			this.one = function ( key, fn, last ) {
				var event = this.create();
				event.one( key, fn, last );
			};
			this.remove = function ( key, fn ) {
				var event = this.create();
				event.remove( key, fn );
			};
			this.listen = function ( key, fn, last ) {
				var event = this.create();
				event.listen( key, fn ,last );
			};
			this.trigger = function () {
				var event = this.create();
				event.trigger.apply( this, arguments );
			};
	};
	
	
	/****************************************************************************************************************************************************************/
	_J.namespace('_J.extendDeep');
	_J.extendDeep = function ( parent, child ) {
		var i,
			toStr = Object.prototype.toString,
			astr = '[object Array]',
			child = child || {};
		for ( i in parent ) {
			if ( parent.hasOwnProperty( i ) ) {
				if ( typeof parent[i] === 'object' ) {
					child[i] = ( toStr.call( parent[i] ) === astr ) ? []:{};
					_J.extendDeep( parent, child );
				}else {
					child[i] = parent[i];
				}
			}
		}
	};
	
	
	return _J;
});
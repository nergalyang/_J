(function(factory) {
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
	//正式开始啦,返回this 能实现链式调用
	var previous_J = root._J;

	_J.version = '1.0.0';

	//出让_J，改名的话就var JJ = _J.noConflict();
	_J.noConflict = function() {
		root._J = previous_J;
		return this;
	};

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
	_J.namespace('_J.util.Array');

	_J.util.Array = (function(){
		// var dependencies
		var myAge = 13;
		// var private properties and method
		// end var

		// public API -- constructor
		var Constr = function (o) {
			if (!(this instanceof Constr)) {
			 	return new Constr(o);
			 }
			this.elements = this.toArray(o);
			this.spiece = 'Animal';
		}

		// public API -- prototype
		Constr.prototype = {
			constructor :  '_J.util.Array',
			version : '1.0.0',
			toArray : function (obj) {
				for (var i = 0, a = [], len = obj.length; i < len; i += 1) {
					a[i] = obj[i];
				}	
				return a;
			},
			getAge: function() {
				console.log('im '+ myAge +'!');
				return this;
			},
			setAge: function(d) {
				myAge = d;
				return this;
			},
			getSpiece: function() {
				console.log(this.spiece)
			}

		}
		return Constr;
	})();


	return _J;

})

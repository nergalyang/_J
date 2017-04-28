# _J
myOwnModule


I mimic bakcbone and use javascript design patterns aimming to create useful and handy piece of code that will definitely enrich your convenience

此插件依赖jQuery，请先引入jQuery。


_J.Menu
************************************************************************************************************************************************
#_J.Menu插件继承jQuery，用jQuery选择器

生成对象： _J.Menu('div')

接收的格式:
var data1 = [{
	'商品管理':['商品分类管理@http://www.baidu.com',{'二级菜单':['二一@http://www.baidu.com','二二@http://www.baidu.com']},'商品公告审核@http://www.baidu.com'],
	'采购商管理':['采购商信息管理','采购商订单管理','二次退货'],
	'产地管理': ['产地信息管理@http://www.baidu.com',{'二级菜单':['二一@http://www.baidu.com',{'三级菜单':['三一@http://www.baidu.com','三二@http://www.baidu.com']},'二二@http://www.baidu.com']},'产地公告','产地订单管理']
}];

提供List对象的格式转换

静态方法getSortData： _J.Menu.prototype.getSortData(data2);
待转换的格式示例：
    var data2 = [
      {
        id:1,
        name:'商品管理',
        children:[
          {
            id:4,
            name:'商品分类管理',
            children:[
              {
                id:6,
                name:'三一',
                children:[],
                url:'abc'
              },
              {
                id:7,
                name:'三二',
                children:[],
                url:'abc'
              }
            ],
            url:'abc'
          },
          {
            id:5,
            name:'商品公告审核',
            children:[],
            url:'abc'
          }
        ],
        url:'abc'
      },
      {
        id:2,
        name:'采购商管理',
        children:[],
        url:'abc'
      },
      {
        id:3,
        name:'产地管理',
        children:[],
        url:'abc'
      }
    ];


渲染DOM： 	_J.Menu('div').draw(data);


css样式为_J.css。
多层级自定义样式接受_JUl[层级] 定义
比如_JUl1 :{}， _JUl2 :{}
_JLi :{}


//2017/4.28
支持页面跳转回选






************************************************************************************************************************************************

_J.Ajax
************************************************************************************************************************************************
#_J.Ajax上传插件，继承自jQuery，可以用jQuery的所有方法。一个selector只能生成一个实例。兼容IE。
示例：
<input id="upload" type="file">
_J.Ajax.getInstance('#upload').options({
    url: 'abc.com',
    dataType:'json',
    onSend: function() {
      
    },
    success: function(data) {
      console.log(data);
    }
  }).upload();


************************************************************************************************************************************************


var validator = new _J.Validator();
validator.add( $('#myinpu'), [{ strategy: 'isNotEmpty', errorMsg: '不能为空' }, { strategy: 'minLength:10', errorMsg: '长度不能小于10' }] );
validator.start(callback);

callback接收两个参数，传入的jQueryDOM对象，以及errorMsg；
var callback = function ( dom, errorMsg ) {
  dom.append(errorMsg);
}
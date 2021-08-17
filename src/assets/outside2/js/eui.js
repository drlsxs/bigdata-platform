+function(namespace) {
	var I18N;
	I18N = {
		LANGUAGE_CODES : [ "zh_CN", "zh_TW", "en", "ja" ],
		LANGUAGE_NAMES : [ "简体中文", "繁體中文", "English", "日本語" ],
		getLanguageName : function(langCode) {
			return I18N.LANGUAGE_NAMES[I18N.LANGUAGE_CODES.indexOf(langCode)];
		},
		/**
		* 检测浏览器语言代码，未检测到时，采用英文
		*/
		detectLanguage : function(defLanguage) {
			var nav = namespace.navigator, probeLanguage = nav.userLanguage
					|| nav.language || defLanguage, parts = probeLanguage.toLowerCase()
					.match(/([a-z]+)(?:-([a-z]+))?/), lang = parts[1], locale = parts[2];
			if (lang && locale)
				lang = lang + '_' + locale.toUpperCase();
			else if (!lang)
				lang = null;
			return lang;
		},
		/**
		* 返回当前所用语言代码。
		*/
		getLang : function() {
			if(EUI.browser.isMobile){//移动端只有中文
				return "zh_CN";
			}
			if (!!I18N._lang) {
				return I18N._lang;
			} else {
				var params = new EUI.Map();
				params.put("action", "getLang");
				var res = EUI.queryObj(EUI.getContextPath()+"eweb/i18n.do", params);
				if (!!res) {
					var result = JSON.parse(res);
					I18N._lang = result.lang;
					I18N._version = result.i18nVersion;
					return I18N._lang;
				}
			}
		},
		/**
		* 从服务器加载资源
		*/
		loadResource : function(force) {
			//通过ajax获取服务器上当前会话相应的resource bundle并返回。
			try {//考虑到可能连不上服务器，将异常抓住
				var root = EUI.getRootWindow();
				if (force || !root.i18n_properties) {
					//直接用http请求对象，方便控制get请求方式
					/*
					 * IMP:优化页面性能，暂去掉__t__时间戳，避免国际化在每个页面都要花费时间请求且无法利用浏览器本地缓存，
					 * 如果要做切换语言后的请求加载，需要后台传递时间或版本信息给前台做url标识
					 */
					//var timestamp = "__t__=" + new Date().getTime();
					root.I18N.getLang();
					var ajax = EUI
							.get({
								url : EUI.formatUrl(EUI.getContextPath() + "eweb/i18n.do?action=loadLang&lang="+root.I18N._lang + "&i18nVersion="+root.I18N._version),
								async : false
							}), bundleStr = ajax.getResponseText();
					// if( !!force ){
					//   ajax.setRequestHeader("x_force","true");//服务器根据此值判断是否要强制返回内容，否则缓存30分钟
					// }
					if (bundleStr) {
						root.i18n_properties = new root.EUI.Map(bundleStr, "\n", "=");
					}
				}
			} catch (e) {
				root.i18n_properties = new root.EUI.Map();
				if (!!window["console"] && !!window["console"].log) {
					window["console"].log(e);
				}
			}
		},
		/**
		* 获取国际化资源串。(参数顺序保持与JAVA代码一致，便于程序自动化处理)
		* @param {String} key 资源键
		* @param {String} def 默认值
		* @param {Array} args 格式化参数
		* @return 返回相应的资源串。
		*/
		getString : function(key, def, args) {
			var str = "";
			if(EUI.browser.isMobile){//移动端只有中文
				str = def;
			}else{
				var root = EUI.getRootWindow();
		    if (!root.i18n_properties)
		      I18N.loadResource();
			 str = root.i18n_properties.get(key);
			 //有其它语言翻译没有合适的文字，文字给空白的情况，比如分页条的第《输入框》页。
			 //由于中间是DOM元素，不好写参数，所有“第”单独做一个资源，翻译后，英文为空字符串
			 if (!str && !root.i18n_properties.containsKey(key)) {
			 	if (!def) {
			 		return key;// 没默认值时返回key值。
			 	} else {
			 		str = def; // 找不到键值时，用def值
			 	}
			 }
			}
//			var str = def;
			 str = EUI.text2Str(!str ? "" : str);


			
			if (!args) {
				return str;
			}
			for (var i = 0,len=args.length; i < len; i++) {
				var replaceStr = "{" + i + "}";
				str = str.replace(replaceStr, args[i]);
			}
			return str;
		}

	};
	//加载服务器上当前session对话的资源。
	//I18N.loadResource();

	window.I18N = I18N;
}(window)
/**
 * EUI对象
 */
+ function (namespace, name) {
  "use strict";
  
  var SPACE_CHAR = "&#xA0;",// Firefox中Alt+0160的字符表示&nbsp;
    XUI_IMAGES_ROOT_PATH = "eui/images/icon/",
    ESCAPE_REGEX = /^[_0-9a-zA-Z@.\*\/\+\$\-]+$/ig,
    r_namespace = /^\w+(\.\w+)*$/,
    r_func_prefix = /^function\s*\(/,
    r_func_comment = /^\/\/.*(\r|\n|$)/mg,
    //中文名的校验正则： 汉字、英文大小写、数字、_、-、+、.、()、（）、&、%、=
    fileNameRegexZH =  /^([\u4E00-\uFA29]|[\uE7C7-\uE7F3]|\w|\-|\+|\(|\)|\.|（|）|&|%|=)+$/,
    //英文名称校验正则：英文大小写、数字、_、-、()
    fileNameRegexEN = /^(\w|\-|\(|\))+$/,
    HEXCHAR = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'],
    RANDOM_MATH_SEED = new Date().getTime(), //产生随机字符串使用
    MONTH_NAMES = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二', 
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug','Sep', 'Oct', 'Nov', 'Dec'],
    DAY_NAMES = ["星期日", 
      "星期一", 
      "星期二", 
      "星期三", 
      "星期四", 
      "星期五", 
      "星期六", 
      "日", 
      "一", 
      "二", 
      "三", 
      "四", 
      "五", 
      "六"],
    FILE_ICON = {
      "htm": "&#xee6c;",
      "html": "&#xee6c;",
      "asp": "&#xee6c;",
      "jsp": "&#xee6c;",
      "ftl": "&#xee6c;",
      "txt": "&#xee70;",
      "conf": "&#xee70;",
      "json": "&#xee70;",
      "css": "&#xee6f;",
      "js": "&#xee6e;",
      "xml": "&#xee6d;",
      // "java": "java.gif",
      "gif": "&#xee66;",
      "jpg": "&#xee65;",
      "jpeg": "&#xee65;",
      "pdf": "&#xee5d;",
      "png": "&#xee64;",
      "bmp": "&#xee67;",
      "portal": "&#xee6a;",
      "bat": "&#xee72;",
      "cmd": "&#xee72;",
      "exe": "&#xee72;",
      "com": "&#xee72;",
      "doc": "&#xee5f;",
      "docx": "&#xee5f;",
      "dot": "&#xee5f;",
      "xls": "&#xee5c;",
      "xlsx": "&#xee5c;",
      // "vsd": "visio.gif",
      "ppt": "&#xee5e;",
      "ldb": "&#xee60;",
      "mdb": "&#xee60;",
      "mpp": "&#xee60;",
      // "one": "onenote.gif",
      "npf": "&#xee6a;",
      "rpt": "&#xee6a;",
      "olap": "&#xee6b;",
      "qbe": "&#xee6b;",
      // "link": "link.gif",
      "csv": "&#xee61;",
      "zip": "&#xee62;",
      "rar": "&#xee62;",
      // "frontpage": "frontpage.gif",
      // "groove": "groove.gif",
      // "infopath": "infopath.gif",
      // "outlook": "outlook.gif",
      // "project": "project.gif",
      // "publisher": "publisher.gif",
      "esp": "&#xee69;",
      "class": "&#xee71;",
      //视频类型后缀
      "avi":"&#xe8ce;",
      "wmv":"&#xe8ce;",
      "rm":"&#xe8ce;",
      "rmvb":"&#xe8ce;",
      "mpeg1":"&#xe8ce;",
      "mpeg2":"&#xe8ce;",
      "mp4":"&#xe8ce;",
      "3gp":"&#xe8ce;",
      "asf":"&#xe8ce;",
      "swf":"&#xe8ce;",
      "vob":"&#xe8ce;",
      "dat":"&#xe8ce;",
      "mov":"&#xe8ce;",
      "m4v":"&#xe8ce;",
      "flv":"&#xe8ce;",
      "f4v":"&#xe8ce;",
      "mkv":"&#xe8ce;",
      "mts":"&#xe8ce;",
      "ts":"&#xe8ce;"
      },
  		_DPI,
      DPI = function(index){
        var x, y;
        if(window.screen.deviceXDPI){
          x = window.screen.deviceXDPI;
          y = window.screen.deviceYDPI;
        }else{
          // var devicePixelRatio = window.devicePixelRatio || 1;
          var tmp = document.body.appendChild(document.createElement("div"));
          tmp.style.cssText += ";height: 1in; width: 1in; left: -100%; position: absolute; top: -100%;";
          x = tmp.offsetWidth/*devicePixelRatio*/;
          y = tmp.offsetHeight/*devicePixelRatio*/;
        }
        _DPI = [x, y];
      };

  function LZ(x) {
    return (x < 0 || x > 9 ? "" : "0") + x;
  }

  /**
    * 
    * @param {dom} parentDom
    * @param {str} w
    * @param {str} h
    * @param {str} clsid
    * @private
    */
    function _createActiveXWithClsid(parentDom, w, h, clsid) {
      var doc = parentDom.ownerDocument;
      var plugin = parentDom.appendChild(doc.createElement("object"));
      try {
        plugin.width = w;
        pluginheight = h;
        plugin.classid = clsid;
        if (plugin.readyState == 4) {
          return plugin;
        } else {
          parentDom.removeChild(plugin);
        }
      } catch (e) { }
      return null;
    }

  function _createActiveXObject(parentDom, width, height, clsid, codebase, onfinish){
	var root = EUI.getRootWindow();
    var wnd = EUI.getWndOfDom(parentDom),
      doc = wnd.document,
      ifrm = doc.createElement("iframe");
    ifrm.style.display = "none";
    doc.body.appendChild(ifrm);
    ifrm.onreadystatechange = function() {
      if (ifrm.readyState == "complete") {
        var plugin = _createActiveXWithClsid(parentDom, width, height, clsid);
        if (onfinish) {
          wnd.__createActiveX_onfinish = onfinish;
          wnd.__createActiveX_onfinish_plugin = plugin;
          wnd.eval("__createActiveX_onfinish(__createActiveX_onfinish_plugin)");
          wnd.__createActiveX_onfinish = null;
          wnd.__createActiveX_onfinish_plugin = null;
        }
        root.activexupdatelog[clsid] = true;
        ifrm.onreadystatechange = null;
        ifrm.src = "about:blank";
        ifrm.style.display = "none";
        doc.body.removeChild(ifrm);
      }
    }
    
   /*
    * ISSUE:ABI-11248 add by xiongrp 2020.6.22
    * 点击下载ActiveX插件，页面一直提示在安装中
    * 设置ActiveX插件安装超时提示信息
    */
	setTimeout(function(){
		if(ifrm.contentDocument.readyState != "complete"){
			if (onfinish && typeof(onfinish) == "function") {
				onfinish();
				EUI.showMessage(I18N.getString("eui.core.eui.js.pluginissettimeout","插件安装失败，安装超时！"));
				wnd.__createActiveX_onfinish = null;
				wnd.__createActiveX_onfinish_plugin = null;
			}
		}else{
			if (onfinish && typeof(onfinish) == "function") {
				onfinish(true);
			}
		}
	}, 20000);
    var idoc = ifrm.contentWindow.document;
    idoc.open();
    idoc.writeln('<html><body><object id="plugin" codebase="' + EUI.getContextPath() + codebase + '" classid="' + clsid + '"></object></body></html>');
    idoc.close();
  }

  /**
  * @private
  */
  function _onWindowUnLoad() {
    disposeObjectInWnd(this);
    EUI.removeEvent(this, "unload", _onWindowUnLoad);
  }

  /**
  * dispose所有通过函数addDispose注册到wnd对象。
  * 
  * @ftype util.dispose
  * @param {window} wnd
  * @private
  */
  function disposeObjectInWnd(wnd) {
    var disposeList = wnd.__disposeObjList;
    wnd.__disposeObjList = null;
    if (!disposeList) return ;
    var obj = null;
    while (disposeList.length > 0) {
      obj = disposeList.pop();
      if (!obj) continue;
      try {
        if (typeof(obj.dispose) == "function") {
          //有的地方可能会有控制调用是否删除dom，这里默认传true， 表示要删除
          obj.dispose(true);
        } else if (typeof(obj.invoke) == "function") {
          obj.invoke();
        } else if (typeof(obj) == "function") {
          obj();
        } else {
          wnd.eval(obj);
        }
      } catch (ex) {
        EUI.sys.gc();
        // 出现异常会导致无法继续执行
      }
    }
    // alert('end dispose:'+wnd.location.href);
    EUI.sys.gc();
  }

  function isArray(target){
    return Object.prototype.toString.call(target) === "[object Array]"
  };

  function isBoolean(target){
    return Object.prototype.toString.call(target) === "[object Boolean]"
  };

  function isFunction(target){
    return Object.prototype.toString.call(target) === "[object Function]"
  };

  function isPlainObject(obj) {
    if (!obj || typeof(obj) !== "object" || obj.nodeType || obj.window === obj) {
      return false;
    }
    try {
      if (obj.constructor && !obj.hasOwnProperty("constructor") && !obj.constructor.prototype.hasOwnProperty("isPrototypeOf")) {
        return false;
      }
    } catch (e) {
      // IE8,9 Will throw exceptions on certain host objects #9897
      return false;
    }
    for (var key in obj) {
      if (!obj.hasOwnProperty(key)) return false;
    }
    return true;
  }

  function extendObj() {
    var target = arguments[ 0 ], i = 1, deep = false, len = arguments.length;
    if (isBoolean(target)) {
      deep = target;
      target = arguments[ 1 ] || {};
      i = 2;
    }
    if (i === len) {
      target = isArray(target) ? [] : {};
      i--;
    } else if(typeof target !== 'object' && !isFunction(target)) {
      target = {};
    }
    var options = null, name = null, src = null, copy = null, clone = null, copyIsArray = false;
    for (; i < len; i++) {
      if ((options = arguments[ i ]) == null) continue;
      for (name in options) {
        src = target[ name ];
        copy = options[ name ];
        if (src === copy) continue;
        if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
          if (copyIsArray) {
            copyIsArray = false;
            clone = isArray(src) ? src : [];
          } else {
            clone = isPlainObject(src) ? src : {};
          }
          target[ name ] = extendObj(deep, clone, copy);
        } else if (copy !== undefined) {
          target[ name ] = copy;
        }
      }
    }
    return target;
  };

  /**
   * 全局命名空间对象
   */
  var EUI = null;
  
  EUI = namespace[ name ] = {};
  extendObj(EUI, {
    /**
     * 扩展对象, 对象克隆
     * @param {Boolean} [deep] 是否递归克隆
     * @param {Object} target 待修改的对象
     * @param {Object} object1 待合并到target的对象
     * @returns {Object} 被修改后的target
     * @example
     * //复制属性
     * var c = EUI.extendObj({a: 1}, {d: 2, b: 2});
     * console.log(c.a);//1
     * console.log(c.b);//2
     * console.log(c.d);//2
     * 
     * //深递归合并
     * var b = {f: 3}
     *  c = EUI.extendObj(true, {a: 1}, {d: 2, b: b});
     * console.log(c.a);//1
     * console.log(c.b === b); //false
     * console.log(c.d);//2
     */
    extendObj : extendObj,
    /**
     * 继承
     * @param {Function} fConstr 子类构造函数
     * @param {Function} fSuperConstr 父类构造函数
     * @param {String} sName 子类名
     * @example
     * EUI.extendClass(ETree, EComponent, "ETree");
     */
    extendClass : function(fConstr, fSuperConstr, sName) {
      //父类不存在直接返回  ||  子类与父类相同
      if (!fSuperConstr || fConstr._superClass === fSuperConstr) return;
      var f = function(){};
      f.prototype = fSuperConstr.prototype;
      fConstr._superClass = fSuperConstr;
      var p = fConstr.prototype = new f();
      if (sName) {
        p._className = sName;
      }
      p.constructor = fConstr;
      return p;
    },
    /**
     * 运行时继承
     * @param {Function} fConstr 子类构造函数
     * @param {(String|Function)} fSuperConstr 父类构造函数的函数或函数名字符串
     * @param {String} sName 子类的类名
     * @param {String} jses 如果fSuperConstr传递的为字符串，那么表示当构造子类时父类还不一定被初始化了，那么可以传递jses参数
     */
    extendClass_runtime: function (fConstr, fSuperConstr, sName, jses) {
      if (fConstr._superClass == fSuperConstr)
        return;
      if (typeof(fSuperConstr) == "string") {
        var ooo = window[fSuperConstr];
        if (!ooo && jses) {// 父类可能还没有初始化，此时需要设置延迟继承。
          EUI.sys.lib.includeSync(jses);
          ooo = window[fSuperConstr];
        }
        if (!ooo)
          throw new Error("父类不存在：" + fSuperConstr + "\nSuperclass does not exist:" + fSuperConstr);
        fSuperConstr = ooo;
      }
      if (fConstr._superClass == fSuperConstr) return;
      fConstr._superClass = fSuperConstr;
      var dp = fConstr.prototype;
      var sp = fSuperConstr.prototype;
      for (var i in sp) {
        if (!dp[i])
          dp[i] = sp[i];
      }
      if (sName) {
        dp._className = sName;
      }
      dp.constructor = fConstr;
      return dp;
    },
    /**
     * 判断对象是否简单的JSON对象
     * @param {Object} obj
     * @returns {Boolean}
     * @example 
     * // true
     * EUI.isPlainObject({a:1});
     * // false
     * EUI.isPlainObject(1);
     */
    isPlainObject : isPlainObject,
    /**
     * 判断是否是一个空的JSON对象
     * @param {Object} obj
     * @returns {Boolean}
     */
    isEmptyObject : function (obj) {
      if (!isPlainObject(obj)) return false;
      for (var key in obj) {
        return false;
      }
      return true;
    },
    /**
     * 清空一个对象
     * @param {Object} obj
     * @param {(String|Array)} names 存在就清空names里的属性，不存在清除对象所有的熟悉
     */
    empty : function (obj, names) {
      if (!obj) return;
      if (!names) {
        for (var key in obj) {
          delete obj[ key ];
        }
      } else {
        if (EUI.isArray(names)) {
          if (!EUI.isString(names)) return;
          names = [ names ];
        }
        for (var i = 0, len = names.length; i < len; i++) {
          delete obj[ names[ i ] ];
        }
      }
    },
    /**
    * 产生随机的字符串。
    * @param {String} prefix 随机串的前缀
    * @param {String} suffix 随机串的后缀
    * @returns {String}
    */
    rndIdentity : function (prefix, suffix) {
      RANDOM_MATH_SEED = (RANDOM_MATH_SEED * 69069) % 0x80000000;
      var rt = (RANDOM_MATH_SEED / 0x80000000).toString().replace(/\w\./, "");
      if (prefix) rt = prefix + rt;
      if (suffix) rt = rt + suffix;
      return rt;
    },
    /**
     * 对数据保留小数后几位，不补全,
     * @param {Number} num 数据
     * @param {Number} unit 小数位数
     * @returns {number}
     */
    round : function (num, unit) {
      if (isNaN(num = parseFloat(num, 10))) return 0;
      if (isNaN(parseInt(unit, 10)) || unit <= 0) return Math.round(num);
      var rate = Math.pow(10, unit);
      return Math.round(num * rate) / rate;
    },
    /**
     * 对数据保留小数后几位，会补全,
     * @param {Number} num 数据
     * @param {Number} unit 小数位数
     * @returns {number}
     */
    toDecimalN: function (x, n) {  
        var f = parseFloat(x);  
        if (isNaN(f)) {  
            return false;  
        }  
        var f = Math.round(x*Math.pow(10, n))/Math.pow(10,n); 
        var s = f.toString();  
        var rs = s.indexOf('.'); 
        if(n==0){
          return s;
        }
        if (rs < 0) {  
            rs = s.length;  
            s += '.';  
        }  
        while (s.length <= rs + n) {  
            s += '0';  
        }  
        return s;  
    },
    /**
     * 转成字符串 通过toString方法
     * @param {*} str 
     * @returns {string}
     */
    asString : function (str) {
      if (EUI.isString(str)) return str;
      if (str === null || str === undefined) return "";
      return str.toString ? str.toString() : '' + str;
    },
    /**
     * 将字符串转换成函数返回
     * @param {String} str 方法字符串
     * @param {*} args 
     * @returns {Function}
     * @example
     * //命名空间类型
     * //会从【args|window】 开始查找
     * EUI.parseFunc("EUI.asString");  
     * 
     * //函数定义字符串
     * EUI.parseFunc("function(){}");
     * 
     * //函数体字符串
     * //args为参数列表的函数
     * EUI.parseFunc("console.log(12)");
     */
    parseFunc : function (str, args) {
      if (EUI.isFunction(str)) return str;
      if (!EUI.isString(str)) return null;
      var func = null;
      if (r_namespace.test(str)) {
        if (!EUI.isArray(args)) args = [ args || window ];
        var names = str.split("."), namelen = names.length, obj = null;
        for (var i = 0, len = args.length; i < len; i++) {
          obj = args[ i ];
          if (!obj) continue;
          for (var j = 0; j < namelen; j++) {
            if (!(obj = obj[ names[ j ] ])) break;
          }
          if (EUI.isFunction(obj)) {
            func = obj;
            break;
          }
        }
      } else {
        str = str.replace(r_func_comment, '');//移除最前面的注释信息
        if (r_func_prefix.test(str)) {
          func = EUI.execJavaScript('(function(){\r\n return ' + str + '\r\n})()');
        } else {
          if (EUI.isArray(args)) {
            for (var i = args.length - 1; i >= 0; i--) {
              if (!EUI.isString(args[ i ])) args.splice(i, 1);
            }
          } else {
            args = EUI.isString(args) ? [ args ] : [];
          }
          args.push(str);
          func = Function.apply(null, args);
        }
      }
      return func;
    },
    /**
     * 执行js
     * @param {String} js 要执行的是脚本代码字符串
     * @param {window} wnd 执行脚本的作用域，缺省为window 
     * @returns {*} 返回执行结果
     **/
    execJavaScript: function (js, wnd) {
      if (!wnd) wnd = window;
      return wnd.execScript ? wnd.execScript(js) : wnd.eval(js);
    },
    /**
     * 将字符串转换成正则对象
     * @param {(String|Array)} str 字符串表示的都是要匹配的字符，如果要匹配多种组合，需使用数组
     * @param {String} pattern  "igm"
     * @returns {RegExp}
     */
    parseReg : function (str, pattern) {
      if (!str) return null;
      if (EUI.isRegExp(str)) return str;
      var regstr = null;
      if (!EUI.isArray(str)) {
        if (!EUI.isString(str)) return null;
        regstr = str;
      } else {
        var texts = [], str_ = null;
        for (var i = 0, len = str.length; i < len; i++) {
          if ((str_ = str[ i ]) && EUI.isString(str_)) {
            texts.push(str_);
          }
        }
        if (!texts.length) return null;
        regstr = '(?:' + texts.join(')|(?:') + ')';
      }
      return new RegExp(arguments[ 2 ] === true ? ("^(?:" + regstr + ")$") : regstr, pattern || '');
    },
    /**
     * 处理小数位数的计算
     */
    floatMul: function (v1, v2) {
		var m = 0;
		var s1 = v1.toString();
		var s2 = v2.toString();
		try {
			m += s1.split(".")[1].length;
		} catch (e) {
		}
		try {
			m += s2.split(".")[1].length;
		} catch (e) {
		}
		return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m);
	},
    /**
     * 格式化JSON字符串
     * @param {String} data 需要被格式化的数据
     * @returns {Object}
     */
    parseJson : function (data) {
      if (!data) return;
      try {
      	if (EUI.isString(data)) {
      		return JSON.parse(data);
      	}
      	return (EUI.isObject(data) || EUI.isArray(data)) ? data : null;
      } catch (e) {
        try {
          return eval(data);
        } catch (e) {
        }
      }
    },
    /**
     * 转换成Boolean类型
     * @param {*} s 需要转换的数据
     * @param {Boolean} def=false 默认值, 转换不了时使用返回def
     * @returns {Boolean}
     */
    parseBool: function (s, def) {
      if (EUI.isBoolean(s)) {
        return s;
      }
      if (!EUI.isString(s)) {
        return (def != null && def != undefined) ? def : false;
      }
      s = s.toUpperCase();
      if (s == "TRUE" || s == "T" || s == "1") {
        return true;
      }
      else if (s == "FALSE" || s == "F" || s == "0") {
        return false;
      }
      else {
        return (def != null && def != undefined) ? def : false;
      }
    },
    /**
     * 格式化日期
     * @param {String} date 日期字符串
     * 2005
     * 200501
     * 20050101
     * 2005----
     * 200501--
     * 2005-01
     * 2005-01-01
     * 2005/01/01
     * @returns {Date} 返回日期对象
     * @example
     * EUI.parseDate("2005----");
     * EUI.parseDate("20050101");
     */
    parseDate: function (date) {
      if (date && typeof(date) == "object" && date.toLocaleDateString)
        return date;
      var rs = new Date();
      var _year = rs.getFullYear(), _month = rs.getMonth() + 1, _date = rs.getDate();
      if (typeof(date) == "string" && date.length >= 4) {
        if (!isNaN(date)) {
          _year = new Number(date.substring(0, 4)).valueOf();
          try {
            var _m = date.substring(4, 6);
            var _d = date.substring(6, 8);
            _month = _m.length > 0 ? new Number(_m).valueOf() : 1;
            _date = _d.length > 0 ? new Number(_d).valueOf() : 1;
          }
          catch (e) {
          }
        }
        else if (new RegExp("(----)", "").test(date)) {
          _year = new Number(date.substring(0, 4)).valueOf();
          _date = 1;
        }
        else if (new RegExp("(--)", "").test(date)) {
          _year = new Number(date.substring(0, 4)).valueOf();
          _month = new Number(date.substring(4, 6)).valueOf();
          _date = 1;
        }
        else {
          var exps = date.split(new RegExp("[-\\/\\.(年|月|日)]", ""));
          //正则表达式不需要国际化.
          //var exps = date.split(new RegExp(I18N.getString("xui.util.js.1","[-\\/\\.(年|月|日)]"), ""));
          if (!exps[exps.length - 1]) {
            // Firefox里exps的最后一个为空，这里要删除掉这个空的
            exps.splice(exps.length - 1, 1);
          }
          if (exps.length == 3) {
            _year = new Number(exps[0]).valueOf();
            _month = new Number(exps[1]).valueOf();
            _date = new Number(exps[2]).valueOf();
          }
          if (exps.length == 2) {
            _year = new Number(exps[0]).valueOf();
            _month = new Number(exps[1]).valueOf();
            _date = 1;
          }
          if (exps.length == 1) {
            var tmp = exps[0];
            _year = new Number(tmp.substring(0, 4)).valueOf();
            var _m = tmp.substring(4, 6);
            _month = _m.length > 0 ? new Number(_m).valueOf() : 1;
            _date = 1;
          }
        }
        rs.setFullYear(_year);
        rs.setMonth(_month - 1, _date);
      }
      return rs;
    },
    /**
     * 百分比计算
     * @param {String} value 需要计算的百分比
     * @returns {Number}
     * @example
     * //0.15
     * EUI.parsePercent("15%");
     * //15
     * EUI.parsePercent("15");
     */
    parsePercent: function (value) {
        if (typeof value === 'string') {
            if (value.replace(/^\s+/, '').replace(/\s+$/, '').match(/%$/)) {
                return parseFloat(value) / 100;
            }
            return parseFloat(value);
        }
        return value;
    },
    /**
    * 解析指定的XML文件或者XML文本内容
    * @param {(String|XML)} xmlstrORxmlurl 要解析的XML; 文件路径；xml字符串；xml对象
    * @param {Function} onfinish 事件定义：onfinish(xdoc, userdate); onfinish存在是异步；不存在是同步
    * @param {Object} [userdata] 用户指定的数据
    * @return {XML}
    */
    parseXML: function (xmlstrORxmlurl, onfinish, userdata) {
      if(!xmlstrORxmlurl) return;
      /*是XML对象时*/
      if (typeof(xmlstrORxmlurl) == "object") {
        if (typeof(onfinish) == "function") {
          onfinish(xmlstrORxmlurl, userdata);
        }
        return xmlstrORxmlurl;
      }

      if(typeof xmlstrORxmlurl !== "string") return;
      var isXmlFile = new RegExp("(.xml)$", "ig").test(xmlstrORxmlurl),
        isxmlstr = EUI.isXML(xmlstrORxmlurl) && !isXmlFile;
      if (isxmlstr) {
        /*是XML文本串时通过loadXMLString方法对其进行解析并生成XML对象*/
        var xmldom = EUI.loadXMLString(xmlstrORxmlurl);
        if (onfinish) {
          onfinish(xmldom.documentElement ? xmldom.documentElement : xmldom, userdata);
        }
        return xmldom.documentElement ? xmldom.documentElement : xmldom;
      }
      var async = typeof(onfinish) == "function";
      if (isXmlFile) {
        if(async){
          EUI.get({
            url: xmlstrORxmlurl,
            async: async,
            callback: function(queryObj){
              onfinish(queryObj.getResponseXML(), userdata);
            }
          });
        } else {
          var xht = EUI.get({
            url: xmlstrORxmlurl,
            async: async
          });
          return xht.getResponseXML();
        }
      }
    },
    /**
     * 获取一个XMLDOM对象
     * @returns {XMLDOM}
     */
    getXMLDOMInstance : function() {
    	if (document.implementation && document.implementation.createDocument) {
    		return document.implementation.createDocument("", "", null);
    	}
    	var axO = ["Microsoft.XMLDOM", "MSXML2.DOMDocument.6.0", "MSXML2.DOMDocument.4.0", "MSXML2.DOMDocument.3.0", "MSXML2.DOMDocument"];
    	for (var i = 0; i < axO.length; i++) {
    		try {
    			return new ActiveXObject(axO[i]);
    		} catch (e) { }
    	}
    	return null;
    },
    /**
     * 将字符串转换成XML对象
     * @param {String} data
     * @returns {XMLDOM}
     */
    loadXMLString : function (data) {
      var xml, tmp;
      try {
    	  var r = data.indexOf("<");
    	  if (r > 0)
    		  data = data.substring(r);
        if (window.DOMParser) { // Standard
          tmp = new DOMParser();
          xml = data ? tmp.parseFromString(data, "text/xml") : EUI.getXMLDOMInstance();
        } else { // IE
          xml = new ActiveXObject("Microsoft.XMLDOM");
          xml.async = "false";
          xml.loadXML(data);
          xml = xml.documentElement;
        }
      } catch (e) {
        xml = undefined;
      }
      if (!xml || xml.getElementsByTagName("parsererror").length) {
        xml = null;
      }
      return xml;
    },
    /**
     * 日期到字符串
     * @param {Date} date
     * @param {String} templet=yyyy-mm-dd  日期模板格式串 yyyy 表示年； mm 表示月； dd 表示天; hh 表示小时； ii表示分； ss表示秒
     */
    date2String: function (date, templet) {
      var year, month, day, hour, minutes, seconds, short_year, full_month, full_day, full_hour, full_minutes, full_seconds;
      if (!templet)
        templet = "yyyy-mm-dd";
      year = date.getFullYear().toString();
      if (year.length < 4) {// 处理年份小于1000的情况
        if (year.length == 0)
          year = "0000";
        else if (year.length == 1)
          year = "000" + year;
        else if (year.length == 2)
          year = "00" + year;
        else if (year.length == 3)
          year = "0" + year;
      }
      // if (year.length > 4) year = year.substring(0, 4);
      short_year = year.substring(2, 4);
      month = (date.getMonth() + 1);
      full_month = month < 10 ? "0" + month : month;
      day = date.getDate();
      full_day = day < 10 ? "0" + day : day;
      hour = date.getHours();
      full_hour = hour < 10 ? "0" + hour : hour;
      minutes = date.getMinutes();
      full_minutes = minutes < 10 ? "0" + minutes : minutes;
      seconds = date.getSeconds();
      full_seconds = seconds < 10 ? "0" + seconds : seconds;
      return templet.replace("yyyy", year).replace("mm", full_month).replace("dd", full_day).replace("yy", short_year).replace("m", month).replace("d", day)
          .replace("hh", full_hour).replace("ii", full_minutes).replace("ss", full_seconds).replace("h", hour).replace("i", minutes).replace("s", seconds);
    },
    /**
     * 该函数的参数个数必须大于1 
     * 用于执行函数
     * 参数必须大于1
     * @private
     * @param {(Function|String)} cb 需要被执行的函数
     * @param {*} other 作为cb 的参数
     * @returns {*} 返回方法的执行结果
     */
    doCallBack : function (cb) {
      if (!cb) {
        return true;
      }
      var args = null;
      if (arguments.length > 1) {
        args = Array.prototype.slice.call(arguments, 1);
      }
      try {
        if (typeof(cb.invoke) == "function") {
          if (args)
            return cb.invoke.apply(cb, args);
          else
            return cb.invoke.call(cb);
        }
        else if (typeof(cb) == "function") {
          if (args)
            return cb.apply(null, args);
          else
            return cb();
        }
        else {
          return eval(cb);
        }
      } catch (e) { 
        // 此段代码造成脚本错误无法抛出，所以重新try...catch将错误抛出
        EUI.throwError(e.description || e.message);
      }
    },
    /**
     * @private
     */
    mySetInterval : function(wnd, func, interval, userdata1, userdata2, userdata3) {
      var timmer = wnd.setInterval(function() {
            EUI.doCallBack(func, userdata1, userdata2, userdata3);
          }, interval);
      return timmer;
    },
    /**
     * @private
     */
    mySetTimeout : function (wnd, func, interval, userdata1, userdata2, userdata3) {
      var timmer = wnd.setTimeout(function() {
            EUI.doCallBack(func, userdata1, userdata2, userdata3);
          }, interval);
      return timmer;
    },
    /**
    * 用win的js上下文调用funcname，所传递的参数都应该是基础类型。
    * @private
    * @param {window} win
    * @param {String} funcname 只能传入函数名而不能传入函数本身
    * @param {*} defresult 返回的默认值；1.找不到对应函数; 2.执行该函数的时候出现异常; 3.该函数没有返回任何值
    * @return {*}
    */
    callFuncInWnd_Eval : function (win, funcname, defresult) {
      try {
        win = win || window;
        var func = win[funcname];
        if (!func) {
          return defresult;
        }
        var args = new Array();
        if (arguments.length > 3) {
          for (var i = 3; i < arguments.length; i++) {
            var arg = arguments[i];
            if (typeof(arg) == "string") {
              arg = "'" + arg + "'";
            }
            args.push(arg);
          }
        }
        return win.eval(funcname + "(" + args.join(",") + ")") || defresult;
      }
      catch (e) {
      // 由于js安全的限制，js不允许访问外部domain的页面。当workspace显示完domain之外的页面再切换回来时，会发生access denied错误，
        return defresult;
      }
    },
    /**
    * 调用指定window中的函数，函数不存在，那么直接返回；存在返回运行结果，从第三个参数开始，作为函数执行的参数
    * @private
    * @param {Window} wid
    * @param {String} funcname 方法名
    */
    callFuncInWnd : function (win, funcname) {
      win = win || window;
      var func = win[funcname];
      if (!func) return;
      return EUI._callFuncWithArgs(func, arguments, 2);
    },
    /**
     * 异步执行某方法
     * @private
     * @param {(String|Array)} js 需要被引入的js
     * @param {Window} wid
     * @param {String} funcname 方法名
     */
    callFuncInWnd_Async : function (js, win, funcname) {
      win = win || window;
      var func = win[funcname];
      if (func) {
        return EUI._callFuncWithArgs(func, arguments, 3);
      }
      var args = arguments;
      EUI.includeAsync(js, win, function() {
        //第三个参数之前为3不正确，因为到这里args[0]已经是函数名了，因此从1开始的参数都要带进来
        EUI._callFuncWithArgs(callFuncInWnd, args, 1);
      }, EUI.dlgs.showWaitDialog);
    },
    /**
    * 执行事件的过程, 外部工程也用了
    * @private
    **/
    _callFuncWithArgs : function (func, args, startindex) {
      if (args.length < startindex) {
        return func();
      }
      try {
        return func.apply(null, Array.prototype.slice.call(args, startindex));
      }
      catch (e) { 
        // 此段代码造成脚本错误无法抛出，所以重新try...catch将错误抛出
        EUI.throwError(e.description || e.message);
      }
    },
    /**
     * 转换成正则，使用EUI.parseReg
     * @param {String} str
     * @private
     */
    convert2Regex : function (str) {
      if (typeof(str) != "string" || str == null || str.length == 0) return null;
      var arr = new Array(),
        temp = str.split(";");
      for (var x = 0; x < temp.length; x++) {
        var w = temp[x];
        if (x > 0) arr.push("|");
        arr.push('^');
        for (var i = 0, is = w.length; i < is; i++) {
          var c = w.charAt(i);
          switch (c) {
            case '*' :
              arr.push(".*");
              break;
            case '?' :
              arr.push(".");
              break;
            case '(' :
            case ')' :
            case '[' :
            case ']' :
            case '$' :
            case '^' :
            case '.' :
            case '{' :
            case '}' :
            case '|' :
            case '\\' :
              arr.push("\\");
              arr.push(c);
              break;
            default :
              arr.push(c);
              break;
          }
        }
        arr.push('$');
      }
      return arr.join("");
    },
    /**
     * java中StrFunc类中的函数str2Text具有一致的功能
     * @private
     */
    str2Text: function (s) {
      if (s == null || s.length == 0) {
        return s;
      }
      var result = [];
      var i, k = 0, len;
      for (i = 0, len = s.length; i < len; i++) {
        var c = s.charAt(i);
        var cd = s.charCodeAt(i);
        switch (c) {
          case '\t' :
            result.push('\\');
            result.push('t');
            break;
          case '\r' :
            result.push('\\');
            result.push('r');
            break;
          case '\n' :
            result.push('\\');
            result.push('n');
            break;
          case '\\' :
            result.push('\\');
            result.push('\\');
            break;
          default :
            if ((cd >= 1 && cd <= 8) || (cd >= 14 && cd <= 32) || (cd == 11) || (c == 12)) {
              result.push('\\');
              result.push('u');
              result.push(new String(cd / 16).charAt(0));
              result.push(HEXCHAR[cd % 16]);
            }
            else {
              result.push(c);
            }
        }
      }
      return result.join('');
    },
    /**
    * 和java中StrFunc类中的函数text2Str具有一致的功能
    * @private
    * */
    text2Str: function (txt) {
      if ((txt == null) || (txt.indexOf("\\") == -1)) {
        return txt;
      }
      var result = [];
      for (var i = 0, len = txt.length; i < len;) {
        if (i == txt.length) {
          break;
        }
        var c = txt.charAt(i);
        if (c == '\\') {
          if (i + 1 == txt.length)
            return result;// 单独出现的 '\\'不合法
          var c2 = txt.charAt(i + 1);
          switch (c2) {
            case '\\' :
              result.push('\\');
              break;
            case 'r' :
              result.push('\r');
              break;
            case 'n' :
              result.push('\n');
              break;
            case 't' :
              result.push('\t');
              break;
            case 'u' : // 不合法的数字也过滤,主要是长度
              if (i + 3 < txt.length) {// 满足\\u1F的结构


                var c3 = txt.charAt(i + 2);
                var c4 = txt.charAt(i + 3);
                var n3 = EUI.hexToInt(c3);
                var n4 = EUI.hexToInt(c4);
                if ((n4 != -1) && (n3 != -1)) {
                  result.push(String.fromCharCode(n3 * 16 + n4));
                }
                i += 2;
              }
          }
          i += 2;
        }
        else {
          result.push(c);
          i += 1;
        }
      }
      return result.join('');
    },
    /**
     * @private
     */
    hexToInt: function (s) {
      var i = -1;
      s = s.toUpperCase();
      for (var j = 0; j < HEXCHAR.length; j++) {
        if (HEXCHAR[j] == s) {
          i = j;
          break;
        }
      }
      return i;
    },
    /**
     * 和java中StrFunc类中的函数quotedStr具有一致的功能
     * @private
     */
    quotedStr: function (s, quote) {
      if (s == null) {
        return null
      }

      if (quote == null) {
        quote = "\"";
      }

      var i = s.indexOf(quote);
      if (i == -1) {
        return quote + s + quote;
      }

      var i1 = 0;
      var value = quote;
      while (i != -1) {
        value = value + s.substring(i1, i) + quote + quote;
        i1 = i + 1;
        i = s.indexOf(quote, i1);
      }
      value = value + s.substring(i1) + quote;
      return value;
    },
    /**
    * 判断是否中文字符
    * @param {CharCoed} ch
    * @returns {Boolean}
    * @example
    * EUI.isChineseChar("中".charCodeAt());
    */
    isChineseChar: function (ch) {
      return (ch >= 0x3400 && ch < 0x9FFF) || (ch >= 0xF900);
    },
    /**
     * 是否是空字符串
     * @param {String} str
     * @returns {Boolean}
     * @example
     * EUI.isStrEmpty("");
     * EUI.isStrEmpty(undefined);
     * EUI.isStrEmpty(null);
     */
    isStrEmpty: function (str) {
      return str == undefined || str == null || str == "" || str.trim().length == 0;
    },
    /**
     * 判断指定的字符串是不是一个xml内容的字符串
     * @param {String} xmlstr
     * @returns {Boolean}
     */
    isXML: function (xmlstr) {
      return typeof(xmlstr) == "string" && new RegExp("<.+>", "g").test(xmlstr);
    },
    /**
     * 保证返回值不为null和undefined
     * @param {String} str
     * @returns {String} str||""
     **/
    ensureStrNotEmpty: function (str) {
      return (str == undefined || str == null) ? "" : str;
    },
    /**
     * 带中文的名称校验正则
     * @desc 包含： 汉字、英文大小写、数字、_、-、+、.、()、（）、&、%、=
     */
    fileNameRegexZH:fileNameRegexZH,
    /**
     * 带中文的名称校验方法，使用正则fileNameRegexCH 校验
     * @desc 包含： 汉字、英文大小写、数字、_、-、+、.、()、（）、&、%、=
     * @param {String} text
     */
    validateFileNameZH: function(text){
      return fileNameRegexZH.test(text);
    },
    /**
     * 不带中文的名称校验正则
     * @desc 包含：英文大小写、数字、_、-、()
     */
    fileNameRegexEN:fileNameRegexEN,
    /**
     * 带中文的名称校验方法，使用正则fileNameRegexCH 校验
     * @desc 包含：英文大小写、数字、_、-、()
     * @param {String} text
     */
    validateFileNameEN: function(text){
      return fileNameRegexEN.test(text);
    },
    /**
     * 检验文件名的合法性
     * @param {String} p 文件名
     * @param {(Boolean|Number)} len 文件名
     * @returns {Boolean}
     * @returns {Boolean}
     */
    validateFileName: function (p, len) {
      if (p == null) return false;
      //;，且不能只包含.或空格,+ [] % @;'$ & ~ 
      var exp = new RegExp('^[^\/\\\\<>\*\?\:"\|~\$\&\'\=\!\,\t\;\[\\]\+\%\@]+$');
      var f1 = exp.test(p) && checkLen(p, len);
      if(!f1)return false;
      
      for (var i = 0; i < p.length; i++) {
        var c = p.charAt(i);
        if (c!='.' && c!='\n' && c!='\r' && c!='\t' && c!=' '){
          return true;
        }
      }
      function checkLen(t, l){
        //false 就不需要长度校验
        if(l === false) return true;
        //数字就根据长度来
        if(EUI.isNumber(l)){
          return t.length < l;
        }
        //什么都没有就是255
        return t.length < 255;
      }

    },
    /**
     * @private
     *seperate为分隔符，比如";"。两个分号为它自己，比如";;"就代表是";"
     *seperateStr[";", ";"] = ["", ""]
     *seperateStr["a;", ";"] = ["a", ""]
     *seperateStr["a;b", ";"] = ["a", "b"]
     *seperateStr["a;b;", ";"] = ["a", "b",""]
     *返回数组的长度为分隔符个数+1
     * @returns {String}
     */
    seperateStr: function (str, seperate) {
      if (EUI.isStrEmpty(str))
        return str;
      var arr = [""];
      var j = 0;
      for (var i = 0, len = str.length; i < len; i++) {
        var ch = str.charAt(i);
        if (ch == seperate) {
          if (i + 1 < len && str.charAt(i + 1) == seperate) {
            arr[j] += ch;
            i++;
          }
          else {
            arr[++j] = "";
          }
        }
        else {
          arr[j] += ch;
        }
      }

      return arr;
    },
    /**
    * 对指定的文本串进行编码，客户端解码unescapeURIComponent，服务器端解码StrFunc.unescape
    * @param {String} str
    * @return {String}
    */
    escapeURIComponent: function (str) {
      if (str == null) {
        return "";
      }
      // 2010-11-25 传入数值时，应该返回该数值本身。原来没有对数值类型进行判断，导致对数值进行编码返回“”
      // 2010-11-26 补：传入boolean值时也不应该返回“”
      if (typeof(str) != "string") {
        str += "";
      }
      if (str.length == 0) {
        return "";
      }

      ESCAPE_REGEX.lastIndex = 0;
      if (ESCAPE_REGEX.test(str)) {
        return str;
      }
      else {
        return encodeURIComponent(escape(str));
      }
    },
    /**
    * 对指定的文本串进行解码操作
    * @param {String} str
    * @return {String}
    */
    unescapeURIComponent: function (str) {
      return str && str.length > 0 ? unescape(decodeURIComponent(str)) : "";
    },
    /**
    * Object对象转换为String对象，格式类似：{xxx:xxx}
    * @param {Object} p 需要转换的Object对象
    * @param {Boolean} includefunc 是否包含Function的转换
    * @param {Booean} singleQuotes 是否为单引号，缺省为双引号
    * @return {String} 字符串形式，类似：{xxxx:xxxx}
    */
    object2String: function (p, includefunc, singleQuotes) {
      if (!p || typeof(p) != "object")
        return null;
      if (typeof(singleQuotes) != "boolean")
        singleQuotes = false;
      var tmp;
      var rs = [];
      for (var key in p) {
        tmp = p[key];
        if (!tmp || (!includefunc && typeof(tmp) == "function"))
          continue;
        rs.push(key + ":" + (singleQuotes ? "'" : "\"") + tmp + (singleQuotes ? "'" : "\""));
      }
      return "{" + rs.join(",") + "}";
    },
    /**
    * 判断是否是一个合法的变量名，表名，或者字段名, 与java中SqlFunc.isValidSymbol方法作用相同
    * 应用:在数据库管理中可以上传文件,并且可以指定表名,此方法可以在上传之前判断表名是否合法
    * @param {String} name 
    * @returns {boolean} 要求名称必须以a-z开始,后面可以接a-z,0-9,_,$
    */
    isValidSymbol:function (name) {
      if (name == null || name.length == 0 || name.length > 100)
        return false;
      var re = /^[a-z]+[a-z_0-9\$]*$/i;
      return re.test(name);
    },
    /**
    * 获取fn的后缀并返回，返回的后缀带有点号，如果没有后缀，那么返回""
    * @param {String} fn
    */
    extractFileExt: function (fn) {
      var index = fn.lastIndexOf(".");
      return index != -1 ? fn.substring(index) : "";
    },
    /**
    * 获取文件名，不包含路径。可以指定是否包含后缀
    * @param {String} fn 文件名
    * @param {Boolean} incext 是否包含后缀
    * @return {String} 不带后缀的字符串
    */
    extractFileName: function (fn, incext) {
      var start = fn.lastIndexOf("\\");
      if (start == -1){
        start = fn.lastIndexOf("/");
      }
      start += 1;
      var end;
      if (incext) {
        end = fn.length;
      }
      else {
        end = fn.lastIndexOf(".");
        if (end == -1)
          end = fn.length;
      }
      return fn.substring(start, end);
    },
    /**
     * 类型判断函数
     * @param {*} a 需要判断类型的
     * @returns {Boolean}
     */
    isAlien: function (a) {
      return !EUI.isFunction(a) && /\{\s*\[native code\]\s*\}/.test(String(a));
    },
    /**
    * 是否是百分数
    * @param {String} wh 被判断的数据
    * @returns {Boolean}
    */
    isPercent: function (wh) {
      return wh?wh.trim().match(/%$/):false;
    },
    /**
    * 判定指定的变量是否是空值，如果是字符串，那么根据notrim来判断是否需要trim一下再判断其是否是空值
    * @private
    * @param {String} p 变量
    * @param {Boolean} notrim 是否去掉空格，缺省是去掉
    * @return {Boolean}
    */
    hasValue: function (p, notrim) {
      if (p == undefined || p == null)
        return false;
      if (!notrim && typeof(p) == "string") {
        if (p.trim().length == 0)
          return false;
      }
      return true;
    },
    /**
     * 获取左树，使用了treepage的页面使用
     * @param {Window} wnd
     * @returns {Object}
     */
    getLeftTree: function (wnd) {
      var i = 0;
      var w = wnd || window;
      while (i++ < 4) {
        try{
          var r = w.__esen_bi_lefttree;
          if (r) return r;
        }catch(e){
        }
        w = w.parent;
      }
    },
    /**
     * 刷新左树， 使用了treepage的页面使用
     * @param {Window} wnd
     */
    refreshLeftTree: function (wnd) {
      var lt = EUI.getLeftTree(wnd);
      if (lt)
        lt.refresh();
    },
    
    /**
     * 获取租户id
     * @param {Window} wnd
     */
    getGlobalRootId: function(rootdir, wnd) {
    	wnd = wnd || window;
    	rootdir = rootdir || "";
    	return wnd._globalRootId_ || rootdir;
    },
    
    /**
     * 刷新面包屑
     * @param {String} rid 页面资源id， 为空时 表示根据传的crumbs刷新面包屑
     * @param {Array} 为空表示 根据资源id获取 [{
     * 									resid:'',//资源id，没有可以为空
		 *									title:'数据集',//标题
		 *									url:''//点击跳转的链接
		 *								},{
		 *									resid:'',//资源id，没有可以为空
		 *									title:'主题域1',//标题
		 *									url:''//点击跳转的链接
     * 								}]
     */
    refreshCrumbs : function(rid, crumbs){
    	var workspace = EUI.getWorkspace();
    	if(workspace && EUI.isFunction(workspace.refreshCrumbs)){
    		workspace.refreshCrumbs(rid, crumbs);
    	}
    },
    
    /**
     * 设置面包屑是否显示
     * @param bool 
     * @param isForce 是否强制显示面包屑   因为模板页可能默认显示的是不显示面包屑，如果这里
     * 				                  设置强制显示面包屑的话，可以忽略模板页的设置，如果
     * 				                  设置不强制的话，会先判断模板页是否显示面包屑，模板页
     * 								  设置不显示面包屑的话，这里设置也无效。
     */
    setCrumbsShow : function(bool,isForce){
    	var workspace = EUI.getWorkspace();
    	if(workspace && EUI.isFunction(workspace.setCrumbsVisible)){
    		if(isForce){
    			workspace.setCrumbsVisible(bool);
    		}else{
    			if(EUI.isFunction(workspace.isShowCrumb)){
    				if(workspace.isShowCrumb()){
    					workspace.setCrumbsVisible(bool);
    				}else{
    					if(!bool){
    						workspace.setCrumbsVisible(bool);
    					}
    				}
    			}
    		}
    	}
    },
    
    
    
    /**
     * 在当前面包屑基础上添加面包屑
     *  @param {Array}[{
     * 									resid:'',//资源id，没有可以为空
		 *									title:'数据集',//标题
		 *									url:''//点击跳转的链接
		 *								},{
		 *									resid:'',//资源id，没有可以为空
		 *									title:'主题域1',//标题
		 *									url:''//点击跳转的链接
     * 								}]
     */
    addCrumbs : function(crumbs){
    	var workspace = EUI.getWorkspace();
    	if(workspace && EUI.isFunction(workspace.addCrumbs)){
    		workspace.addCrumbs(crumbs);
    	}
    },
    
    /**
     * 面包屑回退一级
     */
    backCrumbs : function(){
    	var workspace = EUI.getWorkspace();
    	if(workspace && EUI.isFunction(workspace.backCrumbs)){
    		workspace.backCrumbs();
    	}
    },
    
    /**
     * 打开链接，使用了treepage或iconpage的页面使用
     * @param {String} resid 如果有资源id，传递资源id(会自动处理面包屑的问题)， 没有资源id，传递页面唯一id标识。
     * @param {String} url 需要被打开的链接
     * @param {Window} wnd 根据传递的wnd查找其上级workspace，默认为当前window
     */
    showWorkspaceUrl : function(resid, url, wnd){
    	var workspace = EUI.getWorkspace(wnd);
    	if(workspace && EUI.isFunction(workspace.showURL)){
    		workspace.showURL(resid, url);
    	}else{
    	//当页面单独拿出来时，没有workspace， 就直接刷新当前页面
        (wnd || window).location.href = EUI.formatUrl(url);
      }
    },
    /**
     * 获取的是treepage对象， 使用了treepage的页面使用、
     * @param {Window} wnd 
     */
    getWorkspace: function (wnd) {
      var i = 0;
      var w = wnd || window;
      while (i++ < 4) {
        try {
          var r = w.__esen_bi_workspace;
          if (r) return r;
        } catch (e) { // 可能存在跨域访问的问题
        }
        w = w.parent;
      }
    },
    /**
     * 全局的returnfalse函数，一般用于给onselectstart赋值
     * @private
     */
    returnfalse: function () {
      return false;
    },
    /**
     * 全局的returnfalse函数，一般用于给onselectstart赋值
     * @private
     */
    returntrue: function () {
      return true;
    },
    /**
     * 全局的returnfalse函数，一般用于给onselectstart赋值
     * @private
     */
    returnNull: function () {
      
    },
    /**
     * 该函数，目前只给两个插件使用，报表显示插件和DSO插件。
     * @private
     */
    getHost: function () {
      var url = window.location.href;
      // 如果参数中含有"/"，会导致返回的host有问题。应该判断?之前的串作为url。参数中应该不会含有
      var idx = url.indexOf("?");
      if(idx > -1){
        url = url.substring(0, idx);
      }
      var index = url.lastIndexOf("/");
      return index != -1 ? url.substring(0, index + 1) : "";
    },
    /**
     * 设置一个参数给url
     * @private
     * @param {String} parameter 参数名
     * @param {String} value 参数值
     * @param {String} url 被设置值的url
     * @returns {String}
     * @example
     * //"?c=2&d=1&a=b"
     * EUI.setParameterOfUrl("a", "b", "?c=2&d=1");
     */
    setParameterOfUrl: function (parameter, value, url) {
      var p = url;
      if (p && typeof(p) == "string" && p.length > 0 && p.charAt(0) == "?") {
        var ary2 = [];
        var ary = p.substring(1).split("&");
        if (ary == null || ary.length == 0)
          return "";
        var tmp, tmpp;
        var isAdd = false;
        for (var i = 0; i < ary.length; i++) {
          tmp = ary[i];
          tmpp = tmp.split("=");
          if (tmpp != null && tmpp.length == 2 && tmpp[0] == parameter) {
            tmpp[1] = value;
            tmp = tmpp.join("=");
            isAdd = true;
          }
          ary2.push(tmp);
        }
        if (!isAdd) {
          ary2.push(parameter + '=' + value);
        }
        return ("?" + ary2.join("&"));
      }
      else {
        var arr = [];
        arr.push(parameter + '=' + value);
        return ("?" + arr.join("&"));
      }
    },
    /**
     * 从链接上获取参数的值
     * @private
     * @param {String} parameter 参数名
     * @param {String} url 
     * @returns {String}
     * @example
     * //3
     * EUI.setParameterOfUrl("b", "?b=3&c=2&d=1");
     */
    getParameterOfUrl: function (parameter, url) {
      url = EUI.unescapeURIComponent(url);
      var index = url.indexOf('?');
      if (index >= 0)
        url = url.substring(index + 1);
      var arySearch = url.split("&");
      try {
        var index, tmp, lenPar;
        for (var i = 0; i < arySearch.length; i++) {
          lenPar = parameter.length;
          tmp = arySearch[i];
          if (tmp.substring(0, lenPar + 1) != parameter + "=")
            continue;
          index = tmp.indexOf(parameter + "=");
          if (index != -1) {
            return (tmp.substring(index + lenPar + 1));
          }
        }
        return "";
      }
      catch (e) {
        return "";
      }
    },
    /**
     * @private
     * @see getParameterOfUrl
     */
    getParameter: function (parameter, wnd) {
      wnd = wnd ? wnd : window;
      return EUI.getParameterOfUrl(parameter, window.location.search);
    },
    /**
     * @private
     * @see setParameterOfUrl
     */
    setParameter: function (parameter, value, win) {
      win = win ? win : window;
      return EUI.setParameterOfUrl(parameter, value, win.location.search);
    },
    /**
    * 从url中获取参数并放入map
    * @private
    * @return {EUI.Map}
    */
    getParameterMap: function () {
      var map = new EUI.Map();
      var url = window.location.search;
      url = EUI.unescapeURIComponent(url);
      var index = url.indexOf('?');
      if(index>=0) url = url.substring(index+1);
      var arySearch = url.split("&");
      var index, tmp, lenPar;
      for (var i = 0; i < arySearch.length; i++) {
        tmp = arySearch[i];
        tmpp = tmp.split("=");
        if (tmpp != null && tmpp.length == 2) {
          map.put(tmpp[0],tmpp[1]);
        }
      }
      return map;
    },
    /**
     * 产生一个大的随机数 
     * @param {Number} n=9999999999 随机的倍数
     * @return {Number}
     */
    bigRandom: function (n) {
      return Math.floor(EUI.safeRandom() * (n ? n : 9999999999));
    },
    /**
     * 返回一个随机的以id为前缀的字符串 
     * @param {String} id 前缀
     * @return {String}
     */
    idRandom: function (id) {
      return id + "$" + EUI.bigRandom();
    },
    
    /**
     * 提供新的“安全”随机数算法，
     * 解决fortify安全扫描反馈问题，fortify认为原生的Math.random()方法是有安全缺陷的
     */
    safeRandom: function(prefix, suffix) {
        RANDOM_MATH_SEED = (RANDOM_MATH_SEED * 69069) % 0x80000000;
        var currentRand = RANDOM_MATH_SEED / 0x80000000;
        var rt = currentRand;
        if (prefix) {
        	rt = prefix + (rt + "");
        }
        if (suffix) {
        	rt = rt + "" + suffix;
        }
        return rt;
    },
	avoidXSS: function(param) {
		var checked = param;
		checked = checked.replace(/&/g,"&amp;");
		checked = checked.replace(/</g,"&lt;");
		checked = checked.replace(/>/g,"&gt;");
		checked = checked.replace(/ /g,"&nbsp;");
		checked = checked.replace(/\'/g,"&#39;");
		checked = checked.replace(/\"/g,"&quot;");
		return checked;
	},
    
    /**
     * 转换成dom可用的数值  带单位 px|%; 负数直接为0
     * @param {(String|Number)} p
     * @returns {String}
     * @example
     * //"11px"
     * EUI.toPerNumber(11)
     * //11%
     * EUI.toPerNumber("11%")
     * //0
     * EUI.toPerNumber("-1")
     */
    toPerNumber: function (p) {
      p = typeof(p) == "string" ? (p.lastIndexOf("%") != -1 ? p : ((p = p.toLowerCase()) && p.lastIndexOf("px") != -1 ? p : (p ? p + "px" : p))) : (typeof(p) == "number" ? p + "px" : "100%");
      return p.charAt(0) == "-" ? 0 : p;
    },
    /**
    * 返回像素值，是一个整形。
    * @param {(String|Number)} p
    * @param {(String|Number)} def 默认值。
    * @return {(String|Number)}
    * @example
    * //100
    * EUI.toPixNumber("100");
    * //100
    * EUI.toPixNumber("100px");
    */
    toPixNumber: function (p, def) {
      if (typeof(p) == "number")
        return p;
      if (typeof(p) != "string")
        return def;
      return parseInt(p, 10);
    },
    /**
     * 获取一个唯一的Id，该Id会依据参数classnm来升序产生
     * @param {String} classnm
     * @param {String} prefix 前缀
     * @returns {String}
     */
    getUniqueHtmlId: function (classnm, prefix) {
      var rootWindow = EUI.getRootWindow();
      var rs = rootWindow["ESEN$UniqueHtmlId4" + classnm];
      rootWindow["ESEN$UniqueHtmlId4" + classnm] = rs = rs ? rs + 1 : 1;
      return prefix ? prefix + rs : rs;
    },
    /**
    * 获取对应文件后缀的图标
    * @private
    * @param {String} suffix
    * @returns {String}
    */
    getFileIcon: function (suffix){
      var s = !!suffix?suffix.toLowerCase():suffix,
        icon = FILE_ICON[s] || "&#xee63;";
      return  icon;
    },
    /**
    * 获取字符宽度（中文算两个）
    * @param {String} str
    * @returns {Number}
    */
    getStrWidth: function (str) { 
        var len = str.length; 
        var reLen = 0; 
        for (var i = 0; i < len; i++) {        
            if (str.charCodeAt(i) >= 255) { 
                reLen += 2; 
            } else { 
                reLen += 1;
            } 
        } 
        return reLen;    
    },
    /**
     * @private
    * 获取客户端的Flash插件版本，由于系统缺省的是提供版本10的插件供客户安装，
    * 所以，这里以版本10为基准，如果客户端已经存在高于版本10的插件时，该方法在IE浏览器时，只会返回10，
    * Firefox时根据实际版本来返回
    * tips:如何解决无法安装低版本Flash插件的问题 ？
    * 打开注册表编辑工具，HKEY_LOCAL_MACHINE\SOFTWARE\Macromedia\FlashPlayer\SafeVersions 将结点上的所有与版本有关的内容删除
    * @return {}
    */
    getSwfVersion: function (wnd) {
      wnd = wnd || window;
      var version = 0;
      try {
        var swf = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.10");
        if (swf) {
          version = 10;
        }
      } catch (e) {
        var plugins = wnd.navigator.plugins;
        if (plugins && plugins.length > 0) {
          var swf = plugins["Shockwave Flash"];
          if (swf) {
            version = parseInt(swf.description.split(" ")[2].split(".")[0], 10);
          }
        }
      }
      return version;
    },
    /**
     * 获取应用目录, 默认从页面的$relpath中获取
     * @param {Window} wnd
     * @returns {String}
     */
    getContextPath: function(wnd){
      return EUI.sys.getContextPath(wnd);
    },
    /**
    * 启动一个timer，并且杀掉上次启动并还没有执行的那个，这个函数主要是为了满足这样的需求：
    * 在一个可能会连续被触发的事件中（例如window的resize事件），要再一定时间没有再次触发
    * 事件时再执行某个函数，这样做大多是为了避免频繁的执行函数。
    * @private
    * @param {} func 需要定时执行的函数
    * @param {} timeout 
    * @param {} wnd
    * @param {} timerusrid 此值主要为了区分多个不同目的调用此函数时timer不会混淆
    * @ftype util.time
    */
    setTimeout_killExistFirst: function (func, timeout, wnd, timerusrid) {
      if (!wnd)
        wnd = window;
      var timerusrid = "_timer_of_setTimeout_killExistFirst" + timerusrid;
      var timer = wnd[timerusrid];
      if (timer) {
        wnd.clearTimeout(timer);
        wnd[timerusrid] = 0;
      }
      wnd[timerusrid] = wnd.setTimeout(func, timeout);
    },
    /**
     * @private
     *功能绑定。并缓存结果，下次绑定时自动返回缓存的结果。
     *示例:
     *通常写法
     *var self = this;
     *setTimeout(this.test.bind(this), 1000);
     *新的写法
     *setTimeoutCached(this, "test", 1000);
     *注：
     *1、只循环一次，那么上面两种写法没有太大差别；如果不停地循环，那么本方法效率高些。
     *2、使用本方法时，要调用的函数必须没有参数。建议不要用参数，可能造成内存泄漏。
     * @ftype util.time
     */
    setTimeoutCached: function (me, funcname, time) {
      var tmpfuncname = "__bindme_" + funcname;
      var func = me[tmpfuncname];
      if (typeof(func) != "function") {
        var __method = me[funcname];
        func = function() {
          return __method.apply(me);
        };
        me[tmpfuncname] = func;
      }

      return setTimeout(func, time);
    },
    /**
     * 日期对象格式化函数。类似于java中的SimpleDateFormat.format()
     * @param {Date} date 日期对象
     * @param {String} format 格式 yyyy-MM-dd HH:mm:ss  年-月-日 时:分:秒
     */
    formatDate: function (date, format) {
      format = format + "";
      var result = "",
        i_format = 0,
        c = "",
        token = "",
        y = date.getFullYear() + "",
        M = date.getMonth() + 1,
        d = date.getDate(),
        E = date.getDay(),
        H = date.getHours(),
        m = date.getMinutes(),
        s = date.getSeconds(),
        value;
      value = {
           y: y,
        yyyy: y,
          yy: y.substring(2, 4),
           M: M,
          MM: LZ(M),
         MMM: MONTH_NAMES[M - 1],
         NNN: MONTH_NAMES[M + 11],
           d: d,
          dd: LZ(d),
           E: DAY_NAMES[E + 7],
          EE: DAY_NAMES[E],
           H: H,
          HH: LZ(H)
      };
      value["h"] = H == 0?12:(H > 12?H - 12:H);
      value["hh"] = LZ(value["h"]);
      value["K"]  = H > 11?H - 12:H;
      value["k"] = H + 1;
      value["KK"] = LZ(value["K"]);
      value["kk"] = LZ(value["k"]);
      value["a"] = H > 11?"PM":"AM";
      value["m"] = m;
      value["mm"] = LZ(m);
      value["s"] = s;
      value["ss"] = LZ(s);
      while (i_format < format.length) {
        c = format.charAt(i_format);
        token = "";
        while ((format.charAt(i_format) == c) && (i_format < format.length)) {
          token += format.charAt(i_format++);
        }
        if (value[token] != null) {
          result = result + value[token];
        }
        else {
          result = result + token;
        }
      }
      return result;
    },
    /**
    * 将毫秒时间格式化为XX天XX小时XX分钟XX秒的格式
    * @param {Number} value 毫秒值
    * @returns {String}
    */
    formatTime: function (value) {
      var timetxt = "";
      var f = 30*24*60*60*1000,
        time = Math.floor(value/f);
      if(time){
        timetxt += time + I18N.getString("eui.core.eui.js.month","月");
      }
      value -= time*f
      if(value){
        f = 24*60*60*1000,
        time = Math.floor(value/f);
        if(time){
          timetxt += time + I18N.getString("eui.core.eui.js.day","天");
          value -= time*f;
        }
      }
      if(value){
        f = 60*60*1000,
        time = Math.floor(value/f);
        if(time){
          timetxt += time + I18N.getString("eui.core.eui.js.hour","小时");
          value -= time*f;
        }
      }
      if(value){
        f = 60*1000,
        time = Math.floor(value/f);
        if(time){
          timetxt += time + I18N.getString("eui.core.eui.js.min","分钟");
          value -= time*f;
        }
      }
      if(value){
        f = 1000,
        time = Math.floor(value/f);
        if(time){
          timetxt += time + I18N.getString("eui.core.eui.js.second","秒");
          value -= time*f;
        }
      }
      if(value < 1000 && value > 0){
        timetxt += value + I18N.getString("eui.core.eui.js.minsecond","毫秒");
      }
      return timetxt || "";
    },
    /**
    * 格式化路径。主要是把相对路径格式化为标准的绝对路径用。
    * @private 
    */
    formatUrl: function (url) {
      if(/^http(s)?:/g.test(url)) return url;// 当返回的结果开头出现多个'/'时,会出现'拒绝访问'的异常,例如://test.sa
      //如果是相对路径先不处理
      if(url.indexOf('../') == 0){
      	return url;
      }
      if (url.indexOf('/') == -1) {// 是相对路径，格式化为当前地址栏的绝对路径
        var hh = window.location.pathname;
        var i = hh.lastIndexOf('/');
        if (i >= 0) {
          return hh.substring(0, i + 1) + url;
        }
      }
      var contextPath = EUI.getContextPath();
      if( contextPath!='/' && url.indexOf(contextPath)==0 )//如果url是以contextpath开头，则直接返回，防止格式化后的url重复调用formatUrl造成的url错误
        return url;
      url = url.replace(new RegExp("^/+"), "");
      return contextPath + url;
    },
   /**
    * 返回一个合法的颜色串
    * @param {String} color
    * @param {String} defcolor 默认的颜色值
    * @returns {string}
    * @example 
    * //"#000000"
    * EUI.formatColor("rgb(0,0,0)")
    * //"#000000"
    * EUI.formatColor("rgba(0,0,0,0)")
    */
    formatColor: function (color, defcolor){
      var temp = document.createElement("div");
      var getComputedColor = window.getComputedStyle ? function() {
        return window.getComputedStyle(temp)["color"];
      } : temp.currentStyle ? function() {
        return temp.currentStyle["color"];
      } : function() {
        return null;
      };
      var transInt2HexString = function(num) {
        var hex = num.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      }
      var int2rgb = function(color) {
        var c = parseInt(color, 10);
        return ('#' + transInt2HexString((c >> 16) & 255)
            + transInt2HexString((c >> 8) & 255)
            + transInt2HexString(c & 255)).toUpperCase();
      }
      var transIntOrStrColor = function(color, defcolor) {
        if (!isNaN(color) || /\d+/.test(color)) {
          return int2rgb(color)
        } else {
          temp.style.color = color;
          color = getComputedColor();
          return color ? color.toUpperCase() : defcolor;
        }
      },
      //获取颜色，支持"#FFFFFF", "#FFF", "rgb(255,255,255)", "white"
      formatColor = function(color, defcolor, strict) {
        if (!color) return defcolor;
        if ('transparent' === color) return color;
        if (/^#(\d|[a-f]|[A-F]){6}$/.test(color)) {// #FFFFFF
          return color.toUpperCase();
        }
        if (/^#(\d|[a-f]|[A-F]){3}$/.test(color)) {// #FFF
          return color.replace(/([^#])/g, '$1' + '$1').toUpperCase();
        }
        if (/rgb/.test(color)) {// rgb(255, 255, 255)
          var array = color.split(",");
          if (array.length < 3) return defcolor;
          var rt = '#', v = null;
          for ( var i = 0; i < 3; i++) {
            rt += transInt2HexString(parseInt(array[i].replace(/[^\d]/gi, ''), 10) & 255);
          }
          return rt.toUpperCase();
        }
        if(strict) return defcolor;
        return transIntOrStrColor(color, defcolor);
      };
      return formatColor(color, defcolor);
    },
    /**
     *多个js一起异步加载,此合并好后的js 会在服务器端缓存，所以如果更新了js必须重启服务器，才能更新成功，开发阶段特别需要注意
     * @param {String} js,格式为 xxx.js,xx1.js   多个js间用逗号分隔
     * @param {Window} wnd
     * @param {Function} onfinish 加载完毕后的回调函数
     * @param {*} userdata 外部数据，供回调函数使用，可以不传递
     */
    loadMergeJs: function (js, wnd, onfinish, userdata){
      var wnd = wnd || window,
        doc = wnd.document,
        node = doc.createElement("script"),
        onFinishEvent = function (){
          if (onfinish) onfinish(userdata);
          if (isie)
            node.onreadystatechange = null;
          else
            node.onload = null;
        };
      if (isie)
        node.onreadystatechange = onFinishEvent;
      else
        node.onload = onFinishEvent;
      node.type = 'text/javascript';
      node.charset = "UTF-8"; // 门户文件的htm可能是GBK编码的,如果在这样的htm中引用utf8编码的js文件则必须设置这个属性,否则没法加载.

      if (!isie) {
        node.readyState = "loading";
      }
      node.src = js;
      //应该先设置node.src后再appendChild(node)，不然在ie10上节点的onreadystatechange事件readyState码永远没有complete状态
      doc.body.appendChild(node);
    },
    /**
     * 多个js一起同步加载,此合并好后的js 会在服务器端缓存，所以如果更新了js必须重启服务器，才能更新成功，开发阶段特别需要注意
     * @param {String} jsuri,格式为 xxx.js,xx1.js   多个js间用逗号分隔,或者xxx1.css,xx2.css,
     * @param {Window} wnd
     */
    loadMergeJsSyn: function (jsuri, wnd){
        var wnd = wnd||window,
          jscontent = EUI.getFileContent(jsuri);
        // 执行加载的脚本内容。
        if (!jscontent)return;
        if (wnd.execScript) {
          if (!EUI.execScripting)
            EUI.execScripting = 0;
          // 设置一个记数，当正在执行js的时候util.js中的_onWindowError函数直接return，不然当脚本执行有异常时总是会有提示对话框
          EUI.execScripting++;
          try {
            wnd.execScript(jscontent);
          }
          finally {
            EUI.execScripting--;
          }
        }
        else {
          wnd.eval(jscontent);
        }
    },
    /**
    * 此函数执行异步或同步加载js的行为，它是sys.lib.include方法的一个简单包装，更多
    * 使用require
    * @private
    */
    include: function () {
      var context = EUI.sys.lib;
      context.include.apply(context, arguments);
    },
    /**
     * eui的图片路径， eui/images/icon + imgName
     * @param {str} imgName 图片名称
     * @return {String}
     */
    xuiimg: function (imgName) {
      return EUI.getContextPath() + XUI_IMAGES_ROOT_PATH + imgName;
    },
    /**
    * 此函数不得不放在sys.js中，因为，创建activex的代码必须被<script src=xxxxx></script>引用才能使创建的activex控件
    * 没有一个ie的罩子，
    * 创建一个activex控件如果指定了codebase则在本次session中第一次创建这种插件时会检测插件的版本并试图升级他
    * 参数parentdom必须时一个dom对象。onfinish是是回调函数回调方式是onfinish(plugin)回调时可能创建插件失败或者成功
    * 如果此函数直接创建了插件那么此函数将直接返回plugin
    * @private
    * @param {dom} parentDom
    * @param {str} width
    * @param {str} height
    * @param {str} clsid
    * @param {str} codebase
    * @param {func} onfinish
    * @return {}
    */
    _createActiveX: function (parentDom, width, height, clsid, codebase, onfinish) {
      if (!clsid) return;
      if (clsid.indexOf('CLSID:') == -1) {
        clsid = 'CLSID:' + clsid;
      }
      // top页面如果是frameset框架构成的,将不能够在此页面append任何DOM元素
      var root = EUI.getRootWindow();
      if (!root.activexupdatelog)
        root.activexupdatelog = {};
      if (root.activexupdatelog[clsid] || !codebase) {
        var plugin = _createActiveXWithClsid(parentDom, width, height, clsid);
        if(plugin != null) {
          alert("插件（" + clsid + "）已经存在，不需要安装！" + "\npluginmgr（" + clsid + "）already exists, no installation！");
        }
        if (onfinish) {
          onfinish(plugin);
        }
        return plugin;
      }
      _createActiveXObject(parentDom, width, height, clsid, codebase, onfinish);
      return null;
    },
    /**
    * @private
    */
    _isXUIWindow: function (w) {// 是xui所在的项目的页面
      var pathname;
      try {
        if (w['_is_not_xui_window_'])// 第三方厂商在嵌入我们的页面的时候可以指定他们页面的这个属性
          return false;
        if (w['EUI']) {// 有这个js的页面肯定是bi页面
          /* 有这个js的页面肯定是bi页面没错，但可能是是另一个bi实例的，如两个bi部署在一个ip上，在一个bi的门户中引入另一个bi的报表，此时计算被引入的报表会出错 */
          return w.EUI.getContextPath() == EUI.getContextPath() && w.location.port == window.location.port;
        }
        /**
        * pathname是location对象中的一个属性，原先的写错了会出现异常
        */
        pathname = w.location.pathname;// 可能出现没有权限的异常
      } catch (e) {
        return false;
      }
      var cp = EUI.getContextPath(),
        f = cp != "/" && pathname.indexOf(cp) == 0;
      // 此时要根据正则表达式判断，*.sa, /xui/* , /ebi/*, /vfs/* 是BI的。
      if (f || (f && (pathname.indexOf("/eui/") == 0 || pathname.indexOf("/ebi/") == 0 || pathname.indexOf("/vfs/") == 0 || /\w+\.do$/ig.test(pathname))))
        return true;
      return false;
    },
    /**
     * 获取父窗口
     * 注： 不准使用parent获取父窗口对象！！！
     * @param {Window} wnd
     * @returns {Window} 
     */
    getParentWindow:function(win){
      try{
      	win = win || window;
        var w = win.parent;
        if (EUI._isXUIWindow(w)) {
          return w;
        }
      } catch (e) {
        return win;
      }
      return win;
    },
    /**
    * 获得根窗体的window对象
    * 注： 不准使用top获取父窗口对象！！！
    * @returns {Window}
    */
    getRootWindow: function () {		
      try {
        var w = top.document.getElementsByTagName("frameset").length > 0 ? null : top;
        if (EUI._isXUIWindow(w)) {
          return w;
        }
        throw new Error('impossible');
      } catch (e) { // 如果是跨域访问，那么就出现异常，通过location判断是否跨域host,pathname=/bi/xxx/xxx.do
        // 通过是否能对window对象寄存对象判断是否跨域
        var i = 0,
          obj = window,
          pobj;
        while (i < 10) {
          pobj = obj.parent;
          try {
            if (!EUI._isXUIWindow(pobj) || pobj.document.getElementsByTagName("frameset").length > 0)
              return obj;
          } catch (e) {
            return obj;
          }
          obj = pobj;
          i++;
        }
        return obj;
      }
    },
    /**
     * 获取父窗口上的属性， 会一直向上循环到rootWinow; 包含wnd
     * @param {String} pname
     * @param {Window} wnd
     * @returns {*}
     */
    getPropertyFromParent: function(pname, wnd){
    	wnd = wnd || window;
    	var pwnd ;
    	while(pwnd !== wnd){
    		pwnd = wnd;
    		if(pwnd[pname] !== undefined){
    			return pwnd[pname];
    		}
    		wnd = EUI.getParentWindow(wnd);
    	}
    	return null;
    },
    /**
    * 以wnd的javascript上下文空间创建一个类对象，此函数是同步的，不推荐使用，请使用getObjectFromWindowAsync
    * @private
    * @param {wnd} wnd window对象，本页面的window或其他页面的
    * @param {str} cls 表示要创建的类的类名
    * @param {str} saveid 如果传递saveid则表示将创建的对象寄存到wnd上，下次不再创建而直接获取
    * @param {boolean} disposeit 如果saveid且disposeit则此函数在创建对象时为对象添加dispose的事件。
    * @param {str} jssrc 在创建对象之前，先确保wnd引用了jssrc指定的js，在处理jssrc引用的时候是同步的引用方式
    * @return {obj}
    * @ftype util.root
    */
    getObjectFromWindow: function (wnd, cls, saveid, disposeit, jssrc) {
      var obj = null;
      if (saveid) {
        obj = wnd[saveid];
        if (obj) {
          return obj;
        } else {
          if (jssrc)
            EUI.include(jssrc, wnd);// 就算wnd中已经有cls的定义，但是可能new
          // cls时还需要其它的类，所以总是要include一下js
          obj = wnd.eval("window." + saveid + "= new " + cls + "()");
          if (disposeit) {
            wnd.eval("EUI.addDispose('window." + saveid + ".dispose();window." + saveid + "=null')");
          }
        }
      } else {
        if (jssrc)
          EUI.include(jssrc, wnd);
        obj = wnd.eval("new " + cls + "()");
      }
      return obj;
    },
    /**
    * 以wnd的javascript上下文空间创建一个类对象，相对于getObjectFromRoot来说是异步的引用需要的js，其他功能和其类似，
    * @private
    * @param {wnd} wnd window对象，本页面的window或其他页面的
    * @param {str} cls 表示要创建的类的类名
    * @param {str} saveid 如果传递saveid则表示将创建的对象寄存到wnd上，下次不再创建而直接获取
    * @param {boolean} disposeit 如果saveid且disposeit则此函数在创建对象时为对象添加dispose的事件。
    * @param {str} jssrc 在创建对象之前，先确保wnd引用了jssrc指定的js，在处理jssrc引用的时候是异步的引用方式
    * @param {func} onfinish 当需要应用的jssrc都装入完毕后创建对象并触发回调事件onfinish，如果onfinish为null那么此函数和getObjectFromRoot函数功能一致
    * @param {boolean} dontshowWaitDialog 参数dontshowWaitDialog表示是否不显示等待对话框
    * @param {obj} userdata
    * @return {obj}
    */
    getObjectFromWindowAsync: function (wnd, cls, saveid, disposeit, jssrc, onfinish, dontshowWaitDialog, userdata) {
      if (saveid) {
        var dlg = wnd[saveid];
        if (dlg) {
          if (onfinish) {
            onfinish(dlg);
          }
          return dlg;
        }
      }
      if (onfinish) {
        /**
        * ISSUE:WTAP-713 报表导出对话框，当点击保存到我的收藏时，提示“SaveAsDlg”未定义的异常。
        * 该问题是由于脚本：ebi/js/rootjs/lessdlgatroot.js，在网络环境不好的时候会存在没有完全加载完内容的情况（只加载了一半的内容），
        * 虽然是没有完全加载完，但异步加载时的状态却是loaded，这使得在回调中去创建对象时出现了上述的异常。
        * 现在这里通过timeout 0的方式来避免该类问题，在网速慢的情况下，可以明显的在HttpWatch中看到脚本被完全正确的加载。
        * --20100906 cjb
        */
        setTimeout(function() {
          EUI.sys.lib.includeAsync(jssrc, wnd, function() {
            if (!dontshowWaitDialog)
              EUI.hideWaitDialog();
            onfinish(EUI.getObjectFromWindow(wnd, cls, saveid, disposeit));
          }, dontshowWaitDialog ? null : function(){
            EUI.showWaitDialog();
          }, userdata);
        }, 0);
      } else {
        return EUI.getObjectFromWindow(wnd, cls, saveid, disposeit, jssrc);
      }
    },
    /**
    * 以getRootWindow函数返回的window对象空间创建一个类对象，参考getObjectFromWindow。
    * @private
    * @param {str} cls
    * @param {str} saveid
    * @param {boolean} disposeit
    * @param {str} jssrc
    * @return {obj}
    * @ftype util.root
    */
    getObjectFromRoot: function (cls, saveid, disposeit, jssrc) {
      var root = EUI.getRootWindow();
      return EUI.getObjectFromWindow(root, cls, saveid, disposeit, jssrc);
    },
    /**
    * 以getRootWindow函数返回的window对象空间创建一个类对象，参考getObjectFromWindowAsync。
    * @private
    * @ftype util.root
    */
    getObjectFromRootAsync: function (cls, saveid, disposeit, jssrc, onfinish, dontshowWaitDialog, userdata) {
      var root = EUI.getRootWindow();
      //此处当onfinish不存在的时候需同步返回,否则外部无法接到在getObjectFromWindowAsync中生成的对象
      return EUI.getObjectFromWindowAsync(root, cls, saveid, disposeit, jssrc, onfinish, dontshowWaitDialog, userdata);
    },
    /**
     * 将obj的dispose和wnd对象的onunload事件绑定在一起，当wnd的onunload时调用obj指定的dispose方法。
     * 注：在页面创建的对象，需要调用此方法在关闭页面时调用dispose 进行销毁
     * @param {(String|Object|Function)} obj 可以是一个对象的实例，但对象必须有dispose方法或invoke方法；也可以是一个函数；也可以是一个字符串
     * @param {Window} wnd wnd缺省为当前页面的window对象
     * @example
     * //使用方法
     * EUI.addDispose(function(){
     *  if(list){
     *    list.dispose()
     *  }
     * });
     * 
     * //在页面关闭时，会调用obj.dispose()
     * EUI.addDispose(obj);
     * 
     * //需要eval 不推荐
     * EUI.addDispose("obj.dispose()");
     */
    addDispose: function (obj, wnd) {
      wnd = wnd || window;
      // alert('add dispose:'+wnd.location.href);
      var disposeList = wnd.__disposeObjList;
      if (!disposeList) {
        disposeList = new Array();
        wnd.__disposeObjList = disposeList;
        wnd.EUI.addEvent(wnd, "unload", _onWindowUnLoad);
      }
      disposeList.push(obj);
    },
    /**
     * wnd中所有的iframe上注册的需要释放的对象。
     * @private {Window} wnd
     */
    disposeIframes: function (wnd) {
      wnd = wnd || window;
      var wdfrms = wnd.document.frames,
        frm;
      if (wdfrms && wdfrms.length > 0) {// Firefox中可能会不存在
        for (var i = 0; i < wdfrms.length; i++) {
          try {
            frm = wdfrms[i];
            disposeObjectInWnd(frm.contentWindow ? frm.contentWindow : frm);
            frm = null;
          } catch (e) {
            sys.gc();
            // 出现异常会导致无法继续执行
          }
        }
      }
    },
   /**
    * 抛出一个异常
    * @param {String} msg 异常的简短信息
    * @param {String} [detailmsg] 异常的详细信息
    * @param {String} [option] 额外信息
    * @param {Number} httpstatus 指定状态
    */
    throwError: function (msg, detailmsg, option, httpstatus) {
      var s = msg + (detailmsg ? "\r\n--detailmessage--\r\n" + detailmsg : "");
      // 为了兼容,isMesasge为true表明抛出的不是异常，而是message
      if (option)
        s += "\r\n--messageInfo--\r\n" + option;
      var error = new Error(s);
      if( !!httpstatus ){
        error.httpstatus = httpstatus;
      }
      throw error;
    },
    /**
     * 打开一个新的浏览器标签页
     * @param {String} url
     */
    openWindow: function(url, needContextPath){
      // 第一个，a标签跳转
      var a = document.createElement("a"),
      body = document.body;
      body.appendChild(a);
      if(!EUI.browser.isMobile){
    	  a.target = "_blank";
      }
      a.href = (needContextPath === true ? EUI.getContextPath() : "") + url;
      a.click();
      body.removeChild(a);
      // 第二个方案，表单提交
      // var div = document.createElement("div");
      // div.className = "eui-panel-hide";
      // div.innerHTML = '<form action="' + ((needContextPath === true ? EUI.getContextPath() : "") + url) + '" method="post" target="_blank"></form>';
      // document.body.appendChild(div);
      // div.firstChild.submit();
      // document.body.removeChild(div);
    },
     /**
     * 关闭新开的浏览器标签页
     * @param {Window} wnd
     */
    closeWindow: function(wnd){
      wnd = wnd || window;
      //直接close() IE 会弹出确认框
      wnd.opener = null;
      wnd.open('','_self');
      wnd.close();
    },
    /**
     * 判断Boolean类型
     * @param {*} obj 需要被判断类型的值
     * @returns {Boolean}
     */
    isBoolean: isBoolean,
    /**
     * 判断Number类型
     * @param {*} obj 需要被判断类型的值
     * @returns {Boolean}
     */
    isNumber: function(obj){
      return Object.prototype.toString.call(obj) === "[object Number]";
    },
    /**
     * 判断String类型
     * @param {*} obj 需要被判断类型的值
     * @returns {Boolean}
     */
    isString: function(obj){
      return Object.prototype.toString.call(obj) === "[object String]";
    },
    /**
     * 判断Function类型
     * @param {*} obj 需要被判断类型的值
     * @returns {Boolean}
     */
    isFunction: isFunction,
    /**
     * 判断Array类型
     * @param {*} obj 需要被判断类型的值
     * @returns {Boolean}
     */
    isArray: isArray,
    /**
     * 判断Date类型
     * @param {*} obj 需要被判断类型的值
     * @returns {Boolean}
     */
    isDate: function(obj){
      return Object.prototype.toString.call(obj) === "[object Date]";
    },
    /**
     * 判断RegExp类型
     * @param {*} obj 需要被判断类型的值
     * @returns {Boolean}
     */
    isRegExp: function(obj){
      return Object.prototype.toString.call(obj) === "[object RegExp]";
    },
    /**
     * 判断Object类型
     * @param {*} obj 需要被判断类型的值
     * @returns {Boolean}
     */
    isObject: function(obj){
      return Object.prototype.toString.call(obj) === "[object Object]";
    },
    /**
     * 判断对象是不是html元素
     * @param {*} obj 需要被判断类型的值
     * @returns {Boolean}
     */
    isHtmlElement: function(obj){
      var type = Object.prototype.toString.call(obj);
      //每种类型的html元素就会在HTML Element中间带上标签名， 利用正则判断
      return /[object HTML[A-Za-z]*Element]/.test(type);
    },
    /**
     * 判断undefined类型
     * @param {*} obj 需要被判断类型的值
     * @returns {Boolean}
     */
    isUndefined: function(obj){
      return ((obj == undefined) && (typeof(obj) == "undefined"));
    },
    SPACE_CHAR: SPACE_CHAR,
    XDPI: function(){
    	if(!isArray(_DPI)){
    		DPI();
    	}
      return _DPI[0];
    },
    YDPI: function(){
    	if(!isArray(_DPI)){
    		DPI();
    	}
      return _DPI[1];
    }
  
  });





/**####################################### 浏览器相关信息【EUI.browser】############################################## */  







  
  /** 检查浏览器类型 */
  var userAgent = window.navigator.userAgent,
    isie = /MSIE/g.test(window.navigator.userAgent) || /Trident\/7.0/g.test(userAgent),
    ieVersion = Number.MAX_VALUE,
    isFirefox = /Firefox/g.test(userAgent),
    isChrome = /Chrome/g.test(userAgent),
    isOpera = /(Opera)/g.test(userAgent),
    isSafari = !isChrome && ((/(Safari)/g.test(userAgent))||(/(AppleWebkit)/ig.test(userAgent))),
    isEdge = !isChrome && !isSafari && /Edge/g.test(userAgent),
    isCSS1Compat = document.compatMode == "CSS1Compat";
  if (isie) {
    ieVersion = isie && (function (doc) {
      var v = 3;
      if(/rv:11/g.test(userAgent)){
        v = 11;
      }else if(/(MSIE 10)/g.test(userAgent)){
        v = 10;
      }else {
        //ie10之后就不止 [if gt IE 9] 标签
        var div = doc.createElement('div'), 
          all = div.getElementsByTagName('i');
        while (div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->', all[ 0 ]) {
        }
      }
      return v > 4 ? v : Number.MAX_VALUE;
    })(document);
  };

  //移动类型
  var lowerUserAgent = userAgent.toLowerCase(),
    isIpad = lowerUserAgent.match(/ipad/i) == "ipad",
    isIphone = lowerUserAgent.match(/iphone/i) == "iphone",
    isAndroid = lowerUserAgent.match(/android/i) == "android",
    isWeiXin = lowerUserAgent.match(/MicroMessenger/i)=="micromessenger",
    isApp = lowerUserAgent.match(/abiapp/i)=="abiapp",
    isMobile = isIpad || isIphone || isAndroid,
    isAndroidPad = /(?:android)/.test(lowerUserAgent) && !/(?:mobile)/.test(lowerUserAgent),
    isPad = isIpad || isAndroidPad;
  

  /**
   * @constant browser
   * @desc 判断浏览器
   * @example
   * //判断IE浏览器
   * EUI.browser.isie
   * 
   * //判断IE版本
   * EUI.browser.ieVersion
   * 
   * //判断firefox浏览器
   * EUI.browser.isFirefox
   * 
   * //判断chrome浏览器
   * EUI.browser.isChrome
   * 
   * //判断safari浏览器
   * EUI.browser.isSafari
   * 
   * //判断edge浏览器
   * EUI.browser.isEdge
   * 
   * //判断Opera浏览器
   * EUI.browser.isOpera
   * 
   * //判断isIpad浏览器
   * EUI.browser.isIpad
   * 
   * //判断iPhone
   * EUI.browser.isIphone
   * 
   * //判断安卓
   * EUI.browser.isAndroid
   * 
   * //判断移动端
   * EUI.browser.isMobile
   * 
   *判断是否微信
   *EUI.browser.isWeiXin
   */
  EUI.browser = {
    isie : isie, 
    ieVersion : ieVersion,
    isFirefox : isFirefox,
    isChrome : isChrome,
    isSafari : isSafari,
    isEdge: isEdge,
    isOpera : isOpera,
    isCSS1Compat : isCSS1Compat,
    isIpad: isIpad,
    isIphone: isIphone,
    isAndroid: isAndroid,
    isMobile: isMobile,
    isWeiXin: isWeiXin,
    isApp:isApp,
    isAndroidPad:isAndroidPad,
    isPad:isPad
  };
  
  //用于处理层级的问题， 对话框、面板、提示， 在组件中创建会有无法释放的问题
  window.DLGLayerMgr = [];
  
  
  /**
   * 兼容直接在script中引入组件文件的方式，将返回的全部放到window.UI下
   */
  if(!(EUI.isFunction(window.define) && window.define.amd)){
    
    /**
     * 
     */
    window.require = window.requirejs = function(url){
    	var UI = window.UI;
    	if(!UI){
    		UI = window.UI = {};
      }
      var urls;
      //异步
      if(arguments.length === 2 && EUI.isArray(url)){
        urls = url;
      }else if(EUI.isString(url)){
        urls = [url];
      }
      if(!urls) return;
      var deps = [];
      for(var i = 0, len = urls.length; i < len; i++){
        //UI.modules 存储已经引入过的模块
        var modules = UI.modules;
        if(!modules)modules = UI.modules = [];
        var _url = urls[i];
        if(!_url) continue;
        _url = _url.ensureNotEndWith(".js");
        if(modules.indexOf(_url) === -1){
          modules.push(_url);
          try{
            EUI.include(_url + ".js");
            deps.push(UI);
          }catch (e) {
            EUI.showError(e);
          }
        }else{
          deps.push(UI);
        }
      }
      var handle = arguments[1];
      if(EUI.isFunction(handle)){
        handle.apply(null, deps);
      }
    	return UI;
    };
    
    window.define = function(deps, handle){
      var args = [],
        UI= window.UI;
      if(!UI){
        UI= window.UI = {};
      }
      if(EUI.isArray(deps)){
        for(var i = 0, len = deps.length; i < len; i++){
          args.push(UI);
        }
      }else if(EUI.isFunction(deps)){
        handle = deps;
      }
      if(!EUI.isFunction(handle))return;
      var objs = handle.apply(null, args);
      if(objs){
        EUI.extendObj(UI, objs);
      }
    }
  }
}(window, "EUI");

/**
 * 该bind函数可以避免内存泄漏，可能导致内存泄漏，原因是闭包函数隐式引用了obj变量。
 * @param {obj} obj
 */
Function.prototype.bind2 = function(obj) {
	// Init object storage
	if (!window.__objs) {
		window.__objs = [];
		window.__funs = [];
	}
	// For symmetry and clarity
	var fun = this;
	// Make sure the object has an id stored in the function store;
	var objId = obj.__objId;
	if (!objId) {
		__objs[objId = obj.__objId = __objs.length] = obj;
	}
	// Make sure the function has an id and is stored in the function store.
	var funId = fun.__funId;
	if (!funId) {
		__funs[funId = fun.__funId = __funs.length] = fun;
	}
	// Init closure storage
	if (!obj.__closures) {
		obj.__closures = [];
	}
	// See if we previously created a closure for this object/function pair.
	var closure = obj.__closures[funId];
	if (closure) {
		return closure;
	}
	// Clear references to keep them out of the closure scope.
	obj = null;
	fun = null;
	var hasArguments = arguments.length > 1;
	var __arguments = arguments;

	return __objs[objId].__closures[funId] = function() {
		return __funs[funId].apply(__objs[objId], hasArguments ? Array.prototype.slice.call(__arguments, 1) : arguments);
	}
};

/**
 带事件的功能绑定
 示例:
 通常写法
 var self = this;
 obj.onclick = function(e){
 self.test();
 };
 ...prototype.test = function(e) {
 ...
 };
 新的写法
 obj.onclick = this.test.bind2EventListener(this);
 */
Function.prototype.bind2EventListener = function(p) {
	var __method = this;
	return function(e) {
		__method.call(p, e || window.event);
	};
};

String.prototype.equalsIgnoreCase = function(str) {
	str = str == null ? "" : str;
	return this.toUpperCase() === str.toUpperCase();
};

String.prototype.compareTo = function(str) {
	var s1 = this.toString();
	var s2 = str.toString();
	if (s1 === s2)
		return 0;
	else if (s1 > s2)
		return 1;
	else
		return -1;
};

String.prototype.compareToIgnoreCase = function(str) {
	var s1 = this.toUpperCase();
	var s2 = str.toUpperCase();
	if (s1 === s2)
		return 0;
	else if (s1 > s2)
		return 1;
	else
		return -1;
};

String.prototype.toCharArray = function() {
	var charArr = new Array();
	for (var i = 0; i < this.length; i++)
		charArr[i] = this.charAt(i);
	return charArr;
};

if (!String.prototype.startsWith) {
	String.prototype.startsWith = function(search, pos) {
		return this.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search;
	};
}

/**
 * 确保字符串不以某个子字符串开头
 */
String.prototype.ensureNotStartWith = function(sep) {
  var str = this.toString();
  if (!str || (len = this.length) == 0) {
    return str;
  } else if (sep.length == 0 || sep.length > this.length) {
    return str;
  }
  var tempstr = str;
  while (tempstr.startsWith(sep)) {
    tempstr = tempstr.substring(sep.length);
  }
  return tempstr;
};

if (!String.prototype.endsWith) {
	String.prototype.endsWith = function(search, this_len) {
		if (this_len === undefined || this_len > this.length) {
			this_len = this.length;
		}
		return this.substring(this_len - search.length, this_len) === search;
	};
}

String.prototype.ensureStartWith = function(sep) {
	var str = this.toString();
	if (!sep || (sep.length == 0)) {
		return str;
	}
	if (this.startsWith(sep)) {
		return str;
	}
	return sep + str;
};

/**
 * 确保字符串不以某子字符串结尾
 */
String.prototype.ensureNotEndWith = function(sep) {
  var str = this.toString();
  if (!str || (end = this.length) == 0) {
    return str;
  }
  if (sep.length == 0) {
    return str;
  }
  var tempstr = str;
  while (tempstr.endsWith(sep)) {
    tempstr = tempstr.substring(0, tempstr.length - sep.length);
  }
  return tempstr;
};

String.prototype.ensureEndWith = function(sep) {
	var str = this.toString();
	if (!sep || (sep.length === 0)) return str;
	return str.endsWith(sep) ? str : (str + sep);
};

String.prototype.replaceAll = function(regex, target) {
	return this.replace(new RegExp(regex, "gm"), target);
};

/**系统自带的是trimLeft, V8 6.6兼容了trimStart */
if(!String.prototype.trimStart){
	String.prototype.trimStart = function() {
		return this.replace(/^\s+/, "");
	};
}

/**系统自带的是trimRight, V8 6.6兼容了trimEnd */
if(!String.prototype.trimEnd) {
	String.prototype.trimEnd = function() {
		return this.replace(/\s+$/, "");
	};
}

String.prototype.toArray = function(sept) {
	var s = this.trim();
	if (!sept)
		sept = ',';
	if (s < ' ')
		return new Array();
	else
		return s.split(sept);
};

/**
 * 字符转成HTML页面显示需要的字符，
 * 处理&'"<>这五个字符
 * @returns
 */
String.prototype.toHTML = function() {
	/*
	 * IE低版本（6/7/8）上单引号不能用保留字实体名称&apos;替换输出，只能用对应实体编号&#39;形式
	 */
	return this.toString().replace(/\&/g, "&amp;").replace(/\>/g, "&gt;").replace(/\</g, "&lt;").replace(/\"/g, "&quot;").replace(/\'/g, "&#39;");
};

String.prototype.unHTML = function(){
	return this.toString().replace(/\&gt;/g, ">").replace(/\&lt;/g, "<").replace(/\&quot;/g, '"').replace(/\&#39;/g, "'").replace(/\&amp;/g, "&");
};

/*
 * 中文串转成对应的Unicode编码串，形如
 * 服务器 -> \u670d\u52a1\u5668
 */
String.prototype.cnString2Unicode = function(cnstr) {
  if (!cnstr) {
    return cnstr;
  }
  return escape(cnstr).replace(/%/g, "\\");
};

/*
 * 某种unicode字符编码串转汉字
 * 形如/(\&#x)(\w{4})/gi或/(\u)(\w{4})/gi等
 */
String.prototype.charCodes2CnString = function(charcodes, regexp) {
  if (!charcodes) {
    return charcodes;
  }
  return charcodes.replace(regexp, function($0, $1, $2) {
    return String.fromCharCode(parseInt($2, 16));
  });
};

if (!String.prototype.repeat) {
  String.prototype.repeat = function(count) {
    'use strict';
    if (this == null) {
      throw new TypeError('can\'t convert ' + this + ' to object');
    }
    var str = '' + this;
    count = +count;
    if (count != count) {
      count = 0;
    }
    if (count < 0) {
      throw new RangeError('repeat count must be non-negative');
    }
    if (count == Infinity) {
      throw new RangeError('repeat count must be less than infinity');
    }
    count = Math.floor(count);
    if (str.length == 0 || count == 0) {
      return '';
    }
    // Ensuring count is a 31-bit integer allows us to heavily optimize the
    // main part. But anyway, most current (August 2014) browsers can't handle
    // strings 1 << 28 chars or longer, so:
    if (str.length * count >= 1 << 28) {
      throw new RangeError('repeat count must not overflow maximum string size');
    }
    var rpt = '';
    for (var i = 0; i < count; i++) {
      rpt += str;
    }
    return rpt;
  };
}

/**
 * 把数组里面的元素加入到当前数组
 * */
Array.prototype.putAll = function(arr) {
	if (arr) {
		for (var i = 0, len = arr.length; i < len; i++) {
			this.push(arr[i]);
		}
	}
}

Array.prototype.insertAt = function(obj, i) {
	this.splice(i, 0, obj);
}

Array.prototype.removeAt = function(i) {
	this.splice(i, 1);
}

Array.prototype.clear = function() {
	this.splice(0, this.length);
}

/**判断两个个数组里面的元素是否相等*/
Array.prototype.compareToStr = function(arr) {
	if (this.length == arr.length) {
		for (var i = 0; i < this.length; i++) {
			var tmp = arr[i];
			if (this.indexOfIgnoreCase(tmp) == -1) {
				return false;
			}
		}
		return true;
	}
	return false;
}

Array.prototype.indexOfIgnoreCase = function(str) {
	var s = str.toUpperCase();
	for (var i = 0; i < this.length; i++) {
		if (this[i].toUpperCase() == s)
			return i;
	}
	return -1;
}

/**删除数组中的某个元素*/
Array.prototype.remove = function(element) {
	var i = this.indexOf(element);
	if (i >= 0) {
		this.splice(i, 1);
		return true;
	}
	return false;
}

if (!Array.prototype.find) {
  Object.defineProperty(Array.prototype, 'find', {
    value: function(predicate) {
     // 1. Let O be ? ToObject(this value).
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      var o = Object(this);

      // 2. Let len be ? ToLength(? Get(O, "length")).
      var len = o.length >>> 0;

      // 3. If IsCallable(predicate) is false, throw a TypeError exception.
      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      }

      // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
      var thisArg = arguments[1];

      // 5. Let k be 0.
      var k = 0;

      // 6. Repeat, while k < len
      while (k < len) {
        // a. Let Pk be ! ToString(k).
        // b. Let kValue be ? Get(O, Pk).
        // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
        // d. If testResult is true, return kValue.
        var kValue = o[k];
        if (predicate.call(thisArg, kValue, k, o)) {
          return kValue;
        }
        // e. Increase k by 1.
        k++;
      }

      // 7. Return undefined.
      return undefined;
    },
    configurable: true,
    writable: true
  });
};

if (!Array.prototype.findIndex) {
  Object.defineProperty(Array.prototype, 'findIndex', {
    value: function(predicate) {
     // 1. Let O be ? ToObject(this value).
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      var o = Object(this);

      // 2. Let len be ? ToLength(? Get(O, "length")).
      var len = o.length >>> 0;

      // 3. If IsCallable(predicate) is false, throw a TypeError exception.
      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      }

      // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
      var thisArg = arguments[1];

      // 5. Let k be 0.
      var k = 0;

      // 6. Repeat, while k < len
      while (k < len) {
        // a. Let Pk be ! ToString(k).
        // b. Let kValue be ? Get(O, Pk).
        // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
        // d. If testResult is true, return k.
        var kValue = o[k];
        if (predicate.call(thisArg, kValue, k, o)) {
          return k;
        }
        // e. Increase k by 1.
        k++;
      }

      // 7. Return -1.
      return -1;
    },
    configurable: true,
    writable: true
  });
}

// Number

Number.prototype.equals = function(obj) {
	return this.toString() == obj.toString();
}

Number.prototype.compareTo = function(obj) {
	return this - obj;
}

/**
 * 保留几位小数，pos为小数位数
 * @param {} pos 
 */
Number.prototype.toRound = function(pos) {
	var rate = Math.pow(10, pos || 0);
	return Math.round(this * rate) / rate;
};

Number.prototype.toCeil = function(pos) {
	var rate = Math.pow(10, pos || 0);
	return Math.ceil(this * rate) / rate;
};

Number.toHexString = function(i) {
	return i.toString(16);
}

Number.toBinaryString = function(i) {
	return i.toString(2);
}

Number.isInteger = Number.isInteger || function(value) {
  return typeof value === "number" && 
         isFinite(value) && 
         Math.floor(value) === value;
};

// Date
Date.prototype.hashCode = function() {
	var l = this.getTime();
	var s = Number.toHexString(l);

	var high = 0;
	if (s.length > 8)
		high = parseInt(s.substring(0, s.length - 8), 16);

	var low = l & 0xffffffff;
	return low ^ high;
}

Date.prototype.compareTo = function(obj) {
	return (this.getTime() - obj.getTime()) & 0xffffffff;
}


if(EUI.browser.isFirefox){
	/**
	* 实现event.srcElement方法，在Firefox中也能通过event.srcElement方法来获取当前的DOM元素了
	*/
	Event.prototype.__defineGetter__("srcElement", function() {
		var node = this.target;
		while (node && node.nodeType != 1){
			node = node.parentNode;
		}
		return node;
	});

	/**
	* 实现event.returnValue方法
	*/
	Event.prototype.__defineSetter__("returnValue", function(b) {
		return b ? b : this.preventDefault();
	});
}

/**
 * 兼容ie 使用assign合并对象
 * add by pengyl 2019.11.22
 */
if (typeof Object.assign != 'function') {
  // Must be writable: true, enumerable: false, configurable: true
  Object.defineProperty(Object, "assign", {
    value: function assign(target, varArgs) { // .length of function is 2
      'use strict';
      if (target == null) { // TypeError if undefined or null
        throw new TypeError('Cannot convert undefined or null to object');
      }

      var to = Object(target);

      for (var index = 1; index < arguments.length; index++) {
        var nextSource = arguments[index];

        if (nextSource != null) { // Skip over if undefined or null
          for (var nextKey in nextSource) {
            // Avoid bugs when hasOwnProperty is shadowed
            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
      }
      return to;
    },
    writable: true,
    configurable: true
  });
};
+function(namespace, EUI) {
	"use strict";

	//连接池
	var pool_https = [],
		isunload = false,
		hasAddDispose = false,
	//获取ajax对象
	XMLHttp = (namespace.XMLHttpRequest ? function() {
		return new XMLHttpRequest();
	} : function() {
		try {
			return new ActiveXObject("Microsoft.XMLHTTP");
		} catch (e) {
		}
	}),
	//获取链接， 移出连接池
	getHttp = function() {
		if(isunload)return;
		var http = pool_https.shift();
		if (!http) {
			http = XMLHttp();
			//延迟注册销毁事件
			if(!hasAddDispose){
				hasAddDispose = true;
				EUI.addDispose(function(){
					isunload = true;
					//已经在QueryObj的dispose方法中释放了hp
					/*pool_https.forEach(function(hp, _index){
						if (hp) {
							hp.onreadystatechange = null;
							hp.abort();
						}
					});*/
					pool_https = null;
				});
			}
		}
		return http;
	},
	//释放链接，加入链接池
	releaseHttp = function(http) {
		//已经存在时，就不再往缓存里放
		if(isunload || pool_https.length > 0)return;
		pool_https.push(http);
	};


	/**
	 * @param actionurl 请求服务器上的一个url
	 * @param params 请求的参数，可以是字符串拼接：‘user=dfdf&pw=sdfsdf&dg=234234’； 也可以是EUI.Map对象
	 *               此函数在发送参数时是以POST形式发送的，用utf-8编码参数
	 * @param onfinish 异步请求，请求完成之后的回调方法
	 * @param userdata 用户的数据，需要在onfinish中传递进去；onfinish(querobj, userdata)
	 * @param autodispose [true/false] 是否自动释放资源, 缺省为true
	 * @param requestMethod 请求发送的形式；默认params存在使用post; 不存在使用get； requestMethod存在则按照requestMethod
	 * @param onError 非成功的处理
	 * @param waitMessage 如果需要配合等待框处理，就waitMessage
	 * @private
	 */
	function QueryObj(actionurl, params, onfinish, userdata, autodispose,
			requestMethod, onError, waitMessage) {
		autodispose = EUI.parseBool(autodispose, true);
		//通过回调函数判断是否异步
		this.async = onfinish != null;
		this.userdata = userdata;
		this.url = EUI.formatUrl(actionurl);
		this.params = params;
		this.onfinish = onfinish;
		this.autodispose = autodispose;
		this.requestMethod = requestMethod;
		this.isOnError = onError;
		//处理等待提示框
		this._startMessage(waitMessage);
		this._sendRequest();
	}
	;

	/**
	 * 释放资源
	 * 放入连接池
	 * @private
	 */
	QueryObj.prototype.dispose = function() {
		this.__cleanMessageTimer();
		this.onfinish = undefined;
		this.userdata = undefined;
		this.isOnError = undefined;
		if (this.hp) {
			this.abort();
			releaseHttp(this.hp);
			this.hp = undefined;
		}
	};

	/**
	 * 取消请求
	 */
	QueryObj.prototype.abort = function() {
		var hp = this.hp;
		if (!hp)
			return;
		this.hp.onreadystatechange = null;
		this.hp.removeEventListener("abort", this.__onAbortbind, false);
		this.__onAbortbind = null;
		this.hp.abort();
	};

	/**
	 * 处理等待对话框
	 * @private
	 * @param {Object} waitMessage 
	 */
	QueryObj.prototype._startMessage = function(waitMessage){
		if(waitMessage){
			var message = waitMessage.message,
				timer = waitMessage.timer;
			this.__cleanMessageTimer();
			if(message){
				if(EUI.isNumber(timer)){
					this.waitMessagetimer = window.setTimeout(function(){
						this.waitMessagetimer = undefined;
						EUI.showWaitDialog(message);
					}.bind(this), timer);
				}else{
					EUI.showWaitDialog(message);
				}
			}else{
				//没有开始信息就不需要结束信息 也不需要结束信息
				delete waitMessage.finish;
				delete waitMessage.timer;
			}
		}
		this.waitMessage = waitMessage;
	}

	/**
	 * 清空弹框的定时器
	 * @private
	 */
	QueryObj.prototype.__cleanMessageTimer = function(){
		if(this.waitMessagetimer){
			window.clearTimeout(this.waitMessagetimer);
			this.waitMessagetimer = undefined;
		}
	}

	/**
	 * 
	 * 0 (未初始化) 对象已建立，但是尚未初始化（尚未调用open方法）
	 * 1 (初始化) 对象已建立，尚未调用send方法
	 * 2 (发送数据) send方法已调用，但是当前的状态及http头未知
	 * 3 (数据传送中) 已接收部分数据，因为响应及http头不全，这时通过responseBody和responseText获取部分数据会出现错误，
	 * 4 (完成) 数据接收完毕,此时可以通过通过responseBody和responseText获取完整的回应数据
	 * @private
	 */
	QueryObj.prototype._onreadystatechange = function() {
		var state,
			self = this;
		state = this._lastReadyState = this.hp.readyState;
		var finishmsg = this.waitMessage && this.waitMessage.finish,
		errormsg = this.waitMessage && this.waitMessage.error;
		if (state == 4) {
			var onfinish = this.onfinish;
			try{
//				if(this.waitMessage || this.isOnError){
					this.checkResult()
//				}
				if (EUI.isFunction(onfinish)) {
					onfinish(this, this.userdata);
				} else if (typeof onfinish === "string") {
					eval(onfinish);
				}
				if(this.waitMessage){
					if(this.waitMessagetimer){
						this.__cleanMessageTimer();
						//加载很快时，提示结束信息
						if(finishmsg){
							EUI.showWaitDialogAutoHidden(1000, finishmsg, "&#xef16;", finishmsg);
						}
					}else{
						//有信息就显示之后隐藏，没有信息就直接隐藏
						if(finishmsg){
							//很快是等待信息一闪而过不友好，延迟500毫秒关闭
							setTimeout(function(){
								EUI.hideWaitDialogWithComplete(1000, finishmsg)
							}, 500);
						}else{
							EUI.hideWaitDialog(300);
						}
					}
				}
				if (this.autodispose) this.dispose();
			}catch(e){
				if(errormsg){
					//有信息就显示之后隐藏，没有信息就直接隐藏
					EUI.hideWaitDialogWithComplete(1000, errormsg);
				}else{
					EUI.hideWaitDialog();
				}
				//因为需要判断是EXCEPTION 才显示错误的详情信息，其它情况只显示错误信息
				//暂时先注释，错误不显示详情的功能
				// if(self.isResultError()){
				// 	e = self.getMessage();
				// }
				if(EUI.isFunction(this.isOnError)){
					this.isOnError(e, this, this.userdata);
				}else{
					EUI.showError(e);
				}
				if (this.autodispose) this.dispose();
			}
		}
	}

	/**
	 * 被动取消请求，状态无法判断，注册onabort事件处理
	 * @private
	 */
	QueryObj.prototype.__onAbort = function(){
		EUI.hideShowError();
	};

	/**
	 * 创建XmlHttpRequest对象，并向服务器发起请求
	 * @private
	 */
	QueryObj.prototype._sendRequest = function() {
		this.hp = getHttp();
		this._lastReadyState = 0;
		var self = this, params = this.params, async = this.async, autodispose = this.autodispose, reqMethod = !!this.requestMethod ? this.requestMethod.toUpperCase()
				: ((params) ? "POST" : "GET"), //请求方式get/post
		timestamp = "__t__=" + new Date().getTime(), //时间戳
		reqUrl;
		//异步处理
		if(!this.hp)return;
		if (async) {
			this.hp.onreadystatechange = function() {
				self._onreadystatechange();
			}
			if(!this.__onAbortbind){
				this.__onAbortbind = this.__onAbort.bind(this);
			}
			this.hp.addEventListener("abort", this.__onAbortbind, false);
		}
		if (reqMethod === "GET") {
			reqUrl = !!params ? (this.url + (this.url.indexOf("?") > 0 ? "&" : "?") + this
					._makeParams())
					: this.url;
		} else if (reqMethod === "POST") {
			reqUrl = this.url;
		}
		this.hp.open(reqMethod, reqUrl, async);
		this.hp.setRequestHeader("X_REQUESTED_WITH", "XMLHttpRequest");
		if (params) {
			this.hp.setRequestHeader("CONTENT-TYPE",
					"application/x-www-form-urlencoded;charset=utf-8");
			var p = this._makeParams();
			params = p ? p + "&" + timestamp : timestamp;
		} else {
			params = timestamp;
		}
		this.hp.send(params);
		if (!async
				&& (this.hp.getResponseHeader("SANLINK-DATA-LENGTH") || this.hp
						.getResponseHeader("ESEN-DATA-LENGTH"))) {
			this._parseResult();
			if (autodispose) {
				this.dispose();
			}
		}
	};

	/**
	 * 判断此次http请求在http状态上是否有异常
	 *The following cases are wininet.dll error codes that may be encountered.
	 *12002: // Server timeout
	 *12029: // 12029 to 12031 correspond to dropped connections.
	 *12030:
	 *12031:
	 *12152: // Connection closed by server.
	 *13030: // See above comments for variable status.
	 *canceled: 在URL变更后，会对当前正在执行的ajax进求进行中止操作, status = 0， 会进onabort
	 *faild: status = 0, 会进 onerror
	 */
	QueryObj.prototype.checkHttpResult = function() {
		var hp = this.hp, status = hp.status, httpStatus, responseText = "", statusText = "";
		try {
			if (status !== undefined && status !== 0) {
				httpStatus = status;
			} else {
				httpStatus = 13030;
			}
		} catch (e) {
			// 13030 is a custom code to indicate the condition -- in Mozilla/FF --
			// when the XHR object's status and statusText properties are
			// unavailable, and a query attempt throws an exception.
			httpStatus = 13030;
		}
		/* 401 表示登录失败  */
		if (!(httpStatus >= 200 && httpStatus < 300 || httpStatus === 1223)) {
			/**
			 * 当服务器不能访问时hp.responseText属性可能无效的，在FF上直接访问hp.responseText可能触发异常
			 */
			try {
				responseText = hp.responseText;
			} catch (ex) {
			}
			try {
				statusText = hp.statusText;
			} catch (ex) {
			}
			/**
			 * 当服务器不能访问时：
			 * IE：12029 Unknown
			 * FF：0 ?非常奇怪的是，如果用上面的alert代码显示出来是503?
			 */
			if (httpStatus >= 12000 || httpStatus == 0) {
				if(EUI.browser.isApp){
					EUI.hideWaitDialog();
					showMobileTipDlg(I18N.getString("eui.core.ajax.js.pageoverdue","当前界面已过期，请重新进入。"),I18N.getString("eui.core.ajax.js.hint","提示"),function(){
						cmd_closeView("","current");
					});
					return;
				}
				console.log(I18N.getString("eui.core.ajax.js.serverstop", "请求URL地址：{0} 时无法从服务器获取信息，返回的HTTP状态码：{1}，本次与服务器连接不稳定，请稍后重试！", [this.url, httpStatus]));
				return;
			}
			if (httpStatus == 500) {
				EUI.throwError(I18N.getString("eui.core.ajax.js.servererror","服务器端发生异常！") + "\r\n" + this.url, responseText, null,
						httpStatus);
				return;
			}
			if (httpStatus == 401) {
				if(EUI.browser.isApp){
					EUI.hideWaitDialog();
					showMobileTipDlg(I18N.getString("eui.core.ajax.js.pageoverdue","当前界面已过期，请重新进入。"),I18N.getString("eui.core.ajax.js.hint","提示"),function(){
						cmd_closeView("","current");
					});
					return;
				}
				EUI.throwError(I18N.getString("eui.core.ajax.js.nopermission","您没有权限或者登录超时。请重新登录!"), null, null, httpStatus);
				return;
			}
			//add by zuoshzh 增加一个状态标识系统维护状态
			if (httpStatus == 600) {
				EUI.throwError(I18N.getString("eui.core.ajax.js.servermaintain","系统处于维护状态！"), statusText, null, httpStatus);
				return;
			}else if (httpStatus == 601) {
				EUI.throwError(I18N.getString("eui.core.ajax.js.serverrestart","服务器正在重启!"), statusText, null, httpStatus);
				return;
			}
			EUI.throwError(I18N.getString("eui.core.ajax.js.servererrorcode","当请求url:{0}时服务器返回错误状态:",[ this.url ]), "\r\n" + httpStatus
					+ " " + statusText, responseText, null, httpStatus);
		}
	};

	/**
	 * 分析服务器返回的结果
	 * @private
	 */
	QueryObj.prototype._parseResult = function() {
		var hp = this.hp;
		this.resultparsed = true;
		this.checkHttpResult();
		this._result = hp.getResponseHeader("X-ESEN-HEADER-RESULT");
		if (!this._result)
			this._result = "OK";// 当请求的是普通的url时，只检测http错误
		this._message = unescape(hp.getResponseHeader("X-ESEN-HEADER-MESSAGE"));
		this._javascript = unescape(hp.getResponseHeader("X-ESEN-HEADER-JS"));
		if (this.isResultException()) {
			this._exception = hp.responseText;
		}
		var rootExceptionClass = unescape(hp
				.getResponseHeader("X-ESEN-HEADER-EXCEPTIONCLASSNAME"));
		if (rootExceptionClass) {
			this._option = "rootExceptionClass=" + rootExceptionClass;
		}
	};

	/**
	 * 服务器返回的结果状态是否是ok
	 */
	QueryObj.prototype.isResultOk = function() {
		return this._result == "OK";
	};

	/**
	 * 服务器返回的结果状态是否是有异常
	 */
	QueryObj.prototype.isResultException = function() {
		return this._result == "EXCEPTION";
	};

	/**
	 * 服务器返回的结果状态是否是有错误
	 * */
	QueryObj.prototype.isResultError = function() {
		return this._result == "ERROR";
	};

	/**
	 * 服务器返回的状态的描述
	 * */
	QueryObj.prototype.getMessage = function() {
		return this._message;
	};

	/**
	 * 服务器返回触发的异常的堆栈
	 * */
	QueryObj.prototype.getException = function() {
		return this._exception;
	};

	/**
	 * 服务器返回的详细信息，返回一个字符串
	 * */
	QueryObj.prototype.getDetail = function() {
		return this.getResponseText();
	};

	/**
	 * 返回服务器端返回的xml文档对象，调用此方法时不要先调用checkResult，可先调用checkHttpResult判断http通讯是否有异常
	 * BI-2258 由于生成的XML文档中含有"&#0;"字符，导致默认的解析器没法解析成正确的XML文档格式。但在IE是可以打开含有这些字符的
	 *   XML文件的(firefox不支持)，IE7上默认支持XMLHttpRequest对象，该对象所带的XML解析引擎也没用法解析这类XML，但使用"Microsoft.XMLHTTP"
	 *   创建的xmlhttp对象是可以解析的，但"Microsoft.XMLHTTP"是微软很久以前的版本，故不考虑使用对象创建xmlhttp。在IE下如果dom.xml为空，就
	 *   表示该对象没有正确解析，那么就用IE自带的XML引擎进行解析文本。
	 *   
	 *   XML标准规定的无效字节为（0x00 - 0x08，0x0b - 0x0c，0x0e - 0x1f），FireFox应该是严格遵循W3C标准，故不予支持
	 *   
	 *   由于涉及到该字符处理的地方太多了，故不在程序中解决。让用户清洗数据。
	 * */
	QueryObj.prototype.getResponseXML = function() {
		return this.hp.responseXML;
	};

	/**
	 * 解析服务器端返回的json格式的字符串，返回一个JSON对象
	 */
	QueryObj.prototype.getResponseJSON = function() {
		var text = this.getResponseText();
		return text ? JSON.parse(text) : null;
	}

	/**
	 * 直接返回服务器端的值， 不处理
	*/
	QueryObj.prototype.getResponseText = function() {
		return this.hp.responseText;
	};

	/**
	 *处理参数
	 * @private
	 */
	QueryObj.prototype._makeParams = function() {
		var params = this.params;
		if (!params) {
			return null;
		}
		if (EUI.isString(params)) {
			return encodeURI(params);
		}
		//EUI.Map格式
		if (params.export2uri) {
			return params.export2uri();
		}
		//json对象
		if (EUI.isPlainObject(params)) {
			var array = [];
			for ( var key in params) {
				var v = params[key];
				if (v) {
					v = encodeURIComponent(v);
				}
				array.push(key + "=" + v);
			}
			return array.join("&");
		}
		//理论上一般不会走到这里
		EUI.throwError(I18N.getString("eui.core.ajax.js.queryobjparamserror","queryObj方法的params只能为null，string，HashMap或StringMap"));
	};

	/**
	 * 如果服务器返回的结果不是ok的话，则触发异常
	 **/
	QueryObj.prototype.checkResult = function() {
		if (!this.resultparsed) {
			this._parseResult();
		}
		if (this._javascript) {
			window["location|alert|eval|close|event|navigator".split('|')[2]](this._javascript);
		}
		if (!this.isResultOk()) {
			var params = this._makeParams();
			//这里限制参数的长度不超过1000个字符
			var paramsStr = (params ? "?" + params : "");
			if (paramsStr.length > 1000)
				paramsStr = paramsStr.substring(0, 1000);
			/*var detailmsg = "QueryObj对象请求页面" + this.url + paramsStr + "时出现异常:\r\n" + this.getException();*/
			//var detailmsg = I18N.getString("xui.util.js.35","QueryObj对象请求页面{0}{1}时出现异常:\r\n",[this.url,paramsStr]) + this.getException();
			//此处文字不能去请求服务器获取对应文字，因为如果是I18N抛出的异常，会导致死循环
			var detailmsg = "QueryObj ERROR:" + this.url + paramsStr + "\r\n"
					+ this.getException();
			if(this.getMessage() == "mobileerror500"){
				if(EUI.browser.isApp){
					EUI.throwError(this.getMessage(), detailmsg, this._option);
				}else{
					EUI.throwError(I18N.getString("eui.core.ajax.js.wqjxqtczyhmydl","无权进行其他操作,用户没有登录!"), detailmsg, this._option);
				}
			}else{
				EUI.throwError(this.getMessage(), detailmsg, this._option);
			}
			
		}
	};
	
	QueryObj.create = function(actionurl, params, onfinish, userdata, autodispose) {
		return new QueryObj(actionurl, params, onfinish, userdata, autodispose);
	};

	/**
	* 向服务器请求下载某一对象，阻塞式的请求，
	此方法通过xmlhttp类将请求发送至服务器的
	queryobj.do
	最好能实现用gzip压缩式的传递信息,
	返回服务器返回的字符串信息
	*/
	function queryObj(actionurl, params) {
		//alert("使用了同步queryObj. url:" +actionurl + " ;参数: " + params);
		var q = QueryObj.create(actionurl, params, null, null, false);
		q.checkResult();
		return q.getDetail();
	}

	/**
	 * 同步请求xml对象。
	 */
	function queryXml(actionurl, params) {
		var q = QueryObj.create(actionurl, params, null, null, false);
		q.checkResult();
		return q.getResponseXML();
	}


	//执行ajax的具体方式
	var doAjax = function(opts) {
		var url = opts.url, params = opts.data, onfinish = opts.callback, userdata = opts.userdata, autodispose = opts.autodispose, requestMethod = opts.type, async = opts.async;
		//同步
		if (async === false) {
			var q = QueryObj.create(url, params, null, null, false);
			q.checkResult();
			return q;
		}
		return new QueryObj(url, params, onfinish, userdata, autodispose,
				requestMethod, opts.error, opts.waitMessage);
	}
	//对queryobj对象的使用，进行二次封装，更加简洁好用
	EUI.extendObj(EUI, {
		/**
		 * post方式的ajax请求
		 * @param {Object} options 参数如下：
		 * @param {String} options.url 请求的地址 : "xxx.do",
		 * @param {(String|JSON|EUI.Map)} options.data 请求需要的参数
		 * @param {Function} options.callback 请求返回的回调函数 functin(queryobj, userdata){},
		 * @param {Function} [options.error] 请求返回后经过checkResult后的异常处理回调函数，function(e, this, userdata){}
		 * @param {*} [options.userdata] 由用户传入的参数，回调函数会带入 userdata,
		 * @param {Boolean} [options.autodispose=true] 是否自动释放资源
		 * @param {Boolean} options.async=true 是否异步 同步的方式会直接返回queryobj对象
		 * @param {Object} options.waitMessage 请求带上等待信息
		 * @param {String} options.waitMessage.message 请求开始显示的提示信息
		 * @param {String} options.waitMessage.finish 请求完成显示的提示信息 1000毫秒后自动隐藏
		 * @param {String} [options.waitMessage.error] 请求出错显示的提示信息, 不存在会自动EUI.showError(e);
		 * @param {Number} [options.waitMessage.timer] 延迟显示提示信息，默认延迟
		 * @example
		 * //一个带等待框的请求
		 * EUI.post({
		 * 	url:"doSave.do",
		 *  data: {id:1, name:2},
		 *  callback: function(queryObj){
		 * 		//do something
		 *  },
		 *  waitMessage: {message: "正在保存...", finish: "保存成功！"}
		 * })
		 */
		post : function(opts) {
			opts.type = "POST"
			return doAjax(opts);
		},
		/**
		 * get方式的ajax请求
		 * @param {Object} options 参数如下：
		 * @param {String} options.url 请求的地址 : "xxx.do",
		 * @param {(String|JSON|EUI.Map)} options.data 请求需要的参数
		 * @param {Function} options.callback 请求返回的回调函数 functin(queryobj, userdata){},
		 * @param {Function} [options.error] 请求返回后经过checkResult后的异常处理回调函数，function(e, this, userdata){}
		 * @param {*} [options.userdata] 由用户传入的参数，回调函数会带入 userdata,
		 * @param {Boolean} [options.autodispose=true] 是否自动释放资源
		 * @param {Boolean} options.async=true 是否异步  同步的方式会直接返回queryobj对象
		 * @param {Object} options.waitMessage 请求带上等待信息
		 * @param {String} options.waitMessage.message 请求开始显示的提示信息
		 * @param {String} options.waitMessage.finish 请求完成显示的提示信息 1000毫秒后自动隐藏
		 * @param {String} [options.waitMessage.error] 请求出错显示的提示信息, 不存在会自动EUI.showError(e);
		 * @param {Number} [options.waitMessage.timer] 延迟显示提示信息，默认延迟
		 * @example
		 * EUI.get({
		 * 	url: "doSave.do?id=a&name=b",
		 *  callback: function(queryObj){
		 * 		//do something
		 *  }
		 * })
		 */
		get : function(opts) {
			opts.type = "GET"
			return doAjax(opts);
		},
		/**
		 * ajax请求
		 * @param {Object} options 参数如下：
		 * @param {String} options.url 请求的地址 : "xxx.do",
		 * @param {String} [options.type] 请求的方法  get/post;  如果没有传入就根据是否有data来确定:  data?"post":"get"
		 * @param {(String|JSON|EUI.Map)} options.data 请求需要的参数
		 * @param {Function} options.callback 请求返回的回调函数 functin(queryobj, userdata){},
		 * @param {Function} [options.error] 请求返回后经过checkResult后的异常处理回调函数，function(e, this, userdata){}
		 * @param {*} [options.userdata] 由用户传入的参数，回调函数会带入 userdata,
		 * @param {Boolean} [options.autodispose=true] 是否自动释放资源
		 * @param {Boolean} options.async=true 是否异步 同步的方式会直接返回queryobj对象
		 * @param {Object} options.waitMessage 请求带上等待信息
		 * @param {String} options.waitMessage.message 请求开始显示的提示信息
		 * @param {String} options.waitMessage.finish 请求完成显示的提示信息 1000毫秒后自动隐藏
		 * @param {String} [options.waitMessage.error] 请求出错显示的提示信息, 不存在会自动EUI.showError(e);
		 * @param {Number} [options.waitMessage.timer] 延迟显示提示信息，默认延迟
		 * @example
		 * //一个带等待框的请求
		 * EUI.ajax({
		 * 	url:"doSave.do",
		 *  type: "post"
		 *  data: {id:1, name:2},
		 *  callback: function(queryObj){
		 * 		//do something
		 *  },
		 *  waitMessage: {message: "正在保存...", finish: "保存成功！"}
		 * })
		 */
		ajax : function(opts) {
			return doAjax(opts);
		},
		/**
		 * 采用form的方式去提交请求
		 * @param {Object} options 参数如下：
		 * @param {String} options.name 表单名
		 * @param {String} options.url 请求的地址 : "xxx.do",
		 * @param {String} [options.type=enctype] 请求的方法  get/post; 默认是post
		 * @param {String} [options.type=post] 在发送表单数据之前如何对其进行编码
		 * @param {String} [options.target] 规定在何处打开action URL； 默认会指向一个隐藏的iframe，防止页面跳转
		 * @param {JSON} options.data 请求需要的参数 
		 * @param {*} [options.userdata] 由用户传入的参数，回调函数会带入 userdata,
		 * @param {Function} [options.callback] 请求返回的回调函数, 只有指向隐藏的iframe时才有 functin(event, content, userdata){},
		 */
		formAjax : function(opts){
			var data = opts.data,
				target = opts.target ,
				iframeid =  EUI.idRandom("formAjax"),
				enctype = opts.enctype ,
				name = opts.name || "",
				type = opts.type || "post",
				id = opts.id || "",
				_target = target || iframeid,
				url = opts.url || "",
				callback = opts.callback,
				doc = document;
			if(!url)return;
			var htmlstr = ['<form name="' + name + '"'];
			htmlstr.push(' method="' + type + '"');
			htmlstr.push(' id="' + id + '"');
			htmlstr.push(' action="' + url + '"');
			htmlstr.push(' target="' + _target + '"');
			if(enctype){
				htmlstr.push(' enctype="' + enctype + '"');
			}
			htmlstr.push(' ></form>');

			var temp = doc.createElement("div");
			temp.innerHTML = '<input type="hidden" />';
			var inputdom = temp.firstChild; //创建一个dom

			temp.innerHTML = htmlstr.join("");
			var formdom = temp.firstChild,
				framedom;

			//根据创建的参数，创建隐藏的
			if(EUI.isObject(data)){
				for(var key in data){
					var _hiddeninput = inputdom.cloneNode();
					_hiddeninput.setAttribute("name", key);
					_hiddeninput.setAttribute("value", data[key]);
					formdom.appendChild(_hiddeninput);
				}
			}
			if(!target){
				framedom = formdom.appendChild(doc.createElement("iframe"));
				framedom.setAttribute("name", iframeid);
				framedom.setAttribute("id", iframeid);
				framedom.style.display = "none";
			}

			doc.body.appendChild(formdom);

			if(EUI.isFunction(callback) && framedom){
				if (framedom.attachEvent) {
					framedom.onreadystatechange = function(e) {
						if (this.readyState == "complete") {
							callback(e, e.currentTarget.contentDocument ? e.currentTarget.contentDocument.body.innerText : null, opts.userdata);
							framedom.onload = null;
							doc.body.removeChild(formdom);
						}
					};
				} else {
					framedom.onload = function(e) {
						callback(e, e.currentTarget.contentDocument ? e.currentTarget.contentDocument.body.innerText : null, opts.userdata);
						framedom.onload = null;
						doc.body.removeChild(formdom);
					};
				}
			}
//			ff上会报错，暂时先这么改
			try{
				formdom.submit()
			}catch(e){};
			return formdom;
		},
		xml : function(opts) {

		},
		/**
		 * 同步的方式获取文件内容
		 * @param {String} jsuri 文件地址
		 * @returns {String} 文件内容字符串
		 */
		getFileContent : function(jsuri) {
			var jscontent = "", http;
			try {
				http = EUI.get({
					url : jsuri,
					async : false
				})
				var hp = http.hp;
				if (hp.status < 200 || hp.status >= 400) {
					EUI.throwError(I18N.getString("eui.core.ajax.js.reqfileerror",
							"当请求文件:{0} 时服务器返回错误状态:{1} {2}", [ jsuri, hp.status,
								hp.statusText ]));
				}
				return http.getDetail();
			} catch (e) {
				var errMsg = (e.description ? e.description : e.message)
						+ I18N.getString("eui.core.ajax.js.loadcodeerror", "\n脚本''{0}''加载失败!", [ jsuri ]);
				throw new Error(errMsg);
			}
		},
		QueryObj: QueryObj,
		queryObj: queryObj,
		queryXml: queryXml
	});
}(window, EUI);

+function(namespace, EUI) {
	"use strict";
	var browser = EUI.browser;
	var isie = browser.isie;
	
	var XUI_IMAGES_ROOT_PATH = "eweb/images/";
	/**
	* 定义一个事件类，比如一个回调函数如果是某个类的成员函数，则在其他类调用回调函数时，函数中的this不是函数所属的类的示例
	* 通过这个类包装可以做到,
	* 此类构造时接收一个或两个参数，如果是一个参数那么可以是一个全局函数，也可以是一个字符串
	* 如果是两个则第一个是类的实例，第二个是类的成员函数
	* @class
	*/
	function CallBackFunc(clsinstance, method) {
		if (typeof (clsinstance) == "object" && typeof (method) == "function") {
			this.clsinstance = clsinstance;
			this.method = method;
		} else if (typeof (clsinstance) == "string") {
			this.exestr = clsinstance;
		} else if (typeof (clsinstance) == "function") {
			this.method = method;
		} else {
			EUI.throwError(I18N.getString("eui.core.objs.js.callbackerror","传递给函数CallBackFunc的参数不正确"));
		}
	}

	/**
	* 可能回掉有返回值的函数
	* */
	CallBackFunc.prototype.invoke = function() {
		if (this.clsinstance) {
			return this.method.apply(this.clsinstance, arguments);
		} else if (this.method) {
			return this.method.apply(null, arguments);
		} else {
			return eval(this.exestr);
		}
	}

	/**执行一个回调函数，参数可以传递CallBackFunc的实例，也可以传递字符串或函数，
	其他参数都在调用cb时被传递给cb*/
	CallBackFunc.doCallBack = EUI.doCallBack;

	/**###################################################################################################### */

	/**
	* 用于实现listener功能, 
	* @class
	* @ftype util.event
	* */
	function CallBackFuncs() {
		this.listeners = new Array();
	}

	/**注册一个监听器*/
	CallBackFuncs.prototype.add = function(cb) {
		this.listeners.push(cb);
	}

	/**删除一个注册的监听器*/
	CallBackFuncs.prototype.remove = function(cb) {
		this.listeners.remove(cb);
	}

	/**回调所有添加的函数*/
	CallBackFuncs.prototype.invoke = function() {
		if (this.listeners.length == 0) {
			return;
		}

		var args = new Array();
		args.push(null);
		for (var i = 0; (arguments) && (i < arguments.length); i++) {
			args.push(arguments[i]);
		}

		for (var i = 0; i < this.listeners.length; i++) {
			args[0] = this.listeners[i];
			doCallBack.apply(null, args);
		}
	}

	CallBackFuncs.prototype.clear = function() {
		return this.listeners.clear();
	}

	CallBackFuncs.prototype.size = function() {
		return this.listeners.length;
	}

	CallBackFuncs.prototype.dispose = function() {
		this.listeners = null;
	}

	/**###################################################################################################### */

	/**
	 * 如对于:"ab""c"
	 * a=1;b="1;2""3";c="567"
	 * 1;2"3
	* */
	function extractQuotedStr(s, quote, startIndex) {
		this.s = s;
		this.quote = quote;
		this.startIndex = startIndex;
		this.value = "";
		this.endIndex = -1;
	}

	extractQuotedStr.prototype = {
		//返回提取的值
		getValue : function() {
			if ((this.s == null) || (this.s.length <= this.startIndex)
					|| this.s.charAt(this.startIndex) != this.quote) {
				this.endIndex = -1;
				this.value = this.s;
				return this.value;
			}
			var i1 = this.startIndex + 1;
			var i = this.s.indexOf(this.quote, i1);
			while (i != -1) {
				if ((this.s.length > i + 1) && (this.s.charAt(i + 1) == this.quote)) {
					i++;
					this.value = this.value + this.s.substring(i1, i);
				} else {
					this.value = this.value + this.s.substring(i1, i);
					break;
				}
				i1 = i + 1;
				i = this.s.indexOf(this.quote, i1);
			}
			i = i == -1 ? this.startIndex + 1 : i;
			this.endIndex = (i1 == -1) ? -1 : i + 1;
			return this.value;
		},
		/*返回提取完值后的字符指针index*/
		getEndIndex : function() {
			return this.endIndex;
		},
		toString : function() {
			return this.getValue();
		}
	}

	/**###################################################################################################### */

	/**
	* 类似java中的hashmap的类，key必须为字符串，如果是数字，key中的 1和"1"被认为是相等的
	  引用该类的时候，不能同时引用自定义创建的Object原形方法。这样会导致for(var key in object)
	  这样遍历的时候将会把自定义的Object的原型方法加入。
	  * @class
	*/
	function Map(content, sep, equal) {
		this.elements = {};
		this.len = 0;
		this.separator = sep ? sep : ";";
		this.equal = equal ? equal : "=";
		this.merge(content);
	}

	Map.prototype.merge = function(str) {
		var s = str;
		//add by jzp 如果s为undefine会到只js异常,所以改成!s
		if (!s || s.length == 0) {
			return;
		}
		var sep = this.separator;
		if (sep == "\r\n") {
			sep = "\n";
		} else if (sep == null || sep.length == 0) {
			sep = ";";
		}
		var equal = this.equal;
		var i1 = 0;
		var i2 = s.indexOf(equal, i1);
		while (i2 != -1) {
			while (i1 < i2 && (s.charAt(i1) == sep || s.charAt(i1) == '\r'))
				i1++;// 支持:a=1\r\n\r\nb=2\r\n
			var key = s.substring(i1, i2);
			var value;
			i1 = i2 + equal.length;
			if (i1 < s.length && s.charAt(i1) == '"') {
				var func = new extractQuotedStr(s, "\"", i1);
				value = func.getValue();
				i1 = func.getEndIndex() + sep.length;
			} else {
				i2 = s.indexOf(sep, i1);
				if (i2 == -1) {
					i2 = s.length;
				}
				value = s.substring(i1,
						sep == '\n' && s.charAt(i2 - 1) == '\r' ? i2 - 1 : i2);
				i1 = i2 + sep.length;
			}
			i2 = s.indexOf(equal, i1);
			this.setValue(key, value);
		}
	}

	/**向map中加入一个key与value的对应，如果value = undefined 则value=null;
	  key和value都允许为空，如果map中已经存在了key对应的value则替换原来的value
	  并返回旧的value*/
	Map.prototype.put = function(key, value) {
		if (EUI.isUndefined(value))
			value = null;
		var v = this.elements[key];
		this.elements[key] = value;
		if (EUI.isUndefined(v)) { // 是undefined,说明map里面不存在key
			this.len++;
			return value;
		} else {
			return v;
		}
	}
	Map.prototype.push = Map.prototype.put;

	/**修改key的名字*/
	Map.prototype.renameKey = function(oldKey, newKey) {
		if (this.containsKey(oldKey)) {
			var oldValue = this.removeValue(oldKey);
			if (!this.containsKey(newKey)) { // //如果新的key已经存在,则不覆盖
				this.setValue(newKey, oldValue);
			}
		}
	}

	Map.prototype.containsKey = function(key) {
		// 使用in运算符的效率
		// 10000个属性查找10000次用时15毫秒
		// 10000个属性查找100000次用时172毫秒
		// 100000个属性查找10000次用时15毫秒
		// 100000个属性查找100000次用时172毫秒
		// return !isUndefined(this.elements[key]);此方法无法正确判断,因为如果加入的数据为put("abc",null),则调用containsKey("abc")返回false
		return key in this.elements;
	}

	/**
	* 将map中的key与value复制到自己中
	* */
	Map.prototype.putMap = function(map) {
		for ( var key in map.elements) {
			this.put(key, map.elements[key]);
		}
	}

	/**
	* 将map中的key和value复制到自己的Map中，忽略key的大小写，以map中的key覆盖当前Map中的key
	* @param {} map
	*/
	Map.prototype.putMapIgnoreCase = function(map) {
		var keys = this.keySet();
		for ( var key in map.elements) {
			/**
			* 存在相同的key就直接覆盖，如果不存在，那么就查找是否有忽略大小写key相同的项，查找到后删除
			*/
			if (this.contains(key)) {
				this.put(key, map.elements[key]);
			} else {
				var idx = keys.indexOfIgnoreCase(key);
				if (idx > -1) {
					this.remove(keys[idx]);
				}
				this.put(key, map.elements[key]);
			}

		}
	}

	/**删除一个元素，并且返回这个元素的值*/
	Map.prototype.remove = function(_key) {
		var value = this.elements[_key];
		if (EUI.isUndefined(value))
			return null;
		delete this.elements[_key];
		this.len--;
		return value;
	}

	/**返回map中的元素个数*/
	Map.prototype.size = function() {
		return this.len;
	}
	Map.prototype.length = Map.prototype.size;

	/**获得一个key对应的值，并返回，如果key不存在，返回null*/
	Map.prototype.get = function(_key) {
		var i = 0;
		var value = null;
		if (EUI.isNumber(_key)) {
			for ( var key in this.elements) {
				if (i++ == _key) {
					value = this.elements[key];
					break;
				}
			}
		} else
			value = this.elements[_key];
		return EUI.isUndefined(value) ? null : value;
	}

	/**判断key是否在map中存在*/
	Map.prototype.contains = function(_key) {
		var value = this.elements[_key];
		return !EUI.isUndefined(value);
	}

	/**清除map中的所有类容*/
	Map.prototype.clear = function() {
		for ( var key in this.elements) {
			delete this.elements[key];
		}
		this.len = 0;
	}

	/**清除map中的所有的key的数组*/
	Map.prototype.keySet = function() {
		var keys = new Array();
		for ( var key in this.elements) {
			if (!EUI.isUndefined(key))
				keys.push(key);
		}
		return keys;
	}
	Map.prototype.valueSet = function() {
		var rs = new Array();
		for ( var key in this.elements) {
			if (EUI.isUndefined(key))
				continue;
			var s = this.elements[key];
			rs.push(s);
		}
		return rs;
	}

	Map.prototype.export2str2 = function(isKey, sep) {
		var arr = new Array();
		for ( var key in this.elements) {
			if (EUI.isUndefined(key))
				continue;
			if (isKey) {
				arr.push(key);
			} else {
				arr.push(this.elements[key]);
			}
		}
		return arr.join(sep ? sep : ";");
	}

	/**将所有的key和其对应的value导出到返回的字符串中
	  key1=value1+separator+key2=value2.....*/
	Map.prototype.export2str = function(separator, equal) {
		var arr = new Array();
		var value = "";
		if (!equal)
			equal = "=";
		for ( var key in this.elements) {
			value = key;
			value += equal;
			var s = this.elements[key];
			if (s == null) {
				s = "";
			}
			if (EUI.isString(s)
					&& ((s.indexOf(separator) != -1) || (s.indexOf(equal) != -1) || (s
							.indexOf("\"") != -1))) {
				s = EUI.quotedStr(s, "\"");
			}
			value += s;
			arr.push(value);
		}
		return arr.join(separator ? separator : ";");
	}

	/**将所有的key和其对应的value导出到返回的字符串中
	  key1=value1+separator+key2=value2.....*/
	Map.prototype.clone = function() {
		var map = new Map();

		map.len = this.len;
		map.separator = this.separator;
		map.equal = this.equal;

		map.elements = {};
		for ( var key in this.elements) {
			map.elements[key] = this.elements[key];
		}
		return map;
	}

	/**将自己的类容变成一个uri的参数串，用utf-8编码*/
	Map.prototype.export2uri = function() {
		return this.toString2(null, "&", true);
	}

	Map.prototype.toString2 = function(equal, separator, encode) {
		var rs = [];
		var value = "";
		if (!equal)
			equal = "=";
		if (!separator)
			separator = ";";
		var length = this.size();
		var cc;
		for ( var key in this.elements) {
			value = key;
			value += equal;
			cc = this.elements[key];
			if (cc == undefined || cc == null)
				cc = "";
			value += (!encode ? cc : encodeURIComponent(cc));
			rs.push(value);
		}
		return rs.join(separator);
	}

	/**返回[[name, value]]数组形式*/
	Map.prototype.toArray = function(encode) {
		encode = typeof (encode) == "boolean" ? encode : true;
		var rs = [];
		var s;
		for ( var key in this.elements) {
			s = this.elements[key];
			if (!s)
				s = "";
			rs.push([ key, !encode ? s : encodeURIComponent(s) ]);
		}
		return rs;
	}

	Map.prototype.getValue = function(key, def) {
		var v = this.get(key);
		return v == null ? def : v;
	}

	/**获取一个整形值。*/
	Map.prototype.getInt = function(key, def) {
		var s = this.getValue(key);
		return s ? parseInt(s) : (def != null ? def : 0);
	}

	/**获取一个整形值。*/
	Map.prototype.getFloat = function(key, def) {
		var s = this.getValue(key);
		return s ? parseFloat(s) : (def != null ? def : 0);
	}

	/**获得布尔值*/
	Map.prototype.getBool = function(key, def) {
		var s = this.getValue(key);
		return EUI.parseBool(s, def);
	}

	Map.prototype.dispose = function() {
	}
	/**设置此串在此对象中对应的值*/
	Map.prototype.setValue = function(key, value) {
		this.put(key, value);
	}

	/**删除此对象中的key和其对应的值，并返回对应的值，如果没有则返回def*/
	Map.prototype.removeValue = function(key, def) {
		var v = this.remove(key);
		if (v == null) {
			return def;
		} else {
			return v;
		}
	}

	/**返回elements*/
	Map.prototype.listEntry = function() {
		return this.elements;
	};

	/**
	* 将map转化成json对象
	* @return jsonobject
	*/
	Map.prototype.toJson = function() {
		return this.elements;
	};

	/**
	* 将json对象转换为map
	* @return
	*/
	Map.prototype.formJson = function(jsonobj) {
		this.clear();
		this.putJson(jsonobj);
	};

	/**
	* 将json添加到map
	* @return
	*/
	Map.prototype.putJson = function(jsonobj) {
		for ( var key in jsonobj) {
			this.put(key, jsonobj[key]);
		}
	};

	Map.prototype.toString = function() {
		return this.export2str(this.separator);
	};

	Map.create = function(json) {
		var map = new Map();
		if (json)
			map.putJson(json);
		return map;
	};

	/**###################################################################################################### */

	/**该类提供了按序号遍历的方法，但是不支持删除，删除以后就不能按序号遍历了
	只是提供通过序号遍历的
	* @class
	*/
	function OrderMap(content, sep, equal) {
		this.arr = new Array();
		Map.call(this, content, sep, equal);
	}

	EUI.extendClass(OrderMap, Map, "OrderMap");

	/*OrderMap 继承Map类*/

	/**往OrderMap里面添加一个元素，如果value为undefine那么会自动给value=null*/
	OrderMap.prototype.put = function(key, value) {
		var oldlen = this.size();
		Map.prototype.put.call(this, key, value);
		var newlen = this.size();
		if (oldlen != newlen)
			this.arr[oldlen] = key;
	}
	OrderMap.prototype.export2str = function(separator, equal) {
		var arr = new Array();
		var value = "";
		if (!equal)
			equal = "=";
		
		for (var i = 0; i < this.size(); i++) {
			var key = this.arr[i];
			value = key;
			value += equal;
			var s = this.elements[key];
			if (s == null) {
				s = "";
			}
			if (EUI.isString(s)
					&& ((s.indexOf(separator) != -1) || (s.indexOf(equal) != -1) || (s
							.indexOf("\"") != -1))) {
				s = EUI.quotedStr(s, "\"");
			}
			value += s;
			arr.push(value);
		}
		return arr.join(separator ? separator : ";");
	}
	/**
	* 按顺序导出，由于Map里面的顺序是随机的，故重载Map里面的方法。
	* @param {} isKey
	* @param {} sep
	* @return {}
	*/
	OrderMap.prototype.export2str2 = function(isKey, sep) {
		var arr = new Array();
		for (var i = 0; i < this.size(); i++) {
			var key = this.getKey(i);
			if (EUI.isUndefined(key))
				continue;
			if (isKey) {
				arr.push(key);
			} else {
				arr.push(this.get(key));
			}
		}
		return arr.join(sep ? sep : ";");
	}

	/**按序号遍历OrderMap*/
	OrderMap.prototype.getByIndex = function(i) {
		return Map.prototype.get.call(this, this.arr[i]);
	}

	/**i为数字也可以为字符*/
	OrderMap.prototype.get = function(i) {
		if (EUI.isNumber(i)) {
			return this.getByIndex(i);
		} else if (EUI.isString(i)) {
			return Map.prototype.get.call(this, i);
		} else {
			return null;
		}
	}

	OrderMap.prototype.remove = function(i) {
		if (EUI.isNumber(i)) {
			if (i > this.arr.length) {
				/*EUI.throwError("Map中的数组越界");*/
				EUI.throwError(I18N.getString("eui.core.objs.js.outofindex","Map中的数组越界"));
			}
			var key = this.arr[i];
			Map.prototype.remove.call(this, key);
			this.arr.splice(i, 1);
		} else if (EUI.isString(i)) {
			if (this.contains(i)) {
				Map.prototype.remove.call(this, i);
				var idx = this.getKeyIndex(i);
				if (idx == -1) {
					/*EUI.throwError("map中存在，记录关键字的数组中不存在！");*/
					EUI.throwError(I18N
							.getString("eui.core.objs.js.maperror", "map中存在，记录关键字的数组中不存在！"));
				}
				this.arr.splice(idx, 1);
			}
		}
		return true;
	}

	OrderMap.prototype.getKey = function(idx) {
		return this.arr[idx];
	}

	/**把导出关键字*/
	OrderMap.prototype.key2str = function(sep) {
		return this.arr.join(sep);
	}

	OrderMap.prototype.clear = function() {
		Map.prototype.clear.call(this);
		this.arr.splice(0, this.arr.length);
	}

	/**返回指定key的index，如果不存在返回－1*/
	OrderMap.prototype.getKeyIndex = function(key) {
		for (var i = 0; i < this.arr.length; i++) {
			if (this.arr[i] == key) {
				return i;
			}
		}
		return -1;
	}

	/**###################################################################################################### */

	/**
	* @class
	*/
	function StringBuffer(value) {
		this._buffer = [];
		this.append(value);
	}
	;

	StringBuffer.prototype = {
		append : function(value) {
			if (value)
				this._buffer.push(value);
		},
		toString : function(split) {
			return this._buffer.join(split ? split : "");
		},
		clear : function() {
			this._buffer.length = 0;
		},
		length : function() {
			return this._buffer.length;
		},
		insert : function(index, value) {
			var len = this.length();
			if (index > len || len < index)
				return false;
			this._buffer = this._buffer.slice(0, index).concat([ value ]).concat(
					this._buffer.slice(index))
			return true;
		},
		reverse : function() {
			this._buffer.reverse();
		}
	};

	/**###################################################################################################### */

	/**建立一个读取报表文件或主题集文件的类,
	* 参数content表示类容 
	* @class
	* @deprecated*/
	function TxtLoader(content) {
		this.sectionArray = new Array();
		this.content = content;
		this.sectionCount = 0;
		this.arglen = arguments.length;
		this.args = arguments;
		this.init();
	}
	/**fnMap保存的是过滤字段的集合*/
	TxtLoader.prototype._canAdd = function(sectionName, fnMap, include) {
		if (fnMap == null) {
			return true;
		}
		return (fnMap.contains(sectionName) == include);
	}

	/**把过滤的参数放入到map*/
	TxtLoader.prototype._initFilterMap = function(filterName) {
		var arr = filterName.split(",");
		var map = new Map();
		for (var i = 0, len = arr.length; i < len; i++) {
			map.put(arr[i].toUpperCase(), arr[i]);
		}
		return map;
	}

	/**初始化参数content,该函数体太大，有待调整*/
	TxtLoader.prototype.init = function() {
		if (this.content == null || this.content.length == 0)
			return;
		var filterName = '', include = false, fnMap = null, sectionStr, head, sp, // 段名
		i1 = 0, // 段中第一个空格出现的位置
		i2 = this.content.indexOf("<", i1);
		if (this.arglen == 3) {
			filterName = this.args[1];
			include = this.args[2];
			fnMap = this._initFilterMap(filterName);
		}
		while (i2 != -1) {
			i1 = this.content.indexOf(">", i2);
			if (i1 == -1) {
				/*alert("位于第" + i2 + "个字符位置的\"<\"不匹配");*/
				alert(I18N.getString("eui.core.objs.js.nopipei","位于第{0}个字符位置的\"<\"不匹配", [ i2 ]));
				break;
			}
			// 判断前面一个字符是否是/，如果是那么这个就是一个完整的section
			if (this.content.charAt(i1 - 1) == "/") {
				// 把段内容当作这样一个对象放入数组{name:head,value:sectionStr}
				sectionStr = this.content.substring(i2, i1 + 1);
				head = sectionStr.substring(i2 + 1, i1 - 1);
				sp = head.indexOf(" ");
				if (sp > -1) {
					head = head.substring(i2 + 1, sp);
				}
				// 判断该段是否应该加入
				if (!this._canAdd(head.toUpperCase(), fnMap, include)) {
					i2 = this.content.indexOf("<", i1);
					continue;
				}
				this.sectionArray.push({
					name : head.toUpperCase(),
					value : sectionStr
				});
				i2 = this.content.indexOf("<", i1);
				continue;
			}
			// 多行判断
			head = this.content.substring(i2 + 1, i1);
			// 如果head里面存在空格，那么第一个空格以前的字符串才是head
			sp = head.indexOf(" ");
			if (sp > -1) {
				head = head.substring(0, sp);
			}
			// 由于<col name >..</col>，那么headStart=<col
			var headStart = "<" + head, headEnd = "</" + head + ">", i = searchIndex(
					this.content, headStart, headEnd, i2);
			// 如果只找到开始<>，没有</>就报错
			if (i == -1) {
				break;// alert(headStart + "没有匹配");
			}
			// 判断当前查找的headEnd是否与要查找的相对应，支持这种形式 <g><r></r><g><r></r><g></g></g></g>
			// 判断该段是否应该加入
			if (!this._canAdd(head.toUpperCase(), fnMap, include)) {
				i2 = this.content.indexOf("<", i + headEnd.length);
				continue;
			}

			sectionStr = this.content.substring(i2, i) + headEnd;
			// 把段内容当作这样一个对象放入数组{name:head,value:sectionStr}
			this.sectionArray.push({
				name : head.toUpperCase(),
				value : sectionStr
			});
			i2 = this.content.indexOf("<", i + headEnd.length);
		}
	}

	/**获得section的数目*/
	TxtLoader.prototype.getSectionCount = function() {
		return this.sectionArray.length;
	}

	/**如果i为整形表示获得第i个section的对象
	如果i为字符串则表示获得sectionname为i的section的对象，大小写不敏感,
	*/
	TxtLoader.prototype.getSection = function(i) {
		// 返回的内容包括<..></..>
		if (EUI.isString(i)) {
			var upstr = i.toUpperCase();
			for (var j = 0, len = this.sectionArray.length; j < len; j++) {
				if (this.sectionArray[j].name == upstr) {
					return new TxtSection(this.sectionArray[j].value);
				}
			}
			return null;
		} else if (EUI.isNumber(i)) {
			return new TxtSection(this.sectionArray[i].value);
		} else {
			/*alert(i + "输入的参数错误!");*/
			alert(I18N.getString("eui.core.objs.js.argerror", "{0}输入的参数错误!", [ i ]));
		}
	}

	/**
	* 获取指定标签名的section数组
	* @param {String} name 标签名，该参数只能为字符串
	* @return {Array}
	*/
	TxtLoader.prototype.getSections = function(name) {
		if (!EUI.isString(name)) {
			/*EUI.throwError("输入的参数错误，这里只识别字符串参数");*/
			EUI.throwError(I18N.getString("eui.core.objs.js.argerror2", "输入的参数错误，这里只识别字符串参数"));
		}
		var sections = new Array(), upstr = name.toUpperCase();
		for (var j = 0, len = this.sectionArray.length; j < len; j++) {
			if (this.sectionArray[j].name == upstr) {
				sections.push(new TxtSection(this.sectionArray[j].value));
			}
		}
		return sections;
	}

	TxtLoader.prototype.toString = function() {
		return "TxtLoader";
	}

	/**从index开始查找与<head 相匹配的</head> 是为支持这种形式 <g><r></r><gg ><r></r><g></g></gg></g>
	返回查找到的</head>位置
	判断方法，找到</head>的位置 i2,然后从i2往前找<head看在i2之前是否存在<head,并且该值要大于index
	如果有就说明有相同段名的嵌套。然后判断该段是否在单行段，如果不是stack++。就这样找出>index 和 <i2之间
	的有多少相同的段名相同的嵌套段,然后在根据stack的值去找相应的</head>
	index位置为<head 后的第一个">"号
	/*index为"<"所在的位置
	* @private
	* */
	function searchIndex(content, headStart, end, index) {
		var firstEnd = content.indexOf(end, index);
		// 第一个结束符的匹配位置
		if (firstEnd == -1) {
			/*alert(headStart + "没有匹配");*/
			alert(I18N.getString("eui.core.objs.js.nopipei2", "没有匹配", [ headStart ]));
			return firstEnd;
		}

		var i0 = content.lastIndexOf(headStart, firstEnd);
		if (i0 == index)
			return firstEnd; // 表明中间不存在嵌套段
		var b = false, // 判断是否遍历完成
		stack = 0, i1 = index;
		i0 = index;
		while (i0 > -1) { // 找出有多少个嵌套段，单行段不算
			i2 = content.indexOf(">", i0);
			var ch1 = content.charAt(i2 - 1);
			// 要注意某一个head包含headStart的情况，形如 <g ><gg ></gg></g>
			var ch = content.charAt(i0 + headStart.length);
			if (ch1 == "/" || (ch != '>' && ch != ' ')) {
				i0 = content.indexOf(headStart, i2);
				continue;
			}
			if (i0 < firstEnd) {
				stack++;
			} else {
				i2 = content.lastIndexOf(end, i0);
				firstEnd = i2;
				i1 = i0;
				while (i2 > index && i2 != -1) {
					stack--;
					if (stack == 0) {
						b = true;
						break;
					}
					i2 = content.lastIndexOf(end, i2 - 1);
				}
				index = i0;
				if (b)
					break;
				stack++;
				firstEnd = content.indexOf(end, i0);
			}
			i0 = content.indexOf(headStart, i0 + 1);
		}
		// <g><g><g></g></g><g></g></g>
		if (i0 == -1) {
			i0 = i1;
			for (var i = 1; i <= stack; i++) {
				firstEnd = content.indexOf(end, i0);
				i0 = firstEnd + end.length;
			}
		}
		if (firstEnd == -1) {
			/*alert(headStart + "没有匹配，检查相同段名的嵌套情况!");*/
			alert(I18N
					.getString("eui.core.objs.js.nopipei3", "没有匹配，检查相同段名的嵌套情况!", [ headStart ]));
		}
		return firstEnd;
	}

	/**###################################################################################################### */

	/**表示TxtLoader类中所读取的某端的对象。 
	* @class
	* @deprecated*/
	function TxtSection(content) {
		this.content = content;
		this.name = "";
		// 读取该段的属性
		this.attribsinit = false;
		this.attribs = "";
		this.attribsmap = new EUI.StringMap("", " ");
		// 读取该段的内容
		this.contentStr = "";
		this.strmap = new EUI.StringMap("", "\r\n");
		this.strmapinit = false;
		// 获取该段是否嵌套的属性
		this.recinit = false;
		this.txtLoad;
		this.init();
	}

	TxtSection.prototype.init = function() {
		var i1 = 0;
		var i2 = this.content.indexOf("<", i1);
		var i1 = this.content.indexOf(">", i2);
		var attrline;
		// 属性行
		var tmpi;
		// 表示该段是一单行
		if (this.content.charAt(i1 - 1) == "/") {
			this.contentStr = "";
			attrline = this.content.substring(i2 + 1, i1 - 1);
			tmpi = attrline.indexOf(" ");
			if ((attrline.length > 0) && (tmpi > -1)) {
				this.name = attrline.substring(0, tmpi)
				this.attribs = attrline.substring(tmpi + 1);
			} else {
				this.name = attrline;
				this.attribs = "";
			}
			this.contentStr = "";
			return;
		}
		var head = this.content.substring(i2 + 1, i1);
		var sp = head.indexOf(" ");
		if (sp > 0) {
			// 如果head里面有空格表示有属性,取出属性
			this.attribs = head.substring(sp + 1, i1);
			head = head.substring(0, sp);
		}
		this.name = head;

		// contentStr就是除去<></>之间的内容，还包括\r\n
		// i2 = this.content.indexOf("</" + head + ">");
		i2 = searchIndex(this.content, "<" + head, "</" + head + ">", 0);
		if (i2 != -1) {
			var ln = "\r\n";
			var tmpStr = this.content.substring(i1 + 1, i2);
			for (var c = 0; tmpStr.charCodeAt(c) < 33; c++)
				;
			this.contentStr = tmpStr.slice(c);
		}
	}

	/**获得此section的name，返回字符串*/
	TxtSection.prototype.getName = function() {
		return this.name;
	}

	/**获得sectionname后边跟着的属性所生成的StringMap对象，如果没有返回null*/
	TxtSection.prototype.getAttribs = function() {
		if (!this.attribsinit) {
			this.attribsmap.merge(this.attribs);
		}
		this.attribsinit = true;
		return this.attribsmap;
	}

	/**获得section之间的内容所生成的StringMap对象，如果没有返回null*/
	TxtSection.prototype.getContents = function() {
		if (!this.strmapinit) {
			this.strmap.merge(this.contentStr);
		}
		this.strmapinit = true;
		return this.strmap;
	}

	/**将section之间的东西当作字符串返回*/
	TxtSection.prototype.getContentStr = function() {
		return this.contentStr;
	}

	/**获得section的数目*/
	TxtSection.prototype.getSectionCount = function() {
		if (!this.recinit) {
			this.txtLoad = new TxtLoader(this.contentStr);
		}
		this.recinit = true;
		return this.txtLoad.getSectionCount();
	}

	/**如果i为整形表示获得第i个section的对象
	如果i为字符串则表示获得sectionname为i的section的对象，大小写不敏感
	字符串没有实现，如果输入的字符串匹配多个段，应该
	*/
	TxtSection.prototype.getSection = function(i) {
		if (!this.recinit) {
			this.txtLoad = new TxtLoader(this.contentStr);
		}

		this.recinit = true;
		return this.txtLoad.getSection(i);
	}

	/**
	* 获取指定标签名的sesion数组
	* @param {String} name 标签名，大小写不敏感，该参数只能为字符串
	* @return {Array}
	*/
	TxtSection.prototype.getSections = function(name) {
		if (!this.recinit) {
			this.txtLoad = new TxtLoader(this.contentStr);
		}
		this.recinit = true;
		return this.txtLoad.getSections(name);
	}

	TxtSection.prototype.toString = function() {
		return "TxtSection";
	}

	/**###################################################################################################### */

	/**
	* js端的下载控件，用于客户端进行下载文件的处理
	* 在某些应用中，如不想直接生成下载用的FORM与IFRAME或者想将代码规范，可以通过该功能来处理下载
	* @param {} wnd window对象
	* @param {} url 下载时请求的后台处理链接
	*/
	function Download(wnd, url) {
		this.wnd = wnd && wnd.document ? wnd : window;
		this.doc = this.wnd.document;
		this.url = url;
		this._initDownload();
	}

	Download.create = function(wnd, url, isdispose) {
		var rs = new Download(wnd, url);
		if (typeof (isdispose) != "boolean")
			isdispose = false;
		if (isdispose)
			EUI.addDispose(rs);
		return rs;
	}

	/**
	* 获取唯一的实例
	* @return {}
	*/
	Download.getInstance = function() {
		return EUI.getObjectFromRoot("EUI.Download", "__DownloadInstance__", true,
				"eui/eui.js");
	}

	/**
	* 释放资源
	*/
	Download.prototype.dispose = function() {
		this.wnd = null;
		this.doc = null;
		if (this._downloadAttachForm) {
			this.doc.removeChild(this._downloadAttachForm);
			this._downloadAttachForm = null;
		}
	}

	Download.prototype._initDownload = function() {
		this._downloadAttachForm = new HtmlElementFactory(this.wnd, this.doc.body)
				.form("downloadForm" + Math.floor(EUI.safeRandom() * 9999), null, "post",
						this.url, true);
	}

	/**
	* 获取下载的提交窗体
	* @return {}
	*/
	Download.prototype.getForm = function() {
		return this._downloadAttachForm;
	}

	/**
	* 设置指定的下载链接
	* @param {} url 下载链接
	* @param {} issubmit 是否在设置了下载连接后进行确认下载，缺省为false，不进行确认，只是设置链接
	*/
	Download.prototype.setAction = function(url, issubmit) {
		this._downloadAttachForm.setAction(url);
		if (typeof (issubmit) != "boolean")
			issubmit = false;
		if (issubmit)
			this.submit();
	}

	/**
	* 确认并进行下载
	*/
	Download.prototype.submit = function() {
		this._downloadAttachForm.submit();
	}

	/**###################################################################################################### */

	/**
	* 自动完成某一特定功能的控制，例如在自动刷新统计图表时，可以通过继承该功能来实现
	* 自动刷新统计图表在irpt/js/autoplaychart.js
	* @param {} wnd window对象
	* @param {} delay 延时，单位是秒，缺省为15分钟
	*/
	function AutoPlay(wnd, delay) {
		this.wnd = wnd && wnd.document ? wnd : window;
		this.doc = this.wnd.document;
		this.setDelay(delay);
	}

	/**
	* 释放资源
	*/
	AutoPlay.prototype.dispose = function() {
		this.__userdata = null;
		this.stop();
		this._autoCallback = null;
		this.wnd = null;
		this.doc = null;
	}

	AutoPlay.prototype.toString = function() {
		return "AutoPlay";
	}

	/**
	* 设置延时，单位是秒，缺省为15分钟
	* @param {} delay
	*/
	AutoPlay.prototype.setDelay = function(delay) {
		this.delay = typeof (delay) == "number" ? (delay * 1000) : (15 * 60 * 1000);
	}

	/**
	* 停止
	*/
	AutoPlay.prototype.stop = function() {
		if (this.autoPlayTimer)
			this.wnd.clearTimeout(this.autoPlayTimer);
	}

	/**
	* 设置回调事件，callback(AutoPlay, Userdata)
	* @param {} p
	*/
	AutoPlay.prototype.setAutoCallback = function(p) {
		this._autoCallback = p;
	}

	/**
	* 开始自动刷新
	* @param {} delay 延时多少，单位秒
	*/
	AutoPlay.prototype.play = function(delay) {
		this.autoPlayTimer = this.wnd.setTimeout(this._func_AutoPlay_callback
				.bind(this), typeof (delay) == "number" ? (delay * 1000) : this.delay);
	}

	/**
	* 开始自动运行过程中的回调事件
	*/
	AutoPlay.prototype._func_AutoPlay_callback = function() {
		if (typeof (this._autoCallback) == "function") {
			this._autoCallback(this, this.__userdata);
		}
		this.stop();
		this.play();
	}

	/**###################################################################################################### */

	/**
	* 一行一行的读取某串的类 
	* @class
	* */
	function LineReader(s) {
		this.s = s;
		this.index = 0;
	}

	/**读入一行，并返回*/
	LineReader.prototype.readLine = function() {
		var oldi = this.index;
		if (oldi == -1) {
			return null;
		}
		var s = this.s;
		var i = s.indexOf("\n", oldi);
		if (i == -1) {
			this.index = i;
			return s.substring(oldi);
		} else {
			this.index = i + 1;
			if (s.charAt(i - 1) == '\r')
				i--;
			return s.substring(oldi, i);
		}
	}

	LineReader.prototype.eof = function() {
		return this.index == -1;
	}

	/**从当前处开始读行，直到读入aline为止，返回之间的类容*/
	LineReader.prototype.readLineUtil = function(aline) {
		var ln = this.readLine();
		var r = "";
		while (ln != aline && !this.eof()) {
			r += ln + "\r\n";
			ln = this.readLine();
		}
		return r.trim();
	}

	/**从当前处开始读行，直到读入aline为止，忽略之间的类容*/
	LineReader.prototype.skipLineUtil = function() {
		this.readLineUtil();
	}

	/**获取剩下的类容*/
	LineReader.prototype.getRemain = function() {
		return this.s.substring(this.index);
	}

	/**###################################################################################################### */

	/**
	* 用于封装一些基本的Html元素,doc为document, doc如果不传递缺省使用document，
	eparent所创建的控件依附的父元素，此参数可以不传递，如果不传递则所创建的元素初始化还
	未依附任何父控件(除非创建函数自己传递了父元素)，如果传递可以是字符串或一个dom对象
	* @class
	* */
	function HtmlElementFactory(wnd, eparent) {
		this.wnd = wnd ? wnd : window;
		this.doc = this.wnd.document;
		this.eparent = typeof (eparent) == "string" ? this.doc
				.getElementById(eparent) : (typeof (eparent) == "object" ? eparent
				: null);
		this.disabledRecord(false);
	}

	/**
	* 以Ie6浏览器为例
	* 优化前：
	*   以edit为例，创建5000个时，内存平均增长11M
	* 优化后：
	*   以edit为例，创建5000个时，内存平均增长800k
	*   
	* 如何优化：
	*   1.为每个要创建的方法，增加了资源释放方法
	*   2.创建的元素中定义的方法提取为公共的，原先是匿名的容易产生内存泄漏
	*   3.input元素的创建改为通过innerHTML来创建，因为在创建大量的元素时，innerHTML比createElement效率高些，但是要合理运用，不能够滥用
	*/

	/**所创建的元素中由于增加了一些实用的方法，这些方法必须在浏览器更新或者关闭时释放掉，否则会造成内存泄漏*/
	HtmlElementFactory.prototype.dispose = function() {
		this._disposeDoms();
		this.doc = null;
		this.wnd = null;
	}

	/**
	* 将创建的对象进行资源释放
	*/
	HtmlElementFactory.prototype._disposeDoms = function() {
		if (!this._buf)
			return;
		var tmp;
		while (this._buf.length > 0) {
			tmp = this._buf.pop();
			if (tmp.dispose)
				tmp.dispose();
		}

		this._buf = null;
	}

	/**
	* 屏蔽记录创建的元素，参数f为true时表示屏蔽记录，缺省为记录下被创建的对象
	* @param {} f
	*/
	HtmlElementFactory.prototype.disabledRecord = function(f) {
		if (f) {
			this._buf = null;
		} else {
			if (!this._buf)
				this._buf = [];
		}
	}

	/**
	* 下面以_HtmlElementFactory$开头的方法都是从原有的匿名方法提取出来的，这样可以显著减少在Ie6上的内存泄漏问题
	* 避免创建DOM时，相应方法被重复创建
	*/
	function _HtmlElementFactory$SetCaption(p) {
		EUI.setTextContent(this, p ? p : "");
	}

	/**
	* 设置DOM的字体颜色，参数p为具体的颜色值，例如：#FF0000、red
	* @param {} p
	*/
	function _HtmlElementFactory$SetColor(p) {
		this.style.color = p;
	}

	/**
	* 设置DOM是否可见，参数f为true时表示可见，缺省为false
	* @param {} f
	*/
	function _HtmlElementFactory$SetVisible(f) {
		if (typeof (f) != "boolean")
			f = false;
		var s = f ? "" : "none";
		if (this.style.display == s)
			return;
		this.style.display = s;
	}

	/**
	* 改变DOM的尺寸大小，参数w为DOM的宽，参数h为DOM的高
	* @param {} w
	* @param {} h
	*/
	function _HtmlElementFactory$Resize(w, h) {
		this.style.cssText += '; width: ' + EUI.toPerNumber(w) + '; height: '
				+ EUI.toPerNumber(h);
	}

	/**
	* 改变DOM的源引用属性，参数p为具体的源
	* @param {} p
	*/
	function _HtmlElementFactory$SetSrc(p) {
		this.src = p;
	}

	/**
	* 获取DOM的源引用
	* @return {}
	*/
	function _HtmlElementFactory$GetSrc() {
		return this.src;
	}

	/**
	* 设置DOM是否禁用，参数f为true时表示禁用该DOM，缺省为false
	* @param {} f
	*/
	function _HtmlElementFactory$SetDisabled(f, p) {
		if (typeof (f) != "boolean")
			f = false;
		/**
		* 如果这里不增加参数p来确定要作用的元素对象，则在_HtmlElementFactory$SetDisabled2方法中使用该方法时
		* this所表示的对象将是window对象，这样就造成了disabled属性设置无效
		*/
		if (!p)
			p = this;
		if (p.disabled == f)
			return;
		p.disabled = f;
	}

	/**
	* 设置DOM是否禁用，该方法会使禁用的DOM有一个灰色的效果
	* @param {} f
	*/
	function _HtmlElementFactory$SetDisabled2(f) {
		/**
		* _HtmlElementFactory$SetDisabled方法中无法设置元素的disabled属性，因为原先的SetDisabled方法中没有指定作用的元素对象
		*/
		_HtmlElementFactory$SetDisabled(f, this);
		this.className = this.className.replace(
				/ ?(elementDisabled|elementEnabled)/g, '')
				+ (f ? " elementDisabled" : " elementEnabled");
	}

	/**
	* 获取DOM的value
	* @return {}
	*/
	function _HtmlElementFactory$GetValue() {
		return this.value;
	}

	/**
	* 设置DOM的value值，参数p为具体的值
	* @param {} p
	*/
	function _HtmlElementFactory$SetValue(p) {
		this.value = p ? p : "";
	}

	/**
	* 清除下拉框中的数据项
	*/
	function _HtmlElementFactory$ClearOption() {
		for (var i = this.getCount() - 1; i > -1; i--) {
			this.removeOption(i);
		}
	}

	/**
	* 在下拉框中新增加数据项，参数value为数据项的值，参数text为数据项标题
	* @param {} value
	* @param {} text
	* @return {}
	*/
	function _HtmlElementFactory$AddOption(value, text) {
		if (this.findOption(value, false) == -1) {
			var o = this.ownerDocument.createElement("option");
			o.value = value;
			o.text = text;
			/*
			* add by wangshzh 2013.4.8
			* select在IE8中存在如果选择项长度大于设定宽度时，不能自动扩展显示全的问题，
			* 在IE9中会自动扩展。为兼容性解决的办法是增加title属性，鼠标放上去，自动提示。
			*/
			o.title = text;
			this.options.add(o);
			return o;
		}
	}

	/**
	* 批量添加一些数据项内容，参数opts为数组，形式类似如下：
	* [1,2,3,4]
	* [[1, "2001"],[2, "2002"],[3, "2003"]]
	* [[1,"2001"],2,[3, "2003"]]
	* 
	* @param {} opts
	*/
	function _HtmlElementFactory$AddOptions(opts) {
		if (!EUI.isArray(opts))
			return;
		var tmp;
		for (var i = 0; i < opts.length; i++) {
			tmp = opts[i];
			if (!EUI.isArray(tmp)) {// 不是数组时
				this.addOption(tmp, tmp);
				continue;
			}

			if (tmp.length == 1) {
				this.addOption(tmp[0], tmp[0]);
			} else if (tmp.length >= 2) {
				this.addOption(tmp[0], tmp[1]);
			}
		}
	}

	/**
	* 删除指定的下拉框内的项目,index可以是数值或字符串
	* @param index number or string 删除的索引号或者标题文字,
	* @param isText boolean 删除的对象是否为文本,当index为字符串时,该参数可以指定为删除时是以文本还是值来删除
	*/
	function _HtmlElementFactory$RemoveOption(index, isText) {
		if (typeof (index) == "string") {
			index = this.findOption(index, isText);
		}
		if (typeof (index) == "number" && index != -1)
			this.remove(index);
	}

	/**
	* 获取下拉框的项目总数
	* @return {}
	*/
	function _HtmlElementFactory$GetCount() {
		return this.options.length;
	}

	/**
	* 获取指定的项目,index可以是数值或字符串
	* @param {} index 获取的项目的索引号或者标题文字和值
	* @param {} isText true或者false,是获取指定项目的依据,当index为字符串时,该参数可以指定为是依据文本还是值来获取项目
	* @return {}
	*/
	function _HtmlElementFactory$GetOption(index, isText) {
		if (typeof (index) == "string") {
			index = this.findOption(index, isText);
		}
		if (typeof (index) == "number" && index != -1)
			return this.options[index];
	}

	/**
	* 设置下拉框内指定的项目处于选择状态,index可以是数值或字符串,值
	* @param {} index 索引号或者标题文字和值
	* @param {} isText true或者false,当index为字符串时,该参数可以指定为是依据文本还是值来进行设置
	*/
	function _HtmlElementFactory$SetSelected(index, isText) {
		if (typeof (index) == "string") {
			if (!isText && this.value == index) {
				return;
			}
			index = this.findOption(index, isText);
		}

		if (typeof (index) == "number" && index != -1) {
			var option = this.options[index];
			if (option) {
				option.selected = true;
				return true;
			}
		}
		return false;
	}

	/**
	* 查找指定的项目是否存在,如不存在则返回空, isText是布尔值,表示text是否为文本或值,缺省为为查找文本
	* @param text string 要查找的内容
	* @param isText boolean 查找的串是文本还是值
	* @sample if (findOption("环比")!=-1) {}else{} 返回索引号,如果不存在则返回-1
	* */
	function _HtmlElementFactory$FindOption(text, isText) {
		isText = typeof (isText) == "boolean" ? isText : true;
		var count = this.options.length;
		var tmp = null;
		for (var i = 0; i < count; i++) {
			tmp = this.options[i];
			if (isText ? tmp.text == text : tmp.value == text)
				return i;
		}
		return -1;
	}

	/**
	获取下拉框内被选择的项目,返回option对象
	@sample getCurrentOption().value 返回值
	getCurrentOption().text 返回文本
	*/
	function _HtmlElementFactory$GetCurrentOption() {
		for (var i = 0; i < this.options.length; i++) {
			if (this.options[i].selected)
				return this.options[i];
		}
		return null;
	}

	function _HtmlElementFactory$GetValue4Combobox() {
		var rs = this.getCurrentOption();
		return rs ? rs.value : "";
	}

	function _HtmlElementFactory$SetValue4Combobox(p) {
		this.setSelected(p, false);
	}

	function _HtmlElementFactory$GetCaption4Combobox() {
		var rs = this.getCurrentOption();
		return rs ? rs.text : "";
	}

	function _HtmlElementFactory$SetCaption4Combobox(p) {
		this.setSelected(p, true);
	}

	function _HtmlElementFactory$Form_GetIFrame() {
		return this.iframe;
	}

	function _HtmlElementFactory$SetAction(p) {
		if (!isie) {
			this.setAttribute("action", p);
		} else {
			this.action = p;
		}
	}

	function _HtmlElementFactory$GetDocument() {
		return this.contentWindow.document;
	}

	function _HtmlElementFactory$GetBody() {
		return this.contentWindow.document.body;
	}

	function _HtmlElementFactory$Link_SetCaption(c) {
		var r = this.firstChild;
		var rs = r.nodeType == 3 ? r : r.nextSibling;
		rs.nodeValue = c;
	}

	function _HtmlElementFactory$Link_SetImage(p) {
		var r = this.firstChild;

		if (r.nodeType == 1 && r.tagName.toLowerCase() == "img") {
			r.src = p;
		}
	}

	/**
	* DOM元素的资源释放
	*/
	function _HtmlElementFactory$Dispose() {
		if (this.setVisible) {
			this.setVisible = null;
			this.removeAttribute("setVisible");
		}
		if (this.setDisabled) {
			this.setDisabled = null;
			this.removeAttribute("setDisabled");
		}
		if (this.setCaption) {
			this.setCaption = null;
			this.removeAttribute("setCaption");
		}
		if (typeof (this.dispose) == "function") {
			this.dispose = null;
			this.removeAttribute("dispose");
		}
	}

	/*edit的资源释放*/
	function _HtmlElementFactory$EditDispose() {
		if (this.setDisabled) {
			this.setDisabled = null;
			this.removeAttribute("setDisabled");
		}
		if (this.setValue) {
			this.setValue = null;
			this.removeAttribute("setValue");
		}
		if (this.getValue) {
			this.getValue = null;
			this.removeAttribute("getValue");
		}
		if (typeof (this.dispose) == "function") {
			this.dispose = null;
			this.removeAttribute("dispose");
		}
	}

	/*addlink的资源释放*/
	function _HtmlElementFactory$AddlinkDispose() {
		if (this.setCaption) {
			this.setCaption = null;
			this.removeAttribute("setCaption");
		}
		if (this.setColor) {
			this.setColor = null;
			this.removeAttribute("setColor");
		}
		if (this.setImage) {
			this.setImage = null;
			this.removeAttribute("setImage");
		}
		if (typeof (this.dispose) == "function") {
			this.dispose = null;
			this.removeAttribute("dispose");
		}
	}

	/*img的资源释放*/
	function _HtmlElementFactory$ImgDispose() {
		if (this.setImg) {
			this.setImg = null;
			this.removeAttribute("setImg");
		}
		if (this.getImg) {
			this.getImg = null;
			this.removeAttribute("getImg");
		}
		if (this.resize) {
			this.resize = null;
			this.removeAttribute("resize");
		}
		if (typeof (this.dispose) == "function") {
			this.dispose = null;
			this.removeAttribute("dispose");
		}
	}

	/*iframe的资源释放*/
	function _HtmlElementFactory$IframeDispose() {
		if (this.getBody) {
			this.getBody = null;
			this.removeAttribute("getBody");
		}
		if (this.getDocument) {
			this.getDocument = null;
			this.removeAttribute("getDocument");
		}
		if (typeof (this.visible) == "function") {
			this.visible = null;
			this.removeAttribute("visible");
		}
		if (typeof (this.url) == "function") {
			this.url = null;
			this.removeAttribute("url");
		}
		if (typeof (this.size) == "function") {
			this.size = null;
			this.removeAttribute("size");
		}
		if (typeof (this.dispose) == "function") {
			this.dispose = null;
			this.removeAttribute("dispose");
		}
	}

	/*form的资源释放*/
	function _HtmlElementFactory$FormDispose() {
		if (this.getIFrame) {
			this.getIFrame = null;
			this.removeAttribute("getIFrame");
		}
		if (this.setAction) {
			this.setAction = null;
			this.removeAttribute("setAction");
		}
		if (this.iframe) {
			this.iframe.dispose();
			this.iframe = null;
			this.removeAttribute("iframe");
		}
		if (typeof (this.dispose) == "function") {
			this.dispose = null;
			this.removeAttribute("dispose");
		}
	}

	/*combobox的资源释放*/
	function _HtmlElementFactory$ComboboxDispose() {
		if (this.clearOption) {
			this.clearOption = null;
			this.removeAttribute("clearOption");
		}
		if (this.addOption) {
			this.addOption = null;
			this.removeAttribute("addOption");
		}
		if (this.addOptions) {
			this.addOptions = null;
			this.removeAttribute("addOptions");
		}
		if (this.removeOption) {
			this.removeOption = null;
			this.removeAttribute("removeOption");
		}
		if (this.getCount) {
			this.getCount = null;
			this.removeAttribute("getCount");
		}
		if (this.getOption) {
			this.getOption = null;
			this.removeAttribute("getOption");
		}
		if (this.setSelected) {
			this.setSelected = null;
			this.removeAttribute("setSelected");
		}
		if (this.findOption) {
			this.findOption = null;
			this.removeAttribute("findOption");
		}
		if (this.getCurrentOption) {
			this.getCurrentOption = null;
			this.removeAttribute("getCurrentOption");
		}
		if (typeof (this.dispose) == "function") {
			this.dispose = null;
			this.removeAttribute("dispose");
		}
	}

	HtmlElementFactory.prototype._appendChild = function(childElement) {
		var rs = this.eparent ? this.eparent.appendChild(childElement)
				: childElement;
		/*创建的元素中如果定义了资源释放的方法，则将其保存起来便于控件在最后进行释放*/
		if (this._buf) {
			this._buf.push(rs);
		}
		return rs;
	}

	/**
	* 创建一个链接，参数img为链接左侧显示的图标，参数caption为链接文字，参数ptitle为链接的提示内容，
	* 参数underline为false时表示链接不带下划线，缺省是有下划线的
	* @param {} img
	* @param {} caption
	* @param {} ptitle
	* @param {} underline
	* @return {}
	*/
	HtmlElementFactory.prototype.addLink = function(img, caption, ptitle,
			underline) {
		caption = caption ? caption : "";
		ptitle = ptitle ? ptitle : "";
		underline = typeof (underline) == "boolean" ? underline : true;
		var span = this.doc.createElement("span");
		span.style.paddingLeft = "2px";
		this._appendChild(span);
		var _link = this._appendChild(this.doc.createElement("a"));
		_link.isListViewExLink = true;
		_link.className = "html_link";
		if (!underline)
			_link.style.textDecoration = "none";

		var _icon;
		if (img) {
			_icon = _link.appendChild(this.doc.createElement("img"));
			_icon.isListViewExLink = true;
			_icon.src = img;
			_icon.border = 0;
			_icon.align = "absmiddle";
			_icon.title = ptitle;
		}

		var textNode = _link.appendChild(this.doc.createTextNode(caption));

		_link.setCaption = _HtmlElementFactory$Link_SetCaption;
		_link.setColor = _HtmlElementFactory$SetColor;
		_link.setImage = _HtmlElementFactory$Link_SetImage;
		_link.dispose = _HtmlElementFactory$AddlinkDispose;
		return _link;
	}

	/* 创建一个表格 */
	HtmlElementFactory.prototype.table = function() {
		var r = this._appendChild(this.doc.createElement("table"));
		r.border = 0;
		r.cellPadding = 0;
		r.cellSpacing = 0;
		return r;
	}

	HtmlElementFactory.prototype.div = function() {
		var r = this._appendChild(this.doc.createElement("div"));
		r.setVisible = _HtmlElementFactory$SetVisible;
		r.dispose = _HtmlElementFactory$Dispose;
		return r;
	}

	HtmlElementFactory.prototype.span = function() {
		return this._appendChild(this.doc.createElement("span"));
	}

	HtmlElementFactory.prototype.label = function(t) {
		var r = this._appendChild(this.doc.createElement("label"));
		r.setCaption = _HtmlElementFactory$SetCaption;
		r.dispose = _HtmlElementFactory$Dispose;
		r.setCaption(t);
		return r;
	}

	/*创建图像*/
	HtmlElementFactory.prototype.img = function(src) {
		var r = this._appendChild(this.doc.createElement("img"));
		r.setImg = _HtmlElementFactory$SetSrc;
		r.getImg = _HtmlElementFactory$GetSrc;
		r.resize = _HtmlElementFactory$Resize;
		r.dispose = _HtmlElementFactory$ImgDispose;
		r.setImg(src);
		return r;
	}

	/*创建一个空格*/
	HtmlElementFactory.prototype.space = function() {
		/**
		* BI-2482 在Firefox中进行EasyOlap时，如报表有分页则出现异常
		* 异常提示：uncaught exception: [Exception...
		* "Component returned failure code: 0x80004003 (NS_ERROR_INVALID_POINTER)
		* [nsIDOMNSHTMLElement.innerHTML]" nsresult: "0x80004003
		* (NS_ERROR_INVALID_POINTER)" location: "JS frame ::
		* xui/ctrls/commonctrls.js :: anonymous ::
		* line 4" data: no]
		* 该异常是由于在创建的DOM中通过innerHTML方式设置了&nbsp;造成的，原先这样做是为了达到类似一个空格的效果，
		* 现在为了实现该效果且避免上述的异常，将通过设置样式来达到类似空格的效果
		* --20090901 by cjb
		*/
		var r = this._appendChild(this.doc.createElement("nobr"));
		r.className = "html_space";
		return r;
	}

	HtmlElementFactory.prototype.file = function() {
		var t = this._appendChild(EUI.inputElement(this.doc, "file"));
		t.title="";
		if (!t)
			return;
		t.setDisabled = _HtmlElementFactory$SetDisabled;
		t.dispose = _HtmlElementFactory$Dispose;
		return t;
	}

	/**
	* 新样式的文件上传
	*/
	HtmlElementFactory.prototype.fileinput = function(id, name, title, needtitle,
			parentElement) {
		var temp = this.doc.createElement("div");
		var id = id || "file";
		var name = name || "file";
		if (typeof needtitle != "boolean")
			needtitle = true;
		title = needtitle ? (title || I18N.getString("eui.core.objs.js.choosefile", "选择文件"))
				: "";
		temp.innerHTML = title ? title + ":" : "";
		temp.className = needtitle ? "html_file_con" : "html_importing_content";
		var _dom = temp.appendChild(this.doc.createElement("div"));
		_dom.className = needtitle ? "medium_tableright html_file_con2"
				: "html_file_con2";

		var _dom2 = _dom.appendChild(EUI.inputElement(this.doc, "text"));
		_dom2.className = needtitle ? "filepath_area" : "filepath_content";
		_dom2.readOnly = "true";

		_dom2 = _dom.appendChild(this.doc.createElement("div"));
		_dom2.className = needtitle ? "html_file_con3" : "html_file_content";
		_dom2.title = title;
		if (browser.isSafari) {
			_dom2.style.top = "0px";
		}

		var _dom3 = _dom2.appendChild(this.doc.createElement("img"));
		_dom3.className = "html_file_img";
		_dom3.src = EUI.sys.getImgPath("add.gif");

		var file = _dom2.appendChild(EUI.inputElement(this.doc, "file"));
		file.title = title || I18N.getString("eui.core.objs.js.choosefile", "选择文件");
		file.id = id;
		file.name = name;
		file.className = "html_file";

		var t = parentElement && parentElement.appendChild ? parentElement
				.appendChild(temp) : this._appendChild(temp);
		file.onchange = function() {
			file.parentNode.previousSibling.value = this.value;
		};
		t.setDisabled = _HtmlElementFactory$SetDisabled;
		t.dispose = _HtmlElementFactory$Dispose;
		return file;
	}

	/*创建一个单行的输入框*/
	HtmlElementFactory.prototype.edit = function(initText, name) {
		var t = this._appendChild(EUI.inputElement(this.doc, "text", name, initText));
		if (!t)
			return;
		t.className = "html_edit";
		t.setDisabled = _HtmlElementFactory$SetDisabled2;
		t.getValue = _HtmlElementFactory$GetValue;
		t.setValue = _HtmlElementFactory$SetValue;
		t.dispose = _HtmlElementFactory$EditDispose;
		return t;
	}

	/*隐藏单元*/
	HtmlElementFactory.prototype.hidden = function(initText, name) {
		return this._appendChild(EUI.inputElement(this.doc, "hidden", name, initText));
	}

	/*创建密码输入框*/
	HtmlElementFactory.prototype.password = function(initText, name) {
		var t = this
				._appendChild(EUI.inputElement(this.doc, "password", name, initText));
		if (!t)
			return;
		t.className = "html_password";
		t.setDisabled = _HtmlElementFactory$SetDisabled2;
		t.dispose = _HtmlElementFactory$Dispose;
		return t;
	}

	/*创建一个checkbox*/
	HtmlElementFactory.prototype.checkbox = function(name, value, ischecked) {
		var t = this._appendChild(EUI.inputElement(this.doc, "checkbox", name, value,
				ischecked));
		t.className = "UICheckbox";
		t.setDisabled = _HtmlElementFactory$SetDisabled;
		t.dispose = _HtmlElementFactory$Dispose;
		return t;
	}

	/*创建一个radio*/
	HtmlElementFactory.prototype.radio = function(name, value, ischecked) {
		var t = this._appendChild(EUI.inputElement(this.doc, "radio", name, value,
				ischecked));
		t.className = "UIRadio";
		t.setDisabled = _HtmlElementFactory$SetDisabled;
		t.dispose = _HtmlElementFactory$Dispose;
		return t;
	}

	/*创建一个多行的输入框*/
	HtmlElementFactory.prototype.textarea = function(initText, name) {
		var _id = "Textarea$" + Math.floor(EUI.safeRandom() * 99999999);
		var t = this._appendChild(this.doc.createElement("textarea"));
		t.setAttribute("name", name ? name : _id);
		t.setAttribute("id", _id);
		t.value = initText ? initText : "";
		t.className = "html_textarea";
		t.setDisabled = _HtmlElementFactory$SetDisabled2;
		t.dispose = _HtmlElementFactory$Dispose;
		return t;
	}

	/**
	* 表单
	* @param {str} name 表单名
	* @param {str} enctype 表单类型，multipart/form-data为传送文件时需指定的,缺省的是普通的传送方式
	* @param {str} method 表单方法，是GET还是POST，缺省为POST方式
	* @param {str} action 表单所请求的页面
	* @param {str,boolean} target 表单在发送请求时，该请求指向的目标页。可以是布尔值或者是字符串型，如果是布尔型并且为true时，会自动创建一个隐藏ifram且目标指向它
	* @param {func} callback 当参数target为true时，可以通过该参数来指定隐藏框架在加载完毕后的回调处理，事件定义：callback(iframe)
	* @return {obj}
	*/
	HtmlElementFactory.prototype.form = function(name, enctype, method, action,
			target, callback) {
		var _t = null;
		var _target = null;
		name = typeof (name) == "string" ? name : null;
		var _id = "Form$" + Math.floor(EUI.safeRandom() * 99999999);
		if (typeof (target) == "boolean") {
			if (target) {
				_t = this.iframe(callback);
				_t.size(0, 0);
				_target = _t.name;
			}
		} else if (typeof (target) == "string")
			_target = target;
		var temp = this.doc.createElement("div"), html = [ '<form style="margin: 0px; padding: 0px; *zoom:1;" method="'
				+ (method || 'post')
				+ '" name="'
				+ (name || _id)
				+ '" id="'
				+ _id
				+ '" ' ];
		if (action)
			html.push('action="' + action + '" ');
		if (enctype)
			html.push('enctype="' + enctype + '" ');
		if (_target)
			html.push('target="' + _target + '" ');
		html.push('/>');
		temp.innerHTML = html.join('');
		var t = temp.firstChild;
		if (_t) {
			t.appendChild(_t);
			t.iframe = _t;
		}
		this._appendChild(t);
		/*如果iframe存在那么就返回iframe,否则返回null*/
		t.getIFrame = _HtmlElementFactory$Form_GetIFrame;
		t.setAction = _HtmlElementFactory$SetAction;
		t.dispose = _HtmlElementFactory$FormDispose;
		return t;
	}

	/*创建一个combobox*/
	HtmlElementFactory.prototype.combobox = function() {
		var doc = this.doc;
		var cb = this._appendChild(doc.createElement("select"));
		cb.style.fontSize = "12px";
		// cb.style.height = "12px";

		/*清除所有项目*/
		cb.clearOption = _HtmlElementFactory$ClearOption;
		/*新增一项*/
		cb.addOption = _HtmlElementFactory$AddOption;
		/**
		* 批量添加一些内容
		* 示例：
		* [1,2,3,4]
		* [[1, "2001"],[2, "2002"],[3, "2003"]]
		* [[1, "2001"],2,[3, "2003"]]
		* @param {} opts
		*/
		cb.addOptions = _HtmlElementFactory$AddOptions;
		/*删除指定项目,index可以是数值或字符串*/
		cb.removeOption = _HtmlElementFactory$RemoveOption;
		/*获取项目数*/
		cb.getCount = _HtmlElementFactory$GetCount;
		/*获取指定的项目,index可以是数值或字符串*/
		cb.getOption = _HtmlElementFactory$GetOption;
		/*设置指定的项目为选择状态,index可以是数值或字符串*/
		cb.setSelected = _HtmlElementFactory$SetSelected;
		/*查找指定的项目是否存在,如不存在则返回空, isText是布尔值,表示text是否为text还是value,缺省为text*/
		cb.findOption = _HtmlElementFactory$FindOption;
		/*获取当前被选择的项目*/
		cb.getCurrentOption = _HtmlElementFactory$GetCurrentOption;
		cb.setDisabled = _HtmlElementFactory$SetDisabled;
		cb.getValue = _HtmlElementFactory$GetValue4Combobox;
		cb.setValue = _HtmlElementFactory$SetValue4Combobox;
		cb.getCaption = _HtmlElementFactory$GetCaption4Combobox;
		cb.setCaption = _HtmlElementFactory$SetCaption4Combobox;
		cb.dispose = _HtmlElementFactory$ComboboxDispose;
		return cb;
	}

	/*创建一个按钮*/
	HtmlElementFactory.prototype.button = function(caption) {
		var bt = this._appendChild(EUI.inputElement(this.doc, "button", null,
				caption ? caption : ""));
		bt.style.cssText += "font-size:12px; border-width:0;";
		bt.setDisabled = _HtmlElementFactory$SetDisabled;
		bt.dispose = _HtmlElementFactory$Dispose;
		return bt;
	}

	/**
	* 创建一个框架
	* @param {func} callback 框架加载完毕后的回调事件，事件定义：callback(iframe)
	* @return {obj}
	*/
	HtmlElementFactory.prototype.iframe = function(callback) {
		var _id = "Iframe$" + Math.floor(EUI.safeRandom() * 99999999);
		var temp = this.doc.createElement("div");
		temp.innerHTML = '<iframe name="'
				+ _id
				+ '" id="'
				+ _id
				+ '" frameborder="0" marginheight="0" marginwidth="0" style="width: 100%; height: 100%; margin: 0; border: none"'
				+ '/>'
		var fo = temp.firstChild;
		this._appendChild(fo);
		/*设置iframe大小*/
		fo.size = _HtmlElementFactory$Resize;

		/*引用的url*/
		fo.url = _HtmlElementFactory$SetSrc;

		/*框架是否可见*/
		fo.visible = _HtmlElementFactory$SetVisible;

		/*获取框架的document对象*/
		fo.getDocument = _HtmlElementFactory$GetDocument;

		/*获取框架的body对象*/
		fo.getBody = _HtmlElementFactory$GetBody;
		fo.dispose = _HtmlElementFactory$IframeDispose;
		/*框架在加载完毕后的回调事件*/
		if (typeof (callback) == "function") {
			if (!fo._callbackFunc) {
				fo._callbackFunc = function() {
					callback(fo);
				};
			}
			if (fo.attachEvent) {
				/**
				* Ie通过事件绑定来完成对load的监听要比监听readystatechange要稳妥与安全些，因为Ie对框架的load事件是隐性的支持，
				* 在使用时不能够直接赋值，而应该通过attachEvent来进行绑定。具体可参考：
				* IE’s hidden onload support
				* 
				* Shortly after posting this blog, Christopher commented that using attachEvent() on the iframe element works in IE. I could have sworn I tried this before but, due to his prompting, I whipped up another experiment. As it turns out, he’s completely correct. I had to dig through the MSDN documentation to eventually find a roundabout reference, but sure enough, it’s there. This led to a final code snippet of:
				* 
				* var iframe = document.createElement("iframe");
				* iframe.src = "simpleinner.htm";
				* 
				* if (iframe.attachEvent){
				*     iframe.attachEvent("onload", function(){
				*         alert("Local iframe is now loaded.");
				*     });
				* } else {
				*     iframe.onload = function(){
				*         alert("Local iframe is now loaded.");
				*     };
				* }
				* 
				* document.body.appendChild(iframe);
				* 
				* This code also works in all browsers and avoids any potential issues surrounding the timing of the readystatechange event versus the load event.
				*/
				fo.attachEvent("onload", fo._callbackFunc);
			} else {
				fo.onload = fo._callbackFunc;
			}
		}
		return fo;
	}

	HtmlElementFactory.prototype._separator = function(ep, width) {
		/*原先这里如果没有指定ep参数时，会造成脚本异常。现在更改为没有ep参数也同样能够正确处理所创建的元素*/
		var obj = this.doc.createElement("hr");
		obj.size = 1;
		obj.noShade = true;

		if (typeof (width) == "number") {
			obj.style.width = width + "px";
		} else if (typeof (width) == "string") {
			if (width.lastIndexOf("%") != -1) {
				obj.style.width = width;
			} else {
				obj.style.width = width + "px";
			}
		} else
			obj.style.width = "100%";
		return ep ? ep.appendChild(obj) : obj;
	}

	/** 分割栏 */
	HtmlElementFactory.prototype.separator = function(caption) {
		/*优化创建分割栏的方法，避免出现没有指定eparent参数时出现脚本异常的问题*/
		if (caption) {
			var obj = this._appendChild(this.doc.createElement("table"));
			obj.border = 0;
			obj.width = "100%";
			obj.cellPadding = 0;
			obj.cellSpacing = 0;

			var line = obj.insertRow(-1);
			var t0 = line.insertCell(-1);
			t0.width = "1%";
			t0.noWrap = true;
			this._separator(t0, 10);

			var t1 = line.insertCell(-1);
			t1.width = "1%";
			t1.noWrap = true;
			t1.style.fontSize = "12px";
			t1.style.padding = "0 4px 0";

			if (typeof (caption) == "object") {
				t1.appendChild(caption);
			} else {
				t1.innerHTML = caption ? caption : "&nbsp;";
			}

			var t2 = line.insertCell(-1);
			t2.width = "98%";
			this._separator(t2);
			return obj;
		}

		return this._separator(this.eparent);
	}

	/**创建一个文字段*/
	HtmlElementFactory.prototype.textnode = function(caption) {
		return this._appendChild(this.doc.createTextNode(caption));
	}

	/**###################################################################################################### */

	/**
	* 这是一个向服务器发送执行请求，并轮询执行状态的js抽象类，此类应该被继承使用
	* 
	* 子类可以重载的方法有：
	*  asynQuery(params)，
	*  asynStart()
	*  finish()
	*  finishWithError(e)
	*  showError(e)
	*  getTimeInterval()
	* 当开始一个服务器的后台运算时，并调用start(),其实start还是调用了asynStart()，由asynStart向服务器发送开始执行的指令
	* 服务器会返回一个id给客户端，客户端用这个id去轮询执行状态，并自动开始轮询
	* 
	* 后台接收请求的action应该是AbstractReqMgrAction.java类的子类，AbstractReqMgrAction已经实现了轮询和取消的行为
	* AbstractReqMgrAction的子类只需要实现开始一个后台运算的行为即可，详见AbstractReqMgrAction.java中的注释
	* @class
	*/
	function AbstractReqObj() {
		this.wnd = window;
		this.options = new Map();// 用于存储发送给服务器的信息.
	}

	AbstractReqObj.prototype.setProperty = function(nm, v) {
		this.options.put(nm, v);
	}

	AbstractReqObj.prototype.addProperties = function(mapOrStr) {
		if (!mapOrStr) {
			return;
		}
		if (typeof (mapOrStr) == "string") {
			mapOrStr = new Map(mapOrStr, ";");
		}
		this.options.putMap(mapOrStr);
	}

	AbstractReqObj.prototype.getProperty = function(nm, def) {
		return this.options.get(nm, def);
	}

	/**
	* 发送一个异步开始请求
	* */
	AbstractReqObj.prototype.start = function() {
		this.asynStart();
	}

	/**
	发送一个异步开始请求，让服务器端开始一个后台运算，应该使用函数asynQuery去执行发送信息的操作
	*    这样此类才能启动轮询的timer，去隔一段时间询问一次服务器
	*    有时当此类初始化时后台的运算已经开始了，例如“备份”操作，启动后台备份行为的是其他的页面，调用者只想
	*    用此类去执行轮询的操作，那么他可以在初始化此类之后将后台运算任务的id设置给此类的_id属性，然后
	*    调用query()方法即可开始轮询
	 */
	AbstractReqObj.prototype.asynStart = function() {

	}

	/**
	*整个请求成功（或者被取消后正常退出）完毕后被回调的函数
	*    如果出现异常，那么会调用finishWithError函数，并传递异常对象
	 */
	AbstractReqObj.prototype.finish = function() {

	}

	/**
	*    当服务器端发生了异常，会调用此函数通知子类，本类没有默认的实现此函数，此函数不是必须实现的
	 */
	AbstractReqObj.prototype.finishWithError = function() {

	}

	/**
	* 发送一个异步查询请求
	* */
	AbstractReqObj.prototype.query = function() {
		if (this.isCanceled()) {
			return;
		}
		var params = new Map();
		params.put("action", "query");
		if (this.status) {
			this.status.setQueryParams(params);
		}

		this.asynQuery(params);
	}

	/**
	* 此函数发送一个异步查询请求给服务器，此函数的所有向服务器发送的请求都是经过这个函数实现的
	* 子类可以在这个函数中决定将请求发送给那个action
	* 实现时应该使用函数queryserver去执行具体的发送操作
	* */
	AbstractReqObj.prototype.asynQuery = function(params) {
		// 子类要重载此方法
	};

	/**
	* 默认的取消请求也通过asynQuery发送，并且也确实的请求日志信息，这样在取消某些操作后也能看到服务器最新的日志
	* */
	AbstractReqObj.prototype.cancel = function() {
		if (this.isCanceled()) {
			return;
		}
		this._canceled = true;
		var params = new Map();
		params.put("action", "cancel");
		if (this.status) {
			this.status.setQueryParams(params);
		}

		this.asynQuery(params);
	}

	AbstractReqObj.prototype.isCanceled = function() {
		return this._canceled ? true : false;
	};

	/**
	* 返回此对象的id，只有当请求发送完毕后此方法的返回值才有效
	* */
	AbstractReqObj.prototype.getId = function() {
		return this._id;
	}

	/**
	* 设置此对象的id
	* @param {str} p
	*/
	AbstractReqObj.prototype.setId = function(p) {
		this._id = p;
	}

	/**
	* 返回状态执行信息
	* */
	AbstractReqObj.prototype.getStatusStr = function() {
		if (!this.status) {
			/*return "执行未开始";*/
			return I18N.getString("eui.core.objs.js.startnotstart", "执行未开始");
		} else if (this.status.isFinished()) {
			/*return "执行完毕";*/
			return I18N.getString("eui.core.objs.js.startend", "执行完毕");
		} else if (this.status.isCanceled()) {
			/*return "执行取消";*/
			return I18N.getString("eui.core.objs.js.docel", "执行取消");
		} else if (this.status.isWaiting()) {
			/*return "正在等待执行...";*/
			return I18N.getString("eui.core.objs.js.waitstart", "正在等待执行...");
		} else {
			/*return "正在执行...";*/
			return I18N.getString("eui.core.objs.js.doing", "正在执行...");
		}
	}

	/**
	*    当服务器发生异常时总是会通知此函数，以在界面上显示异常信息，本类有此函数的默认实现，直接用对话框弹出异常
	 */
	AbstractReqObj.prototype.showError = function(e) {
			if(EUI.browser.isMobile){
				var title = (typeof (EUI.showError) == "function")?I18N.getString("eui.core.objs.js.errorhint", "错误提示"):I18N.getString("eui.core.objs.js.hint", "提示");
				var msg = e.message.split('\n')[0];
				showMobileTipDlg(msg,title);
			}else{
				if (typeof (EUI.showError) == "function")
					EUI.showError(e);
				else
					EUI.showMessage(isie ? e.description : e.message);
			}
	}

	/**
	* 子类中queryObj的回调函数，传递给QueryServer对象
	* error  参数  erroe, xmlhttp, userdata
	* */
	AbstractReqObj.prototype.onqueryobjfinish = function(xmlhttp, err) {
		//异常了
		if(err instanceof Error){
			if (this.finishWithError) {
				this.finishWithError(err);
			}
			if (!xmlhttp.isResultException() && !xmlhttp.isResultError()) {// 有可能是http异常，如果是，那么应该在这里截获。
				this.showError(err);
				return;
			}
		}
		this._loadStatus(xmlhttp.getDetail());

		var status = this.status;

		if (xmlhttp.isResultException() || xmlhttp.isResultError()) {// 有异常, 把异常throw出去，由showError函数显示。
			try {
				// 异常信息要加入url，因为报告错误时需要url。
				var detailmsg = status.getLogs();

				/**
				* 20091210 服务器有2种情况会出现isResultException=true的情况：<br>
				*          <ul>
				*            <li>1、预期的计算错误，比如表达式编译通不过，此时错误的详细信息在status.getLogs()中，包括异常堆栈。
				*                   这个错误信息的输出是在AbstractReqMgrAction.printRequestTaskExecuteInfo()方法中输出。
				*            <li>2、非预期的程序错误，比如程序报空指针异常，此时异常堆栈在xmlhttp.getDetail()中。
				*                   这种异常被JsAction截获，并在JsAction中调用ClientResult.writeTo()方法输出错误信息和异常堆栈。
				*          </url>
				*          这2种异常的异常堆栈都应该显示，方便查错。
				*          之前只显示了第一种情况的异常堆栈，对于第2种情况，只显示了异常信息，没有显示异常堆栈。
				*          上面的问题可以这样重现：钻取报表，在钻取过程中故意报空指针异常。
				*          参考ISSUE:BI-2752 点击代码的最后级别，系统报错。这个帖子中的错误对话框就没有显示异常堆栈。
				*/
				if (!detailmsg)
					detailmsg = xmlhttp.getDetail();

				/*detailmsg += "\r\n\r\n页面地址为：【" +"<a errurl=true>"+ xmlhttp.url + (xmlhttp.params ? "?" + xmlhttp.params : "") ++"</a>" + "】";*/
				detailmsg += I18N.getString("eui.core.objs.js.pageaddress", "\r\n\r\n页面地址为：【{0}】",
						[ "<a errurl=true>" + xmlhttp.url
								+ (xmlhttp.params ? "?" + xmlhttp.params : "") + "</a>" ]);
				EUI.throwError(xmlhttp.getMessage(), detailmsg);
			} catch (abcd) {
				if (!EUI.browser.isMobile) {
					this.showError(abcd);
				}else{
					showMobileErrorDlg(abcd.message);
				}
			}
			return;
		}

		if (!this._id) {
			this._id = this.status.getId();
			if (!this._id) {
				/*EUI.throwError("提交计算请求后无法从服务器获得id");*/
				EUI.throwError(I18N.getString("eui.core.objs.js.noidfromserver", "提交计算请求后无法从服务器获得id"));
			}
			if (!status.isFinished() && this.isCanceled())
				this.cancel();
		}

		if (this.showStatus) {// 显示计算状态
			this.showStatus();
		}
		this.querynext();
	}

	/**
	* 判断任务是否结束，如果没有结束，则在一段时间后启动另一次轮询<br>
	* @param {} status
	*/
	AbstractReqObj.prototype.querynext = function() {
		var status = this.status;
		if (status.isFinished() || this.isCanceled()) {
			this.finish();
		} else {
			this.timerid = EUI.mySetTimeout(this.wnd, new CallBackFunc(this, this.query),
					this.getTimeInterval());
		}
	}

	/**
	  *    此函数决定了客户端以什么样的频率向服务器发送轮询信息，此函数返回一个大于0的整数表示毫秒数，每个这个毫秒数
	*    客户端就会发送一个轮询个服务器，询问服务器后台的执行任务有没有执行完毕
	*    每次轮询完毕后启动下次轮询时都会调用此函数，所以此函数还可以做到控制每次轮询的间隔是不一样的
	*    本类有此函数的默认实现，是一个相对智能的实现，开始的时候轮询的快，以后越来越慢
	 */
	AbstractReqObj.prototype.getTimeInterval = function() {
		if (typeof (this.timeInterval) == "undefined")
			this.timeInterval = 500;
		if (this.timeInterval >= 505 && this.timeInterval < 1000 * 2) {
			this.timeInterval += 500;
		} else {
			this.timeInterval += 1;
		}
		return this.timeInterval;
	}

	/**
	* @private
	*/
	function _AbstractReqObj_onQueryFinish(xmlhttp, userdata, err) {
		if(xmlhttp instanceof Error){
			err.onqueryobjfinish(userdata, xmlhttp);
		}else{
			userdata.onqueryobjfinish(xmlhttp, err);
		}
	}

	/**
	* 向服务器发送一个异步请求, 此类以及子类的所有服务器请求都经过这个方法
	* */
	AbstractReqObj.prototype.queryserver = function(action, param) {
		if (param == null)
			param = "";// 处理param为空的情况
		if (this.getId()) {
			if (typeof (param) == "string") {
				param += ("&id=" + this.getId());
			} else {
				param.put("id", this.getId());
			}
		}
		return EUI.ajax({
			url: action,
			data: param,
			callback: _AbstractReqObj_onQueryFinish,
			error: _AbstractReqObj_onQueryFinish,
			userdata: this
		});
	}

	/**
	* 装入服务器返回的状态信息，
	* @private
	* */
	AbstractReqObj.prototype._loadStatus = function(s) {
		if (!this.status) {
			this.status = new ReqObjExeStatus();
		}
		this.status._load(s);
	}

	/**
	* 初始化状态，每次start时都应该初始化状态，
	* */
	AbstractReqObj.prototype.reset = function() {
		this._canceled = false;
		this._id = null;
		this.options.clear();
		if (this.status) {
			this.status.reset();
		}
	}

	/**###################################################################################################### */

	/**
	* 参见上面AbstractReqObj类的注释，客户端会隔一段时间询问一次服务器“后台运算”的执行情况，
	* 服务器会返回一些字符信息给客户端，此类就是负责解析服务器端返回的信息，并提供一些方法供使用者调用的
	* 
	* 除了服务器返回的一些“标准”的信息外，有时也会返回一些特殊的信息，那些特殊的信息被存放在getOptions()方法返回的map对象中
	* 服务器端的RequestTask接口的函数printInfo负责生成这些特殊的信息
	* @class
	*/
	function ReqObjExeStatus() {
		this._logs = "";// 有可能使用ReqObjExeStatus的人，刚开始就访问日志信息，如果不初始化值的话，会得到undefined
	}

	/**
	* 从s中读出服务器返回的信息
	* @private
	* */
	ReqObjExeStatus.prototype._load = function(s) {
		var map = new EUI.StringMap(s, "\r\n");
		this._status = map.getValue("status");
		this._hasException = map.getValue("hasexception") == "true";
		this._exceptionmsg = unescape(map.getValue("exceptionmsg"));
		this._startTime = map.getValue("starttime");
		if (!this._caclId) {
			this._caclId = map.getValue("id");
		}
		this._canceled = map.getValue("canceled");
		this._resultIsReport = map.getValue("reportresult") != "false";// 请求的结果是否是一个报表

		var logscount = map.getValue("logscount");
		if (logscount) {
			this.logscount = logscount;
		}

		/**
		* 如果服务器端发送了lastlog（可能发送的为一个空串），那么表示要更新客户端的lastlog信息
		*/
		var lastlog = map.getValue("lastlog");
		if (typeof (lastlog) == "string" && this._logs) {// 替换this._logs中的最后一行
			this._logs = this._logs.substring(0, this._logs.length - this.lastlog_len
					- 2/*_logs后面还有个回车符*/)
					+ unescape(lastlog) + "\r\n";
		}

		var lastlog_hash = map.getValue("lastlog_hash");
		if (lastlog_hash) {
			this.lastlog_hash = lastlog_hash;
			this.lastlog_len = parseInt(map.getValue("lastlog_len"));// 发送了lastlog_hash肯定也会发送lastlog_len
		}

		/**
		* 接收服务器发送过来的增量日志信息，inclogs可能为空，表示没有日志信息即客户端已经是最新的日志了，
		* 如果inclogs不为空，那么一定会以一个回车换行结束
		*/
		var inclogs = map.getValue("inclogs");
		if (inclogs) {
			if (this._logs)
				this._logs = this._logs + unescape(inclogs);
			else
				this._logs = unescape(inclogs);
		}

		this.options = map;
	};

	/**
	* 客户端向服务器获取日志信息时，需要提供服务器一些信息服务器才知道如何增量的发生给客户端哪些日志信息
	* 此处客户端提供给服务器：目前自己拥有的日志的行数，最后一行日志的hash和长度，这些信息都是服务器端
	* 上次给客户端的，客户端在返回给服务器
	*/
	ReqObjExeStatus.prototype.setQueryParams = function(params) {
		if (this.logscount)
			params.put("last_getlogs_count", this.logscount);
		if (this.lastlog_hash) {
			params.put("lastlog_hash", this.lastlog_hash);
		}
	}

	/**
	* 当前请求是否正在等待
	* */
	ReqObjExeStatus.prototype.resultIsReport = function() {
		return this._resultIsReport;
	};
	/**
	* 当前请求是否正在等待
	* */
	ReqObjExeStatus.prototype.isWaiting = function() {
		return this._status == "waiting";
	};
	/**
	* 当前请求是否正在执行
	* */
	ReqObjExeStatus.prototype.isExecuting = function() {
		return this._status == "executing";
	};
	/**
	* 挡墙请求是否已执行完毕
	* */
	ReqObjExeStatus.prototype.isFinished = function() {
		return this._status == "finished";
	};
	/**
	* 如果执行完毕,则此函数返回执行过程中是否有异常
	* */
	ReqObjExeStatus.prototype.hasException = function() {
		return this._hasException;
	};
	/**
	* 返回执行过程中的异常的标题信息
	* */
	ReqObjExeStatus.prototype.getExceptionMsg = function() {
		return this._exceptionmsg;
	};
	/**
	* 请求是否被取消了
	* */
	ReqObjExeStatus.prototype.isCanceled = function() {
		return this._canceled == "true";
	};
	/**
	* 请求的开始时间
	* */
	ReqObjExeStatus.prototype.getRequestStartTime = function() {
		return this._startTime;
	};

	/**
	* 获得服务器的logs信息
	* */
	ReqObjExeStatus.prototype.getLogs = function() {
		return this._logs;
	};

	/**
	* 请求的唯一编号
	* */
	ReqObjExeStatus.prototype.getId = function() {
		return this._caclId;
	};
	/**
	* 返回发送此请求的登陆者的身份
	* */
	ReqObjExeStatus.prototype.getOwner = function() {
		return null;
	};
	ReqObjExeStatus.prototype.getProgress = function() {
		return null;
	};
	ReqObjExeStatus.prototype.getOptions = function() {
		return this.options;
	};
	ReqObjExeStatus.prototype.reset = function() {
		this.options.clear();
		this._caclId = null;
		this._logs = null;
		this._canceled = false;
		this._hasException = false;
		this._resultIsReport = false;
		this._startTime = false;
	};

	/**###################################################################################################### */

	/**
	* 系统对象，提供脚本动态加载，IE垃圾回收，获得服务器信息等
	* 
	* @class
	*/
	function Sys() {
		this.lib = new Library();
	}

	/**
	* 这里定义的是xui的默认支持的tag和需要引用的js的一个对应
	* 修改这里的tag名时一定要慎重。
	* 调用者不必直接使用这个变量，应该通过sys.lib.getComponentJs函数类使用
	* TODO 在下面的map里包含控件名简写和控件名称相同的key，以后要将控件名称简写放入xui的map
	* @type 
	*/
	Sys.XUITAG_JSFILES_MAP = {
		edialog 					: "eui/modules/edialog.js",
		edialogbutton 		: "eui/modules/edialog.js",
		elist 						: "eui/modules/elist.js",
		esplitter 				: "eui/modules/epanelsplitter.js",
		etree 						: "eui/modules/etree.js",
		eprogress 				: "eui/modules/eprogress.js",
		etabctrl 					: "eui/modules/etabctrl.js",
		efontlink 				: "eui/modules/efontctrls.js",
		ethumbnail				: "eui/modules/ethumbnail.js",
		ecolorpicker 			: "eui/modules/epicker.js",
		espinner 					: "eui/modules/ecommonctrls.js",
		ebutton						: "eui/modules/ecommonctrls.js",
		eeditbrowser			: "eui/modules/ecommonctrls.js",
		eeditslider				: "eui/modules/ecommonctrls.js",
		elistboxcombobox	: "eui/modules/ecombobox.js",
		elistbox					: "eui/modules/elistbox.js",
		ecoolbar					: "eui/modules/ecoolbar.js",
		elistcombox				: "eui/modules/ecombobox.js",
		eimagestylepicker	: "eui/modules/epicker.js"
	/*	xcolorpicker : "xui/ctrls/xpicker.js",
		xbrushpicker : "xui/ctrls/xpicker.js",
		xlinepicker : "xui/ctrls/xpicker.js",
		xcalendar : "xui/ctrls/xcalendar.js",
		xcalendarcombo : "xui/ctrls/xcalendar.js",
		xcalendarcombobox : "xui/ctrls/xcalendar.js",
		xmenology : "xui/ctrls/xcalendar.js",
		xmenologycombo : "xui/ctrls/xcalendar.js",
		xmenologycombobox : "xui/ctrls/xcalendar.js",
		xcolorpanel : "xui/ctrls/xcolorpanel.js",
		xeditcombo : "xui/ctrls/xcombobox.js",
		xeditcombobox : "xui/ctrls/xcombobox.js",
		xlistcombo : "xui/ctrls/xcombobox.js",
		xlistcombobox : "xui/ctrls/xcombobox.js",
		xlistboxcombobox : "xui/ctrls/xcombobox.js",
		xbutton : "xui/ctrls/xcommonctrls.js",
		xeditbrowser : "xui/ctrls/xcommonctrls.js",
		xsearchpanel : "xui/ctrls/xcommonctrls.js;xui/ctrls/xpanel.js",
		xcoolbar : "xui/ctrls/xmenu.js;xui/ctrls/xcoolbar.js",
		xdialog : "xui/xwindow.js;xui/ctrls/xcommonctrls.js;xui/ctrls/xdialog.js",
		xdialogbutton : "xui/xwindow.js;xui/ctrls/xcommonctrls.js;xui/ctrls/xdialog.js",
		xfontlink : "xui/ctrls/xfontctrls.js",
		xfontcombo : "xui/ctrls/xcombobox.js;xui/ctrls/xlistbox.js,xui/ctrls/xfontctrls.js",
		xfontcombobox : "xui/ctrls/xcombobox.js;xui/ctrls/xfontctrls.js",
		xfontsizecombo : "xui/ctrls/xcombobox.js;xui/ctrls/xfontctrls.js",
		xfontsizecombobox : "xui/ctrls/xcombobox.js;xui/ctrls/xfontctrls.js",
		xlist : "xui/ctrls/xlist.js",
		xlistbox : "xui/ctrls/xlistbox.js",
		xmenu : "xui/ctrls/xmenu.js",
		xnotebook : "xui/ctrls/xnotebook.js",
		xpagectrl : "xui/ctrls/xpagectrl.js",
		xpagecontrol : "xui/ctrls/xpagectrl.js",
		xpanel : "xui/ctrls/xpanel.js",
		xhintpanel : "xui/ctrls/xpanel.js",
		xsplitter : "xui/ctrls/xpanelsplitter.js",
		xprogressbar : "xui/ctrls/xprogressbar.js",
		xspinner : "xui/ctrls/xspinner.js",
		xtree : "xui/ctrls/xtree.js",
		accordionxtree : "xui/ctrls/xtree.js",
		xline : "xui/uibase.js",
		xslider : "xui/ctrls/xslider.js",
		xeditslider : "xui/ctrls/xslider.js",
		xppted : "xui/ctrls/xppted.js",
		xribbonpanel : "xui/ctrls/xribbonpanel.js",
		xribbontab : "xui/ctrls/xribbonpanel.js",
		xribbongroup : "xui/ctrls/xribbonpanel.js",
		xribbonband : "xui/ctrls/xribbonpanel.js"*/
	}

	/**
	* IE浏览器的内存释放
	*/
	Sys.prototype.gc = function() {
		if (!isie)
			return;
		CollectGarbage();
		setTimeout("CollectGarbage();", 1);
	}

	Sys.prototype.regTag = function(key, value) {
		Sys.XUITAG_JSFILES_MAP[key] = value;
	}

	/**
	* 取得服务器的web应用目录(contextpath)，返回的值总是前后有/,如果contextpath为空,则返回/。
	* 
	* 此函数中嵌入了jsp代码，服务器会把此段代码当成jsp执行后生成相应的javascript代码
	*/
	Sys.prototype.getContextPath = function(wnd) {
		//不能使用relpath，可能是跳转页面  会导致不对
		/*if ( window["$relpath"] ) { //$relpath 在comm.ftl中定义.只有在前台ftl模版里面引用了改ftl,才有这个对象
		  return $relpath;
		}*/
		wnd = wnd || window;
		if (wnd) {
			var relpath = wnd["$relpath"];
			if (relpath) return relpath;
		}
		var local = (wnd || window).location,
			pathname = local.pathname;
		if (!pathname || pathname == "" || pathname == "null") {
			return "/";
		}
		var base = /\/([^\/]+)\//.exec(pathname);
		if(base && base[1]){
			base = "/" + base[1] + "/";
			return base;
		}
		return "";
	}
	/**
	* 为了兼容一部分代码，暂时保留getImgPath
	* @type 
	*/
	Sys.prototype.getImgPath = function(imgName) {
		return EUI.getContextPath() + XUI_IMAGES_ROOT_PATH + imgName;
	};

	/**
	* 标记某个js已经加载完毕了.
	* 例如：sys.setJsIncluded("xui/util.js");
	* @param {str} jsName 当前js名称
	*/
	Sys.prototype.setJsIncluded = function(jsName) {
		window[jsName] = true;
	}

	/**
	* 此函数返回当前浏览器外网访问服务器所用的地址，如http://54.56.55.111:80/bi/
	* 当服务器是经过端口映射或者反向代理之后，那么访问服务器可以用内网地址也可以用外网地址
	* 详细参考函数Sys.prototype.getServerName的注释
	*/
	Sys.prototype.getRequestURL = function() {
		var lct = window.location;
		return lct.protocol + "//" + lct.host + this.getContextPath();
	}

	/**
	* 此函数返回服务器的内网访问地址,如http://192.168.0.2:80/bi/ 总以/结尾并包含http://和地址端口等信息
	* 
	* 当服务器是经过端口映射或者apache的反向代理后公布到外网时,外网用户可以通过一个外网地址访问到服务器,那个地址可以
	* 通过函数sys.getRequestURL()获得,而此时在客户端是无法获得其内网访问地址的,因为客户端浏览器是不知道服务器是否
	* 经过了端口映射或者apache的反向代理,此函数可以帮助客户端获得服务器的内网访问地址信息.
	* 
	* 此方法与sys.getRequestURL()的作用相同,此方法获得内网地址,sys.getRequestURL()获得外网地址
	* 
	* 用途: 1.如gis的geoserver,如果geoserver在外网,则需要使用外网的方式访问bi服务器,
	* 如果geoserver在内网,并且无法访问外网资源,则需要用内网的方式访问bi服务器
	*/
	Sys.prototype.getServerName = function() {
		var requrl = "<%=request.getRequestURL()%>";// 请求的完整路径,如http://www.google.com/images/1.gif
		var svrpath = "<%=request.getServletPath()%>";// 请求的文件路径,如/images/1.gif
		var svrpathlen = svrpath == null ? 0 : svrpath.length;
		var rootpath = requrl.substring(0, requrl.length - svrpathlen);
		if (rootpath.charAt(rootpath.length - 1) != '/') {
			rootpath += '/';
		}
		return rootpath;
	}

	/**###################################################################################################### */

	/**
	* 此类只在Sys对象中构造，表示sys对象中的lib属性
	* @class
	*/
	function Library() {
		this.https = [];
	}

	/**
	* 
	*/
	Library.prototype.dispose = function() {
		/**if (this.http)
		  this.http = null;*/
		this.https = null;
	}

	/**
	* 获取需要被引用的js，返回一个数组，数组中的js都没有被装载过，但有些js可能已经开始异步装载只是还没有完成。
	* 
	* @private
	* @param {str;arr} jses,参见includeAsync函数的说明
	* @param {wnd} wnd,参见includeAsync函数的说明
	* @param {arr} fnsneed，数组对象，可以不传递，如果传递，那么将直接使用传递的数组对象
	* @return {}
	*/
	Library.prototype._getNeedIncludeFiles = function(jses, wnd, fnsneed) {
		/*
		* BUG:同步加载js时传入标签名时或传入包含分号的路径名参数时可能会报错
		* 举例：调用sys.lib.include("xdialog")时报错;
		* 原因：在调用Library.prototype.getComponentJs获取JS路径时返回了”xui/xwindow.js;xui/ctrls/xcommonctrls.js;xui/ctrls/xdialog.js”
		* 		但是Library.prototype._getNeedIncludeFiles中并没有考虑参数中包含分号的情况，导致无法正常加载JS。
		* 解决办法：解析jses参数中的js文件时，考虑包含分号的情况
		* 			异步加载时传入这里的jses参数不会包含分号，故作这样的修改不会对异步加载产生影响。
		*/
		var fns = typeof (jses.push) == 'function' ? jses : jses.split(/,|;/img);
		if (!fnsneed)
			fnsneed = new Array();
		for (var i = 0; i < fns.length; i++) {
			var fn = fns[i];
			if (!fn)
				continue;
			if (fn.indexOf(".") == -1) {
				/**
				* 直接写的类名或控件名时，从Sys.XUITAG_JSFILES_MAP找到其需要引用的js并分析那些js
				*/
				var componentsjs = this.getComponentJs(fn);
				if (!componentsjs)
					throw new Error("不存在控件:" + fn + "\nThe control doesn't exist:" + fn);
				fnsneed = this._getNeedIncludeFiles(componentsjs, wnd, fnsneed);
				continue;
			}
			if (!this._findScript(fn, wnd) && fn.indexOf("/sys.js") == -1
					&& this._arrayIndexOf(fnsneed, fn) == -1) {
				fnsneed.push(fn);
			}
		}
		return fnsneed;
	}

	/**
	* 传递一个控件TAG名，返回此控件所需要的js文件列表
	* 
	* @param {str} componenttag，控件TAG名，如"xtree"
	* @return {str} 返回一个逗号分割的字符串，表示此控件需要的js，如果不存在，则返回空
	*/
	Library.prototype.getComponentJs = function(componenttag) {
		return Sys.XUITAG_JSFILES_MAP[componenttag.toLowerCase()];
	}

	/**
	* 设置一个控件需要加载的是哪些js。
	* 
	* @param {} componenttag，控件TAG名，如"xtree"
	* @param {} jses，逗号分割的字符串，表示此控件需要的js
	*/
	Library.prototype.setComponentJs = function(componenttag, jses) {
		Sys.XUITAG_JSFILES_MAP[componenttag.toLowerCase()] = jses;
	}

	/**
	* @private
	*/
	Library.prototype._arrayIndexOf = function(ar, element) {
		for (var i = 0; i < ar.length; i++) {
			if (ar[i] == element)
				return i;
		}
		return -1;
	}

	/**
	* 当同步或异步请求js内容时，真正请求的url由此js生成，例如，当传入的参数是"xui/util.js"时，那么返回"/bi2.2/xui/util.js"，假设bi2.2是contextPath，
	* 带上了contextPath，这样当在一些路径很深的页面中使用include时也能正确的请求到js的内容，例如如果测试页面的路径是/test/sys/testSys.html
	* 那么在这个测试页面上执行include时，传递的js文件名如果是xui/util.js，那么真正请求的内容会是/bi2.2/test/sys/xui/util.js，如果服务器没有做转发
	* 那么这个请求是无法请求到内容的，此函数做了一个默认的处理，所有的异步请求都从contextPath开始，这样就不会出现上面的问题了。
	* 
	* @param {} js
	* @return {}
	*/
	Library.prototype._makeJsUrl = function(js) {
		return EUI.formatUrl(js);
	}

	/**
	* 是否正在被装载？
	* @private
	*/
	Library.prototype._isLoading = function(js, wnd) {
		var i = wnd[js];
		return i == 0;
	}

	/**
	* @private
	*/
	Library.prototype._isLoaded = function(js, wnd) {
		var i = wnd[js];
		return i ? true : false;
	}

	/**
	* 是否fns在wnd中都被装入了，目前用于在定时的timer中检测所加载的js是否都完成了
	* 因为不是每个js文件在开头都一定有调用sys.setJsIncluded，所此函数检测的时候
	* 还需要遍历script dom节点
	* @private
	*/
	Library.prototype._isScriptsLoaded = function(fns, wnd) {
		for (var i = 0; i < fns.length; i++) {
			if (!this._findScript(fns[i], wnd))
				return false;
		}
		return true;
	}

	/**
	* @private
	*/
	Library.prototype._finishLoadJs = function(js, wnd) {
		wnd[js] = true;
		this._checkAsyncTasks(js, wnd);
	}

	/**
	* 某个js成功装入后调用。
	* @private
	*/
	Library.prototype._checkAsyncTasks = function(js, wnd) {
		var tsks = this.asyncIncludes;
		if (!tsks || tsks.length == 0) {
			this._stopCheckAsyncTasksTimer();
			return;
		}
		var tsk = null, len = tsks.length;
		for (var i = 0; i < len; i++) {
			if (!(tsk = tsks[i]))
				continue;
			if (tsk.checkFinish(js, wnd)) {
				tsks.splice(i--, 1);
				len--;
			}
		}
		/* 这里会导致后调用的先执行引发问题，所以改用上面的
		var tsk;
		for (var i = tsks.length - 1; i >= 0; i--) {
		  tsk = tsks[i];
		  if (!tsk)
		    continue;
		  if (tsk.checkFinish(js, wnd)) {
		    tsks.splice(i, 1);
		  }
		}*/
		if (len == 0)
			this._stopCheckAsyncTasksTimer();
	}

	/**
	* @private
	*/
	Library.prototype._startCheckAsyncTasksTimer = function() {
		if (this._checkAsyncTasksTimer)
			return;
		var self = this;
		/* 因为ie的onreadystatechange事件可能不稳定，不是每次都调用，所以定义一个timer定时检测脚本是否装载完毕。 */
		if (!this._checkAsyncTasksTimerFunc) {
			this._checkAsyncTasksTimerFunc = function() {
				self._checkAsyncTasksTimer = 0;
				self._checkAsyncTasks();
				if (self.asyncIncludes && self.asyncIncludes.length > 0)
					self._startCheckAsyncTasksTimer();
			}
		}
		self._checkAsyncTasksTimer = setTimeout(this._checkAsyncTasksTimerFunc,
				1000);
	}

	/**
	* @private
	*/
	Library.prototype._stopCheckAsyncTasksTimer = function() {
		if (this._checkAsyncTasksTimer) {
			clearTimeout(this._checkAsyncTasksTimer);
			this._checkAsyncTasksTimer = 0;
		}
	}

	/**
	* 该方法会自动引用ExtJs相应的样式与脚本，并在其成功加载完毕后执行设定的回调事件
	* @param {func} callback 回调事件，事件定义：callback(userdata)
	* @param {obj} userdata 外部数据
	*/
	Library.prototype.includeExtjs = function(callback, userdata) {
		/**
		* 已经存在Ext对象时就不必现异步加载extjs相关的样式与脚本了
		*/
		if (typeof (Ext) != "undefined") {
			if (typeof (callback) == "function")
				callback(userdata);
			return;
		}

		this
				.includeAsync(
						"xui/ext.css;xui/third/ext/adapter/ext/ext-base.js;xui/third/ext/ext-all.js",
						null, function() {
							if (typeof (callback) == "function")
								callback(userdata);
						});
	}

	/**
	* 参见includeAsync函数的注释，此函数与includeAsync不同的是，此函数是同步加载，
	* 不推荐使用此函数
	* 
	* @param {str} jses
	* @param {wnd} wnd
	*/
	Library.prototype.includeSync = function(jses, wnd) {
		wnd = wnd ? wnd : window;
		var fns = this._getNeedIncludeFiles(jses, wnd);
		//alert("窗口名称："+wnd.name?wnd.name:"无"+"; includejs: "+jses);
		if (fns.length > 0) {// debugger;
			var tsk = new _SyncIncludeTask(this, fns, wnd);
			tsk.doInclude();
		}
	}

	/**
	* 异步装载js或控件 , 当真正有js需要加载时调用onstart,并以数组的形式传递需要加载的js。
	* 
	* @param {str} jses表示要加载的js或控件，可以是以逗号分隔的多个js或控件，可用的控件列表参见：Sys.XUITAG_JSFILES_MAP。
	*              例如："xui/commonctrls.js,xui/debug.js,xlist,xui/dialog.js"，需要注意的是：分隔符可以是逗号，也可以是分号
	*              不同的分隔符意义也不同，分号分隔的表示对加载的顺序是有要求的，例如"a;b,c;d,e"，那么必须a加载完成后才能继续加载后续的js，
	*              必须b和c加载完成后才能继续加载d和e，但b和c的加载没有顺序要求。
	*              中间不能含有空格回车换行tab的字符；
	* @param {wnd} wnd表示要将js加载到哪个window对象上，可不传递表示加载的当前window对象上
	* @param {func} onfinish 当所有js加载完成后调用，调用方式是onfinish(userdata)
	* @param {func} onstart 当开始异步加载时调用，调用方式是onstart(fns, userdata)，参数fns是一个数组对象，表示要加载的js列表
	*               此回调函数不一定总是指向，因为也许指定要加载的js早已经被其他地方加载了，那么此函数将直接回调onfinish并返回，
	*               如果要加载的js中有部分已经加载了，那么会执行回调函数onstart，并在回调参数fns中传递那些需要加载的js。
	* @param {obj} userdata一个调用者自己的对象指针，用于在回调时传递给调用者
	*/
	Library.prototype.includeAsync = function(jses, wnd, onfinish, onstart,
			userdata) {
		wnd = wnd ? wnd : window;
		if (!wnd.document.body) {// 也许页面还没有初始化
			this.includeSync(jses, wnd);
			if (onfinish)
				onfinish(userdata);
			return;
		}
		jses = this._convertComponentInJses(jses);
		/*先按分号分组，按顺序加载，如果没有一个分号，那么执行正常的异步加载，不保证加载的顺序*/
		if (typeof (jses) == 'string' && jses.indexOf(';') >= 0) {
			var jsgrps = jses.split(';');
			var tsk = new _AsyncIncludeTaskGrp(this, jsgrps, wnd, onfinish, onstart,
					userdata);
			tsk.doInclude();
			return;
		}

		var fns = this._getNeedIncludeFiles(jses, wnd);
		if (fns && fns.length > 0) {
			if (onstart)
				onstart(fns, userdata);
			var tsk = new _AsyncIncludeTask(this, fns, wnd, onfinish, userdata);
			if (!this.asyncIncludes) {
				this.asyncIncludes = new Array();
			}
			this.asyncIncludes.push(tsk);
			this._startCheckAsyncTasksTimer();
			tsk.doInclude();
		} else {
			if (onfinish)
				onfinish(userdata);
		}
	}

	/**
	* 该方法是将include的js重新分组，化解掉component
	* 在化解组件的时候会将sys.js;util.js;uibase.js加在前面
	* 比如：include("xlist;xtree")会变更为
	* xui/sys.js;xui/util.js;xui/uibase.js;xui/ctrls/xlist.js;xui/ctrls/xtree.js
	* 
	* include时也支持component和js的混搭，如
	* include("xui/util.js,xlist;xtree,xui/test.js")会变更为
	* xui/sys.js;xui/util.js;xui/uibase.js;xui/util.js,xui/ctrls/xlist.js;xui/ctrls/xtree.js,xui/test.js
	* 
	* include时也支持加入数组，如
	* include(["t1","t2.js"]);
	* 等同于 include("t1,t2.js");
	* 
	* 更多例子可以看testSys内测试代码
	* @private
	* @param {} jses
	* @return {}
	*/
	Library.prototype._convertComponentInJses = function(jses) {
		if (jses instanceof Array)
			jses = jses.join(',');
		if (jses == "")
			return "";
		var jsgrps = jses.split(';');
		var newjsgrps = new Array();
		var hasComponentJs = false;
		for (var i = 0; i < jsgrps.length; i++) {
			var arr = jsgrps[i].split(',');
			var componentAllJsArr = [];
			var newjs = "";
			for (var j = 0; j < arr.length; j++) {
				var curjs = arr[j];
				// 如果使用以下混搭的方式："xlist,xtree.js"，需要把xlist替换成XUITAG_JSFILES_MAP加载的js，并加上
				if (!curjs.endsWith(".css") && !curjs.endsWith(".js")) {
					hasComponentJs = true;
					var curjs = Sys.XUITAG_JSFILES_MAP[curjs.toLowerCase()];
					if (!curjs)
						throw new Error("不存在控件：" + curjs + "\nThe control doesn't exist:"
								+ curjs);
					if (curjs.indexOf(";") > 0) {
						var componentjsArr = curjs.split(";");
						curjs = componentjsArr[0];
						componentjsArr.splice(0, 1);
						componentAllJsArr = componentAllJsArr.concat(componentjsArr);
					}
				}
				newjs = newjs ? newjs + "," + curjs : curjs;
			}
			newjsgrps.push(newjs);
			newjsgrps = newjsgrps.concat(componentAllJsArr); //.putAll(componentAllJsArr);
		}
		if (hasComponentJs)
			newjsgrps = [ "eui/modules/uibase.js" ]
					.concat(newjsgrps);
		return newjsgrps.join(';');
	}

	/**
	* 此函数类似includeSync，所不同的是，如果没有传递回调函数，那么执行同步加载。
	* 
	* bi2.2及以前，include方法只是同步加载的，2.3后include改为可异步了
	*/
	Library.prototype.include = function(jses, wnd, onfinish, onstart, userdata) {
		if (arguments.length <= 2) {
			/**
			* 兼容处理，如果没有传递回调事件，那么执行同步加载
			*/
			this.includeSync(jses, wnd);
			return;
		}

		this.includeAsync.apply(this, arguments);
	}

	/**
	* 查找js是否已加载
	* @private
	*/
	Library.prototype._findScript = function(fn, wnd) {
		if (wnd[fn])
			return true;
		// 如果找不到，再到dom里面去找<script>节点引用。
		var domnd = this._findScriptInDom(fn, wnd.document);
		if (domnd) {
			if (this._isScriptDomReady(domnd)) {
				wnd[fn] = true;
				return true;
			} else {
				/**
				* 设置为0表示loading，这样可以避免在一个js未加载完毕时，又有其他地方要加载此js，导致重复加载 
				* 
				* fixme 有可能 domnd并没有onreadystatechange事件。
				*/
				wnd[fn] = 0;
				return false;
			}
		}
		return false;
	}

	/**
	* 判断scriptdom节点是否加载完毕
	* @param {dom} domnd 
	*/
	Library.prototype._isScriptDomReady = function(domnd) {
		if(domnd.readyState === undefined) return true;
		if (domnd.attachEvent) {
			/**
			* IE8和IE6上，不知为何动态异步加载的scriptdom节点的readyState最终的值就是loaded,而静态写在html中的script的 readyState最终的值就是complete
			* 但是动态加载的在readyState是complete那一刻时脚本并不是完全加载完毕的，必须要等到loaded
			*/
			return (domnd.xuisrc && domnd.readyState == "loaded")
					|| (!domnd.xuisrc && domnd.readyState == "complete")
		} else {
			/**
			* 通过异步include进来的js都会有readyState属性为loading或loaded，静态的写入到html中的script节点没有此属性
			* 所以我们认为readyState != "loading"的都是加载完毕的
			*/
			return domnd.readyState != "loading";
		}
	}

	/**
	* 查找js是否已存在,如果存在返回对应的dom节点。
	* @private
	*/
	Library.prototype._findScriptInDom = function(fn, doc) {
		// if (isie) {
		// 	for (var i = 0; i < doc.scripts.length; i++) {
		// 		var nd = doc.scripts[i];
		// 		if (nd.src.indexOf(fn) != -1)
		// 			return nd;
		// 	}
		// }

		try {
			var nds = doc.getElementsByTagName("script");
			if (!nds)
				return;
			var count = nds.length;
			for (var i = 0; i < count; i++) {
				var nd = nds[i];
				if (nd.src.indexOf(fn) != -1)
					return nd;// IE8和ff中的nd.src是含有contentpath的
			}
		} catch (e) {
			// FIXME: 在IE执行execScript过程中再执行此函数有可能会出现80020101错误。所以将此代码try...catch.
		}
	}

	/**###################################################################################################### */

	/**
	* 同步加载任务，每次同步加载调用都会创建一个此对象，把加载的处理交给此对象实现
	* 
	* @class
	* @private
	*/
	function _SyncIncludeTask(lib, fns, wnd) {
		this.lib = lib;
		this.fns = fns;
		this.wnd = wnd ? wnd : window;
	}

	/**
	* 
	* @private
	*/
	_SyncIncludeTask.prototype.doInclude = function() {
		for (var i = 0; i < this.fns.length; i++) {
			this._loadScript( this.fns[i]);
		}
	}

	/**
	* 加载并运行js脚本文件。
	* @private
	*/
	_SyncIncludeTask.prototype._loadScript = function(jsuri) {
		if (this.lib._isLoaded(jsuri, this.wnd))// 之前的_getNeedIncludeFiles返回的列表中的js可能有些已经被加载了
			return;
		if (this.lib._isLoading(jsuri, this.wnd)) {
			throw new Error("js:" + jsuri + " 正在异步装载" + "\njs:" + jsuri
					+ " is loading asynchronously");
		}
		var jscontent = "";
		try {
			var requrl = this.lib._makeJsUrl(jsuri);
			jscontent = EUI.getFileContent(jsuri);
			// 执行加载的脚本内容。
			if (!jscontent || jscontent.length == 0)
				return;
			/**
			* 这样不会造成任何的错误，除此之外当值为NULL或者false，在验证时不会为true
			* 而原先的判断在值为NULL或者false时，条件就会成立，这样就会出错
			* --20101102
			*/
			if (this.wnd.execScript) {
				if (!this.wnd.execScripting)
					this.wnd.execScripting = 0;
				this.wnd.execScripting++;// 设置一个记数，当正在执行js的时候util.js中的_onWindowError函数直接return，不然当脚本执行有异常时总是会有提示对话框
				try {
					/**
					* 由于execScript方法被Ie与Chrome支持，两者对语言类型的参数支持存在差异，如果指定的不正确就会影响到脚本的执行，所以这里不指定语言类型参数，让各
					* 浏览器使用缺省的参数设置来执行脚本。
					* --20101102
					*/
					this.wnd.execScript(jscontent);
				} finally {
					this.wnd.execScripting--;
				}
			} else {
				this.wnd.eval(jscontent);
			}
			this.wnd[jsuri] = true;
			// this.lib._finishLoadJs(jsuri, this.wnd);
			// //同步加载的js和异步加载的js混合调用时，同步的也会触发异步的onfinish，这回造成onfinish的混乱，典型的现象是有些报表参数无法显示。
		} catch (e) {
			var errMsg = (e.description ? e.description : e.message) + " \n脚本'"
					+ jsuri + "'加载失败!" + " \nScript'" + jsuri + "'loading failed!";
			throw new Error(errMsg);
		}
	}

	/**###################################################################################################### */

	/**
	* 执行一组js的异步加载，例如如果要加载js:"xui/util.js;xui/uibase.js;xlist"，那么其实分了3组，前面的加载完毕后后面的才能开始加载
	* 
	* @class
	* @private
	* @param {} lib
	* @param {} fns
	* @param {} wnd
	* @param {} onfinish
	* @param {} onstart
	* @param {} userdata
	*/
	function _AsyncIncludeTaskGrp(lib, fns, wnd, onfinish, onstart, userdata) {
		this.lib = lib;
		this.fns = fns;
		this.wnd = wnd ? wnd : window;
		this.onfinish = onfinish;
		this.onstart = onstart;
		this.__userdata = userdata;
		this.currentIndex = 0;
	}

	/**
	* @private
	*/
	_AsyncIncludeTaskGrp.prototype.doInclude = function() {
		this.lib.includeAsync(this.fns[this.currentIndex], this.wnd,
				this.myonfinish, this.myonstart, this);
	}

	_AsyncIncludeTaskGrp.prototype.myonfinish = function(self) {
		self.currentIndex++;
		if (self.currentIndex >= self.fns.length) {
			var onfinish = self.onfinish;
			var userdata = self.__userdata;
			self.onfinish = null;
			self.__userdata = null;
			self.wnd = null;
			if (onfinish)
				onfinish(userdata);
		} else {
			self.doInclude();
		}
	}

	_AsyncIncludeTaskGrp.prototype.myonstart = function(fns, self) {
		var onstart = self.onstart;
		if (onstart) {
			self.onstart = null;
			onstart(fns, self.__userdata);
		}
	}

	/**###################################################################################################### */

	/**
	* 异步加载任务，私用，一次异步加载调用就会产生一个新的此对象，把加载的处理交给此对象实现。
	* 
	* @class
	* @private
	*/
	function _AsyncIncludeTask(lib, fns, wnd, onfinish, userdata) {
		this.lib = lib;
		this.fns = fns;
		this.wnd = wnd ? wnd : window;
		this.onfinish = onfinish;
		this.__userdata = userdata;
	}

	/**
	* @private
	*/
	function _onAsyncIncludeError() {
		throw new Error("include js failed :" + this.src);
	}

	/**
	* @private
	*/
	_AsyncIncludeTask.prototype.doInclude = function() {
		var self = this;
		var onload = function() {
			// 参考：http://msdn.microsoft.com/en-us/library/ms534359%28VS.85%29.aspx
			// uninitialized Object is not initialized with data.
			// loading Object is loading its data.
			// loaded Object has finished loading its data.
			// interactive User can interact with the object even though it is not fully loaded.
			// complete Object is completely initialized.
			// IE11 更加偏向现代浏览器
			if(this.attachEvent){
				if(this.readyState != "loaded" && this.readyState != "complete") return;
				this.onreadystatechange = null;
			}else{
				this.onload = null;
				this.readyState = "loaded";
			}
			this.onerror = null;
			self.lib._finishLoadJs(this.xuisrc, self.wnd);
		}
		/**
		* BUG:在插件显示报表时异步加载的脚本会出现个别脚本没有加载的情况
		* 原因：可能是由于在显示插件时出现了阻塞现象，使得要加载的脚本没有被正常加载而直接执行了回调事件
		* 需要注意的是，该问题在某些性能好的机器上可能并不会出现
		* --20101122
		*/
		setTimeout(function() {
			for (var i = 0; i < self.fns.length; i++) {
				self._loadScriptAsync(self.fns[i], onload);
			}
		}, 0);
	}

	/**
	* @private
	*/
	_AsyncIncludeTask.prototype._loadScriptAsync = function(js, onload) {
		if (this.lib._isLoading(js, this.wnd)) {
			return;
		}

		if (js.endsWith(".css")) {
			/**
			* 如果是样式文件时，仅加载它就行了，不用作事件的监听，因为link元素在非Ie的浏览器上不支持onload事件
			*/
			this._loadStyle(js);
			return;
		}

		var doc = this.wnd.document;
		var node = doc.createElement("script");
		if(node.attachEvent){
			node.onreadystatechange = onload;
		}else{
			node.onload = onload;
		}
		node.onerror = _onAsyncIncludeError; // ie 上不行， ff上可以
		node.type = 'text/javascript';

		if (/(sanlib\/|ebi\/|xui\/).+/g.test(js)) {
			node.charset = "UTF-8"; // 门户文件的htm可能是GBK编码的,如果在这样的htm中引用utf8编码的js文件则必须设置这个属性,否则没法加载.
		}

		node.xuisrc = js;
		if (!node.attachEvent) {
			/**
			* ff上并没有readyState属性，当一个script正在加载时，无法根据scriptdom判断此script正在被加载
			* 所以这里在加载之前设置一下这个属性，这样其他地方好判断
			*/
			node.readyState = "loading";
		}
		node.src = this.lib._makeJsUrl(js);
		/*
		* 最后在把node加入到body中，为什么呢，因为当对同一批js先后连续调用异步装入时，第二次的调用可能没有需要装入的js，但是可能有些wnd[js]=true了
		* 但js内部的对象还没有初始化好，此时如果直接调用onfinish，可能会出现无法获取对象的异常。 ISSUE BI-746
		* http://svrdev/jira/browse/BI-746
		*/
		/*
		* 应该先设置node.src后再appendChild(node)，不然在ie10上节点的onreadystatechange事件readyState码永远没有complete状态
		* by chxb, 2014/5/14
		*/
		doc.body.appendChild(node);

	}

	/**
	* 加载指定的外部样式
	* @private
	* @param {str} css
	*/
	_AsyncIncludeTask.prototype._loadStyle = function(css) {
		var doc = this.wnd.document;
		var node = doc.getElementsByTagName("head")[0].appendChild(doc
				.createElement("link"));
		node.rel = "stylesheet";
		node.type = "text/css";
		node.href = this.lib._makeJsUrl(css);
		node.xuisrc = css;

		/**
		* 执行一下加载完样式后的回调，因为link元素在非Ie的浏览器上不支持onload事件，所以就无法知道样式是否已经完成加载，
		* 这里用setTimeout是为了却保加载样式后能够正常的执行完成后的回调而模拟的一个运行过程，需要注意的是这里的回调不会
		* 因为样式没有成功加载而不执行，该回调始终会执行。 
		*/
		var slf = this;
		this.wnd.setTimeout(function() {
			slf.lib._finishLoadJs(css, slf.wnd);
		}, 0);
	}

	/**
	* 判断是否需要调用finish事件，如果需要则调用且返回true
	*/
	_AsyncIncludeTask.prototype.checkFinish = function(js, wnd) {
		if (wnd && this.wnd != wnd)
			return;
		if (this.lib._isScriptsLoaded(this.fns, this.wnd)) {
			this.doFinish();
			return true;
		}
	}

	/**
	* @private
	*/
	_AsyncIncludeTask.prototype.doFinish = function() {
		if (this._hasDoFinish)
			return;
		this._hasDoFinish = true;
		if (this.onfinish) {
			this.onfinish(this.__userdata);
			this.__userdata = null;
			this.onfinish = null;
		}
	}

	/**###################################################################################################### */

	var TimeoutQueue = (function() {
		var queue = [], firing = false;
		function fire() {
			for (var i = 0, len = queue.length; i < len; i++) {
				var opt = queue[i], context = opt["context"];
				if (opt["callback"].apply(context, opt["args"]) === false
						|| opt["once"]) {
					var onfinish = opt["onfinish"];
					if (typeof (onfinish) === "function") {
						var args4finish = opt["args4finish"];
						onfinish.apply(context, EUI.isArray(args4finish) ? args4finish
								: [ args4finish ]);
					}
					queue.splice(i, 1);
					i--;
					len--;
				}
				if (opt["single"])
					break;
			}
			if (queue.length) {
				setTimeout(fire, 15);
			} else {
				firing = false;
			}
		}
		function _checkUnique(callback, context, args) {
			for (var i = 0, len = queue.length; i < len; i++) {
				var opt = queue[i];
				if (opt["callback"] === callback && opt["context"] === context) {
					queue.splice(i, 1);
					opt["args"] = args;
					queue.push(opt);
					return true;
				}
			}
			return false;
		}

		return {
			add : function(callback, options) {
				if (typeof (callback) === "function") {
					options = options || {};
					var context = options["context"], args = options["args"];
					args = EUI.isArray(args) ? args : [ args ];
					if (options["unique"] && _checkUnique(callback, context, args))
						return;
					var oninit = options["oninit"], onfinish = options["onfinish"], args4finish = options["args4finish"];
					if (typeof (oninit) === "function") {
						var args4init = options["args4init"];
						oninit.apply(context, EUI.isArray(args4init) ? args4init
								: [ args4init ]);
					}
					if (options["fire"] === true
							&& callback.apply(context, args) === false) {
						if (typeof (onfinish) === "function") {
							onfinish.apply(context, EUI.isArray(args4finish) ? args4finish
									: [ args4finish ]);
						}
						return;
					}
					var id = options["id"] || EUI.rndIdentity("timeout_")
					queue.push({
						id : id,
						callback : callback,
						context : context,
						args : args,
						once : options["once"] !== false,
						onfinish : onfinish,
						args4finish : args4finish,
						single : options["single"] === true
					});
					if (!firing) {
						firing = true;
						setTimeout(fire, 15);
					}
					return id;
				}
			},
			remove : function(callback, name) {
				if (!name)
					name = typeof (callback) === "function" ? "callback" : "id";
				for (var i = queue.length - 1; i >= 0; i--) {
					if (queue[i][name] === callback) {
						queue.splice(i, 1);
					}
				}
			}
		};
	})();

	/**##################################################### Cookie ################################################# */
	/**
	 * cookie管理
	 * @class
	 */
	function Cookie() {
		this.doc = document;
		this.enabled = window.navigator.cookieEnabled;
	};

	/**
	 * 设置cookie, nDays为该cookie的存活期
	 * @type 
	 */
	Cookie.prototype = {
		setCookie	   : function(sName, sValue, nDays) {
			if (!this.enabled)
				return;
			var expires = "";
			if (typeof(nDays) == "number") {
				var d = new Date();
				d.setTime(d.getTime() + nDays * 24 * 60 * 60 * 1000);
				expires = "; expires=" + d.toGMTString();
			}

			this.doc.cookie = sName + "=" + escape(sValue) + expires + "; path=/";
		},
		/**
		 * 根据name获取一个cookie
		 * @param {} sName
		 */
		getCookie	   : function(sName) {
			if (!this.enabled)
				return;
			var re = new RegExp("(\;|^)[^;]*(" + sName + ")\=([^;]*)(;|$)");
			var res = re.exec(this.doc.cookie);
			return res != null ? unescape(res[3]) : "";
		},
		/**
		 * 根据name删除一个cookie
		 * @param {} name
		 */
		removeCookie	: function(name) {
			if (!this.enabled)
				return;
			this.setCookie(name, "", -1);
		}
	};

	/*####################################剪切板##########################################*/
	/**
	 * 封装过后的剪切板对象
	 * @returns
	 */
	function EsClipboard(){
		this._data = null;//如果不能从剪切版里取到值，就从_data 中取
	}

	/**
	 * 获取剪切板对象
	 * @returns
	 */
	EsClipboard.getInstace = function(){
		if(!this._esclipboard){
			this._esclipboard = new EsClipboard();
		}
		return this._esclipboard;
	};

	/**
	 * 返回textarea，不存在就创建一个
	 * 这个地方，getdata和setdata的时候需要哦创建不同的div 不能共用同一个，非IE浏览器事件会有印象，
	 */
	EsClipboard.prototype.getAreaDom = function(id){
		var area = document.getElementById(id);
		if (!area) {
			area = document.createElement("textarea");
			area.id = id;
			area.style.cssText += ";opacity: 0;position:absolute;top:-10000px;right:0;";
			document.body.appendChild(area);
		}
		return area;
	};
	
	/**
	 * 设置浏览器缓存的copy值和剪切板的值  
	 * 非IE只能通过keydown事件设置剪切板的值，右键菜单就只能把值放到div中，并不能同步到剪切板
	 * @param text
	 */
	EsClipboard.prototype.setData = function(text){
		this._data = text;
		if (namespace.clipboardData) {//IE
			try{
				namespace.clipboardData.clearData(); 
				namespace.clipboardData.setData("Text",text);
			}catch(e){
				//IE会莫名奇妙的报OpenClipboard失败的错
			}
		}else{
			var area = this.getAreaDom("esrpt_special_copy");
			area.value = text;
			if (document.createRange) {//全选里面的文本
				area.focus();
				area.setSelectionRange(0,text.length);//keyup的时候会默认的把值放到
			}
		}
	};

	/**
	 * 获取值  
	 * 无法从剪切板获取时 获取浏览器内存保存的值
	 * @returns {string}
	 */
	EsClipboard.prototype.getData = function(callbackFunc){
		if (window.clipboardData) {
			if(typeof callbackFunc == "function"){
				callbackFunc(window.clipboardData.getData('text') || "");
			}
		} else if (typeof callbackFunc == "function") {
			var self = this;
			this._getData = false;//表示目前还没有取到值
			var area = this.getAreaDom("esrpt_special_paste");
			if (document.createRange)area.focus();
			$(area).bind("keyup", function(evt) {
				if (!evt.ctrlKey && evt.keyCode != 17)return;//表示不是按的ctrl+V
				self._getData = true;
				var pastedText = area.value;
				self._data = pastedText;
				area.value = "";
				area.blur();
				if (typeof callbackFunc == "function"){
					callbackFunc(pastedText);
					$(area).unbind("keyup");
				}
			});
			setTimeout(function() {
				//如果取不到值this._getData = false时，就直接从_data里取值
				if (!self._getData && typeof callbackFunc == "function") {
					callbackFunc(self._data);
					$(area).unbind("keyup");
				}
			}, 200);
		}
	};

	/*##################################序列填充对象######################################*/
	/**
		 * 序列填充对象，制定各种填充规则
		 */
		function TableSequence(options){
			this.reset(options);
		}

		TableSequence.prototype.next = function(){
			throw new Error("The method 'TableSequence.next()' Unimplemented!");
		};

		TableSequence.prototype.reset = function(options){
			if(!options) throw new Error('缺少初始化参数.');
		};
		
		/**
		 * 简单复制序列填充对象
		 * @param options {items: xxx(待被复制的数据项数组,非空且长度要大于0), index: 0(起始复制索引位置，默认0)}
		 */
		function CopySequence(options){
			CopySequence._superClass.call(this, options);
		}

		EUI.extendClass(CopySequence, TableSequence, "CopySequence");

		/**
		 * 获取下一个，根据当前索引位置简单循环下一个
		 * @returns
		 */
		CopySequence.prototype.next = function(){
			this._index = (this._index + this._offset) % this._length;
			return this._items[this._index];
		};

		/**
		 * 重新设置数据项
		 * @param options {items: xxx(待被复制的数据项数组,非空且长度要大于0), index: 0(起始复制索引位置，默认0), offset: 偏移值，默认1}
		 */
		CopySequence.prototype.reset = function(options){
			CopySequence._superClass.prototype.reset.call(this, options);
			var items = options["items"], index = parseInt(options["index"]);
			if(!items || !$.isArray(items) || items.length < 1) throw new Error('CopySequence参数非法【缺少数据项】.');
			this._items = items;
			var len = this._length = items.length;
			if(isNaN(index) || index < 0){//矫正索引位置
				index = 0;
			} else if(index >= len){
				index = index % len;
			}
			this._index = index;
			this._offset = (options["offset"] || 1) + len;
		};

		/**
		 * 计算公式序列填充对象
		 * @param options {index: 当前值位置, formula 计算公式}
		 * @returns
		 */
		function FormulaSequence(options){
			FormulaSequence._superClass.call(this, options);
		}

		EUI.extendClass(FormulaSequence, TableSequence, "FormulaSequence");

		/**
		 * 获取下一个计算值，且参数自动增offset
		 * @returns
		 */
		FormulaSequence.prototype.next = function(){
			this._curnum += this._offset;
			return this._formula.call(null, this._curnum);
		};

		/**
		 * 重置计算公式序列填充对象的计算公式及下一个计算参数值
		 * @param options  {index: xxx(当前值个数), formula xxx(计算公式), offset: 每次调用参数的偏移值，默认1}
		 */
		FormulaSequence.prototype.reset = function(options){
			FormulaSequence._superClass.prototype.reset.call(this, options);
			var formula = options["formula"];
			if(typeof(formula) != 'function') throw new Error('FormulaSequence【缺少计算公式】.');
			var curnum = parseInt(options["index"]);
			if(isNaN(curnum) || curnum < 0) curnum = 0;
			this._curnum = curnum;
			this._formula = formula;
			this._offset = parseInt(options["offset"]) || 1;
		};

		/**
		 * 格式化序列填充对象
		 * 	用途举例，如传入一个星期的复制序列填充对象，且format为function(value){ return '星期' + value; }
		 * @param options {sequence: xxx(非空), format: func}
		 * @returns {FormatSequence}
		 */
		function FormatSequence(options){
			TableSequence.call(this, options);
			this.reset(options);
		}

		EUI.extendClass(FormatSequence, TableSequence, "FormatSequence");

		/**
		 * 获取下一个格式化后的值
		 * @returns
		 */
		FormatSequence.prototype.next = function(){
			var rt = this._sequence.next();
			if(this._format){
				rt = this._format.call(null, rt);
			}
			return rt;
		};

		/**
		 * 重新设置格式化sequence对象及格式化方法
		 * @param options {sequence: xxx(非空), format: func}
		 */
		FormatSequence.prototype.reset = function(options){
			FormatSequence._superClass.prototype.reset.call(this, options);
			var sequence = options["sequence"], format = options["format"];
			if(!(sequence instanceof TableSequence)) throw new Error(I18N.getString("eui.core.objs.js.illparam",'FormatSequence参数非法【不是TableSequence对象】.'));
			this._sequence = sequence;
			this._format = typeof(format) == 'function' ? format : null;
		};

		/**
		 * 复合序列填充对象， 该对象常用于一个值中可能涉及到多个序列填充的情况
		 * @param options {sequences: xxx(非空), format: xxx(非空)}
		 * @returns {ComplexSequence}
		 */
		function ComplexSequence(options){
			TableSequence.call(this, options);
			this.reset(options);
		};

		EUI.extendClass(ComplexSequence, TableSequence, "ComplexSequence");

		/**
		 * 获取下一个复合后的值
		 * @returns
		 */
		ComplexSequence.prototype.next = function(){
			if(this._format){
				return this._format.call(null, this._sequences);
			} else {
				var _sequences = this._sequences, rt = [];
				for(var i=0,len=_sequences.length; i<len; i++){
					rt.push(_sequences[i].next());
				}
				return rt.join('');
			}
		};

		/**
		 * 重新设置复合sequences数组对象及格式化方法
		 * @param options {sequences xxx(序列填充对象数组，非空), format xxx(复合方法，可空，为空时返回所有序列填充对象next()返回值的合并)}
		 */
		ComplexSequence.prototype.reset = function(options){
			ComplexSequence._superClass.prototype.reset.call(this, options);
			var sequences = options["sequences"], format = options["format"];
			if(!$.isArray(sequences)) throw new Error(I18N.getString("eui.core.objs.js.complexSequenceillparam",'ComplexSequence参数非法【不是TableSequence对象数组】.'));
			this._format = typeof(format) == 'function' ? format : null;
			this._sequences = sequences;
		};
		
		/**
		 * 用来提供序列对象的工厂。
		 */
		function SequenceFactory(){
		}

		SequenceFactory.ITEMS4COPY = [
				{item: [ '日', '一', '二', '三', '四', '五', '六' ], prefix: "周"}, // 中文周
				{item: [ '天', '一', '二', '三', '四', '五', '六' ], prefix: "星期"}, // 中文星期
				{item: [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ], prefix: "\\b", suffix: "\\b"}, // 英文星期
				{item: [ 'Sun', 'Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat' ], prefix: "\\b", suffix: "\\b"}, // 英文星期简写
				{item: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月' ]}, // 中文月份
				{item: [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ], prefix: "\\b", suffix: "\\b"}, // 英文月份
				{item: [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ], prefix: "\\b", suffix: "\\b"}, // 英文月份简写
				[ '①', '②','③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩'/*, '⑪', '⑫', '⑬', '⑭','⑮', '⑯', '⑰', '⑱', '⑲', '⑳' */], // 特殊字符
				[ '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸' ], // 天干
				[ '子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥' ], // 地支
				{item: [ 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z' ], strict: true}, // 小写字母
				{item: [ 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z' ], strict: true}, // 大写字母
				{item: [ 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII' ], prefix: "[^=]?", suffix: "([\\s|\\.].*)?", strict: true} //罗马数字1--12
		];

		/**
		 * 创建字符串序列填充对象
		 * @param values
		 * @param options
		 * @returns
		 */
		SequenceFactory.createStringSequence = function(values, options){
			var sort4Array = function(a, b){ return b.length - a.length; };
			///检查所传值是否符合给定简单复制字符串规则
			var checkValueInItem = function(value, items, strict){
				if(typeof(value) !== "string") return;
				var prefix = null, suffix = null;
				if(!$.isArray(items)){
					prefix = items["prefix"], suffix = items["suffix"], strict = strict || items["strict"], items = items["item"];
				}
				var itemvalue = new RegExp((items.concat().sort(sort4Array)).join('|')).exec(value);
				if(!itemvalue) return;
				var reg = itemvalue[0], index = items.indexOf(reg);
				if(prefix){
					reg = "(?:" + ($.isArray(prefix) ? prefix.join('|') : prefix) + ")" + reg;
				}
				if(suffix){
					reg += "(?:" + ($.isArray(suffix) ? suffix.join('|') : suffix) + ")";
				}
				reg = strict ? new RegExp("^"+reg+"$") : new RegExp(reg);
				return reg.test(value) ? [items, index] : null;
			};
			///解析所给值及其索引位置 匹配 所给简单复制字符串数组，返回对应的填充对象
			var resolveSequence = function(items, values, itemindex, vcount, reverse, strict){
				var value = values[0].substr(0, vcount);
				if(!value) return null;
				var ckrt = null, newitemindex = 0;
				for(var i=itemindex,len=items.length; i<len; i++){
					ckrt = checkValueInItem(value, items[i], strict);
					if(ckrt){
						newitemindex = i+1; break;
					}
				}
				if(!ckrt) return null;//未匹配到任何简单复制项
				var item = ckrt[0], index = ckrt[1], itemvalue = item[index],
					pindex = value.indexOf(itemvalue), prefix = "";
				if(pindex > 0){//如果前面有字符串，则需要从下一个简单复制项去匹配前面的字符串，能匹配的话则忽略此次匹配结果，依次接着匹配
					var sequence = resolveSequence(items, values, 0, pindex, reverse, strict);//检查该匹配项前面是否仍然能匹配其它项
					if(sequence) return sequence;
					prefix = value.substr(0, pindex);
				}
				var count = pindex + itemvalue.length, suffix = values[0].substr(count), newvalues = [suffix],
					newvalue = null, len=values.length, itemlen = item.length;
				for(var i=1; i<len; i++){//检查前缀和后缀，将所有后缀重新保存到一个新字符串数组，以下次递归匹配
					itemvalue = item[(index + i) % itemlen];
					count = pindex + itemvalue.length;
					newvalue = values[i];
					if(newvalue.substr(0, count) != (prefix + itemvalue)){//检查前缀是否一致，不一致则忽略此次匹配结果，继续向下一个简单复制项匹配
						return resolveSequence(items, values, newitemindex, vcount, reverse, strict);
					}
					newvalue = newvalue.substr(count);
					newvalues.push(newvalue);
					if(suffix && suffix != newvalue) suffix = false;
				}
				if(len === 1 && suffix || suffix === false){//如果有后缀，则递归匹配后缀字符串数组
					var nextsequence = resolveSequence(items, newvalues, 0, undefined, reverse, strict);
					if(nextsequence){
						var sequence = SequenceFactory.createCopySequence(item, reverse, index, len);
						return new ComplexSequence({sequences: [prefix ? new FormatSequence({sequence: sequence, format: function(rt){ return prefix + rt; }}) : sequence, nextsequence]});
					} else if(suffix === false){//如果后缀不一致，且未匹配到任何简单复制项，则直接返回null
						return null;
					}
				}
				var sequence = SequenceFactory.createCopySequence(item, reverse, index, len);
				return new FormatSequence({sequence: sequence, format: prefix ? function(rt){ return prefix + rt + suffix; } : function(rt){ return rt + suffix; }});
			};
			///重载
			SequenceFactory.createStringSequence = function(values, options){
				if(!$.isArray(values) || values.length < 1) return null;
				options = options || {};
				var reverse = options["reverse"];
				return resolveSequence(SequenceFactory.ITEMS4COPY, values, 0, undefined, reverse, options["strict"])
					|| SequenceFactory.createCopySequence(values, reverse);
			};
			return SequenceFactory.createStringSequence.call(this, values, options);
		};

		/**
		 * 解析数值序列填充，返回序列填充对象
		 *    规则：
		 *      1. 所给值长度为1，简单递增(+1)
		 *      2. 所给值长度为2，简单递增(values[1] - values[0])
		 *      3. 倍数递增(递减)
		 *      4. 非线性递增(递减)，简单复制
		 *      5. 其余按牛顿插值法计算值
		 * @param {Object} values
		 * @param options
		 * @returns
		 */
		SequenceFactory.createNumberSequence = function(values, options){
			///普通插值方法 --- *values.length==1时采取增1累加; *==2时采取增(values[1]-values[0])累加; *>2时非单调递增(递减)简单复制处理,倍数递增(递减)优先处理
			var resolveByNormalInterpolation = function(values){
				var len = values.length;
				for(var i=0; i<len; i++){//检查数值中是否有非数字数据
					values[i] = parseFloat(values[i], 10);
					if(isNaN(values[i])){
						return function(n) { return values[(n-1) % len]; };
					}
				}
				if(len === 1){//简单累加
					var value = values[0] - 1;
					return function(n) { return value + n; };
				}
				if(len === 2){//简单递增
					var reduce = values[1] - values[0], v = values[0] - reduce;
			  	return function(n){ return v + reduce * n; };
				}
				var v0 = values[0], v1 = values[1];
				if(v0 !== 0 && v1 !== 0){
					var equ = v1 / v0, i = 1, ilen = len - 1;
					for(; i<ilen; i++){
						if(values[i+1]/values[i] !== equ) break;
					}
					if(i == ilen){//当数值成倍数递增(递减)时
						var value = values[0] / equ;
						return function(n){ return value * Math.pow(equ, n); };
					}
				}
				v1 = v1 - v0;
				for(var i=1,llen=len-1; i<llen; i++) {
					v0 = v1;
					v1 = values[i + 1] - values[i];
					if(v0 * v1 < 0){//当数值非线性递增(递减)时直接采取简单复制
						return function(n) { return values[(n-1) % len]; };
					}
				}
			};
			///牛顿插值方法
			var resolveByNewtonInterpolation = function(values){
				///获取牛顿插值法系数
				var generateParam = function(ys, xs, level) {
					var len = ys.length - 1;
					if (len == 0) return ys[0];
					var cys = [];
					for (var i=0; i<len; i++) {
						cys.push((ys[i + 1] - ys[i]) / (xs[i + level] - xs[i]));
					}
					return [ys[0]].concat(generateParam(cys, xs, level + 1));
				};
				resolveByNewtonInterpolation = function(values){
					var xs = [];// 生成对应x坐标值
					for (var i=0,len=values.length; i<len; i++) {
						xs.push(i + 1);
					}
					var params = generateParam(values, xs, 1);
					return function(n) {
						var rt = 0;
						for (var i=0,len=params.length; i<len; i++) {
							var k = params[i];
							for ( var j = 0; j < i; j++) {
								k *= (n - xs[j]);
							}
							rt += k;
						}
						return rt;
					};
				};
				return resolveByNewtonInterpolation.call(this, values);
			};
			//重写该方法
			SequenceFactory.createNumberSequence = function(values, options){
				var interpolation = resolveByNormalInterpolation(values);//优先一般规律的方法
				if(!interpolation) interpolation = resolveByNewtonInterpolation(values);//其次使用牛顿插值法
				return (options && options["reverse"]) ? new FormulaSequence({formula: interpolation, index: 1, offset: -1})
					: new FormulaSequence({formula: interpolation, index: values.length, offset: 1});
			};
			return SequenceFactory.createNumberSequence(values, options);
		};

		/**
		 * 创建简单复制序列填充对象
		 * @param values
		 * @param reverse
		 * @param index
		 * @param len
		 * @returns
		 */
		SequenceFactory.createCopySequence = function(values, reverse, index, len){
			if(isNaN(index)) index = 0;
			if(reverse){
				return new CopySequence({items: values, index: index, offset: -1});
			} else {
				if(isNaN(len)) len = values.length;
				return new CopySequence({items: values, index: index + len - 1, offset: 1});
			}
		};

		/**
		 * 根据值创建序列填充对象
		 * @param values
		 * @param options
		 * @returns
		 */
		SequenceFactory.createSequence = function(values, options){
			if(!values) return null;
			var len = values.length;
			if(!len) return null;
			var reverse = options && options["reverse"];
			if(options["copy"]) return SequenceFactory.createCopySequence(values, reverse);
			var parseValues = [], value = null;
			for(var i=0; i<len; i++){
				value = parseFloat(values[i], 10);
				//如需要将c01这种序列填充，isNaN需要改为!/\d+$/.test(values[i] 来判断
				if(isNaN(value)){
					for(i=0; i<len; i++){
						if(typeof(values[i]) !== 'string'){
							return SequenceFactory.createCopySequence(values, reverse);
						}
					}
					return SequenceFactory.createStringSequence(values, options);
				}
				parseValues[i] = value;
			}
			return SequenceFactory.createNumberSequence(parseValues, options);
		};
		/**###################################################################################################*/
		/**
		 * add by genghsh 把esenface1.2.4版本的/esmain/js/ui.js搬过来，使用方式DSUI.xxx
		 */
		(function (namespace, name) {
			  "use strict";

			  var r_namespace = /^\w+(\.\w+)*$/,
			    r_func_prefix = /^function\s*\(/,
			    r_func_comment = /^\/\/.*(\r|\n|$)/mg,

			    RANDOM_MATH_SEED = new Date().getTime(),

			    Timeout = function (delay) {
			      delay = delay || 226;
			      var list = [], firing = false, fireIdx = null, fireLen = null, k = 0, timeid = null;
			      var fire = function () {
			        if (firing) return;
			        firing = true;
			        fireIdx = 0;
			        fireLen = list.length;
			        while (fireIdx < fireLen) {
			          var t = list[ fireIdx ], time = (new Date()).getTime();
			          if (time - t[ "time" ] > t[ "delay" ]) {
			            if ((t[ "callback" ].apply(t[ "context" ], t[ "args" ]) === false) || t[ "once" ]) {
			              var onfinish = t[ "onfinish" ], idx = list.indexOf(t);
			              if (UI.isFunction(onfinish)) onfinish.apply(t[ "context" ], [].concat(t[ "args4finish" ]));
			              if (idx !== -1) {//这里需要重新indexOf查找位置，否则在callback里调用了remove后将造成删除错误
			                list.splice(idx, 1);
			                fireLen--;
			              } else {
			                fireIdx++;
			              }
			              continue;
			            }
			            t[ "time" ] = time;
			            if (t[ "single" ]) break;
			          }
			          fireIdx++;
			        }
			        firing = false;
			        timeid = false;
			        start();
			      };
			      var start = function () {
			        if (!timeid && list.length) timeid = setTimeout(fire, delay);
			      };
			      var _checkIndex = function (func, context) {
			        for (var i = 0, len = list.length; i < len; i++) {
			          var opt = list[ i ];
			          if (opt[ "id" ] === func || opt[ "callback" ] === func && opt[ "context" ] === context) {
			            return i;
			          }
			        }
			        return -1;
			      };
			      return {
			        add : function (func, options) {
			          if (!UI.isFunction(func)) return;
			          var context = options[ "context" ], args = options[ "args" ];
			          if (!UI.isArray(args)) args = [ args ];
			          if (options[ "unique" ]) {
			            var idx = _checkIndex(func, context);
			            if (idx !== -1) list.splice(idx, 1);
			          }
			          list.push({
			            callback : func,
			            context : context,
			            args : args,
			            once : options[ "once" ] !== false,
			            onfinish : options[ "onfinis" ],
			            args4finish : options[ "args4finish" ],
			            single : options[ "single" ] === true,
			            delay : parseInt(options[ "delay" ], 10) || 0,
			            time : (new Date()).getTime(),
			            id : ++k
			          });
			          start();
			          return k;
			        },
			        remove : function (func, context) {
			          var idx = _checkIndex(func, context);
			          if (idx === -1) return false;
			          list.splice(idx, 1);
			          if (firing) {
			            fireLen--;
			            if (idx <= fireIdx) fireIdx--;
			          } else if (list.length === 0) {
			            clearTimeout(timeid);
			            timeid = false;
			          }
			          return true;
			        }
			      };
			    },

			    global_timeout = Timeout();

			  //全局命名空间对象
			  var UI = null;
			  UI = namespace[ name ] = {
			    /**
			     * 扩展对象
			     * @returns {*}
			     */
			    extend : function () {
			      var target = arguments[ 0 ], i = 1, deep = false, len = arguments.length;
			      if (UI.isBoolean(target)) {
			        deep = target;
			        target = arguments[ 1 ] || {};
			        i = 2;
			      }
			      if (i === len) {
			        target = UI.isArray(target) ? [] : {};
			        i--;
			      } else if(typeof target !== 'object' && !UI.isFunction(target)) {
			        target = {};
			      }
			      var options = null, name = null, src = null, copy = null, clone = null, copyIsArray = false;
			      for (; i < len; i++) {
			        if ((options = arguments[ i ]) == null) continue;
			        for (name in options) {
			          src = target[ name ];
			          copy = options[ name ];
			          if (src === copy) continue;
			          if (deep && copy && (UI.isPlainObject(copy) || (copyIsArray = UI.isArray(copy)))) {
			            if (copyIsArray) {
			              copyIsArray = false;
			              clone = UI.isArray(src) ? src : [];
			            } else {
			              clone = UI.isPlainObject(src) ? src : {};
			            }
			            target[ name ] = UI.extend(deep, clone, copy);
			          } else if (copy !== undefined) {
			            target[ name ] = copy;
			          }
			        }
			      }
			      return target;
			    },
			    /**
			     * 继承
			     * @param sub 子类
			     * @param sup 父类
			     * @param methods 子类的方法集合
			     */
			    inherit : function (sub, sup, methods) {
			      if (!sub || !sup) return;
			      var f = function () {};
			      f.prototype = sup.prototype;
			      sub._superClass = sup;
			      var subp = sub.prototype = new f();
			      subp.constructor = sub;
			      for (var i = 2, len = arguments.length; i < len; i++) {
			        UI.extend(subp, arguments[ i ]);
			      }
			    },
			    /**
			     * 命名空间
			     * @param names
			     * @returns {*}
			     */
			    namespace : function (names) {
			      if (!names || !names.split) return;
			      names = names.split('.');
			      var obj = arguments[ 1 ] || window, name = null;
			      for (var i = 0, len = names.length; i < len; i++) {
			        name = names[ i ];
			        obj = obj[ name ] = obj[ name ] || {};
			      }
			      return obj;
			    },
			    random : function (prefix, suffix) {
			      RANDOM_MATH_SEED = (RANDOM_MATH_SEED * 69069) % 0x80000000;
			      var rt = (RANDOM_MATH_SEED / 0x80000000).toString().replace(/\w\./, "");
			      if (prefix) rt = prefix + rt;
			      if (suffix) rt = rt + suffix;
			      return rt;
			    },
			    /**
			     * 判断对象是否简单的JSON对象
			     * @param obj
			     * @returns {boolean}
			     */
			    isPlainObject : function (obj) {
			      if (!obj || typeof(obj) !== "object" || obj.nodeType || obj.window === obj) {
			        return false;
			      }
			      try {
			        if (obj.constructor && !obj.hasOwnProperty("constructor") && !obj.constructor.prototype.hasOwnProperty("isPrototypeOf")) {
			          return false;
			        }
			      } catch (e) {
			        // IE8,9 Will throw exceptions on certain host objects #9897
			        return false;
			      }
			      for (var key in obj) {
			        if (!obj.hasOwnProperty(key)) return false;
			      }
			      return true;
			    },
			    /**
			     * 判断是否是一个空的JSON对象
			     * @param obj
			     * @returns {boolean}
			     */
			    isEmptyObject : function (obj) {
			      if (!this.isPlainObject(obj)) return false;
			      for (var key in obj) {
			        return false;
			      }
			      return true;
			    },
			    /**
			     * 清空一个对象
			     * @param obj
			     * @param names
			     */
			    empty : function (obj, names) {
			      if (!obj) return;
			      if (!names) {
			        for (var key in obj) {
			          delete obj[ key ];
			        }
			      } else {
			        if (UI.isArray(names)) {
			          if (!UI.isString(names)) return;
			          names = [ names ];
			        }
			        for (var i = 0, len = names.length; i < len; i++) {
			          delete obj[ names[ i ] ];
			        }
			      }
			    },
			    /**
			     * 字符串开头处理方法
			     * @param str 要处理的字符串
			     * @param prefix 被处理的开头字符串
			     * @param ensure
			     *   true: 确保str以prefix开头并返回
			     *   false: 确保str不以prefix开头并返回
			     *   (OTHER): 返回str是否以prefix开头(Boolean)
			     * @returns {*}
			     */
			    startWith : function (str, prefix, ensure) {
			      if (!prefix) return;
			      if (UI.isNumber(str)) {
			        str = '' + str;
			      } else {
			        if (!UI.isString(str)) return;
			      }
			      var len = prefix.length, sw = str.substr(0, len) === prefix;
			      if (ensure === true) {
			        return sw ? str : (prefix + str);
			      } else if (ensure === false) {
			        if (sw) {
			          do {
			            str = str.substr(len);
			          } while (str.substr(0, len) === prefix);
			        }
			        return str;
			      }
			      return sw;
			    },
			    /**
			     * 字符串结尾处理方法
			     * @param str 要处理的字符串
			     * @param suffix 被处理的结尾字符串
			     * @param ensure
			     *   true: 确保str以suffix结尾并返回
			     *   false: 确保str不以suffix结尾并返回
			     *   (OTHER): 返回str是否以suffix结尾(Boolean)
			     * @returns {*}
			     */
			    endWith : function (str, suffix, ensure) {
			      if (!suffix) return;
			      if (UI.isNumber(str)) {
			        str = '' + str;
			      } else {
			        if (!UI.isString(str)) return;
			      }
			      var len = suffix.length, idx = str.length - len, ew = str.substr(idx) === suffix;
			      if (ensure === true) {
			        return ew ? str : (str + suffix);
			      } else if (ensure === false) {
			        if (ew) {
			          do {
			            str = str.substr(0, idx);
			          } while (str.substr(idx -= len) === suffix)
			        }
			        return str;
			      }
			      return ew;
			    },
			    /**
			     * 对数据保留小数后几位
			     * @param num
			     * @param unit
			     * @returns {number}
			     */
			    round : function (num, unit) {
			      if (isNaN(num = parseFloat(num, 10))) return 0;
			      if (isNaN(parseInt(unit, 10)) || unit <= 0) return Math.round(num);
			      var rate = Math.pow(10, unit);
			      return Math.round(num * rate) / rate;
			    },
			    asString : function (str) {
			      if (UI.isString(str)) return str;
			      if (str === null || str === undefined) return "";
			      return str.toString ? str.toString() : '' + str;
			    },
			    /**
			     * 将字符串转换成函数返回
			     * @param str String
			     *  命名空间类型 "xxx.xx.x" 此时会直接从args|window中查找出对应的方法， 此时args可以为null|Object|Array<Object>
			     *  函数定义字符串 "function(..." 此时会直接将字符串转换成JS函数
			     *  函数体字符串 "var a = xxx; ..." 此时会生成以该字符串为内容，args为参数列表的函数, 此时args可以为null|String|Array<String>
			     * @param args
			     * @returns {*}
			     */
			    parseFunc : function (str, args) {
			      if (UI.isFunction(str)) return str;
			      if (!UI.isString(str)) return null;
			      var func = null;
			      if (r_namespace.test(str)) {
			        if (!UI.isArray(args)) args = [ args || window ];
			        var names = str.split("."), namelen = names.length, obj = null;
			        for (var i = 0, len = args.length; i < len; i++) {
			          obj = args[ i ];
			          if (!obj) continue;
			          for (var j = 0; j < namelen; j++) {
			            if (!(obj = obj[ names[ j ] ])) break;
			          }
			          if (UI.isFunction(obj)) {
			            func = obj;
			            break;
			          }
			        }
			      } else {
			        str = str.replace(r_func_comment, '');//移除最前面的注释信息
			        if (r_func_prefix.test(str)) {
			          func = UI.execScript('(function(){\r\n return ' + str + '\r\n})()');
			        } else {
			          if (UI.isArray(args)) {
			            for (var i = args.length - 1; i >= 0; i--) {
			              if (!UI.isString(args[ i ])) args.splice(i, 1);
			            }
			          } else {
			            args = UI.isString(args) ? [ args ] : [];
			          }
			          args.push(str);
			          func = Function.apply(null, args);
			        }
			      }
			      return func;
			    },
			    /**
			     * 将字符串转换成正则对象
			     * @param str String/Array 字符串表示的都是要匹配的字符，如果要匹配多种组合，需使用数组
			     * @param pattern String "igm"
			     * @returns {*}
			     */
			    parseReg : function (str, pattern) {
			      if (!str) return null;
			      if (UI.isRegExp(str)) return str;
			      var regstr = null;
			      if (!UI.isArray(str)) {
			        if (!UI.isString(str)) return null;
			        regstr = str;
			      } else {
			        var texts = [], str_ = null;
			        for (var i = 0, len = str.length; i < len; i++) {
			          if ((str_ = str[ i ]) && UI.isString(str_)) {
			            texts.push(str_);
			          }
			        }
			        if (!texts.length) return null;
			        regstr = '(?:' + texts.join(')|(?:') + ')';
			      }
			      return new RegExp(arguments[ 2 ] === true ? ("^(?:" + regstr + ")$") : regstr, pattern || '');
			    },
			    /**
			     * 将字符串转换成XML对象
			     * @param data
			     * @returns {*}
			     */
			    parseXml : function (data) {
			      var xml, tmp;
			      if (!data || !UI.isString(data)) {
			        return null;
			      }
			      try {
			        if (window.DOMParser) { // Standard
			          tmp = new DOMParser();
			          xml = tmp.parseFromString(data, "text/xml");
			        } else { // IE
			          xml = new ActiveXObject("Microsoft.XMLDOM");
			          xml.async = "false";
			          xml.loadXML(data);
			          xml = xml.documentElement;
			        }
			      } catch (e) {
			        xml = undefined;
			      }
			      if (!xml || xml.getElementsByTagName("parsererror").length) {
			        xml = null;
			      }
			      return xml;
			    },
			    parseJson : function (data) {
			      if (!data) return;
			      try {
			      	if (UI.isString(data)) {
			      		return JSON.parse(data);
			      	}
			      	return (UI.isObject(data) || UI.isArray(data)) ? data : null;
			      } catch (e) {
			        try {
			          return eval(data);
			        } catch (e) {
			        }
			      }
			    },
			    timeout : function (func, opt) {
			      if (arguments[ 2 ] === true || !UI.isFunction(func)) {
			        return global_timeout.remove(func, opt);
			      } else {
			        return global_timeout.add(func, opt || {});
			      }
			    }
			  };

			  var toString = Object.prototype.toString;
			  [ "Boolean", "Number", "String", "Function", "Array", "Date", "RegExp", "Object" ].forEach(function (name) {
			    var typevalue = "[object " + name + "]";
			    this[ "is" + name ] = function (obj) {
			      return toString.call(obj) === typevalue;
			    };
			  }, UI);
			  
			  
			///### 创建XMLHttpRequest对象
			  var createXHR = typeof window[ "XMLHttpRequest" ] !== 'undefined' ? function () {
			    return new XMLHttpRequest();
			  } : function () {
			    try {
			      return new window.ActiveXObject("Microsoft.XMLHTTP");
			    } catch (e) {}
			  };

			  ///### 整合参数，将JSON对象转换成地址字符串
			  function params (param) {
			    if (!param) return null;
			    if (UI.isString(param)) return param;
			    var rt = [];
			    for (var i in param) {
			      rt.push(i + '=' + encodeURIComponent(param[ i ]));
			    }
			    return rt.join('&');
			  }

			  ///### 返回请求值，xml/json/string
			  function _response (xhr, options) {
			    if (options[ "xml" ]) {
			      var xml = xhr.responseXML;
			      return xml || UI.parseXml(xhr.responseText);
			    }
			    var text = xhr.responseText;
			    return options[ "json" ] ? UI.parseJson(text) : text;
			  }

			  ///### 完成请求调用回调函数
			  function complete (xhr, onfinish, options) {
			    onfinish.apply(options[ "context" ], [ _response(xhr, options) ].concat(options[ "args" ]));
			  }

			  ///### 通过定时器查询请求结果
			  function _timeout_ajax_ (xhr, onfinish, options) {
			    if (xhr.readyState === 4) {
			      complete(xhr, onfinish, options);
			      return false;
			    } else if (--options[ "timeout" ] === 0) {
			      var onerror = options[ "onerror" ], tip = I18N.getString("eui.core.bojs.js.networktimeout","请求【{0}】网络超时",[options[ "url" ]]);
			      if (UI.isFunction(onerror)) {
			        onerror.apply(options[ "context" ], [ tip ].concat(options[ "args" ]));
			      } else {
			        UR.error(tip);
			      }
			      return false;
			    }
			  }

			  ///### 绑定script节点加载完成回调函数
			  var _bind_file_onload_ = null, _file_onload_check = null,
			    _file_onload_ = function (data) {
			      data[ "callback" ].apply(this, data[ "args" ]);
			    };
			  if (document.addEventListener) {
			    _file_onload_check = function (evt) {
			      if (evt.type === "load") {
			        _file_onload_.call(this, evt.data);
			      }
			    };
			    _bind_file_onload_ = function (file, callback, args) {
			      if (!UI.isFunction(callback)) return;
			      UI.bind(file, "load", { callback : callback, args : args }, _file_onload_check, true);
			    };
			  } else {
			    _file_onload_check = function (evt) {
			      var readyState = this.readyState;
			      if (readyState === "loaded" || readyState === "complete") {
			        UI.unbind(this, "readystatechange");
			        _file_onload_.call(this, evt.data);
			      }
			    };
			    _bind_file_onload_ = function (file, callback, args) {
			      if (!UI.isFunction(callback)) return;
			      UI.bind(file, "readystatechange", { callback : callback, args : args }, _file_onload_check);
			    };
			  }

				/**
				 * AJAX请求数据
				 * @param options
				 *  {
				 *    url: 请求地址
				 *    method: 请求方式，缺省"GET"
				 *    async: 是否异步请求，如果不指定，则根据onfinish决定是否异步请求，有onfinish则异步，否则同步
				 *    params: 额外参数，JSON或字符串
				 *    mimeType: 请求类型
				 *    timeout: 检查次数. 如对于比较耗时的请求，可能默认的请求次数不够，需要增大检查次数
				 *    onfinish: 请求回调函数
				 *    context: 请求回调函数的执行上下文
				 *    args: 请求回调的第二个参数开始的参数
				 *  }
				 * @returns {*}
				 */
			  function ajax (options) {
			  	if (!options) return;
					var url = options[ "url" ];
					if (!url) return;
					var xhr = createXHR(), onfinish = options[ "onfinish" ], hasfinish = UI.isFunction(onfinish), async = options[ "async" ];
					if (async !== true && async !== false) async = !!hasfinish;
					var method = (options[ "method" ] || "").toUpperCase(), param = params(options[ "params" ]);
					if (method !== "POST") {
						method = "GET";
						if (param) url = url + (url.indexOf("?") === -1 ? '?' : '&') + param;
					}
					xhr.open(method, url, async);
					var mimeType = options[ "mimeType" ];
					if (mimeType) xhr.mimeType = mimeType;
					xhr.setRequestHeader("X_REQUESTED_WITH", "XMLHttpRequest");
					xhr.send(param);
					if (hasfinish) {
						if (async) {
							UI.timeout(_timeout_ajax_, {
								args : [ xhr, onfinish, options ], once : false
							});
						} else {
							complete(xhr, onfinish, options);
						}
					} else if (!async) {
						return _response(xhr, options);
					}
			  }

			  UI.extend(UI, {
			    ajax : ajax,
			    get : function (url, params, callback, args, context) {
			      return ajax({
			        method : "GET",
			        url : url,
			        params : params,
			        onfinish : callback,
			        args : args,
			        context : context
			      });
			    },
			    post : function (url, params, callback, args, context) {
			      return ajax({
			        method : "POST",
			        url : url,
			        params : params,
			        onfinish : callback,
			        args : args,
			        context : context
			      });
			    },
			    script : function (url, callback, args, charset, wnd) {
			      wnd = wnd || window;
			      var doc = wnd.document, _script = doc.createElement("script");
			      _script.type = "text/javascript";
			      _script.src = url;
			      if (charset) _script.charset = charset;
			      _bind_file_onload_(_script, callback, args);
			      return doc.body.appendChild(_script);
			    },
			    style : function (url, callback, args, wnd) {
			      wnd = wnd || window;
			      var doc = wnd.document, _style = doc.createElement("link");
			      _style.rel = "stylesheet";
			      _style.type = "text/css";
			      _style.href = url;
			      _bind_file_onload_(_style, callback, args);
			      return (doc.getElementsByTagName("head")[ 0 ] || doc.body).appendChild(_style);
			    }
			  });
			  
			  var names_border = [ "borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth" ],
			  names_padding = [ "paddingTop", "paddingRight", "paddingBottom", "paddingLeft" ],
			  names_dir = [ "top", "right", "bottom", "left" ],

			  r_multiDash = /[A-Z]/g,
			  r_dashAlpha = /-([\da-z])/gi,

			  indexof_dir = function (dir) {
			    if (UI.isString(dir)) {
			      dir = dir.toLowerCase();
			      for (var i = 0, name = null, len = names_dir.length; i < len; i++) {
			        name = names_dir[ i ];
			        if (name === dir || name.charAt(0) === dir) return i;
			      }
			      return -1;
			    } else {
			      var idx = parseInt(dir);
			      return isNaN(idx) || idx < 0 || idx > 3 ? -1 : idx;
			    }
			  },
			  fcamelCase = function (all, letter) {
			    return letter.toUpperCase();
			  },
			  getCurrentStyle = window.getComputedStyle ? function (node, stlname) {
			    var stl = UI.getWindow(node).getComputedStyle(node, '');
			    if (stl) {
			      return stl.getPropertyValue(stlname.replace(r_multiDash, "-$&").toLowerCase());
			    }
			  } : function (node, stlname) {
			    var stl = node.currentStyle;
			    if (stl) return stl[ stlname.replace(r_dashAlpha, fcamelCase) ];
			  },
			  findByAttr = function (node, name, value) {
			    var v = node.getAttribute(name);
			    return v && (!value || value === v);
			  },
			  _find_breadth_ = function (nodes, filter, args) {
			    var node = nodes.shift().firstChild;
			    while (node) {
			      if (filter.apply(null, [ node ].concat(args))) return node;
			      nodes.push(node);
			      node = node.nextSibling;
			    }
			    return nodes.length ? _find_breadth_(nodes, filter, args) : null;
			  },
			  _find_deepth = function (node, filter, args) {
			    if (!node || filter.apply(null, [ node ].concat(args))) return node;
			    return _find_deepth(node.firstChild, filter, args) || _find_deepth(node.nextSibling, filter, args);
			  },
			  getDocument = function (node) {
			    return node ? (node.nodeType === 9 ? node : node.ownerDocument || node.document) : document;
			  };

			/** 检查浏览器类型 */
			var userAgent = window.navigator.userAgent,
			  isie = /MSIE/g.test(userAgent),
			  ieVersion = Number.MAX_VALUE,
			  isFirefox = /Firefox/g.test(userAgent),
			  isChrome = /Chrome/g.test(userAgent);
			if (isie) {
			  ieVersion = isie && (function (doc) {
			      var v = 3, div = doc.createElement('div'), all = div.getElementsByTagName('i');
			      while (div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->', all[ 0 ]) {
			      }
			      return v > 4 ? v : Number.MAX_VALUE;
			    })(document);
			}
			var temp_div = document.createElement("div");
			temp_div.style.cssText += '; position: absolute; left: -99999px; top: -99999px;';

			UI.extend(UI, {
			  isie : isie,
			  ieVersion : ieVersion,
			  isFirefox : isFirefox,
			  isChrome : isChrome,
			  /**
			   * 返回节点|文档所在的Window对象
			   * @param node
			   * @returns {*|Window}
			   */
			  getWindow : function (node) {
			    var wnd = null;
			    if (node) {
			      var doc = node.nodeType === 9 ? node : node.ownerDocument;
			      if (doc) wnd = doc.defaultView || doc.parentWindow;
			    }
			    return wnd || window;
			  },
			  /**
			   * 返回节点所在的Document对象
			   * @param node
			   * @returns {*|HTMLDocument}
			   */
			  getDocument : getDocument,
			  /**
			   * 执行节点鼠标事件 type可以传click,mousedown等
			   * @param node
			   * @param type
			   */
			  execEvent : function (node, type) {
			    try {
			      if (node[ type ]) {
			        node[ type ]();
			      } else {
			        var doc = UI.getDocument(node), wnd = UI.getWindow(doc);
			        var evobj = doc.createEvent('MouseEvents');
			        evobj.initMouseEvent(type, true, true, wnd);
			        node.dispatchEvent(evobj);
			      }
			    } catch (e) {
			    }
			  },
			  /**
			   * 给指定节点添加样式名
			   * @param node 节点
			   * @param className 要添加的样式名，多个以" "分隔
			   */
			  addClass : function (node, className) {
			    if (!node || node.nodeType !== 1 || !className || !UI.isString(className)) return;
			    var clsNames = node.className;
			    if (arguments[ 2 ] !== false) {
			      if (clsNames) {
			        if (clsNames.split(' ').indexOf(className) !== -1) return;
			        className = clsNames + ' ' + className;
			      }
			      node.className = className;
			    } else {
			      var clsNames = node.className, classNames = className.split(' ');
			      clsNames = clsNames ? clsNames.split(' ') : [];
			      for (var i = 0, len = classNames.length; i < len; i++) {
			        className = classNames[ i ];
			        if (className && clsNames.indexOf(className) === -1) clsNames.push(className);
			      }
			      node.className = clsNames.join(' ');
			    }
			  },
			  /**
			   * 给指定节点移除指定样式名，如果没有该样式名，直接忽略
			   * @param node 节点
			   * @param className 要移除的样式名，多个以" "分隔
			   */
			  removeClass : function (node, className) {
			    if (!node || node.nodeType !== 1 || !className || !UI.isString(className)) return;
			    var clsNames = node.className;
			    if (!clsNames) return;
			    clsNames = clsNames.split(' ');
			    if (arguments[ 2 ] !== false) {
			      var index = clsNames.indexOf(className);
			      if (index === -1) return;
			      clsNames.splice(index, 1);
			    } else {
			      var classNames = className.split(' '), newClsNames = [];
			      for (var i = 0, len = clsNames.length; i < len; i++) {
			        className = clsNames[ i ];
			        if (className && classNames.indexOf(className) === -1) newClsNames.push(className);
			      }
			      clsNames = newClsNames;
			    }
			    node.className = clsNames.join(' ');
			  },
			  /**
			   * 给指定节点切换样式名，有指定的样式名则会删除该样式名，没有则会添加该样式名
			   * @param node 节点
			   * @param className 要切换的样式名，多个以" "分隔，如果分隔的样式名中有重复的，重复数为奇数则按一次处理，为偶数次则无任何效果
			   * @returns {*}
			   */
			  toggleClass : function (node, className) {
			    if (!node || node.nodeType !== 1 || !className || !UI.isString(className)) return;
			    var toggleClsNames = className.split(' '), classNames = (node.className || '').split(' '), rt = null, idx = -1;
			    for (var i = 0, len = toggleClsNames.length; i < len; i++) {
			      if (!(className = toggleClsNames[ i ]))continue;
			      if ((idx = classNames.indexOf(className)) === -1) {
			        classNames.push(className);
			        rt = true;
			      } else {
			        classNames.splice(idx, 1);
			        rt = false;
			      }
			    }
			    node.className = classNames.join(' ');
			    return rt;
			  },
			  /**
			   * 判断指定节点是否有指定样式名
			   * @param node 节点
			   * @param className 样式名，不允许以" "分隔
			   * @returns {boolean}
			   */
			  hasClass : function (node, className) {
			    if (!node || node.nodeType !== 1 || !className || !UI.isString(className)) return;
			    var clsNames = node.className;
			    if (!clsNames) return false;
			    return clsNames.split(' ').indexOf(className) !== -1;
			  },
			  /**
			   * 给指定节点替换样式名
			   * @param {Object} node
			   * @param {Object} newClassName 要新增的样式名，不支持空格分隔的多个
			   * @param {Object} oldClassName 要去掉的样式名，不支持空格分隔的多个
			   */
			  replaceClass : function (node, newClassName, oldClassName) {
			    if (!node || node.nodeType !== 1 || newClassName === oldClassName
			      || (!UI.isString(newClassName) && !UI.isString(oldClassName))) return;
			    var classNames = (node.className || '').split(' ');
			    if (oldClassName) {
			      var idx = classNames.indexOf(oldClassName);
			      if (idx !== -1) classNames.splice(idx, 1);
			    }
			    if (newClassName && classNames.indexOf(newClassName) === -1) classNames.push(newClassName);
			    node.className = classNames.join(' ');
			  },
			  /**
			   * 设置|获取节点样式
			   * @param node
			   * @param css
			   *  样式名: 返回样式值
			   *  样式字符串/JSON样式键值对: 设置样式值
			   */
			  css : function (node, css) {
			    if (!node || node.nodeType !== 1 || !css) return;
			    if (UI.isString(css)) {
			      if (css.indexOf(":") === -1) {//取样式
			        return getCurrentStyle(node, css);
			      } else {
			        node.style.cssText += UI.startWith(UI.endWith(css.trim(), ";", true), ";", true);
			      }
			    } else if (UI.isObject(css)) {
			      var csstext = [ ';' ], clearcss = [], value = null;
			      for (var _key in css) {
			        if (css.hasOwnProperty(_key)) {
			          if ((value = css[ _key ]) && UI.isString(value)) {
			            csstext.push(_key, ':', value, ';');
			          } else {
			            clearcss.push(_key);
			          }
			        }
			      }
			      var cssText = node.style.cssText;
			      if (clearcss.length) cssText = cssText.replace(UI.parseReg(clearcss), '');
			      node.style.cssText = cssText + csstext.join('');
			    }
			  },
			  /**
			   * 判断节点是否是另一节点的祖先节点
			   * @param pnode
			   * @param cnode
			   * @param same 是否允许是相同节点
			   * @return Boolean
			   */
			  isAncestor : document.contains ? function (pnode, cnode, same) {
			    if (!pnode || !cnode) return false;
			    return pnode.contains(cnode) && (same === true || pnode !== cnode);
			  } : document.compareDocumentPosition ? function (pnode, cnode, same) {
			    if (!pnode || !cnode) return false;
			    var tag = pnode.compareDocumentPosition(cnode);
			    return (tag & 16) === 16 || (same === true && tag === 0);
			  } : function (pnode, cnode, same) {
			    if (!pnode || !cnode) return false;
			    if (pnode === cnode) return !!same;
			    do {
			      cnode = cnode.parentNode;
			      if (cnode === pnode) return true;
			    } while (cnode);
			    return false;
			  },
			  /**
			   * 遍历子节点执行回调
			   * @param node
			   * @param callback 回调方法，返回false则阻止后面的节点继续调用该方法
			   * @param args
			   */
			  browseChild : function (node, callback, args) {
			    if (!node || !UI.isFunction(callback)) return;
			    var cnode = node.firstChild;
			    while (cnode) {
			      if (callback(cnode, args) === false) break;
			      cnode = cnode.nextSibling;
			    }
			  },
			  /**
			   * 删除节点
			   */
			  removeNode : isie ? function (node) {
			    if (node && node.tagName !== 'BODY') {
			      var tmp = UI.getDocument(node).createElement("div");
			      tmp.appendChild(node);
			      tmp.innerHTML = '';
			    }
			  } : function (node) {
			    if (node && node.tagName !== 'BODY') {
			      var pnode = node.parentNode;
			      if (pnode) pnode.removeChild(node);
			    }
			  },
			  /**
			   * 清除子节点
			   * @param node
			   */
			  clearNode : isie ? function (node) {
			    if (!node) return;
			    var tmp = getDocument(node).createElement("div");
			    var cnode = node.firstChild, tmpnode = null;
			    while (cnode) {
			      cnode = (tmpnode = cnode).nextSibling;
			      tmp.appendChild(tmpnode);
			    }
			    tmp.innerHTML = '';
			  } : function (node) {
			    if (!node) return;
			    var cnode = node.firstChild, tmpnode = null;
			    while (cnode) {
			      cnode = (tmpnode = cnode).nextSibling;
			      node.removeChild(tmpnode);
			    }
			  },
			  /**
			   * 查找符合条件的子节点，会从该节点本身开始查找
			   * @param node 节点
			   * @param filter 过滤函数，也可以是属性名(此时args为属性值，如果不指定，则只需要有该属性名就符合)
			   * @param args 过滤函数参数，或者属性值(当filter为属性名时)
			   * @param deep 为true时采用深度优先查找，否则采用广度优先查找
			   * @returns {*} 返回第一个符合条件的节点
			   */
			  findChild : function (node, filter, args, deep) {
			    if (!UI.isFunction(filter)) {
			      args = [ filter, args ];
			      filter = findByAttr;
			    }
			    return filter.apply(null, [ node ].concat(args)) || (deep === true ? _find_deepth(node.firstChild, filter, args) : _find_breadth_([ node ], filter, args));
			  },
			  /**
			   * 查找符合条件的父节点，会从该节点本身开始查找
			   * @param node 节点
			   * @param filter 过滤函数，也可以是属性名(此时args为属性值，如果不指定，则只需要有该属性名就符合)
			   * @param args 过滤函数参数，或者属性值(当filter为属性名时)
			   * @returns {*} 返回第一个符合条件的节点
			   */
			  findParent : function (node, filter, args) {
			    if (!UI.isFunction(filter)) {
			      args = [ filter, args ];
			      filter = findByAttr;
			    }
			    while (node && node.nodeType === 1) {
			      if (filter.apply(null, [ node ].concat(args))) return node;
			      node = node.parentNode;
			    }
			  },
			  firstElement : function (node) {
			    if (!node) return null;
			    node = node.firstChild;
			    return !node || node.nodeType === 1 ? node : UI.nextElement(node);
			  },
			  nextElement : function (node) {
			    if (!node) return null;
			    do {
			      node = node.nextSibling;
			    } while (node && node.nodeType !== 1);
			    return node;
			  },
			  prevElement : function (node) {
			    if (!node) return null;
			    do {
			      node = node.previousSibling;
			    } while (node && node.nodeType !== 1);
			    return node;
			  },
			  /**
			   * 获取节点边框大小
			   * @param node
			   * @param dir
			   *  true:返回纵向边框(上边框和下边框)大小加和
			   *  false:返回横向边框大小加和
			   *  0|"top"|"t",1|"right"|"r",2|"bottom"|"b",3|"left"|"l"分别返回上边框，右边框，下边框，左边框的大小
			   * @returns {*}
			   */
			  borderSize : function (node, dir) {
			    if (!node || node.nodeType !== 1) return -1;
			    if (dir === true) {
			      return (parseInt(getCurrentStyle(node, names_border[ 0 ])) || 0) + (parseInt(getCurrentStyle(node, names_border[ 2 ])) || 0);
			    } else if (dir === false) {
			      return (parseInt(getCurrentStyle(node, names_border[ 1 ])) || 0) + (parseInt(getCurrentStyle(node, names_border[ 3 ])) || 0);
			    } else {
			      var idx = indexof_dir(dir);
			      return idx === -1 ? -1 : (parseInt(getCurrentStyle(node, names_border[ idx ])) || 0);
			    }
			  },
			  /**
			   * 获取节点边距大小
			   * @param node
			   * @param dir
			   *  true:返回纵向边距(上边距和下边距)大小加和
			   *  false:返回横向边距大小加和
			   *  0|"top"|"t",1|"right"|"r",2|"bottom"|"b",3|"left"|"l"分别返回上边距，右边距，下边距，左边距的大小
			   * @returns {*}
			   */
			  paddingSize : function (node, dir) {
			    if (!node || node.nodeType !== 1) return -1;
			    if (dir === true) {
			      return (parseInt(getCurrentStyle(node, names_padding[ 0 ])) || 0) + (parseInt(getCurrentStyle(node, names_padding[ 2 ])) || 0);
			    } else if (dir === false) {
			      return (parseInt(getCurrentStyle(node, names_padding[ 1 ])) || 0) + (parseInt(getCurrentStyle(node, names_padding[ 3 ])) || 0);
			    } else {
			      var idx = indexof_dir(dir);
			      return idx === -1 ? -1 : (parseInt(getCurrentStyle(node, names_padding[ idx ])) || 0);
			    }
			  },
			  getRect : function (node) {
			    return node.getBoundingClientRect();
			  }
			});
			  
			  //####################### Event ##################################
			  
			//重载的事件对象单例
			  var event4eui = {
			      preventDefault : function () {
			        var evt = this.originalEvent;
			        if (!evt) return;
			        if (evt.preventDefault) {
			          evt.preventDefault();
			        } else {
			          evt.returnValue = false;
			        }
			      },
			      stopPropagation : function () {
			        var evt = this.originalEvent;
			        if (!evt) return;
			        if (evt.stopPropagation) {
			          evt.stopPropagation();
			        } else {
			          evt.cancelBubble = true;
			        }
			      }
			    },

			    r_keyEvent = /^key/,
			    r_mouseEvent = /^(?:mouse|contextmenu)|click/,
			    r_notwhite = /\S+/g,
			    r_typenamespace = /^([^.]*)(?:\.(.+)|)$/,

			    fix = {
			      keyHooks : {
			        props : [ 'altKey', 'ctrlKey', 'shiftKey', 'metaKey', 'keyCode', 'charCode' ],
			        filter : function (evt, original) {
			          if (!evt.charCode) evt.charCode = original.keyCode;
			        }
			      },
			      mouseHooks : {
			        props : [ 'pageX', 'pageY', 'which', 'target', 'relatedTarget', 'wheel', 'altKey', 'ctrlKey', 'shiftKey', 'metaKey' ],
			        filter : function (evt, original) {
			          var target = evt.target;
			          if (!target) target = evt.target = original.srcElement || document;
			          if (target.nodeType === 3) target = target.parentNode;
			          evt.metaKey = !!evt.metaKey;
			          if (evt.pageX == null && original.clientX != null) {
			            var evtDoc = UI.getDocument(target), doc = evtDoc.documentElement, body = evtDoc.body,
			              scrollLeft = false, scrollTop = false, clientLeft = false, clientTop = false;
			            if (doc) {
			              scrollLeft = doc.scrollLeft;
			              scrollTop = doc.scrollTop;
			              clientLeft = doc.clientLeft;
			              clientTop = doc.clientTop;
			            }
			            if (body) {
			              if (!scrollLeft) scrollLeft = doc.scrollLeft;
			              if (!scrollTop) scrollTop = doc.scrollTop;
			              if (!clientLeft) clientLeft = doc.clientLeft;
			              if (!clientTop) clientTop = doc.clientTop;
			            }
			            evt.pageX = original.clientX + (scrollLeft || 0) - (clientLeft || 0);
			            evt.pageY = original.clientY + (scrollTop || 0) - (clientTop || 0);
			          }
			          if (!evt.relatedTarget) {
			            var fromElement = original.fromElement;
			            evt.relatedTarget = fromElement === target ? original.toElement : fromElement;
			          }
			          if (!evt.which) {
			            var button = original.button;
			            evt.which = (button & 1 ? 1 : (button & 2 ? 3 : (button & 4 ? 2 : 0)));
			          }
			        }
			      }
			    },

			  //扩展事件
			    handler_enter_leave = function (evt, handler) {
			      var relatedTarget = evt.relatedTarget;
			      if (!relatedTarget || !UI.isAncestor(this, relatedTarget, true)) {
			        return handler.call(this, evt);
			      }
			    },
			    special = {
			      mouseenter : {
			        type : "mouseover",
			        handler : handler_enter_leave
			      },
			      mouseleave : {
			        type : "mouseout",
			        handler : handler_enter_leave
			      },
			      mousewheel : UI.isFirefox ? {
			        type : "DOMMouseScroll",
			        handler : function (evt, handler) {
			          evt.wheel = evt.originalEvent.detail / 3;
			          return handler.call(this, evt);
			        }
			      } : {
			        type : "mousewheel",
			        handler : function (evt, handler) {
			          evt.wheel = -evt.originalEvent.wheelDelta / 120;
			          return handler.call(this, evt);
			        }
			      },
			      resize : {
			        type : "resize",
			        handler : function (evt, handler, data) {
			          var width = this.offsetWidth, height = this.offsetHeight;
			          if (width !== data[ "width" ] || height !== data[ "height" ]) {
			            handler.call(this, data[ "width" ] = width, data[ "height" ] = height, evt);
			          }
			        },
			        setup : function (handler, data) {
			          UI.timeout(handler, { args : { type : "resize" }, once : false });
			          data[ "width" ] = this.offsetWidth;
			          data[ "height" ] = this.offsetHeight;
			          return false;
			        }
			      }
			    },

			  //所有注册的事件列表
			    handlers = {},
			    dommaps = {},//所有注册过事件的DOM都会以一个随机ID缓存在该对象上，通过查找DOM匹配的ID可以在handlers中确定对应的注册过的事件
			    mapnum = 0,//dommaps的自增ID

			    /**
			     * 获取DOM对应的事件数据对象
			     * @param dom
			     * 返回值格式如下：
			     * {
			     *    elem : DOM,
			     *    handler : Function,
			     *    events : {
			     *      click: [
			     *       type : String, [click|mousedown]
			     *        namespace : String,
			     *       data : Object,
			     *       handler : Function
			     *      ], [...]
			     *    },
			     *    mousemove : [...]
			     * }
			     */
			    getEvtData = function (dom) {
			      for (var i in dommaps) {
			        if (dommaps[ i ] === dom) return handlers[ i ];
			      }
			      dommaps[ ++mapnum ] = dom;
			      return handlers[ mapnum ] = { elem : dom };
			    },
			    /**
			     * 绑定的DOM事件的原型，默认的任何类型的DOM事件都会执行该方法，只是每次调用该方法的scope不一样
			     * @param evt
			     */
			    eventHandler = function (evt) {
			      formatEvent(evt, UI.getWindow(elem));
			      var elem = this.elem, type = event4eui.type, handlers = this.events[ type ].concat(), len = handlers.length, handlerObj = null, specialHandler = null, rt = null;
			      for (var i = 0; i < len; i++) {
			        handlerObj = handlers[ i ];
			        event4eui.data = handlerObj.data;
			        event4eui.namespace = handlerObj.namespace;
			        event4eui.type = handlerObj.type;
			        if (specialHandler = handlerObj.specialHandler) {
			          rt = specialHandler.call(elem, event4eui, handlerObj.handler, this);
			        } else {
			          rt = handlerObj.handler.call(elem, event4eui);
			        }
			        if (handlerObj.once) {
			          handlers.splice(i--, 1);
			          len--;
			        }
			      }
			      if (rt === false) {
			        event4eui.preventDefault();
			        event4eui.stopPropagation();
			      } else if (type === "contextmenu") {
			        event4eui.preventDefault();
			      }
			      if (!len) {
			        removeEvent(elem, type, this.handler);
			        delete this.events[ type ];
			      }
			    },
			    /**
			     * 真正执行绑定事件的方法
			     * @param dom
			     * @param type
			     * @param handler
			     * @param data
			     * @param once
			     * @param evtData
			     */
			    doBindEvent = function (dom, type, handler, data, once, evtData) {
			      if (!UI.isFunction(handler)) return;
			      var types = type.match(r_notwhite), evtHandler = evtData.handler, events = evtData.events, bindType = null,
			        tmp = null, namespace = null, eventArray = null, typespecial = null, specialHandler = null;
			      if (!events) events = evtData.events = {};
			      if (!evtHandler) evtHandler = evtData.handler = eventHandler.bind(evtData);
			      for (var i = 0, len = types.length; i < len; i++) {
			        tmp = r_typenamespace.exec(types[ i ]);
			        if (!(type = tmp[ 1 ])) continue;
			        namespace = (tmp[ 2 ] || '').split('.').sort().join('.');
			        typespecial = special[ type ];
			        if (typespecial) {
			          bindType = typespecial[ "type" ];
			          specialHandler = typespecial[ "handler" ];
			        } else {
			          bindType = type;
			          specialHandler = null;
			        }
			        eventArray = events[ bindType ];
			        if (!eventArray) {
			          eventArray = events[ bindType ] = [];
			          if (!typespecial || !typespecial.setup || (typespecial.setup.call(dom, evtHandler, evtData) !== false)) {
			            addEvent(dom, bindType, evtHandler);
			          }
			        }
			        eventArray.push({
			          type : type,
			          namespace : namespace,
			          specialHandler : specialHandler,
			          handler : handler,
			          data : data,
			          once : once === true
			        });
			      }
			    },
			    /**
			     * 真正执行解绑事件的方法
			     * @param event
			     * @param namespace
			     * @param type
			     * @returns {*}
			     */
			    doUnbindEvent = function (events, namespace, type) {
			      var handlerObj = null;
			      for (var i = events.length - 1; i >= 0; i--) {
			        handlerObj = events[ i ];
			        if ((!type || type === handlerObj[ "type" ] ) && (!namespace || namespace === handlerObj[ "namespace" ])) {
			          events.splice(i, 1);
			        }
			      }
			      return events.length;
			    },

			  //格式化事件单例对象
			    formatEvent = function (evt, wnd) {
			      if (evt === event4eui) return evt;
			      if (!evt) {
			        if (!(evt = (wnd || window.event))) {
			          UI.empty(event4eui, fix.mouseHooks);
			          UI.empty(event4eui, fix.keyHooks);
			          return event4eui;
			        }
			      }
			      var type = event4eui[ "type" ] = evt.type, hooks = null;
			      if (r_mouseEvent.test(type)) {
			        UI.empty(event4eui, fix.keyHooks);
			        hooks = fix.mouseHooks;
			      } else if (r_keyEvent.test(type)) {
			        UI.empty(event4eui, fix.mouseHooks);
			        hooks = fix.keyHooks;
			      } else {
			        UI.empty(event4eui, fix.mouseHooks);
			        UI.empty(event4eui, fix.keyHooks);
			      }
			      event4eui.originalEvent = evt;
			      if (hooks) {
			        var props = hooks.props, filter = hooks.filter, name = null;
			        for (var i = 0, len = props.length; i < len; i++) {
			          name = props[ i ];
			          event4eui[ name ] = evt[ name ];
			        }
			        filter(event4eui, evt);
			      }
			    };

			  //跨浏览器执行绑定事件的功能
			  var addEvent = null, removeEvent = null;
			  if (document.addEventListener) {
			    addEvent = function (node, type, handler) {
			      node.addEventListener(type, handler, false);
			    };
			    removeEvent = function (node, type, handler) {
			      node.removeEventListener(type, handler, false);
			    };
			  } else {
			    addEvent = function (node, type, handler) {
			      node.attachEvent('on' + type, handler);
			    };
			    removeEvent = function (node, type, handler) {
			      node.detachEvent('on' + type, handler);
			    };
			  }

			  ///###事件管理类
			  UI.extend(UI, {
			    /**
			     * 绑定DOM事件
			     * @param dom
			     * @param type
			     * @param data
			     * @param handler
			     * @param once
			     * @returns {*}
			     */
			    bind : function (dom, type, data, handler, once) {
			      if (dom) {
			        var evtData = getEvtData(dom);
			        if (UI.isArray(type)) {
			          for (var i = 0, len = type.length; i < len; i++) {
			            var evtObj = type[ i ];
			            doBindEvent(dom, evtObj[ "type" ], evtObj[ "handler" ], evtObj[ "data" ], evtObj[ "once" ], evtData);
			          }
			        } else if (UI.isObject(type)) {
			          doBindEvent(dom, type[ "type" ], type[ "handler" ], type[ "data" ], type[ "once" ], evtData);
			        } else if (UI.isString(type)) {
			          if (UI.isFunction(data)) {
			            handler = data;
			            data = null;
			          }
			          doBindEvent(dom, type, handler, data, once, evtData);
			        }
			      }
			      return this;
			    },
			    /**
			     * 解绑DOM事件
			     * @param dom
			     * @param type
			     */
			    unbind : function (dom, type) {
			      if (dom) {
			        var evtData = getEvtData(dom), handler = evtData[ "handler" ];
			        if (!handler) return this;
			        var events = evtData[ "events" ];
			        if (UI.isString(type) && (type = type.trim())) {
			          var types = type.match(r_notwhite), tmp = null, namespace = null, evttype = null, typespecial = null, eventArray = null;
			          for (var i = 0, len = types.length; i < len; i++) {
			            tmp = r_typenamespace.exec(types[ i ]);
			            type = tmp[ 1 ];
			            namespace = (tmp[ 2 ] || '').split('.').sort().join('.');
			            if (type) {
			              evttype = (typespecial = special[ type ]) ? typespecial[ "type" ] : type;
			              if (!(eventArray = events[ evttype ])) continue;
			              if (doUnbindEvent(eventArray, namespace, type) === 0) {
			                removeEvent(dom, evttype, handler);
			                delete events[ evttype ];
			              }
			            } else {
			              for (var name in events) {
			                if (doUnbindEvent(events[ name ], namespace) === 0) {
			                  removeEvent(dom, name, handler);
			                  delete events[ name ];
			                }
			              }
			            }
			          }
			        } else {
			          for (var i in events) {
			            removeEvent(dom, i, handler);
			          }
			        }
			      }
			      return this;
			    }
			  });

			})(window, "DSUI");
	/**###################################################################################################### */
	//公布到到EUI上
	EUI.extendObj(EUI, {
		CallBackFunc : CallBackFunc,
		CallBackFuncs : CallBackFuncs,
		extractQuotedStr : extractQuotedStr,
		Map : Map,
		StringMap : Map,
		OrderMap : OrderMap,
		StringBuffer : StringBuffer,
		TxtLoader : TxtLoader,
		TxtSection : TxtSection,
		Download : Download,
		AutoPlay : AutoPlay,
		LineReader : LineReader,
		HtmlElementFactory : HtmlElementFactory,
		AbstractReqObj : AbstractReqObj,
		ReqObjExeStatus : ReqObjExeStatus,
		sys : new Sys(),
		TimeoutQueue : TimeoutQueue,
		Cookie: Cookie,
		EsClipboard : EsClipboard,
		SequenceFactory : SequenceFactory
	});

}(window, EUI)
+function(namespace, EUI) {
	//跨浏览器执行绑定事件的功能
	var browser = EUI.browser, //判断浏览器
	addEvent = null, removeEvent = null, setEvent = null, banBackSpace, SPACE_CHAR = "&#xA0;",
	_domscrollwidth;// Firefox中Alt+0160的字符表示&nbsp;

	if (document.addEventListener) {
		addEvent = function(node, type, handler) {
			node.addEventListener(type, handler, false);
		};
		removeEvent = function(node, type, handler) {
			node.removeEventListener(type, handler, false);
		};
	} else {
		addEvent = function(node, type, handler) {
			node.attachEvent('on' + type, handler);
		};
		removeEvent = function(node, type, handler) {
			node.detachEvent('on' + type, handler);
		};
	}

	function _getDomscrollwidth(){
		var div = document.createElement("div"),
			div2 = div.appendChild(document.createElement("div"));
		div.style.cssText += ";width: 50px;height: 50px;overflow:auto;"
		div2.style.cssText += ";width: 100px;height: 100px;"
		document.body.appendChild(div);
		_domscrollwidth = div.offsetWidth - div.clientWidth - EUI._getBorderSize(div, 1);
		document.body.removeChild(div);
	};

	/**
	 * @private
	 * 屏蔽浏览器的backspace事件
	 * 1、禁止浏览器自动后退
	 * 2、但不影响密码、单行文本、多行文本输入框等的回退操作
	 */
	banBackSpace = function(evt) {
		var evt = evt || window.event;
		if (evt.keyCode == 8) {//当敲Backspace键时
			var obj = evt.target || evt.srcElement;
			var t = obj.type || obj.getAttribute("type");//触发对象类型
			//事件源类型非密码或单行、多行文本的，则退格键失效
			if (t != "password" && t != "text" && t != "textarea") {
				evt.preventDefault();
				evt.returnValue = false;
				return false;
			}
			var isreadonly = obj.readOnly || obj.getAttribute("readonly");
			var isenable = obj.getAttribute("enabled");
			isreadonly = isreadonly == null ? false : isreadonly;
			isenable = isenable == null ? true : isenable;
			//事件源类型为密码或单行、多行文本的，  
			//并且readonly属性为true或enabled属性为false的，则退格键失效  
			if (isreadonly === true || isenable === false) {
				evt.preventDefault();
				evt.returnValue = false;
				return false;
			}
		}
	};

	if (browser.isie || browser.isChrome) {
		//禁止后退键  作用于IE、Chrome  
		addEvent(document, "keydown", banBackSpace);
	} else {
		//禁止后退键 作用于Firefox、Opera 
		addEvent(document, "keypress", banBackSpace);
	}

	/**
	 * 设置指定元素的事件，该事件不是事件监听器而是直接对元素的事件进行赋盖，如需要释放指定事件的资源则可以将参数callback传空值
	 * 例如：setEvent(link, "load", function(p, u){...}, data);
	 * @private
	 * @param {DOM} obj
	 * @param {str} eventType
	 * @param {func} callback 事件定义：callback(obj, userdata)
	 * @param {obj} userdata
	 * @param {boolean} ignore 为true时表示忽略缺省的状态检查，该参数仅针对onload事件，缺省为false
	 */
	setEvent = function(obj, eventType, callback, userdata, ignore) {
		/**
		 * 没有传递回调时将释放资源
		 */
		if (!callback) {
			/**
			 * 因为统一了load事件的处理过程，使其忽略了浏览器之间的差异，因为Ie是通过监控onreadystatechange来完成的，其它浏览器是通过onload。
			 * 所以这里在释放资源时，必须针对Ie进行一下特殊的处理
			 */
			if (eventType == "load" && browser.isie
					&& typeof (obj.onreadystatechange) != "undefined") {
				eventType = "readystatechange";
			}
			obj["on" + eventType] = null;
			return;
		}

		var _doit = function() {
			if (typeof (callback) == "function")
				callback(obj, userdata);
		};

		/**
		 * 用link引入的外部样式除了Ie支持onreadystatechage外，其它的浏览器并不支持，同时也不支持onload的事件，
		 * 所以这里忽略这样的事件设置
		 */
		if (obj.nodeName && obj.nodeName.toLowerCase() == "link"
				&& eventType == "load") {
			setTimeout(_doit, 0);
			return;
		}

		var _doReadyStateChange;
		if (eventType == "load") {
			if (browser.isSafari || browser.isOpera) {
				/*
				 * 原因： 有可能是对onload事件的解释不同造成的该问题吧，具体的原因暂时不明
				 * 解决方法： 通过new方式来指定onload事件可以解决，但需要注意的是，IE与Firefox不支持该方式，如果不加以区分则会出现类似Opera中的脚本异常。
				 */
				obj["on" + eventType] = new _doit;
				return;
			}

			/**
			 * 是Ie浏览器时，就检测一下对象是否支持onreadystatechage，只要支持就将load事件改为readystatechange，
			 * 因为一般来说，在Ie下监控是否准备好都是通过该事件的，而其它浏览器由于不支持该事件而只支持load
			 */
			if (browser.isie && obj.onreadystatechange) {
				_doReadyStateChange = function() {
					if (/*参数ignore为true时表示不作缺省的状态判断，而由用户自己通过回调事件来决定*/ignore
							||
							/**
							 * 可能是XMLHttpRequest对象，readyState返回的是数值
							 */
							(!isNaN(this.readyState) && this.readyState == 4)
							||
							/**
							 * 可能是script、img、iframe元素
							 */
							this.readyState == "complete"
							||
							/**
							 * 可能是window对象，可以通过document.readyState来判断当前页面的状态
							 */
							(this.navigator && this.document && this.document.readyState == "complete")
							||
							/**
							 * 可能是iframe元素
							 */
							(this.contentWindow && this.contentWindow.document.readyState == "complete")) {
						_doit();
					}
				};

				eventType = "readystatechange";
			}
		}

		obj["on" + eventType] = _doReadyStateChange ? _doReadyStateChange : _doit;
	};

	/**
	 * @private
	 * 获取当前点击的event,兼容ie/firefox/chrome等
	 * 主要用于event不方便直接传递的地方、firefox的真实event等
	 * 有些地方真实event传递不进来，只能通过类似下面这样的方法尝试获取，参考自bi的esutil.js#getEvent
	 * @returns event
	 */
	es_tryfetch_getEvent = function() {
		//for IE
		if (document.all) {
			return window.event;
		}
		var func = es_tryfetch_getEvent.caller;
		//find real event object for current browser
		while (func != null) {
			var arg0 = func.arguments[0];
			if (arg0) {
				//MouseEvent for firefox, preventDefault/stopPropagation for W3C standard event method
				if ((arg0.constructor == Event)
						|| (arg0.constructor == MouseEvent)
						|| ((typeof (arg0) == "object") && !!arg0.preventDefault && !!arg0.stopPropagation)) {
					return arg0;
				}
			}
			func = func.caller;
		}
		return null;
	};

	/**
	 * 输入框验证
	 */
	var InputValidate = {};
	InputValidate._initObject = function(dom, func) {
		if (typeof (dom) == "string" && dom.length > 0)
			dom = document.getElementById(dom);
		if (typeof (dom) == "object" && dom.tagName
				&& "INPUT".equalsIgnoreCase(dom.tagName)) {
			dom.onkeydown = function(e) {
				if (!e)
					e = EUI.getWndOfDom(dom).event;
				if (typeof (func) == "function")
					return func(e);
			};
			dom.oncontextmenu = EUI.returnfalse;
		}
	};

	/**
	 * 只能输入数值的输入框
	 * @param dom object or string 输入框对象
	 */
	InputValidate.Number = function(dom) {
		InputValidate._initObject(dom, function(e) {
			if ((e.ctrlKey && e.keyCode == 86) || (e.keyCode > 57 && e.keyCode > 48))
				return false;
		});
	};

	/**
	 * 只能输入英文的输入框
	 * @param dom object or string 输入框对象
	 */
	InputValidate.English = function(dom) {
		InputValidate._initObject(dom, function(e) {
			if (e.keyCode > 128)
				return false;
		});
	};

	/**
	 * 只能输入中文的输入框
	 * @param dom object or string 输入框对象
	 */
	InputValidate.Chinese = function(dom) {
		InputValidate._initObject(dom, function(e) {
			if (e.keyCode > 32 && e.keyCode < 128)
				return false;
		});
	};

	InputValidate.Replace = function(dom, reg, s) {
		if (typeof (dom) == "string" && dom.length > 0)
			dom = document.getElementById(dom);
		if (typeof (dom) == "object" && dom.tagName
				&& "INPUT".equalsIgnoreCase(dom.tagName)) {
			if (typeof (reg) != "object" && typeof (reg) != "function")
				reg = /[^A-Z^a-z^0-9^\-^\_^\.]/g;
			if (dom.value != null && dom.value.length > 0)
				dom.value = dom.value.replace(reg, s ? s : "");
		}
	};

	InputValidate.test = function(dom, reg) {
		if (typeof (dom) == "string" && dom.length > 0)
			dom = document.getElementById(dom);
		if (typeof (dom) == "object" && dom.tagName
				&& "INPUT".equalsIgnoreCase(dom.tagName)) {
			if (typeof (reg) != "object" && typeof (reg) != "function")
				reg = /[^A-Z^a-z^0-9^\-^\_^\.]/g;
			return reg.test(dom.value);
		}
	};

	EUI.extendObj(EUI, {
			/**
			 * 绑定的事件
			 * @method
			 * @param {Element} dom
			 * @param {String} name 事件名
			 * @param {Function} func 事件执行函数
			 * @example
			 * EUI.addEvent(dom, "click", function(){});
			 */
			addEvent : addEvent,
			/**
			 * 移出绑定的事件
			 * @method
			 * @param {Element} dom
			 * @param {String} name 事件名
			 * @param {Function} func 事件执行函数
			 * @example
			 * EUI.removeEvent(dom, "click", function(){});
			 */
			removeEvent : removeEvent,
			/**
			 * 设置指定元素的事件，该事件不是事件监听器而是直接对元素的事件进行赋盖，如需要释放指定事件的资源则可以将参数callback传空值
			 * @method
			 * @param {DOM} obj
			 * @param {str} eventType
			 * @param {func} callback 事件定义：callback(obj, userdata)
			 * @param {obj} userdata
			 * @param {boolean} ignore 为true时表示忽略缺省的状态检查，该参数仅针对onload事件，缺省为false
			 * @example
			 * setEvent(link, "load", function(p, u){...}, data);
			 */
			setEvent : setEvent,
			/**
			 * 输入框验证
			 * @method
			 * @example
			 * //只能输入数字
			 * EUI.InputValidate.Number(dom);
			 * //只能输入英文
			 * EUI.InputValidate.English(dom);
			 * ////只能输入中文
			 * EUI.InputValidate.Chinese(dom);
			 */
			InputValidate : InputValidate,
			/**
			 * 绑定事件到当前documentr的所有iframe上
			 * @param {string} method  对事件的处理方法,add是添加,remove是删除
			 * @param {object} doc  是document对象
			 * @param {string} e  绑定到哪个事件上,如mousedown
			 * @param {function} func  绑定的事件上要触发的函数
			 */
			attacheEvent4Iframes : function(method, doc, e, func) {
				if (method == "add") {
					EUI.addEvent(doc, e, func, false);
				} else {
					EUI.removeEvent(doc, e, func, false);
				}
				var _tmp, _wnd, _doc, _body, _pn;
				var _ifms = doc.getElementsByTagName("iframe");
				for (var i = 0; _ifms && i < _ifms.length; i++) {
					try {
						_tmp = _ifms[i];
						_pn = _tmp.parentNode;
						if (_tmp.id
								&& _tmp.id.indexOf("SAN_BACKGROUND_IFRAME_ID") >= 0)
							continue;// 显示于菜单之后的iframe
						if (_tmp.style.visibility == "hidden"
								|| _tmp.style.display == "none"
								|| (_pn && _pn.style.visibility == "hidden")
								|| (_pn && _pn.style.display == "none"))
							continue;
						//检查window是否可存取，domain之外的js是无权限存取的
						_wnd = _tmp.contentWindow;
						_doc = _wnd.document;
						_body = _doc.body;
						if (!_wnd || !_doc || !_body)
							continue;
						EUI.attacheEvent4Iframes(method, _doc, e, func);
					} catch (e) {
					}
				}
				EUI.attacheEvent4Frames(method, doc, e, func);
			},
			/**
			 * 绑定事件到当前documentr的所有frame上
			 * @param {string} method  对事件的处理方法,add是添加,remove是删除
			 * @param {object} doc  是document对象
			 * @param {string} type  绑定到哪个事件上,如mousedown
			 * @param {function} func  绑定的事件上要触发的函数
			 */
			attacheEvent4Frames : function(method, doc, e, func) {
				var _tmp, _wnd, _doc, _body, _pn;
				var _fms = doc.getElementsByTagName("frame");
				for (var i = 0; i < _fms.length; i++) {
					try {
						_tmp = _fms[i];
						_pn = _tmp.parentNode;
						if (_tmp.style.visibility == "hidden"
								|| _tmp.style.display == "none")
							continue;
						//检查window是否可存取，domain之外的js是无权限存取的
						_wnd = _tmp.contentWindow;
						_doc = _wnd.document;
						_body = _doc.body;
						if (!_wnd || !_doc || !_body)
							continue;
						EUI.attacheEvent4Iframes(method, _doc, e, func);
					} catch (e) {
					}
				}
			},
			/**
			 * 绑定事件到top的所有iframe上
			 * @param {string} method  对事件的处理方法,add是添加,remove是删除
			 * @param {string} type  绑定到哪个事件上,如mousedown
			 * @param {function} func  绑定的事件上要触发的函数
			 */
			attacheEvent4TopIframes : function(method, e, func) {
				if (typeof (func) != "function")
					return;
				EUI.attacheEvent4Iframes(method, EUI.getRootWindow().document, e, func);
			},
			/**
			 * 绑定Resize事件，采用的是jQuery resize插件，原理是每250ms检查一次，具体检查机制由jQuery插件完成
			 * @param {Element} resizedom 绑定事件的DOM元素
			 * @param {Object} options 配置参数,可选项如下：
			 * @param	{String} options.resizewh: 'w'/'h', 指定调整宽度/高度，缺省则宽高均作调整
			 * @param	{Function} options.callback: 将调整好的宽高作为参数的回调函数,
			 * @param	{(Element|Element[])} options.targets: callback不传时可以通过传入DOM或DOM数组，最后会直接将调整好的宽度/高度设置到每个DOM中
			 * @param	{Number} options.offsetw/offseth: 分别对应计算后的宽高的偏移值
			 */
			bindResize : function(resizedom, options) {
				var elems = [], datas = [], delay = 500, time_id = null, name_height = 'clientHeight', name_width = 'clientWidth';
				var doCheckResize = function() {
					var len = elems.length;
					if (len === 0)
						return false;
					for (var i = 0; i < len; i++) {
						var elem = elems[i], data = datas[i];
						var resizewh = data["resizewh"], width = null, oriwidth = null, height = null, oriheight = null;
						if (resizewh !== 'h') {
							oriwidth = data["width"];
							width = elem[name_width] - data["offsetw"];
						}
						if (resizewh !== 'w') {
							oriheight = data["height"];
							height = elem[name_height] - data["offseth"];
						}
						if (width === oriwidth && height === oriheight)
							continue;
						try {
							data["callback"].call(data["context"],
									data["width"] = width, data["height"] = height,
									data["extArgs"]);
						} catch (e) {
						}
					}
				};
				var loopy = function() {
					if (time_id)
						clearTimeout(time_id);
					time_id = setTimeout(function() {
						if (doCheckResize() !== false)
							loopy();
					}, delay);
				};
				var setChildSize = function(width, height, childNodes) {
					var cssText = ';'
							+ (width !== null ? 'width: ' + width + 'px;' : '')
							+ (height !== null ? 'height: ' + height + 'px;' : '');
					for (var i = 0, len = childNodes.length; i < len; i++) {
						childNodes[i].style.cssText += cssText;
					}
				};
				EUI.addDispose(function() {
					if (time_id)
						clearTimeout(time_id);
					elems = null;
					datas = null;
				});

				bindResize = function(resizedom, options) {
					if (!resizedom || !elems)
						return;
					if (!options) {
						var idx = elems.indexOf(resizedom);
						if (idx !== -1) {
							elems.splice(idx, 1);
							datas.splice(idx, 1);
							if (elems.length === 0 && time_id) {
								clearTimeout(time_id);
							}
						}
					} else {
						var callback = options["callback"], extArgs = null, context = null;
						if (typeof (callback) !== 'function') {
							var targets = options["targets"];
							if (!targets)
								return;
							callback = setChildSize;
							extArgs = targets;
						} else {
							extArgs = options["extArgs"];
							context = options["context"];
						}
						var resizewh = options["resizewh"], width = resizedom[name_width], height = resizedom[name_height], w = null, h = null, offsetw = null, offseth = null;
						resizewh = resizewh === "w" || resizewh === "h" ? resizewh
								: null;
						if (resizewh !== "h") {
							offsetw = parseInt(options["offsetw"]) || 0;
							w = width - offsetw;
						}
						if (resizewh !== "w") {
							offseth = parseInt(options["offseth"]) || 0;
							h = height - offseth;
						}
						if (!options["defer"])
							callback.call(context, w, h, extArgs);
						elems.push(resizedom);
						datas.push({
							width : width,
							height : height,
							offsetw : offsetw,
							offseth : offseth,
							resizewh : resizewh,
							extArgs : extArgs,
							context : context,
							callback : callback
						});
						if (elems.length === 1 && !time_id)
							loopy();
					}
				};
				bindResize.apply(this, arguments);
			},
			/**
			 * 显示一个遮罩面板
			 * @param {Element} parentDom 父对象,可以是字符串或对象,如果不指定就是body
			 * @param {Boolean} visible 是否可见,缺省的为true
			 * @param {Boolean} istransparent=false 是否为透明色遮罩
			 * @param {number|String} 指定遮罩层zIndex
			 * @ftype util.dom
			 */
			showDisablePane : function(parentDom, visible, istransparent,zindex) {
				if(EUI.isString(parentDom)) {
					parentDom = document.getElementById(parentDom);
				}
				if (!EUI.isHtmlElement(parentDom)){
					parentDom = document.body;
				} 
				var doc = parentDom.ownerDocument,
					_gname = parentDom.slk_disablePane_id;
				if (!visible && !_gname)
					return;
				var wnd = EUI.getWndOfDoc(doc);
				if (wnd.onBefore_ShowDisablePane){
					wnd.onBefore_ShowDisablePane();
				}
				var pane = _gname?doc.getElementById(_gname): null,
					ishide = !pane || EUI.hasClassName(pane, "eui-hide");
				//面板是显示的，且需要显示面板，只用把状态+1
				if(!ishide && visible){
					pane.visibleid += 1;
					//叠加的时候，需要透明的时候不用管上层是什么样的， 但是非透明就需要处理
					if(!istransparent){
						EUI.removeClassName(pane, "eui-shade-transparent");
					}
					
					if(zindex){
						pane.lastZIndex = pane.style.zIndex;
						pane.style.zIndex = zindex;
					}
					
					return;
				}
				//面板是隐藏的，切需要把面板隐藏，直接return
				if( ishide && !visible) return;
				if (!pane) {
					pane = parentDom.appendChild(doc.createElement("div"));
					pane.visibleid = 0;
					pane.className = "eui-shade";
					pane.id = EUI.idRandom("slk_disablePane");
					parentDom.slk_disablePane_id = pane.id;
					pane.oncontextmenu = EUI.returnfalse;
					// 用透明的图片来替代透明滤镜可以减少内存消耗
					var inpane = pane.appendChild(doc.createElement("img"));
					inpane.src = EUI.xuiimg("null.gif");
					inpane.style.cssText += ";position:absolute;width:100%;height:100%;z-index:1;";
					inpane.oncontextmenu = EUI.returnfalse;
					
					//绑定事件，该事件将遮罩层的zindex传入e中，其他dom冒泡可以获取遮罩层面板的zindex，比如combobox面板隐藏问题
					addEvent(inpane,"mousedown",function(e){
						e.disablePanezIndex = pane.style.zIndex;
					});
					addEvent(inpane,"click",function(e){
						e.disablePanezIndex = pane.style.zIndex;
					});
					//使对话框背景蒙板禁用鼠标拖选，解决在chrome上移动对话框时造成文字被选择的问题
					EUI.disableDocTextSelect(pane, false);
				}
				if(EUI.parseBool(istransparent, false)){
					EUI.addClassName(pane, "eui-shade-transparent");
				}else{
					EUI.removeClassName(pane, "eui-shade-transparent");
				}
				pane.visibleid += visible ? 1 : -1;
				if (pane.visibleid > 0) {
					//层级与对话框一致
					pane.style.zIndex = typeof (zindex) != "number" ? 9 : zindex;
					EUI.removeClassName(pane, "eui-hide");
				} else {
					pane.visibleid = 0;
					EUI.addClassName(pane, "eui-hide");
				}
				if (wnd.onAfter_ShowDisablePane){
					wnd.onAfter_ShowDisablePane(pane.visibleid > 0, pane);
				}
				return pane;
			},
			/**
			 * 获取body标签中的内容
			 * @param {String} html 
			 * @returns {String}
			 */
			getHtmlBody : function(html) {
				if (!html) {
					return html;
				}
				var i = html.indexOf("<body");
				if (i > -1) {
					i = html.indexOf(">", i);
					var e = html.lastIndexOf("</body>");
					html = html.substr(i + 1, e - i - 1);
				}
				if (browser.isie) {
					return html;
				}
				return html.replace(/(&nbsp;)/g, SPACE_CHAR);
			},
			/**
			 * 获取script标签中的内容
			 * @param {String} html 
			 * @returns {String}
			 */
			getScriptBody : function(html) {
				if (!html) {
					return html;
				}
				var i = html.indexOf("<script");
				if (i > -1) {
					i = html.indexOf(">", i);
					var e = html.lastIndexOf("</script>");
					html = html.substr(i + 1, e - i - 1);
					return html;
				}
				return null;
			},
			/**
			 * 获取元素o的真实左坐标
			 * @param {Element} o
			 * @returns {Number}
			 */
			getRealLeft : function(o) {
				var l = o.offsetLeft - o.scrollLeft, o = o.offsetParent;
				while (o && o.tagName != "BODY") {// 不是body就累加
					l += o.offsetLeft - o.scrollLeft + o.clientLeft; // clientLeft用于考虑dom的border的宽度
					o = o.offsetParent;
				}
				return l;
			},
			/**
			 * 获取元素o的真实上坐标
			 * @param {Element} o
			 * @returns {Number}
			 */
			getRealTop : function(o) {
				var t = o.offsetTop - o.scrollTop, o = o.offsetParent;
				while (o && !"BODY".equalsIgnoreCase(o.tagName)) {// 不是body就累加
					t += o.offsetTop - o.scrollTop + o.clientTop;
					o = o.offsetParent;
				}
				return t;
			},
			/**
			 * 获取dom的上坐标
			 * @param {Element} dom
			 * @param {(Element|Boolean)} parentNode ; true:坐标原点是document左上角;false:坐标原点是父dom左上角
			 * @param {Boolean} ignoreScroll 是否忽略滚动条
			 * @returns {Number}
			 */
			getDomTop : function(dom, parentNode, ignoreScroll) {
				var _baseDom = dom;
				if (!parentNode) {
					return EUI.getDomOffsetTop(_baseDom);
				}
				var _pNode = _baseDom.offsetParent;
				var r = EUI.getDomOffsetTop(_baseDom, ignoreScroll);
				while (_pNode != null && _pNode != parentNode) {
					r += EUI.getDomOffsetTop(_pNode, ignoreScroll);
					_pNode = _pNode.offsetParent;
				}
				return r;
			},
			/**
			 * 获取dom所在的元素上的偏移上坐标 
			 * @param {Element} dom
			 * @param {Boolean} ignoreScroll 是否忽略滚动条
			 * @returns {Number}
			 */
			getDomOffsetTop : function(dom, ignoreScroll) {
				return dom.offsetTop - (ignoreScroll ? dom.scrollTop : 0)
						+ dom.clientTop;
			},
			/**
			 * 获取dom的左坐标
			 * @param {Element} dom
			 * @param {Element} parentNode 
			 * @param {Boolean} ignoreScroll 是否忽略滚动条
			 * @returns {Number}
			 */
			getDomLeft : function(dom, parentNode, ignoreScroll) {
				var _baseDom = dom;
				if (!parentNode) {
					return EUI.getDomOffsetLeft(_baseDom);
				}
				var _pNode = _baseDom.offsetParent;
				var r = EUI.getDomOffsetLeft(_baseDom, ignoreScroll);
				while (_pNode != null && _pNode != parentNode) {
					r += EUI.getDomOffsetLeft(_pNode, ignoreScroll);
					_pNode = _pNode.offsetParent;
				}
				return r;
			},
			/**
			 * 获取dom所在的元素上的偏移左坐标
			 * @param {Element} dom
			 * @param {Boolean} ignoreScroll 是否忽略滚动条
			 * @returns {Number}
			 */
			getDomOffsetLeft : function(dom, ignoreScroll) {
				return dom.offsetLeft - (ignoreScroll ? dom.scrollLeft : 0)
						+ dom.clientLeft;
			},
			/**
			 * 获取指定ＤＯＭ的滚动栏坐标 
			 * @param {Element} dom
			 * @param {Element} parentNode
			 * @returns {Element}
			 * @example
			 * var pt = EUI.getAbsScrollPosition(dom, pdom);
			 * var left = pt.left;
			 * var top = pt.top;
			 */
			getAbsScrollPosition : function(p, parentnode) {
				if (!p)
					return;
				var doc = parentnode ? parentnode : p.ownerDocument;
				var left = p.scrollLeft;
				var top = p.scrollTop;
				p = p.offsetParent;
				while (p && p != doc) {
					left += p.scrollLeft;
					top += p.scrollTop;
					p = p.offsetParent;
				}
				return {
					x : left,
					y : top
				};
			},
			/**
			 * 获取dom对象在parentNode对象上的坐标,如果parentNode对象没有指定,则为body上,win为dom所在的window对象
			 * @param {winow} win
			 * @param {Element} dom
			 * @param {Element} parentNode
			 * @return {Object}
			 * @example
			 * var p = getAbsPosition(window, dom);
			 * var x = p.x;//获得x坐标;
			 * var y = p.y;//获得y坐标;
			 */
			getAbsPosition : function(win, elem, offsetNode) {
				var doc = elem.ownerDocument || win.document, box = elem
						.getBoundingClientRect(), offsetbox = null;
				if (!offsetNode) {
					offsetNode = doc.documentElement;
					offsetbox = {
						left : 0,
						top : 0
					};
				} else {
					offsetbox = offsetNode.getBoundingClientRect();
				}
				return {
					x : box["left"] - offsetbox["left"] + offsetNode.scrollLeft
							- (offsetNode.clientLeft || 0),
					y : box["top"] - offsetbox["top"] + offsetNode.scrollTop
							- (offsetNode.clientTop || 0)
				};
			},
			/**
			 * 设置指定对象里的文本内容
			 * @param {Element} p DOM对象
			 * @param {(string|number)} text  文本内容,可以是字符串或者数值型
			 */
			setTextContent : function(p, text, istospace) {
				if (!p)
					return;
				text = typeof (text) == "string" || typeof (text) == "number" ? text
						: (istospace == false ? "" : " ");
				if (p.nodeType == 3) {// 兼容#text文字节点
					p.data = text;
				} else if (browser.isie) {
					p.style.display = 'none'; //这里IE中经常造成渲染不及时，所以先隐藏再显示
					p.innerText = text;
					p.style.display = '';
				} else {
					p.textContent = text;
				}
			},
			/**
			 * 返回指定DOM里的文本内容
			 * @param {Element} noe  DOM对象
			 * @returns {String} 获取的内容
			 */
			getTextContent : function(p) {
				if (!p)
					return null;
				var nodeType = p.nodeType;
				if (nodeType === 1 || nodeType === 9 || nodeType === 11) {
					if (typeof p.textContent === "string") {
						return p.textContent;
					} else {
						var rt = [];
						for (var elem = p.firstChild; elem; elem = elem.nextSibling) {
							rt.push(EUI.getTextContent(elem));
						}
						return rt.join('');
					}
				} else if (nodeType === 3 || nodeType === 4) {
					return p.nodeValue;
				}
				return '';
			},
			/**
			 * 清除指定DOM里的内容
			 * @param {Element} noe  DOM对象
			 * @param {Function} [filter]
			 */
			clearAllContent : function(node, filter) {
				var childnode = node.firstChild, tmpchild = null;
				if (typeof (filter) === 'function') {
					while (tmpchild = childnode) {
						childnode = childnode.nextSibling;
						if (filter(tmpchild, node) !== true)
							node.removeChild(tmpchild);
					}
				} else {
					while (tmpchild = childnode) {
						childnode = childnode.nextSibling;
						node.removeChild(tmpchild);
					}
				}
				return node;
			},
			/**
			 * 清除子节点
			 * @param node
			 */
			clearNode : EUI.isie ? function (node) {
				if (!node) return;
				var tmp = getDocument(node).createElement("div");
				var cnode = node.firstChild, tmpnode = null;
				while (cnode) {
					cnode = (tmpnode = cnode).nextSibling;
					tmp.appendChild(tmpnode);
				}
				tmp.innerHTML = '';
			} : function (node) {
				if (!node) return;
				var cnode = node.firstChild, tmpnode = null;
				while (cnode) {
					cnode = (tmpnode = cnode).nextSibling;
					node.removeChild(tmpnode);
				}
			},
			/**
			 * 获取指定DOM元素内的子元素，等同于dom.childNodes[i]方法
			 * @param {Element} p DOM元素
			 * @param {Number} index 第几个子元素
			 * @returns {Element}
			 */
			getChildNodes : function(p, index) {
				var cns = p.childNodes, tmp = null, j = 0;
				for (var i = 0, len = cns.length; i < len; i++) {
					tmp = cns[i];
					if (tmp.nodeType != 3 || tmp.nodeValue.indexOf("\n") != 0) {
						if (j++ == index)
							return tmp;
					}
				}
			},
			/**
			 * 获取指定结点里的CDATASection内容
			 * @param node
			 * @returns {string}
			 */
			getCDATASectionValue : function(node) {
				var length = node.childNodes.length;
				if (length == 0)
					return node.nodeName == "#cdata-section" ? node.nodeValue : "";
				var _node;
				var str = null;
				for (var i = 0; i < node.childNodes.length; i++) {
					_node = node.childNodes[i];
					if (_node.nodeName == "#cdata-section") {
						str = (str == null ? "" : str) + _node.nodeValue;
					} else if (str != null) {
						break;//CDATA中断,不再是连续的CDATA节点
					}
				}
				return str == null ? "" : str;
			},
			/**
			 * 获得dom的一个子节点
			 * @param {Element} parentobj	父节点
			 * @param {String} attrib	属性或属性名
			 * @param {String} value	属性值
			 * @param {Boolean} recur	是否递归查找
			 * @returns {Element|null}
			 */
			getChildDomByAttrib : function(parentobj, attrib, value, recur) {
				if (parentobj == null || value == null) {
					return null;
				}
				var childs = parentobj.childNodes;
				var len = childs.length;
				var child;
				for (var i = 0; i < len; i++) {
					child = childs[i];
					if (child.nodeType !== 1)
						continue;
					// 如果attrib为tagName,在ie中value必须为大小,而在firefox中为小写,所以用不区分大小写的比较
					if (value.equalsIgnoreCase(child[attrib])
							|| (value.equalsIgnoreCase(child.getAttribute(attrib)))) {
						return child;
					}
					if (recur) {
						child = EUI.getChildDomByAttrib(child, attrib, value, recur);
						if (child != null) {
							return child;
						}
					}
				}
				return null;
			},
			/**
			 * 获得dom的一个子节点
			 * @param {Element} parentobj	父节点
			 * @param {String} attrib	属性名
			 * @param {String} value	属性值
			 * @param {Number} index	第index个符合属性的子节点
			 * @returns {Element|null}
			 */
			getChildDomByAttribWithIndex : function(parentobj, attrib, value,
					index) {
				if (parentobj == null) {
					return null;
				}
				if (!index)
					index = 0;
				var childs = parentobj.childNodes;
				var len = childs.length;
				var child;
				var cur = -1;
				for (var i = 0; i < len; i++) {
					child = childs[i];
					if (child.nodeType !== 1)
						continue;
					// 如果attrib为tagName,在ie中value必须为大小,而在firefox中为小写,所以用不区分大小写的比较
					if (value.equalsIgnoreCase(child[attrib])
							|| (value.equalsIgnoreCase(child.getAttribute(attrib)))) {
						cur++;
						if (cur == index) {
							return child;
						}
					}
				}
				return null;
			},
			/**
			 * 将html赋值给obj的innerHTML并且执行html中的所有script标签中的内容。
			 * @param {Element} node  dom
			 * @param {String} html  html内容
			 */
			setInnerHTML : function(obj, html) {
				var start = "<script";
				var end = "</script\>";
				var i1 = html.indexOf(start, 0);
				var arr = [];
				var _body, _script;
				while (i1 != -1) {
					var i2 = html.indexOf(end, i1);
					var i3 = html.indexOf(">", i1);
					var str = html.substring(i3 + 1, i2);
					if (str != "") {
						arr.push(str);
					}
					i1 = html.indexOf(start, i2);
				}
				obj.innerHTML = EUI.getHtmlBody(html);
				eval(arr.join("\r\n"));
			},
			/**
			 * 设置指定元素内的html内容,包括内部脚本与内部样式的支持
			 * @param {Object} node  要加入html内容的元素
			 * @param {String} html  html内容
			 */
			setHtmlContent : function(node, html) {
				if (!node)
					return;
				//根据node结点获取所在的window对象，只有window对象正确，脚本才能够被正确的执行
				var wnd = EUI.getWndOfDom(node);
				if (!wnd) {
					return;
				}
				var doc = wnd.document;
				// 提取脚本的正则表达式
				var _exp = /<script.*?>[\s\S]*?<\/script>/gi;
				var _scripts = html.match(_exp);
				html = html.replace(_exp, "");

				if (browser.isie) {
					// IE浏览器在引用定义了样式的Html时，需要在其前面放置一个无关的元素,才能正确的渲染样式
					html = "<span style=display:none>MSIE</span>" + html;
					node.innerHTML = html;
					// 完成后删除无关的元素
					node.removeChild(node.firstChild);
				} else {
					/**
						* 适用非Ie内核的浏览器用来内置外部的HTML代码，如：Firefox、Chrome、Safari与Opera
						*/
					var node1 = node.nextSibling;
					var node2 = node.parentNode;
					if (node2.nodeType != 1)
						return;
					// 删除要放置html代码的元素
					node2.removeChild(node);
					// 渲染Html内容
					var _exp = /<style.*?>[\s\S]*?<\/style>/gi;
					var _styles = html.match(_exp);
					if (_styles && _styles.length > 0) {
						var _head = doc.getElementsByTagName("head")[0];
						var _pstyle = doc.getElementById("style4InnerHtml");
						if (!_pstyle) {
							_pstyle = _head.appendChild(doc.createElement("style"));
							_pstyle.id = "style4InnerHtml";
						}
						if (_pstyle.parentNode != _head) {
							_head.appendChild(_pstyle);
						}
						EUI.clearAllContent(_pstyle);
						_pstyle.innerHTML = EUI._styles2String4HtmlContent(_styles);

						html = html.replace(_exp, "");
					}
					node.innerHTML = html.replace(/(&nbsp;)/g, SPACE_CHAR);
					// node1中有兄弟结点时，将node插入到node1的前面，否则将node添加到node2中
					node1 && node1.nodeType == 1 ? node2.insertBefore(node, node1)
							: node2.appendChild(node);
				}
				//执行脚本
				EUI.exeDomScriptJs(node, _scripts, wnd);
			},
			/**
			 * 执行脚本，通过execScript或者eval来执行
			 * @param {Element} node 添加到目标dom
			 * @param {Array} _scripts
			 * @param {window} wnd
			 */
			exeDomScriptJs : function(node, _scripts, wnd) {
				var _script, ndx, doc = wnd.document;
				for (var i = 0; _scripts && i < _scripts.length; i++) {
					_script = _scripts[i];
					ndx = _script.indexOf(">");
					if (ndx == -1)
						continue;
					if (_script.substring(0, ndx + 1).indexOf("src=") != -1) {
						// 通过sys.lib.include方法引用包含的外部js
						EUI._sysIncludeJs4HtmlContent(_script);
					} else {
						if (_script.indexOf("/*rptclientjs*/") > -1) {
							var tempdiv = doc.createElement("div");
							tempdiv.innerHTML = _script;
							node.appendChild(tempdiv.firstChild);
							tempdiv = null;
							continue;
						}
						// 执行<script>标签内定义的脚本，这里在执行时，需要明确window对象，如果window对象不正确，那么所执行的脚本将会不正确
						_script = _script.substring(ndx + 1, _script.length
								- "</script>".length);
						/*参考util.js#execJavaScript方法中的注释*/
						EUI.execJavaScript(_script, wnd);
					}
				}
			},
			/**
			 * 设置div为指定的left和top
			 * @param {ELement} div
			 * @param {Number} x
			 * @param {Number} y
			 */
			setDivPos : function(div, x, y) {
				if (browser.isie) {
					// ie中要使用pixelTop和pixelLeft设置图层的位置，不然可能使ie崩溃
					div.style.pixelTop = y;
					div.style.pixelLeft = x;
				} else {
					div.style.top = y + "px";
					div.style.left = x + "px";
				}
			},
			/**
			 * 获取evt中，x、y的坐标
			 * @param {event} e
			 * @param {winow} wnd
			 * @returns {Object} 返回{x:, y:}
			 */
			getCursorPosition : function(e, wnd) {
				wnd = wnd && typeof (wnd) == "object" ? wnd : window;
				if (!e)
					e = wnd.event;
				if (!e) {
					e = es_tryfetch_getEvent();
				}
				if (!!e) {
					return {
						x : e.clientX,
						y : e.clientY
					};
				}
				return null;
			},
			/**
			 * 添加外部脚本
			 * @param {document} doc document对象
			 * @param {String} src 脚本名
			 * @param {Function} scriptLoaded 加载完成的回调事件
			 */
			addScript : function(doc, src, scriptLoaded) {
				var _head = doc.getElementsByTagName("head");
				var hasHead = _head && _head.length > 0;

				if (hasHead) {
					if (EUI.findScript(doc, src) != -1)
						return;
					var __head = _head[0];
					var _script = doc.createElement("script");
					if (scriptLoaded) {
						_script.onload = scriptLoaded;
						__head.appendChild(_script);
						_script.src = src;
					} else {
						__head.appendChild(_script);
						_script.src = src;
					}
				}
			},
			/**
			 * 批量异步加载js
			 * 利用script标签加载， 
			 * @private
			 * @param {document} doc
			 * @param {(Array|String)} jsurl  字符串的话逗号分隔
			 * @param {Boolean} needpath=true 是否需要带上下文
			 */
			addScripts: function(doc, jsurl, needpath){
				if(!jsurl)return;
				needpath = EUI.parseBool(needpath, true);
				if(!EUI.isArray(jsurl)){
					jsurl = jsurl.split(",");
				}
				jsurl.forEach(function(url, index){
					jsurl[index] = url.ensureNotEndWith(".js")
				})
				if(window.define.amd){
					require(jsurl);
				}else{
					jsurl.forEach(function(url, index){
						EUI.addScript(doc, (needpath?EUI.getContextPath():"") + url + ".js");
					});
				}
			},
			/**
			 * 添加外部样式
			 * @param {document} doc document对象
			 * @param {String} name 为样式名
			 * @param {Function} callback 加载完成的回调事件
			 */
			addStyle : function(doc, name, callback) {
				var _head = doc.getElementsByTagName("head");
				var hasHead = _head && _head.length > 0;

				if (hasHead) {
					if (EUI.findStyle(doc, name) != -1)
						return;
					var __head = _head[0];
					var _link = __head.appendChild(doc.createElement("link"));
					_link.rel = "stylesheet";
					_link.type = "text/css";
					if (typeof (callback) === "function")
						_link.onload = callback;
					_link.href = name;
				}
			},
			/**
			 * 添加指定的样式使样式能够适用所在的页面
			 * 参数css为具体的样式内容，参数wnd为样式所在的window对象
			 * 如果没有指定则缺省为window对象
			 * 参数id为样式的唯一id，如果该样式已经存在则会更新该样式内容
			 * @param {String} css
			 * @param {String} [id]
			 * @param {window} wnd
			 * @example
			 * EUI.addStyleSheet("*{font-size:12px;color:#000}");
			 */
			addStyleSheet : function(css, id, wnd) {
				if (!wnd)
					wnd = window;
				var doc = wnd.document, rules = doc.getElementById(id), ss = null;
				if (!rules) {
					var head = doc.getElementsByTagName("head")[0];
					rules = doc.createElement("style");
					rules.setAttribute("type", "text/css");
					if (id) {
						rules.setAttribute("id", id);
					}
					head.appendChild(rules);
				}
				// if (browser.isie) {
				if(rules.styleSheet){
					ss = rules.styleSheet;
					ss.cssText += css;
				} else {
					try {
						rules.appendChild(doc.createTextNode(css));
					} catch (e) {
						rules.cssText += css;
					}
					ss = rules.styleSheet ? rules.styleSheet
							: (rules.sheet || doc.styleSheets[doc.styleSheets.length - 1]);
				}
				return ss;
			},
			/**
			 * 查找指定的外部脚本是否存在
			 * @param {document} doc document对象
			 * @param {String} src 脚本文件名
			 * @returns {index} 返回下标，不存在则返回-1
			 */
			findScript : function(doc, src) {
				var _script = doc.getElementsByTagName("script");
				if (!_script)
					return;
				var count = _script.length;
				for (var i = 0; i < count; i++) {
					if (_script[i].src.indexOf(src) != -1)
						return i;
				}
				return -1;
			},
			/**
			 * 查找指定的外部样式是否存在
			 * @param {document} doc document对象
			 * @param {String} name 样式文件名
			 * @returns {index} 返回下标，不存在则返回-1
			 */
			findStyle : function(doc, name) {
				var _link = doc.getElementsByTagName("link");
				if (!_link)
					return;
				var count = _link.length;
				for (var i = 0; i < count; i++) {
					if (_link[i].href.indexOf(name) != -1)
						return i;
				}
				return -1;
			},
			/**
			 * 添加样式className
			 * @param {Element} dom
			 * @param {String} className 字符串，多个以" "分隔
			 */
			addClassName : function(dom, className) {
				if (!dom || !className)
					return;
				var clsNames = dom.className;
				if (arguments[2] === true) {
					if (clsNames) {
						if (clsNames.split(' ').indexOf(className) !== -1)
							return;
						className = clsNames + ' ' + className;
					}
					dom.className = className;
				} else {
					clsNames = clsNames ? clsNames.split(' ') : [];
					className.split(' ').forEach(function(clsName) {
						if (clsName && this.indexOf(clsName) === -1)
							this.push(clsName);
					}, clsNames);
					dom.className = clsNames.join(' ');
				}
			},
			/**
			 * 移除样式className
			 * @param {Element} dom
			 * @param {String} className字符串，多个以" "分隔
			 */
			removeClassName : function(dom, className) {
				if (!dom || !className)
					return;
				var clsNames = dom.className;
				if (!clsNames)
					return;
				clsNames = clsNames.split(' ');
				if (arguments[2] === true) {
					var index = clsNames.indexOf(className);
					if (index === -1)
						return;
					clsNames.splice(index, 1);
				} else {
					className.split(' ').forEach(function(clsName) {
						var index = this.indexOf(clsName);
						if (index !== -1)
							this.splice(index, 1);
					}, clsNames);
				}
				dom.className = clsNames.join(' ');
			},
			/**
			 * 判断DOM是否有指定的className
			 * @param {Element} dom
			 * @param {String} className
			 * @returns {Boolean}
			 */
			hasClassName : function(dom, className) {
				if (!dom || !className)
					return;
				var clsNames = dom.className;
				if (!clsNames)
					return false;
				return clsNames.split(' ').indexOf(className) !== -1;
			},
			/**
			 * 切换className， 有则移除(返回false)，没有则添加(返回true)
			 * @param {Element} dom
			 * @param {String} className
			 * @returns {Boolean}
			 */
			toggleClassName : function(dom, className) {
				if (!dom || !className)
					return;
				var toggleClsNames = className.split(' ');
				if (toggleClsNames.length > 1) {
					toggleClsNames.forEach(function(className) {
						toggleClassName(this, className);
					}, dom);
					return;
				}
				var clsNames = (dom.className || '').split(' '), index = clsNames
						.indexOf(className), rt = null;
				if (index === -1) {
					clsNames.push(className);
					rt = true;
				} else {
					clsNames.splice(index, 1);
					rt = false;
				}
				dom.className = clsNames.join(' ');
				return rt;
			},
			/**
			 * 返回node的子节点中，标签名是tagName的第index个
			 * @param {Element} node 指定节点
			 * @param {String} tagName 标签名
			 * @param {Number} index 下标
			 */
			getChildNodeAt : function(node, tagName, index) {
				if (!node)
					return null;
				index = parseInt(index) || 0;
				var child = node.firstChild, idx = -1;
				if (!tagName)
					tagName = false;
				while (child) {
					var nodeName = child.tagName;
					if (nodeName
							&& (!tagName || nodeName.equalsIgnoreCase(tagName))) {
						idx++;
						if (idx === index)
							return child;
					}
					child = child.nextSibling;
				}
				return null;
			},
			/**
			 * 获取当前处于激活状态的元素 
			 * @param {document} doc
			 * @param {event} e
			 * @returns {Element}
			 */
			getActiveElement : function(doc, e) {
				if (!doc)
					doc = document;
				if (!e)
					e = window.event;
				return doc.activeElement ? doc.activeElement
						: e.explicitOriginalTarget;
			},
			/**
			 * 判断在dom结构中，p是否是c的上级节点
			 * @param {Element} p 上级节点
			 * @param {Element} c 当前节点
			 * @returns {Boolean} 
			 */
			domIsParent : function(p, c) {
				if (!c || !p || c == p) {
					return false;
				}
				var pp = c.parentNode;
				var body = p.ownerDocument.body;
				while (pp && pp != p && pp != body) {
					pp = pp.parentNode;
				}
				return pp == p;
			},
			/**
			 * 获取指定DOM中的第一个子结点,排除了text节点
			 * @param {Element} dom
			 * @returns {Element}
			 */
			getFirstChild : function(dom) {
				if (!dom)
					return null;
				var firstChild = dom.firstChild;
				if (!firstChild)
					return null;
				if (firstChild.nodeType == 1)
					return firstChild;
				return EUI.getNextElementSibling(firstChild);
			},
			/**
			 * 获取指定dom下的所有子节点，除开文字节点
			 * @param {ELement} dom
			 * @returns {Array}
			 */
			getDomChildNodes : function(dom) {
				var arr = new Array();
				if (!dom)
					return arr;
				var cs = dom.childNodes;
				for (var i = 0; i < cs.length; i++) {
					var node = cs[i];
					if (node.nodeType != 1)
						continue;
					arr.push(node);
				}
				return arr;
			},
			/**
			 * 根据dom获取document对象
			 * @param {Element} dom
			 * @returns {window} wnd;
			 */
			getWndOfDom : function(dom) {
				return dom && dom.ownerDocument ? (browser.isie ? dom.ownerDocument.parentWindow
						: dom.ownerDocument.defaultView)
						: window;
			},
			/**
			 * 根据document获取window对象
			 * @param {document} doc
			 * @returns {window} wnd;
			 */
			getWndOfDoc : function(doc) {
				return doc ? (browser.isie ? doc.parentWindow : doc.defaultView)
						: window;
			},
			/**
			 * 获取dom上的样式
			 * @param {ELement} obj 获取样式的dom
			 * @param {String} prop 获取的属性名
			 * @returns {String} 对应的样式值
			 * @example
			 * //获取上边框
			 * EUI.getCurrentStyle(dom, ""border-top-width"");
			 */
			getCurrentStyle : function(obj, prop) {
				var index = null;
				if (obj.currentStyle) {
					prop = prop.replace(/-[a-z]/g, function($) {
						return $.charAt(1).toUpperCase();
					});
					index = obj.currentStyle[prop];
				} else if (window.getComputedStyle) {
					var cst = EUI.getWndOfDom(obj).getComputedStyle(obj, "");
					if (cst) {
						prop = prop.replace(/[A-Z]/g, "-$&").toLowerCase();
						index = cst.getPropertyValue(prop);
					}
				}
				return index;
			},
			/**
				* 执行DOM事件
				* @param {Element} node DOM
				* @param {String} evtType "click"
				*/
			execDomEvent : function(node, evtType) {
				try {
					if (node[evtType]) {
						node[evtType]();
					} else {
						var doc = node.ownerDocument, wnd = doc.parentWindow
								|| doc.defaultView;
						var evObj = doc.createEvent('MouseEvents');
						evObj.initMouseEvent(evtType, true, true, wnd);
						node.dispatchEvent(evObj);
					}
				} catch (e) {
				}
			},
			/**
			 * 获取键盘按键值
			 * @param {event} e
			 * @param {window} wnd
			 * @returns {String} keyCode
			 */
			getKeyCode : function(e, wnd) {
				wnd = wnd && typeof (wnd) == "object" ? wnd : window;
				if (!e)
					e = wnd.event;
				return e.keyCode;
			},
			/**
			 * 获取mouse下的目标对象
			 * @param {window} wnd
			 * @param {event} e
			 * @returns {Eleme} target
			 */
			getTarget : function(wnd, e) {
				wnd = wnd ? wnd : window;
				e = e ? e : wnd.event;
				if (!e)
					return null;
				return e.srcElement ? e.srcElement : e.target;
			},
			/**
			 * 获取mouse下的目标对象的id, 如果此对象没有id,则会返回一个空
			 * @param {event} e
			 * @param {window} wnd
			 * @returns {String} target的id
			 */
			getTargetId : function(e, wnd) {
				var target = EUI.getTarget(wnd, e);
				if (!target)
					return null;
				return target.id;
			},
			/**
				* 移动光标到指定的位置
				* @param {Element} p 需要移动光标的对象,如textarea对象
				* @param {Function} callback 回调事件,返回一个数值型, 回调事件将传入p的textRange对象
				* @return {textRange}
				*/
			moveCursorTo : function(p, callback) {
				if (typeof (p) != "object")
					return;
				var _pos = 0;
				var ctr = p.createTextRange();
				if (callback && typeof (callback) == "function")
					_pos = callback(ctr);
				ctr.moveStart("character", typeof (_pos) == "number" ? _pos : 0);
				ctr.collapse(true);
				ctr.select();
				return ctr;
			},
			/**
			 * 设置焦点
			 * @param {(String|Element)} focusid string时是id 需要设置焦点的dom
			 */
			setFocus : function(focusid) {
				if (typeof (focusid) == "string")
					focusid = document.getElementById(focusid);
				if (typeof (focusid) == "object") {
					try {
						focusid.focus();
					} catch (e) {
						//这里捕获异常，是因为当要获得焦点的输入框还没有显示时就设置焦点会出异常
					}
				}
			},
			/**
			 * 给dom绑定keydown事件，按键是回车时focusid的dom设置焦点
			 * @param {(String|ELement)} id string时是id
			 * @param {(String|ELement)} focusid string时是id， 需要焦点的dom
			 */
			onFocus : function(id, focusid) {
				if (id && typeof (id) == "string" && id.lenght > 0)
					id = document.getElementById(id);
				if (focusid && typeof (focusid) == "string" && focusid.lenght > 0)
					focusid = document.getElementById(focusid);
				if (typeof (id) != "object" || typeof (focusid) != "object")
					return;
				id.onkeydown = function(e) {
					if (!e)
						e = EUI.getWndOfDom(id).event;
					if (e.keyCode == 13) {
						try {
							focusid.focus();
						} catch (e) {
						}
					}
				};
			},
			/**
			 * 给dom绑定keydown事件，按键是回车时执行func
			 * @param {(String|ELement)} id string时是id
			 * @param {Function} func 按回车后执行的具体方法 
			 */
			onEnter : function(id, func) {
				if (id && typeof (id) == "string" && id.length > 0)
					id = document.getElementById(id);
				if (typeof (id) != "object")
					return;
				id.onkeydown = function(e) {
					if (!e)
						e = EUI.getWndOfDom(id).event;
					if (e.keyCode == 13) {
						if (typeof (func) == "function") {
							func();
						} else if (typeof (func) == "string") {
							eval(func);
						}
					}
				};
			},
			/**
			 * 判断指定两个节点是否是父子节点
			 * @param {ELement} pnode 父节点
			 * @param {Element} cnode 子节点
			 * @param {Boolean} same 是否允许相同，true时当两个节点相同则返回true，否则返回false
			 * @param {Number} level 指定最多向上查找level层，找不到就返回false，不指定则一直找到body那层
			 * @returns {Boolean}
			 */
			isChildNode : function(pnode, cnode, same, level) {
				if (!pnode || !cnode)
					return false;
				if (pnode === cnode)
					return !!same;
				level = parseInt(level);
				if (isNaN(level)) {
					do {
						cnode = cnode.parentNode;
						if (cnode === pnode)
							return true;
					} while (cnode);
				} else {
					do {
						cnode = cnode.parentNode;
						if (cnode === pnode)
							return true;
					} while (cnode && (--level) > 0);
				}
				return false;
			},
			/**
			 * 获取指定节点的下一个元素节点
			 * 建议使用该方法替换dom.nextElementSibling
			 * @param {Element} node
			 * @returns {Element}
			 * @example 
			 * EUI.getNextElementSibling(dom);
			 */
			getNextElementSibling : function(node) {
				var next = node.nextElementSibling;
				if (next)
					return next;
				next = node.nextSibling;
				while (next && next.nodeType !== 1) {
					next = next.nextSibling;
				}
				return next;
			},
			/**
			 * 获取屏幕的分辨率，设置缩放系数
			 * @param {window} wnd
			 */
			getZoomnumFromWin : function(wnd) {
				wnd = wnd ? wnd : window;
				var w = wnd.screen.width;//1366 1024
				//var h = wnd.screen.height;//768
				var zoomnum = 0;//0或者0.9~1~1.1均为不缩放 
				//参考标准 1024 * 768
				return zoomnum = w / 1024;
			},
			/**
			 * 获得dom元素的内容，只支持一部分dom
			 * @param {Element} dom 获取内容的dom
			 * @returns {String} 内容
			 */
			getDomValue : function(dom) {
				switch (dom.tagName.toUpperCase()) {
					case "INPUT":
					case "TEXTAREA":
						return dom.value;
					case "DIV":
					case "TD":
					case "A":
					case "SPAN":
					case "NOBR":
						return EUI.getTextContent(dom);
					case "SELECT":
						return dom.options[dom.selectedIndex].text;
					default:
						EUI.throwError(I18N.getString("eui.core.dom.js.errordom", "不能识别的dom元素"));
				}
			},
			/**
			 * 设置dom元素的内容,设置dom是否可编辑，只支持一部分dom
			 * @param {Element} dom 被设置的dom
			 * @param {String} value 设置的value
			 * @param {Boolean} enabled 是否可用
			 * @param {String} isSelectValue 给下拉框使用
			 */
			setDomValue : function(dom, value, enabled, isSelectValue) {
				switch (dom.tagName.toUpperCase()) {
					case "INPUT":
					case "TEXTAREA":
						if (value != null) {
							dom.value = value;
						}
						break;
					case "DIV":
					case "TD":
					case "A":
					case "SPAN":
					case "NOBR":
						if (value != null) {
							if (value == null || value.length == 0
									|| value.equalsIgnoreCase("null")) {
								EUI.setTextContent(dom, '');
							} else {
								EUI.setTextContent(dom, value);
							}
						}
						break;
					case "SELECT":
						if (value != null) {
							if (EUI.isNumber(value)) {
								dom.selectedIndex = value;
							} else {
								var options = dom.options;
								var len = options.length;
								var option;
								for (var i = 0; i < len; i++) {
									option = options[i];
									if ((isSelectValue ? option.value : option.text) == value) {
										dom.selectedIndex = i;
										break;
									}
								}
							}
						}
						break;
					default:
						EUI.throwError(I18N.getString("eui.core.dom.js.errordom", "不能识别的dom元素"));
				}
				if (EUI.isBoolean(enabled)) {
					dom.disabled = !enabled;
				}
			},
			/**
			 * 在ie中菜单，floatdiv和dialog后面都必须有一个iframe，这样就造成ie中有很多iframe，其实创建一个公共的iframe池就好了。
			 * 此函数每次返回一个可用的iframe
			 * @param {document} doc
			 */
			getBackGroundIFrame : function(doc) {
				if (!doc)
					doc = document;
				var ifms = doc.getElementsByTagName("iframe");
				var ifm;
				for (var i = 0; ifms && i < ifms.length; i++) {
					ifm = ifms[i];
					if (ifm.id == "SAN_BACKGROUND_IFRAME_ID"
							&& ifm.style.left == "-99999px" && ifm.style.top == "0px")
						return ifm;
				}
				ifm = doc.createElement("iframe");
				ifm.id = "SAN_BACKGROUND_IFRAME_ID";
				ifm.setAttribute('frameborder', '0', 0);
				ifm.setAttribute('marginheight', '0', 0);
				ifm.setAttribute('marginwidth', '0', 0);
				ifm.style.cssText += ";position:absolute; left:-99999px; top:0; zIndex:-1;";
				ifm.style.display = "";
				doc.body.appendChild(ifm);
				return ifm;
			},
			/**
			 * 显示或隐藏dom后面的iframe,如果是显示，则返回ifram
			 * @param {Element} dom iframe跟dom平级
			 * @param {Boolean} visible 显示还是隐藏
			 * @param {Element} extsize 额外的宽高，默认是dom的大小，设置改参数后就是  dom的宽度+extsize， dom的高度+extsize；
			 */
			showBackGroundIFrame : function(dom, visible, extsize) {
				if (!browser.isie)
					return;
				if (visible) {
					var ifm = dom._back_ground_iframe;
					if (!ifm)
						ifm = EUI.getBackGroundIFrame(dom.ownerDocument);
					if (ifm.parentNode != dom.parentNode) {
						ifm.parentNode.removeChild(ifm);
						dom.parentNode.appendChild(ifm);
					}
					extsize = parseInt(extsize, 10) || 0;
					var zIndex = EUI.getCurrentStyle(dom, "zIndex");
					var _sty = ifm.style;
					_sty.cssText += ";left: " + dom.offsetLeft + "px;top:" + dom.offsetTop + "px;width:" + (extsize + dom.offsetWidth) + "px;height:" + (extsize + dom.offsetHeight) +"px;";
					_sty.display = "";
					_sty.zIndex = EUI.isNumber(zIndex)? zIndex - 1: -1;
					dom._back_ground_iframe = ifm;
					ifm._in_used = true;
					return ifm;
				} else {
					var ifm = dom._back_ground_iframe;
					dom._back_ground_iframe = null;
					if (!ifm)
						return;
					ifm._in_used = false;
					var _sty = ifm.style;
					_sty.cssText += ";left: -99999px;top:0;width:0;height:0;z-index:0;";
					_sty.display = "";
					if (ifm.parentNode != ifm.ownerDocument.body) {
						ifm.parentNode.removeChild(ifm);
						ifm.ownerDocument.body.appendChild(ifm);
					}
				}
			},
			/**
			 * 设置dom中的文本是否选中
			 * @param {Element} container 包含文字的dom
			 * @param {(Boolean|String)} can 禁用的状态
			 * @example
			 * //设置只能选中文本
			 * EUI.disableDocTextSelect(dom, "text");
			 * //设置都能选中
			 * EUI.disableDocTextSelect(dom, "all");
			 * //禁止选中
			 * EUI.disableDocTextSelect(dom, "none");
			 * EUI.disableDocTextSelect(dom, false);
			 * EUI.disableDocTextSelect(dom);
			 * //不禁止文本选中
			 * EUI.disableDocTextSelect(dom, true);
			 */
			disableDocTextSelect : function(container, can) {
				container = container || document.body;
				if(EUI.isUndefined(can)){
//				给上默认值
					can = false;
				}
				//return false 表示没有进行设置
				if(container.getAttribute("_selectabletype_") === (EUI.isBoolean(can)?(can + ""):(can || ""))) return false;
				container.setAttribute("_selectabletype_", can);
				if (can === "text" || can === "all") {
					container.style.cssText += [ '; -moz-user-select:',
							'; -o-user-select: ', '; -khtml-user-select: ',
							'; -webkit-user-select: ', '; -ms-user-select:',
							'; user-select:', ';' ].join(can);
					if (browser.isie) {
						container.setAttribute("_selectable_", true);
						container.onselectstart = null;
					}
				} else {
					if (can = can && can !== 'none') {
						container.style.cssText = container.style.cssText
								.replace(
										/(?:[; ]+|^)(?:-moz-|-o-|-khtml-|-webkit-|-ms-)?(?:user-select):[^;]+(;|$)/gi,
										';');
						if (browser.isie) {
							container.removeAttribute("_selectable_");
							container.onselectstart = null;
						}
					} else {
						container.style.cssText += [ '; -moz-user-select:',
								'; -o-user-select: ', '; -khtml-user-select: ',
								'; -webkit-user-select: ', '; -ms-user-select:',
								'; user-select:', ';' ].join('none');
						if (browser.isie) {
							container.removeAttribute("_selectable_");
							container.onselectstart = function(evt) {
								if (!evt)
									evt = getWndOfDom(this).event;
								if (!evt)
									return;
								var target = evt.srcElement || evt.target;
								if (target.nodeType === 3)
									target = target.parentNode;
								if ([ "input", "textarea" ].indexOf(target.nodeName
										.toLowerCase()) !== -1)
									return;
								while (target !== this) {
									if (target.getAttribute("_selectable_"))
										return;
									target = target.parentNode;
								}
								return false;
							}
						}
					}
				}
			},
			/**
				* 设置光标的位置，pos从1开始
				* @param {Element} ctrl 为TextArea对象
				* @param {Number} pos 光标起始位置
				* @param {Number} end 光标结束位置 
				* @ftpye util.dom
				*/
			setCursorPosition : function(ctrl, pos, end) {
				if (ctrl.setSelectionRange) {
					ctrl.focus();
					ctrl.setSelectionRange(pos, end ? end : pos);
				} else if (ctrl.createTextRange) {
					var range = ctrl.createTextRange();
					range.collapse(true);
					range.moveEnd('character', end ? end : pos);
					range.moveStart('character', pos);
					range.select();
				}
			},
			/**
				* 在光标位置插入文本
				* @param {Element} edit 编辑输入框
				* @param {String} value 要插入的文本
				*/
			insertAtCursor : function(edit, value) {
				try {
					edit.focus();
				} catch (e) {
				}
				;
				if (document.selection) {
					// IE
					document.selection.createRange().text = value;
				} else if (edit.selectionStart || edit.selectionStart == 0) {
					// Firefox
					var oldSelectionStart = edit.selectionStart + value.length;
					edit.value = edit.value.substring(0, edit.selectionStart)
							+ value + edit.value.substring(edit.selectionEnd);
					edit.setSelectionRange(oldSelectionStart, oldSelectionStart);
				} else {
					// Other
					edit.value += value;
				}
			},
			/**
			 * 设置input或者textarea 框的内容全选
			 * @param {Element} dom input或者textarea
			 */
			selectValue : function(dom) {
				/*输入框如果是禁用的则不允许进行全选的操作*/
				if (dom.disabled)
					return;
				try {
					//控件如果是在没有显示的情况下进行焦点操作时会触发异常，所以这里需要进行异常的捕获*/
					// IRPT-19008 Chrome 版本41有这么一个BUG，输入框重复获取焦点会导致光标错位进而影响DOM位置
					if (!browser.isChrome) {
						dom.focus();
					}
					dom.select();
				} catch (e) {
				}
			},
			/**
			 * 设置当前dom的宽高为父节点宽高
			 * @param {String} dom的id
			 */
			maxDomSize : function(id) {
				var dom = document.getElementById(id);
				var p = dom.parentNode;
				//此处可能出现父dom的clientWidth=0，这时设置到dom上时会报错，所以为0时停止操作
				if (p.clientWidth == 0 || p.clientHeight == 0)
					return;
				if (dom.width == null) {
					dom.style.width = p.clientWidth;
					dom.style.height = p.clientHeight;
				} else {
					dom.width = p.clientWidth;
					dom.height = p.clientHeight;
				}
			},
			/**
			 * 添加table
			 * @private
			 * @param {document} doc
			 * @param {Element} pe 父节点 pe存在，就将table加入到pe
			 * @returns {Element} table
			 */
			appendTable : function(doc, pe) {
				var obj = doc.createElement("table");
				obj.border = 0;
				obj.cellPadding = 0;
				obj.cellSpacing = 0;
				return pe ? pe.appendChild(obj) : obj;
			},
			/**
			 * 添加tbody
			 * @private
			 * @param {document} doc
			 * @param {Element} table 父节点 table存在，就将tbody加入到table
			 * @returns {Element} tbody
			 */
			appendTbody : function(doc, table) {
				var obj = doc.createElement("tbody");
				return table ? table.appendChild(obj) : obj;
			},
			/**
			 * 添加tr
			 * @private
			 * @param {document} doc
			 * @param {Element} tbody 父节点 tbody存在，就将tr加入到tbody
			 * @returns {Element} tr
			 */
			appendRow : function(doc, tbody) {
				var obj = doc.createElement("tr");
				return tbody ? tbody.appendChild(obj) : obj;
			},
			/**
			 * 添加td
			 * @private
			 * @param {document} doc
			 * @param {Element} row 父节点 TR存在，就将td加入到tr
			 * @returns {Element} TD
			 */
			appendCell : function(doc, row) {
				var obj = doc.createElement("td");
				return row ? row.appendChild(obj) : obj;
			},
			/**
			 * 返回活动单元格
			 * @returns {Element} 单元格
			 */
			getActiveTdElement : function() {
				if (!browser.isie) return null;
				var e = document.activeElement;
				if (!"TD".equalsIgnoreCase(e.tagName)) {
					e = e.parentElement;
					if (e && !"TD".equalsIgnoreCase(e.tagName)) {
						e = e.parentElement;
						if (e && !"TD".equalsIgnoreCase(e.tagName))
							return null;
					}
				}
				return e;
			},
			/**
			 * 分析表元名，返回行列号
			 * @param {String} name 表元名
			 * @returns {Array} 返回行列 [行号， 列号]
			 * @example
			 * //[0, 9]
			 * EUI.getRowColFromName("A10");
			 */
			getRowColFromName : function(name) {
				var col = -1;
				var len = name.length;
				var i = 0;
				for (; i < len; i++) {
					var c = name.charCodeAt(i);
					if (c <= 57 && c >= 48)
						break;

					col = (col + 1) * 26 + (c - 65);
				}
				var row = i - 1 < len ? parseInt(name.substring(i)) - 1 : -1;//i不应再减去1
				return [ row, col ];
			},
			/**
			 * 根据名字获取行号
			 * @returns {Number} 行号 基数是0
			 * @example
			 * //0
			 * EUI.getRowFromName(A10);
			 */
			getRowFromName : function(name) {
				return EUI.getRowColFromName(name)[0];
			},
			/**
			 * 根据名字获取列号
			 * @returns {Number} 列号 基数是0
			 * @example
			 * //9
			 * EUI.getColFromName(A10);
			 */
			getColFromName : function(name) {
				return EUI.getRowColFromName(name)[1];
			},
			/**
			* 获取事件发生时Alt/Shift/Ctrl键按下情况
			* @param {event} evt
			* @return {Number} 1位数字，转换成二进制就变成3位数，能够表示按键情况, 0表示没有按下，1表示按下；三位顺序是：【Alt】【Shift】【Ctrl】； 
			* @example 
			* 7--二进制--> 111, 【Alt】按下 【Shift】按下 【Ctrl】按下
			* 1--二进制--> 001, 【Alt】未按下 【Shift】未按下 【Ctrl】按下
			*/
			getEventSpecialKey : function(evt) {
				if (!evt) {
					return 0;
				}
				var keyByte = 0;
				if (evt.ctrlKey) {
					keyByte = keyByte | 1;
				}
				if (evt.shiftKey) {
					keyByte = keyByte | 2;
				}
				if (evt.altKey) {
					keyByte = keyByte | 4;
				}
				return keyByte;
			},

			/**
			* 根据字符串创建方法
			* @param {String} evtstr 方法字符串
			* @param {Object} option 可选项
			* @description 该方法用于根据所传字符串返回相应的方法，其参数规则为：
			* 		a. evtstr为字母组成(中间可以有“.”分隔), 此时option["objs"]为要查找范围，缺省为window.
			* 			如: createEventHandler("AAA.BBB", {objs: C}) 则会返回 C.AAA.BBB 或 null(C.AAA不存在或C.AAA.BBB不存在)
			* 		b. evtstr为"function("开头, 则返回该字符串的JS方法.
			* 			如: createEventHandler("function(){ alert('Hello, world!'); }") 将返回方法 function(){ alert('Hello, world!'); }
			* 		c. 其它则默认将所传字符串作为返回方法的方法体, 此时option["args"]为返回方法的参数名称
			* 			如: createEventHandler("alert('Hello, world!')", {args: ['arg0', 'arg1']}) 将返回 function(arg0, arg1){ alert('Hello, world!'); }
			* @returns {Function} 创建的方法
			*/
			transStr2Function : function(evtstr, option) {
				var getHandler = function(obj, names) {
					names = names.split('.');
					for (var i = 0, len = names.length; obj && i < len; i++) {
						obj = obj[names[i]];
					}
					return typeof (obj) == 'function' ? obj : null;
				};
				transStr2Function = function(evtstr, option) {
					if (!evtstr)
						return null;
					var type = typeof (evtstr);
					if (type != 'string')
						return type == 'function' ? evtstr : null;
					if (!evtstr.trim())
						return null;
					var func = null;
					try {
						if (/^\w+(\.\w+)*$/.test(evtstr)) {
							var objs = null;
							if (option) {
								objs = option["objs"];
							}
							if (!objs) {
								objs = [ window ];
							} else if (!EUI.isArray(objs)) {
								objs = [ objs ];
							}
							for (var i = 0, len = objs.length; !func && i < len; i++) {
								func = getHandler(objs[i], evtstr);
							}
						} else {
							evtstr = evtstr.replace(/^\/\/.*(\r\n|\n|$)/mg, '');
							if (/^function\s*\(/.test(evtstr)) {
								func = window.eval('(function(){\r\n return ' + evtstr
										+ '\r\n})()');
							} else {
								var args = null;
								if (option) {
									args = option["args"];
								}
								if (!args) {
									args = [ 'p' ];
								} else if (Object.prototype.toString.call(args) != '[object Array]') {
									args = [ args ];
								}
								args.push(evtstr);
								func = Function.apply(this, args);
							}
						}
					} catch (e) {
						e.message = I18N.getString(
								"eui.core.dom.js.wrongis", "错误：")
								+ '<span style="color: red">'
								+ e.message
								+ '</span>\r\n'
								+ '<div style="padding: 0px 30px;color:#666">'
								+ I18N.getString(
										"eui.core.dom.js.checkformat",
										"请检查自定义事件格式，内容如下：")
								+ '\r\n'
								+ '<pre style="padding: 3px 10px;color: #333;font-family:Verdana !important">'
								+ evtstr + '</pre></div>';
						EUI.showError(e);
					}
					return func || null;
				};
				return transStr2Function(evtstr, option);
			},
			/**
			* 返回指定xml结点内的文本内容
			* @param {XMLElement} p
			* @return {String}
			* @example
			* //<item>This's test item.</item>
			* EUI.getTextContent4Xml(item);
			*/
			getTextContent4Xml : function(p) {
				if (!p)
					return null;
				return (browser.isie ? (p.text || p.nodeTypedValue || p.textContent)
						: p.textContent)
						|| "";
			},
			/**
			 * 返回xml结点的序列化结果
			 * @param {XMLElement} nodenode为xml结点
			 * @param {String} charset 编码格式 xml文件头中的编码标识
			 * @returns {String} 序列化之后的xml字符串
			 */
			serialize2String : function(node, charset) {
				var xmlrs = charset ? "<?xml version=\"1.0\" encoding=\""
						+ charset + "\"?>" : "", xmlstr;
				try {
					xmlstr = new XMLSerializer().serializeToString(node);
				} catch (e) {
					xmlstr = node.xml;
				}
				if (EUI.isString(xmlstr) && xmlstr.startsWith("<?")) {
					xmlstr = xmlstr.substring(xmlstr.indexOf("<", 1));
				}
				return xmlrs + xmlstr;
			},
			/**
				* 从指定xmlnode上获取属性值
				* @param {XMLElement} xmlnode 可以是xml文字串或者xml对象
				* @param {String} name 属性名
				* @param {String} defvalue 缺省值，当没有获取到属性的值时就用缺省值
				* @returns {String} 获取的值
				*/
			getXmlNodeProperty : function(xmlnode, name, defvalue) {
				if (!xmlnode)
					return;
				if (typeof (xmlnode) == "string")
					xmlnode = EUI.loadXMLString(null, xmlnode);
				var rs = xmlnode.getAttribute(name);
				return rs ? rs : defvalue;
			},
			/**
				* 创建Img元素
				* @param {String} imgurl 图片链接
				* @param {Element} pdom 父DOM对象
				* @return {Element} Img元素
				*/
			createPngImg : function(imgurl, pdom) {
				var rs = document.createElement("img");
				rs.src = img;
				rs.border = 0;
				return pdom ? pdom.appendChild(rs) : rs;
			},
			/**
			 * 将对象p里的innerHTML设为editdom的值
			 * @param {(String|Element)} p 源dom， 可以是id
			 * @param {(String|Element)} editdom 目标dom， 可以是id
			 * @param {Boolean} isExtInfo=false 是否从源dom的【extInfo】熟悉上获取值， false从【innerHTML】上获取
			 * @example
			 * EUI.InnerHTML2Edit("id1", "id2");
			 */
			InnerHTML2Edit : function(p, editdom, isExtInfo) {
				if (typeof (p) == "string" && p.length > 0)
					p = document.getElementById(p);
				if (typeof (editdom) == "string" && editdom.length > 0)
					editdom = document.getElementById(editdom);
				if (typeof (editdom) == "object" && editdom.tagName
						&& "INPUT".equalsIgnoreCase(editdom.tagName)
						&& typeof (p) == "object") {
					isExtInfo = EUI.parseBool(isExtInfo, false);
					editdom.style.color = "#000000";
					editdom.value = isExtInfo ? p.extInfo : p.innerHTML;
				}
			},
			/**
			* 创建一个以input为基本元素的其它DOM元素,例如文本输入框,按钮,多选框,单选框,密码输入框
			* @deprecated 推荐使用eform模块创建表单元素
			* @param {document} doc 对象
			* @param {String} type 类型
			* @param {string} name  名字
			* @param {(String|Number)} initValue 初始值
			* @param {Boolean} ischecked 是否处于选中状态,针对checkbox,radiobutton
			* @return 返回生成的DOM对象
			* @example
			* EUI.inputElement(document, "text", "type", 1);
			*/
			inputElement : function(doc, type, name, initValue, ischecked) {
				doc = doc ? doc : document;
				/*没有指定type时，缺省为文本输入框text*/
				type = !type ? "text" : type.toLowerCase();
				var canChecked = type == "radio" || type == "checkbox";
				var _chk = typeof (ischecked) == "boolean" ? ischecked : false;
				var id = EUI.idRandom(type);

				/**
					* innerHTML创建DOM比createElement要高效些，这样也可以减少浏览器的判断操作（Firefox也支持innerHTML），使代码简洁些
					* 原先对过createElement后再appendChild时，如创建5000个时平均消耗内存448K左右，改为innerHTML的静态方式来创建5000个时平均消耗内存仅40K左右
					* 虽然在内存消耗上很明显，但并不是说以后在创建元素时就用innerHTML，因为innerHTML会影响开发效率和增加维护成本，所以在使用时要权衡
					*/
				var tmp = doc.createElement("div");
				tmp.innerHTML = "<input type=\"" + type + "\" name=\""
						+ (name ? name : id) + "\" id=\"" + id + "\""
						+ (canChecked && _chk ? " checked" : "")
						+ (initValue ? " value=\"" + initValue + "\"" : "") + "/>";
				var t = tmp.firstChild;
				tmp = null;
				return t;
			},
			/**
			 * 创建button元素
			 * @param {document} doc 当前窗口的document
			 * @param {document} text 按钮文字
			 * @param {String} type=button  按钮类型
			 * @param {Function} click 点击事件
			 * @param {String} cls 按钮风格
			 * @returns {Element} Button 
			 * @example
			 * EUI.buttonElement(document, "点我", "buttom", function(){}, "eui-btn-primary");
			 */
			buttonElement : function(doc, text, type, click, cls) {
				var tmp = doc.createElement("div");
				tmp.innerHTML = '<button class="eui-btn ' + (cls || "") + '" type="' + (type || "button") + '">'
						+ (text || '') + '</button>';
				var btn = tmp.firstChild;
				tmp = null;
				if (click)
					btn.onclick = click;
				return btn;
			},
			/**
			* 显示信息
			* @param {ELement} dom为显示的位置
			* @param {String} icon图标
			* @param {String} msg简略信息
			* @param {String} detaillogs详细的信息
			*/
			showHintMessage : function(dom, icon, msg, detaillogs) {
				var doc = document;
				var parentElement = typeof (dom) == "string" ? doc
						.getElementById(dom) : (typeof (dom) == "object" ? dom
						: doc.body);
				if (parentElement._showmessage == null) {
					var table = doc.createElement("table");
					table.border = 0;
					table.cellSpacing = 2;
					table.cellPadding = 0;
					table.style.cssText += ";width:100%; border:1px dashed #aca899; background-color:#fffff1;";
					var row = table.insertRow(-1);
					var cell = row.insertCell(-1);
					cell.vAlign = "top";
					cell.style.cssText += ";height:1%; padding:2px; background-color:#ffcccc;";

					// 图片
					var img = cell.appendChild(doc.createElement("img"));
					img.align = "absMiddle";
					img.style.cssText += ";float:left;";
					if (icon != null) {
						src = icon;
					} else {
						src = "ebi/images/warning.gif";
					}
					img.onclick = function() {
						eval("hideHintMessage(parentElement)");
					}
					table.img = img;

					// 连接
					var a = cell.appendChild(doc.createElement("a"));
					// 有详细信息时显示
					a.className = "Blink";
					a.href = "javascript:;";
					a.style.cssText += ";float:left;";
					a.onclick = function() {
						var style=a.parentNode.parentNode.parentNode.parentNode.rows[1].style;
						style.display=style.display=='none'?'':'none';
					}
					table.a = a;

					// 没有详细信息时显示
					var div = cell.appendChild(doc.createElement("div"));
					table.text = div;

					// 显示详细内容
					row = table.insertRow(-1);
					table.row = row;
					row.style.display = "none";
					cell = row.insertCell(-1);
					cell.vAlign = "top";
					cell.style.cssText += ";height:150px;padding:2px;";
					div = cell.appendChild(doc.createElement("div"));
					div.style.cssText += ";position:relative; width:100%; height:100%; overflow:hidden;";
					div = div.appendChild(doc.createElement("div"));
					div.style.cssText += ";position:absolute; width:100%; height:100%; overflow:auto;";
					table.detail = div;
					// 显示详细信息

					parentElement._showmessage = table;
					// 属性img,text,a,row,detail
					parentElement.appendChild(table);
				}

				var setvalue = function(dom, value) {
					if (value == null || value.length == 0) {
						dom.innerHTML = "&nbsp;";
					} else {
						EUI.setTextContent(dom, value);
					}
				}
				var table = parentElement._showmessage;
				if (detaillogs == null) {
					table.a.style.display = "none";
					table.text.style.display = "";
					setvalue(table.text, msg);
				} else {
					table.a.style.display = "";
					table.text.style.display = "none";

					setvalue(table.a, msg);
					setvalue(table.detail, detaillogs);
				}
				table.row.style.display = "none";
				table.style.display = "";
			},
			/**
			 * 隐藏showHintMessage显示的信息
			 */
			hideHintMessage : function(dom) {
				var parentElement = typeof (dom) == "string" ? document
						.getElementById(dom) : (typeof (dom) == "object" ? dom
						: this.doc.body);
				if (parentElement._showmessage != null) {
					parentElement._showmessage.style.display = "none";
				}
			},
			/**
			 * 在指定的wnd中创建一个隐藏的iframe，然后让iframe的src指向url，当url后面的参数的长度超出ie(2kb)限制时，那么用get方式提交不了，必须
		   * 改为用post方式提交，params里面是MAP类型，里面存储参数名和参数值，wnd如果不传递则使用当前的window
			 * @param {String} url 请求的url
			 * @param {window} 对应的窗口 
			 * @param {EUI.Map} params 请求参数
			 */
			openIframeUrl : function(url, wnd, params) {
				var contextPath = EUI.getContextPath();
				url = url.ensureStartWith(contextPath);
				wnd = wnd || EUI.getRootWindow();
				var doc = wnd.document, body = wnd.document.body, hef = new EUI.HtmlElementFactory(
						wnd), rs = wnd["__OpenIframeUrlForm__"];
				if (!rs) {// 不存在唯一的则创建它
					rs = wnd["__OpenIframeUrlForm__"] = body.appendChild(hef.form(
							"$openIframeUrlForm", null, "post", null, true));
					rs.style.display = "none";
				}
				var iframeDoc = rs.getIFrame().contentWindow.document;
				if (browser.isie && iframeDoc.charset.toLowerCase() != "utf-8") {
					iframeDoc.charset = "utf-8";
				}
				var count = rs.childNodes.length;
				if (count > 0) {
					/*在使用前先清空表单中设置的历史参数*/
					var pnode;
					for (var i = count - 1; i >= 0; i--) {
						// 删除节点时不能顺序删除,删除节点后该节点后的位置就变化了.一般是采用倒序删除
						pnode = rs.childNodes[i];
						if (pnode.nodeType != 1
								|| pnode.tagName.toLowerCase() == "iframe")
							continue;
						rs.removeChild(pnode);
					}
				}
				rs.setAction(url);
				if (params) {
					/*指定了参数时，将向表单中添加参数*/
					var keys = params.keySet();
					var key;
					for (var i = 0, len = keys.length; i < len; i++) {
						key = keys[i];
						if (!key)
							continue;
						rs.appendChild(hef.hidden(params.get(key), key));
					}
				}
				// 进行表单提交
				rs.submit();
			},
			/**
			* 自动的无提示关闭浏览器窗口
			* @param {window} wnd
			* @example
			* EUI.autoCloseBrowser(window);
			*/
			autoCloseBrowser : function(wnd) {
				if (!wnd || !wnd.navigator)
					wnd = window;
				wnd.close();
			},
			/**
			* 添加一条垂直线
			* @param {document} doc
			* @param {ELement} parentElement 父节点
			* @param {(Number|String)} size 高度 像素值、百分比
			* @param {String} color=#ACA899 颜色
			* @param {Boolean} notInner=false 是否需要创建一个内层垂直线
			* @return {Element} 创建好的垂直线dom
			* @example 
			* EUI.addVerticalLine(doc, dom, 50, "#cccccc", false);
			* EUI.addVerticalLine(doc, dom, "50px", "#cccccc", false);
			* EUI.addVerticalLine(doc, dom, "20%", "#cccccc", false);
			*/
			addVerticalLine : function(doc, parentElement, size, color, notInner) {
				notInner = EUI.parseBool(notInner, false);
				var _color = typeof (color) == "string" && color.length > 0 ? color
						: "#ACA899";
				var lineContainer = doc.createElement("div");
				if (_color == "#ACA899") {
					lineContainer.className = "verticalline_container verticalline_container_color";
				} else {
					lineContainer.className = "verticalline_container";
					lineContainer.style.borderLeftColor = _color;
				}
				lineContainer.style.height = size ? (EUI.isNumber(size)? size
						+ "px" : size) : "100%";
				if (!notInner) {
					var line = lineContainer.appendChild(lineContainer.cloneNode(false));
					line.className = "verticalline_line_notinner";
				}
				return parentElement ? parentElement.appendChild(lineContainer)
						: lineContainer;
			},
		  /**
			 * 获取relEl对象上绑定的_sancomponent 对象，会向父节点循环
			 * @param {Element} relEl 
			 * @param {Constructor} [classobj] 判断对象的类型
			 * @return {Object}
			 * @example
			 * EUI.getEComponentByDom(dom, ETree);
			 */
			getEComponentByDom : function(relEl, classobj) {
				//实现调整 优化
				if (!relEl)
					return null;
				var isnull = !classobj, isfunc = !isnull
						&& EUI.isFunction(classobj), sancomponent = null;
				while (relEl) {
					if (sancomponent = relEl._sancomponent) {
						if (isnull
								|| (isfunc ? sancomponent instanceof classobj
										: typeof (sancomponent[classobj]) == "function")) {
							return sancomponent;
						}
					}
					relEl = relEl.parentNode;
				}
			},
			/**
			 * 设置标签的图标
			 * @param {Element} dom 需要设置图标的dom
			 * @param {String} icon 图片路径、字体图标的编码
			 * @example
			 * //设置字体图标
			 * EUI.setTagIcon(dom, "&#xe0ca;");
			 * //设置图片
			 * EUI.setTagIcon(dom, "eui/images/icon/ok.png");
			 */
			setTagIcon: function(dom, icon){
				if(!icon){
					//清空潜在的字体图标
					dom.innerHTML = "";
					return;
				}
				if(/^.+\.\w{2,4}$/.test(icon)){
					//图片路径
					EUI.addClassName(dom, "eui-icon-img");
					//清空潜在的字体图标
					dom.innerHTML = "";
					dom.style.backgroundImage = "url('" + EUI.formatUrl(icon) + "')";
					return;
				}
				//先清空， 字体图标或者是背景图片
				dom.style.backgroundImage = "";
				EUI.removeClassName(dom, "eui-icon-img");
				if(icon.startsWith("svg-")){
					dom.innerHTML = '<svg class="eui-icon-svg" aria-hidden="true"><use xlink:href="#eui-icon-' + icon + '"></use></svg>';
				} else if(icon.startsWith("#")){
					dom.id = icon.substring(1);
				} else if(icon.startsWith(".")){
					EUI.addClassName(dom, icon.substring(1));
				} else if(/^&#\w{5};$/.test(icon) || icon.length === 1){
					//"" 是xml 解析过了，所以没有编码
					//这里判断是字体图标才做设置
					dom.innerHTML = icon;
				}
			},
			/**
			 * 获取滚动条的宽度
			 * @returns {Number}
			 */
			getScrollbarWidth: function(){
				if(!EUI.isNumber(_domscrollwidth)){
					_getDomscrollwidth();
				}
				return _domscrollwidth || 0;
			},

// 以下是私有方法， 不建议调用

			/**
			* 获取<style ...>..</style>区块的内容，参数p为包含样式区块的数组
			* @param {} p
			* @private
			*/
			_styles2String4HtmlContent : function(p) {
				if (!p || p.length < 1)
					return "";
				var rs;
				var tmp;
				for (var i = 0; i < p.length; i++) {
					tmp = p[i];
					if (!rs)
						rs = [];
					rs.push(tmp.substring(tmp.indexOf(">") + 1, tmp
							.indexOf("</style>")))
				}
				return rs.join("\n");
			},
			/**
			* 将串中有<script src="..."></script>引用的脚本，通过sys.lib.include装入，参数p指定的是Html串内容
			* @param {*} p
			* @private
			*/
			_sysIncludeJs4HtmlContent : function(p) {
				if (!p)
					return;
				// 提取src=中内容的正则表达式
				var _exp = /src=("|')([^\"]*?.js)("|')/gi
				var _scripts = p.match(_exp);
				var tmp;
				for (var i = 0; _scripts && i < _scripts.length; i++) {
					tmp = _scripts[i];
					EUI.include(tmp.substring(5, tmp.length - 1));
				}
			},
			/**
			*  @private
			*/
			_getMouseEventTarget : function(e) {
				return e.srcElement ? e.srcElement : e.target;
			},
			/**
			* 获取水平和竖直边框大小
			* @param dom
			* @param idx
			* @private
			*/
			_getBorderSize : function(dom, idx) {
				var names = [ "borderTopWidth", "borderRightWidth",
						"borderBottomWidth", "borderLeftWidth" ];
				return (parseInt(EUI.getCurrentStyle(dom, names[idx])) || 0)
						+ (parseInt(EUI.getCurrentStyle(dom, names[idx + 2])) || 0);
			},
			/**
			* 根据鼠标事件获得鼠标事件所在的元素所属的EComponent类 参数classobj可以不传递，如果传递了，比如：EFloatDiv
			* ，那么此函数返回e所在地dom所属的第一个EFloatDiv
			* @private
			*/
			_getMouseEventEComponent : function(e, classobj) {
				var relEl;
				if (!e.target) {
					if (e.type == "mouseover")
						relEl = e.fromElement;
					else if (e.type == "mouseout")
						relEl = e.toElement;
					else
						relEl = e.srcElement;
				} else
					relEl = e.target;
				try {
					return EUI.getEComponentByDom(relEl, classobj);
				} catch (ex) {
					return null;
				}
			},
				/**
				* 还原上级隐藏的DOM
				* @private
				* @param hiddens
				* @returns {Boolean}
				*/
			_recoverHiddenParents : function(hiddens) {
				if (!hiddens)
					return;
				for (var i = 0, len = hiddens.length; i < len; i++) {
					var hide = hiddens[i];
					hide["dom"].style.display = hide["disp"];
				}
				return true;
			},
				/**
				* 显示所有上级隐藏的DOM
				* 经常遇到要调整某个DOM的位置或大小，但如果其上级某个节点处于隐藏状态，则会导致位置和大小不正确，
				* 使用该方法先将那些隐藏的DOM暂时显示，然后调用_recoverHiddenParents进行还原。
				* @private
				* @param dom
				* @returns {Array}
				*/
				_getHiddenParents : function(dom) {
					var rt = [], STYLE_NAME = "display", STYLE_VALUE = "none";
					while (dom && dom.nodeType === 1) {
						if (STYLE_VALUE === EUI.getCurrentStyle(dom, STYLE_NAME)) {
							rt.push({
								dom : dom,
								disp : dom.style.display
							});
							dom.style.display = 'block';
						}
						dom = dom.parentNode;
					}
					return rt;
				},
				/**
				* 获取水平和竖直padding大小
				* @private
				* @param dom
				* @param idx
				*/
				_getPaddingSize : function(dom, idx) {
					var names = [ "paddingTop", "paddingRight", "paddingBottom",
							"paddingLeft" ];
					return (parseInt(EUI.getCurrentStyle(dom, names[idx])) || 0)
							+ (parseInt(EUI.getCurrentStyle(dom, names[idx + 2])) || 0);
				}
		});

	EUI.DomUtil = (function($, _) {
		var CHAR_NEWLINE = '\r\n', CHAR_TAB = '\t', CHAR_BLANK = ' ', CHAR_EQU = '=', CHAR_QUOT = '\'', CHAR_LT = '<', CHAR_LTR = '</', CHAR_GT = '>', CHAR_GTR = '/>', CDATA_BEGIN = '<![CDATA[', CDATA_END = ']]>';
		function getSpace(num) {
			return CHAR_NEWLINE + (new Array((num || 0) + 1).join(CHAR_TAB));
		}
		function saveCDATA(array, value, index) {
			var space = getSpace(index || 0);
			array.push(space, CDATA_BEGIN, CHAR_NEWLINE, value, space, CDATA_END);
		}

		function saveAttr(array, name, value) {
			array.push(CHAR_BLANK, name, CHAR_EQU, CHAR_QUOT, value.toHTML(),
					CHAR_QUOT);
		}
		function saveTag(array, tagName, index, attributes, options) {
			if (!array)
				array = [];
			var space = getSpace(index);
			array.push(space, CHAR_LT, tagName);
			if (attributes) {
				for (var i = 0, attr = null, len = attributes.length; i < len; i++) {
					attr = attributes[i];
					saveAttr(array, attr["name"], attr["value"]);
				}
			}
			array.push(CHAR_GT);
			var startLen = array.length, childLen = 0;
			if (options) {
				var func = options["func"], args = options["args"] || [];
				if (typeof (func) === 'function') {
					if (args[0] !== array)
						args.unshift(array);
					func.apply(options["scope"], args);
				}
				childLen = array.length - startLen;
				if (!childLen && options["fulltag"])
					childLen = 1;
			}
			if (!childLen) {
				array.pop();
				array.push(CHAR_GTR);
				return array;
			}
			if (childLen != 1)
				array.push(space);
			array.push(CHAR_LTR, tagName, CHAR_GT);
			return array;
		}

		var r_blankhtml = /\r|\n|\t/g;

		function doSaveChild(htmls, node, index, filter) {
			var childNode = node.firstChild, gt_one = index && childNode
					&& (childNode.nextSibling !== null);
			while (childNode) {
				doSaveNode(htmls, childNode, index, filter, gt_one);
				childNode = childNode.nextSibling;
			}
		}

		function doSaveNode(htmls, node, index, filter, _) {
			if (typeof (filter) === "function" && filter(node, _) === false)
				return;
			switch (node.nodeType) {
				case 1:
					saveTag(htmls, node.tagName.toLowerCase(), index, node.attributes, {
						func : doSaveChild,
						args : [ htmls, node, index + 1, filter ],
						scope : this
					});
					break;
				case 3:
					var nodeValue = node.nodeValue.replace(r_blankhtml, '');
					if (nodeValue) {
						if (_ === true)
							htmls.push(getSpace(index));
						htmls.push(nodeValue.toHTML());
					}
					break;
			}
		}

		function getChildHTML(node, filter) {
			var htmls = [];
			doSaveChild(htmls, node, 0, filter);
			return htmls.join('');
		}
		;

		function getNodeHTML(node, filter) {
			var htmls = [];
			doSaveNode(htmls, node, 0, filter);
			return htmls.join('');
		}

		return {
			getNodeHTML : getNodeHTML,
			getChildHTML : getChildHTML
		};
	})(window, "DomUtil");

}(window, EUI)


+ function(namespace, EUI){
  "use strict";
var rootWindow = EUI.getRootWindow(),
	global = null;

//将全局对话框的存储变藏起来，外界只能通过getGlobalDlg、setGlobalDlg操作
//引入对话框对象
if(namespace === rootWindow){
	global = {};
}

/**
 * 将全局对话框放到
 * @private
 * @param {String} id 
 */
EUI.getGlobalDlg = function(id){
	if(namespace !== rootWindow){
		return rootWindow.EUI.getGlobalDlg(id);
	}
	return global[id];
};

/**
 * 将根窗口的对话框对象，放到列表中，方便下次取用
 * 并进行了销毁注册
 * @private
 * @param {String} id 
 * @param {EDialog} dialog 
 */
EUI.setGlobalDlg = function (id, dialog){
	if(namespace !== rootWindow){
		rootWindow.EUI.setGlobalDlg(id, dialog);
	}else {
		var dlg = global[id];
		if(dlg)return;
		EUI.addDispose(dialog, namespace);
		global[id] = dialog;
	}
};

/**
 * 获取全局提供的 rootwindow上的公共对话框
 * @private
 * @param {Object} options 
 * @param {String} options.objectName 对象名
 * @param {String} options.id 唯一ID 缓存
 * @param {Function} options.onfinish 点击确定或者对象提供的确定事件
 * @param {Boolean} options.notShowWait  是否不显示等待框
 */
function getRootDefaultDlg(options){
	var rootEUI = rootWindow.EUI,
		id = options.id,
		objectName = options.objectName,
		onfinish = options.onfinish,
		dlg = rootEUI.getGlobalDlg(id),
		rootwnd = options.wnd;
	if(!dlg){
		var dialogs = rootWindow.require("eui/modules/edialog"),
			constructor = dialogs[objectName];
		if(constructor){
			dlg = rootwnd ? new constructor({wnd:rootwnd}) : new constructor();
			rootEUI.setGlobalDlg(id, dlg);
			if(rootEUI.isFunction(onfinish)){
				onfinish(dlg);
			}
		}else {
			console.error(I18N.getString("eui.core.dlgs.js.noentity","不存在对象【{0}】",[objectName]));
		}
	}else{
		if(rootEUI.isFunction(onfinish)){
			onfinish(dlg);
		}
	}
	return dlg;
};

/**
 * 获取全局提供的 放在rootwindow上的公共对话框，
 * 
 * 1、当对话框在多个界面使用时，才允许使用该方法，复用性高；当rootwindow销毁时，才销毁该对话框
 * 2、当对话框只在一个界面使用时，请不要使用该方法，且销毁界面时一起销毁对话框，不复用
 * 
 * @param {Object} options 
 * @param {String} options.objectName 对象名
 * @param {String} options.id 唯一ID 缓存
 * @param {(String|Array[])} options.jssrc  js文件模块名,
 * 		可以是字符串："eui/modules/elist,eui/modules/edialog"，多个js采用逗号分隔
 * 		可是是数组：["eui/modules/elist,eui/modules/edialog"]
 * @param {Boolean} issync=false  true-同步加载js，false-异步加载，默认异步加载
 * @param {Function} options.onfinish 创建好对象的回调事件
 */
function getRootUserDlg(options){
	var rootEUI = rootWindow.EUI,
		id = options.id,
		jssrc = options.jssrc || [],
		issync = rootEUI.parseBool(options.issync, false),
		onfinish = options.onfinish,
		dlg = rootEUI.getGlobalDlg(id);
	if(!dlg){
		if(EUI.isString(jssrc)) jssrc = jssrc.split(",");
		if(issync) {
			//同步
			var objectArr = [];
			for(var i=0, len = jssrc.length; i<len; i++) {
				var object = rootWindow.require(jssrc[i]);
				objectArr.push(object);
			}
			options.objects = objectArr;
			createObjectFromParam(options);
		} else {
			//异步
			rootWindow.require(jssrc, function(){
				options.objects = arguments;
				createObjectFromParam(options);
			});
		}
	}else{
		if(rootEUI.isFunction(onfinish)){
			onfinish(dlg);
		}
	}
	return dlg;
};

/**
 * 从对象组中找到对象，并创建，是给getRootUserDlg方法使用的
 * 
 * @private
 * @param {Object} options 
 */
function createObjectFromParam(options){
	var rootEUI = rootWindow.EUI, id = options.id, objects = options.objects,
	objectName = options.objectName, onfinish = options.onfinish;
	var constructor = null;
	for(var i=0, len = objects.length; i<len; i++) {
		var object = objects[i];
		if(object[objectName]) {
			constructor = object[objectName];
			break;
		}
	}
	if(constructor){
		var dlg = new constructor();
		rootEUI.setGlobalDlg(id, dlg);
		if(rootEUI.isFunction(onfinish)){
			onfinish(dlg);
		}
	}else {
		console.error(I18N.getString("eui.core.dlgs.js.noentity","不存在对象【{0}】",[objectName]));
	}
};

EUI.extendObj(EUI, {

	/**
	 * 获取全局提供的 放在rootwindow上的公共对话框，
	 * 
	 * 1、当对话框在多个界面使用时，才允许使用该方法，复用性高；当rootwindow销毁时，才销毁该对话框
	 * 2、当对话框只在一个界面使用时，请不要使用该方法，且销毁界面时一起销毁对话框，不复用
	 * 
	 * @param {Object} options 
	 * @param {String} options.objectName 对象名
	 * @param {String} options.id 唯一ID 缓存
	 * @param {(String|Array[])} options.jssrc  js文件模块名,
	 * 		可以是字符串："eui/modules/elist,eui/modules/edialog"，多个js采用逗号分隔
	 * 		可是是数组：["eui/modules/elist,eui/modules/edialog"]
	 * @param {Boolean} issync=false  true-同步加载js，false-异步加载，默认异步加载
	 * @param {Function} options.onfinish 创建好对象的回调事件
	 * @example
	 * 	EUI.getRootUserDlg({
	 * 		objectName : "EInputDialog",
	 * 		id : "__EInputDialog__",
	 * 		jssrc : ["eui/modules/elist", "eui/modules/edialog"],
	 * 		onfinish : function(dlg) {
	 * 			dlg.open();
	 * 		}
	 * 	});
	 */
	getRootUserDlg : getRootUserDlg,
	
	/**
	 * 获得缺省的等待对话框的对象，此等待对话框是一个没有进度条也没有任何按钮的等待框
	 * @param  {Function} onfinish 对话框创建完毕后执行function(dlg){}
	 * @return {Object} EProgressDialog2 对象实例
	 * @example
 	 * // returns 对话框实例
 	 * EUI.getDefaultWaitDialog(function(dlg){
	 *   dlg.show();
	 * });
	 */
	getDefaultWaitDialog: function (onfinish) {
		return getRootDefaultDlg({
			id: "__ESEN$WaitDialog__",
			objectName: "EProgressDialog2",  //等待框也是有该对象实现
			onfinish: onfinish,
			notShowWait: true
		});
	},
	/**
	 * 隐藏缺省的等待对话框，框中将显示一个表示成功的动画
	 * @param  {Number} timeout 对话框在timeout毫秒后隐藏
	 * @param  {String} msg 对话框显示的等待信息
	 * @example
	 * //显示【保存成功】字样， 在1000毫秒后隐藏对话框
 	 * EUI.hideWaitDialogWithComplete(1000, "保存成功");
	 */
	hideWaitDialogWithComplete: function (timeout, msg) {
		EUI.hideWaitDialog(timeout, msg, "&#xef16;");
	},
	/**
	 * 隐藏缺省的等待对话框，框中将显示一个表示成功的动画
	 * @param  {Number} timeout 对话框在timeout毫秒后隐藏
	 * @param  {String} msg 对话框显示的等待信息
	 * @example
	 * //显示【保存成功】字样， 在1000毫秒后隐藏对话框
 	 * EUI.hideWaitDialogWithComplete(1000, "保存成功");
	 */
	showWaitDialog: function (msg) {
		if (EUI.browser.isPad) {
			showMobileWaitToast(msg);
			return;
		}
		rootWindow.__ESEN$WaitDialog$IsVisible__ = true;
		EUI.getDefaultWaitDialog(function(dlg) {
			if (rootWindow.__ESEN$WaitDialog$IsVisible__) {
				if (rootWindow.__ESEN$WaitDialog$Timeout__) {
					rootWindow.clearTimeout(rootWindow.__ESEN$WaitDialog$Timeout__);
					rootWindow.__ESEN$WaitDialog$Timeout__ = false;
				}
				/*msg = msg ? msg : "正在装入，请等待…";*/
				msg = msg ? msg : I18N.getString("eui.core.dlgs.js.loadingwaiting","正在装入，请等待…");
				dlg.setBaseCss("eui-dialog-operationtips");
				dlg.setCanResizable(false);
				dlg.setParams(msg);
				dlg.setDetailVisible(false);
				dlg.show();
			}
		});
	},
	/**
	 * 隐藏缺省的等待对话框
	 * @param {Number} timeout 对话框在timeout毫秒后隐藏
	 * @param {String} msg 对话框显示的等待信息
	 * @param {String} icon 对话框显示在右侧的图标
	 * @example
	 * //显示【保存成功】字样， 在1000毫秒后隐藏对话框
 	 * EUI.hideWaitDialog(1000, "保存成功", "&#xef16;");
	 */
	hideWaitDialog: function (timeout, msg, icon) {
		if (EUI.browser.isPad) {
			hideMobileWaitToast();
			if (msg) {
				showSuccessToast(msg);
			}
			return;
		}
		var root = rootWindow;
		root.__ESEN$WaitDialog$IsVisible__ = false;
		if (root.__ESEN$WaitDialog$Timeout__) {
			root.clearTimeout(root.__ESEN$WaitDialog$Timeout__);
			root.__ESEN$WaitDialog$Timeout__ = false;
		}
		var dlg = rootWindow.EUI.getGlobalDlg("__ESEN$WaitDialog__");
		if (!dlg)
			return;
		dlg.hideDialog(timeout, msg, icon);
	},
	/**
	 * 显示指定时间后自动消失的等待对话框
	 * @param {Number} timeout 对话框在timeout毫秒后隐藏
	 * @param {String} msg 对话框显示的等待信息
	 * @param {String} icon 对话框显示在右侧的图标
	 * @param {String} hidemsg 对话框关闭时显示的信息
	 * @example
	 * //显示【成功中】字样， 在1000毫秒后隐藏对话框时，显示【保存成功】字样
 	 * EUI.showWaitDialogAutoHidden(1000, "保存中", "&#xef16;", "保存成功");
	 */
	showWaitDialogAutoHidden: function (timeout,msg,icon, hidemsg) {
			var root = rootWindow;
			root.__ESEN$WaitDialog$IsVisible__ = true;
			EUI.getDefaultWaitDialog(function(dlg) {
							if (root.__ESEN$WaitDialog$IsVisible__) {
									if (root.__ESEN$WaitDialog$Timeout__) {
										root.clearTimeout(root.__ESEN$WaitDialog$Timeout__);
									}
									dlg.setBaseCss("eui-dialog-operationtips");
									dlg.setCanResizable(false);             
									dlg.show();
									root.__ESEN$WaitDialog$Timeout__ = dlg.hideDialog(timeout, hidemsg || msg, icon);
							}
					});
	},
	/**
	 * 隐藏【getConfirmDialog】获取的全局确认对话框
	 * @example
 	 * EUI.hiddenConfirmDialog();
	 */
	hiddenConfirmDialog: function () {
		getRootDefaultDlg({
			id: "__ESEN$ConfirmDialog__",
			objectName: "EConfirmDialog",  
			onfinish: function(rs) {
				rs.close();
			},
			notShowWait: true
		});
	},
	/**
	 * 获取全局的确认对话框
	 * @return {Object} EConfirmDialog 对象实例
	 * @example
 	 * // returns 对话框实例
 	 * EUI.getConfirmDialog();
	 */
	getConfirmDialog: function () {
		return getRootDefaultDlg({
			id: "__ESEN$ConfirmDialog__",
			objectName: "EConfirmDialog",  
			notShowWait: true
		});
	},
	/**
	 * 全局的确认窗口
	 * @param {String} title 对话框标题
	 * @param {(String|Number|Object)} msg 提示信息 {msg:"消息",icon:"图标"}
	 * @param {Boolean} isyesno=false  false, 对话框上有【确定】【取消】按钮； true, 对话框上有【是】【否】【取消】按钮
	 * @param {Function} loadCallback 对话框加载完毕后执行 function(dlg){}
	 * @param {Function} sureCallback 点击【确定】或者【是】按钮执行该方法 function(dlg){}
	 * @param {Function} noCallback 点击【取消】或者【否】按钮执行该方法 function(dlg){}
	 * @param {Function} cancelCallback 在参数isyesno=true时，点击【取消】按钮执行该方法 function(dlg){}
	 * @return {Object} EConfirmDialog 对象实例
	 * @example
	 * //显示 【是】 【否】 【取消】按钮
 	 * EUI.confirmDialog("关闭提示", "是否关闭", true, function(dlg){//加载}, function(dlg){//是}, function(dlg){//否}, function(dlg){//取消});
	 * 
	 * //显示 【确认】 【取消】按钮
 	 * EUI.confirmDialog("关闭提示", "是否关闭", false, function(dlg){//加载}, function(dlg){//确认}, function(dlg){//取消});
	 */
	confirmDialog: function (title, msg, isyesno, loadCallback) {
		var _args = arguments;
		return getRootDefaultDlg({
			id: "__ESEN$ConfirmDialog__",
			objectName: "EConfirmDialog",  
			notShowWait: true,
			wnd:EUI.getRootWindow(),
			onfinish: function(rs) {
				if (typeof(loadCallback) == "function")
				loadCallback(rs);
				rs.showModal();
				// 参数msg可以是字符串、数值或者JSON对象，当参数是JSON对象时可以同时指定消息内容与图标，形式如：{msg:'',icon:''}
				var _msg = null, _icon = null;
				if (typeof(msg) == "object") {
					_msg = msg.msg;
					_icon = msg.icon;
				}
				else if (typeof(msg) == "string" || typeof(msg) == "number") {
					_msg = msg;
				}
				rs.setParams(title, _msg, isyesno, _icon);
				if (rs._isYesNo) {
					rs.setOnYes(_args[4]);
					rs.setOnNo(_args[5]);
				} else {
					rs.setOnOK(_args[4]);
				}
				rs.setOnCancel(_args[rs._isYesNo ? 6 : 5]);
			}
		});
	},
	/**
	* 打开一个链接对话框，默认为帮助
	* @param {String} help 链接
	* @param {String} [title=帮助] 对话框标题
	* @param {Boolean} isModal 是否模态
	* @return {Object} EMemoDialog 对象实例
	* @example
	* EUI.getHelp("help.html");
	* EUI.getHelp("vfs/help/help.html");
	* EUI.getHelp("xui/images/help.gif");
	* EUI.getHelp("http://www.sanlink.com.cn");
	*/
	getHelp: function (help, title, isModal) {
		if (!help)
			return;
		return getRootDefaultDlg({
			id: "__ESEN$HelpDialog__",
			objectName: "EMemoDialog",  
			notShowWait: true,
			onfinish: function(rs) {
			rs.setContent((help.indexOf("vfs/") == 0 ? sys.getContextPath() : "") + help, true);
					rs.open(isModal);
					rs.setTitle(title, I18N.getString("eui.core.dlgs.js.help","帮助"));
					rs.setIcon("xui/images/help.gif");
					rs.moveTo(rs.doc.body.clientWidth - (rs.getWidth() + 5));
			}
		});
	},
	/**
	* 显示一个链接对话框，本质与getHelp一样
	* @see getHelp
	*/
	showHelp: function (help, title, isModal) {
		EUI.getHelp(help, title, isModal);
	},
	/**
	* 返回一个进程框
	* @return {Object} EProgressDialog2 对象实例
	* @example
	* var dlg = EUI.getProgressDlg();
	*/
	getProgressDlg: function () {
		return getRootDefaultDlg({
			id: "__ESEN$ProgressDialog__",
			objectName: "EProgressDialog2",  
			notShowWait: true
		});
	},
	/**
	* 显示一个进程框
	* @param {String} msg 提示信息
	* @param {Function} oncancel 点击取消按钮后的事件；该参数存在时，对话框会显示取消按钮，否则不显示
	* @return {Object} EProgressDialog2 对象实例
	* @example
	* EUI.showProgressDlg("正在计算...", function(dlg){})
	*/
	showProgressDlg: function (msg, oncancel) {
		return getRootDefaultDlg({
			id: "__ESEN$ProgressDialog__",
			objectName: "EProgressDialog2",  
			notShowWait: true,
			onfinish: function(progressDlg) {
				progressDlg.setMessage(msg ? msg : /*"正在计算，请稍等......"*/I18N.getString("eui.core.dlgs.js.help.writingwating","正在计算，请稍等......"));
				progressDlg.setBaseCss("eui-dialog-loading");
				progressDlg.setLogs("");
				progressDlg.showUnknownProgress();
				progressDlg.setHasDetailButton(false);
				progressDlg.setCanCancel(typeof(oncancel) == "function", oncancel);
				if (progressDlg.isVisible())
					return;
				progressDlg.show();
			}
		});
	},
	/**
	* 隐藏一个进程框
	* @param {Number} timeout 单位毫秒， 表示在指定毫秒后隐藏对话框，不传就立马隐藏对话框
	* @param {String} msg 提示信息
	* @param {String} icon 表示在对话框的消息右侧所显示的图标， 图标路径， 必须配合msg使用
	* @example
	* EUI.hideProgressDialog(1000, "计算完成")
	*/
	hideProgressDialog: function (timeout, msg, icon) {
		var dlg = rootWindow.EUI.getGlobalDlg("__ESEN$ProgressDialog__");
		if(!dlg)return;
		getRootDefaultDlg({
			id: "__ESEN$ProgressDialog__",
			objectName: "EProgressDialog2",  
			notShowWait: true,
			onfinish: function(progressDlg) {
				progressDlg.hideDialog(timeout, msg, icon);
			}
		});
	},
	/**
	* 隐藏一个进程框，框中将显示一个表示成功的动画
	* @param {Number} timeout 单位毫秒， 表示在指定毫秒后隐藏对话框，不传就立马隐藏对话框
	* @param {String} msg 提示信息
	* @example
	* EUI.hideProgressDialog(1000, "计算完成")
	*/
	hideProgressDialogWithComplete: function (timeout, msg) {
		EUI.hideProgressDialog(timeout, msg, "eweb/images/success_ani.gif");
	},
	/**
	* 显示备注信息
	* isModal为true时，表示对话框显示为模态的
	* @param {String} html HTML字符串 或者 链接
	* @param {Boolean} isUrl false: html是HTML字符串， true： html是url
	* @param {Boolean} isModal 是否模态显示
	* @return {Object} EMemoDialog 实例
	* @example
	* EUI.showMemoDialog("<b>NOWRAP | noWrap </b>");
	* EUI.showMemoDialog("http://www.baibu.com");
	*/
	showMemoDialog: function (html, isUrl, isModal) {
		return getRootDefaultDlg({
			id: "__ESEN$MemoDialog__",
			objectName: "EMemoDialog",  
			notShowWait: true,
			onfinish: function(rs) {
				rs.setContent(html, isUrl);
				rs.open(isModal);
			}
		});
	},
	/**
	* 显示自动提示消息框，参数msg为提示的内容，可以是Html代码片段，
	* staytime 表示消息框停留时间，以毫秒为单位，时间为0表示永久停留
	* animationtime 表示消息框的动画时间，即从开始到停留在右下角所用时间，以毫秒为单位，时间段则滑动的越快，时间为0表示直接显示出来
	* @param {String} msg 提示内容，可以是HTML字符串
	* @param {Number} staytime 对话框停留时间 毫秒
	* @param {Number} animationtime 动画时间 毫秒，从初始到显示在右下角所用的时间，时间段则滑动的越快，时间为0表示直接显示出来
	* @param {Function} onclose 关闭时执行 function(dlg){}
	* @return {Object} EFloatHintMsg实例
	* @example
	* var dlg = showFloatHintMsg("您有5条未读的消息。", 3000, 200);
	* dlg.setTextAlign("left", "middle");
	*/
	showFloatHintMsg: function (msg, staytime, animationtime, onclose) {
		return getRootDefaultDlg({
			id: "__ESEN$FloatHintMsg__",
			objectName: "EFloatHintMsg",  
			notShowWait: true,
			onfinish: function(rs) {
				rs.setMessage(msg);
				rs.open(staytime, animationtime);
				rs.onclose = onclose;
			}
		});
	},
	/**
	* 获取一个自动提示消息框
	* @return {Object} EFloatHintMsg实例
	* @example
	* EUI.getFloatHintMsg();
	*/
	getFloatHintMsg: function () {
		return getRootDefaultDlg({
			id: "__ESEN$FloatHintMsg__",
			objectName: "EFloatHintMsg",  
			notShowWait: true});
	},
	/**
	* 显示错误窗口
	* @param {(Error|String)} e Error对象或者是 错误信息
	* @param {} caller 调用堆栈
	* @param {Function} oninit 初始化执行 function(){}
	* @example
	* EUI.showError("显示错误");
	*
	* //一般在异常中使用
	* try{}catch(e){
	*	EUI.showError(e);
	* }
	*/
	showError: function (e, caller, oninit) {
		if(EUI.browser.isMobile){
		  var msg = e.message.split('\n')[0];
		  if(msg.replace(/^\s*|\s*$/g,"") == "mobileerror500"){
				EUI.hideWaitDialog();
				showMobileTipDlg(I18N.getString("eui.core.dlgs.js.pageerror","当前界面已过期，请重新进入。"),I18N.getString("eui.core.dlgs.js.hint","提示"),function(){
						cmd_closeView("","current");
					});
				return;
		  }
			showMobileTipDlg(msg,I18N.getString("eui.core.dlgs.js.errorhint","错误提示"),function(){cmd_closeView("","current");});
			return;
		}
		if( (e instanceof Error) &&  (e.httpstatus==401 || e.httpstatus>=12000 ) ){//如果是401错误，则显示登录超时对话框
			getRootDefaultDlg({
				id: "__ESEN$XShowHttpError__",
				objectName: "EShowHttpError",  
				notShowWait: true,
				onfinish: function(rs) {
					var dlg = rootWindow.EUI.getGlobalDlg("__ESEN$XShowError__");
					if( !!dlg && dlg.isVisible() ){
						dlg.close();
					}
					if (typeof(oninit) === "function") oninit.call(rs, arguments[3]);
					rs.resize(400,150);
					if (rs.isVisible()) {
						rs.setParams(e);
						return rs;
					}
					rs.setParams(e);
					rs.showModal();
				}
		});
		}else{
//			if (EUI.browser.isie && !caller) caller = EUI.ShowError.getJsStackTrace(arguments.callee.caller);//解决IE中错误对话框堆栈信息不对的问题
			getRootDefaultDlg({
				id: "__ESEN$XShowError__",
				objectName: "EShowError",  
				notShowWait: true,
				onfinish: function(rs) {
					if (typeof(oninit) === "function") oninit.call(rs, arguments[3]);
					if (rs.isVisible()) {// 保存后面出现的错误窗口,在当前错误窗口在点击确定后才去显示后面的错误窗口
//						rs.errorCalls.push([rs, e, caller]);
						return rs;
					}
					rs.setBottomVisible(!EUI.isString(e));
					rs.setParams(e, caller);
					rs.showDetail(false);
					rs.showModal();
				}
			});
		};
	},
	/**
	 * 隐藏错误对话框
	 * @private
	 */
	hideShowError: function(){
		var dlg = rootWindow.EUI.getGlobalDlg("__ESEN$XShowError__");
		if( !!dlg && dlg.isVisible() ){
			dlg.close();
		}

		dlg = rootWindow.EUI.getGlobalDlg("__ESEN$XShowHttpError__");
		if( !!dlg && dlg.isVisible() ){
			dlg.close();
		}
	},
	/**
	* 上传文件对话框
	* @param {String} caption 对话框标题
	* @param {String} hint 对话框上的提示信息
	* @param {String} fileCaption=选择文件： 上传文件框前面的文字
	* @param {String} buttonCaption=上传 上传按钮的文字
	* @param {Boolean} zipVisible=false 是否显示【解压】勾选框
	* @param {Boolean} coverVisible=false 是否显示【覆盖】勾选框
	* @param {String} action 上传文件的Action
	* @param {Function} callback 上传文件后的回调函数 function(dlg, info){}
	* @return {Object} EUploadDialog 实例
	* @example
	* EUI.uploadDialog("上传文件",null, null, null, true, true, "upload.do", function(){});
	*/
	uploadDialog : function(caption, hint, fileCaption, buttonCaption, zipVisible, coverVisible, action, callback, checkFunc) {
		return getRootDefaultDlg({
			id: "__ESEN$XuploadDialog__",
			objectName: "EUploadDialog",  
			notShowWait: true,
			onfinish: function(rs) {
				rs.setParams(caption, hint, fileCaption, buttonCaption, zipVisible, coverVisible, action, callback, checkFunc);
				rs.showModal();
			}
		});
	},
	/**
	* 显示消息窗口，页面上的消息提示，都使用该方法
	* @param{String} msg 提示信息
	* @param{String} caption 标题
	* @param{String} icon 消息左侧显示的图标，可以不指定，组件缺省会有个图标显示
	* @param{boolean} nowrap=true 消息是否自动换行
	* @return {Object} EShowMessage 实例
	* @example
	* EUI.showMessage("输入不合法")
	*/
	showMessage: function (msg, caption, icon, nowrap) {
		if(EUI.browser.isMobile){
			showMobileTipDlg(msg,caption);
			return;
		}
		return getRootDefaultDlg({
			id: "__ESEN$ShowMessage__",
			objectName: "EShowMessage",  
			notShowWait: true,
			onfinish: function(rs) {
				if(!EUI.browser.isMobile){
					rs.hideBottom();
				}
				rs.setParams(msg, caption, icon, nowrap);
				rs.showModal();
			}
		});
	},
	/**
	* 输入对话框
	* @param {String} prompt  输入框的标题
	* @param {String} caption  对话框的标题
	* @param {Function} onok 点击确定按钮后的回调函数,返回true可以关闭当前窗口,返回false则不能关闭 function(dlg){}
	* @param {(String|Array[])} defValue 输入框的默认值； 字符串时是input框；数组时是select框
	* @param {Boolean} isModel=true 是否模态
	* @param {Boolean} resize=false 是否能调整大小
	* @param {params} params 额外参数
	* @example
	* EUI.inputDialog("文件名：", "新建文件", function(dlg){});
	*/
	inputDialog: function (prompt, caption, onok, defValue, isModel, resize, params) {
		params = params || {};
		return EUI.isArray(defValue) ? EUI.editComboboxDialog(prompt, caption, onok, defValue, isModel) : EUI.__getInstance4InputDialog("EInputDialog", prompt, caption, onok, defValue,
				isModel, resize, params,params.required);
	},
	/**
	 * 带有两个编辑框的 对话框
	 * @param {String} caption
	 * @param {String} prompt1 编辑框1的提示文字
	 * @param {String} prompt2 编辑框2的提示文字
	 * @param {Function} onok  点击确定的回调事件
	 * @param {String} value1  编辑框1的值
	 * @param {String} value2  编辑框2的值
	 * @example
	 * EUI.inputDialog2("重命名", "文件名：", "新文件名：", function(dlg){}, "aaa.txt", "");
	 */
	inputDialog2: function(caption,prompt1,prompt2,onok,value1,value2,isModel) {
		return getRootDefaultDlg({
			id: "__ESEN$EInputDialog2",
			objectName: "EInputDialog2",  
			notShowWait: true,
			onfinish: function(rs) {
				rs.setCanResizable(false);
		    rs.setParams(caption,prompt1,prompt2,onok,value1,value2);
		    rs.setEnabled(true);// 对话框可能由于上次使用被disabled了
				rs.open(typeof(isModel) == "boolean" ? isModel : !(rs.wnd == window));
				//BUG:inputDialog控件显示时，输入框外面有输入光标在闪,需要重置焦点
				rs.wnd.setTimeout(rs.setFocus.bind(rs), 0);
			}
		});
	},
	/**
	 * 显示全局的数值输入对话框
	 * @param {String} prompt 输入框的标题
	 * @param {String} caption 对话框的标题
	 * @param {Function} onok 点击确定按钮后的回调函数
	 * @param {Number} defnumber 缺省值
	 * @param {Number} maxnumber 最大值
	 * @param {Number} minnumber 最小值 
	 * @param {Boolean} isModel 是模态窗口显示 
	 */
	numberDialog: function (prompt, caption, onok, defnumber, maxnumber, minnumber, isModel) {
		return getRootDefaultDlg({
			id: "__ESEN$NumberDialog__",
			objectName: "ENumberDialog",  
			notShowWait: true,
			onfinish: function(rs) {
				rs.setParams(prompt, caption, onok, defnumber, maxnumber, minnumber);
				rs.open(typeof(isModel) == "boolean" ? isModel : !(rs.wnd == window));
			}
		});
	},
	/**
	* 多行文本编辑对话框
	* @param {String} prompt    输入框的标题
	* @param {String} caption   对话框的标题
	* @param {Function} onok    点击确定按钮后的回调函数，返回true表示可以关闭当前窗口，否则不能关闭。function(dlg){}
	* @param {String} defValue  多行文本编辑框中的缺省值
	* @param {Boolean} isModel=true  是否模态显示
	* @example
	* EUI.textAreaDialog("编辑提示", "提示：", function(dlg){}, "这是提示");
	*/
	textAreaDialog: function (prompt, caption, onok, defValue, isModel,required) {
		return EUI.__getInstance4InputDialog("ETextAreaDialog", prompt, caption, onok, defValue, isModel,'','',required);
	},
	/**
	* 下拉选择对话框
	* @param {String} prompt    输入框的标题
	* @param {String} caption   对话框的标题
	* @param {Function} onok    点击确定按钮后的回调函数，返回true表示可以关闭当前窗口，否则不能关闭。function(dlg){}
	* @param {String} defValue  下拉选择框内的缺省值
	* @param {Boolean} isModel=true  是否模态显示
	* @ftype util.root
	*/
	comboboxDialog: function (prompt, caption, onok, defValue, isModel) {
		return EUI.__getInstance4InputDialog("EListComboboxDialog", prompt, caption, onok, defValue, isModel);
	},
	/**
	* 可增加内容的下拉选择对话框
	* @param {String} prompt    输入框的标题
	* @param {String} caption   对话框的标题
	* @param {Function} onok      点击确定按钮后的回调函数，返回true表示可以关闭当前窗口，否则不能关闭。回调函数的参数为对话框对象
	* @param {String} defValue  下拉选择框内的缺省值
	* @param {Boolean} isModel   为true时表示是模态窗口显示，否则为非模态显示
	* @ftype util.root
	*/
	editComboboxDialog: function (prompt, caption, onok, defValue, isModel) {
		return EUI.__getInstance4InputDialog("EEditComboboxDialog", prompt, caption, onok, defValue, isModel);
	},
	/**
	 * @private
	 */
	_onWindowError: function (msg, url, line) {
		if (window.execScripting)
			return;
		if (EUI.browser.isFirefox && (/NS_ERROR_FAILURE:/.test(msg) || new RegExp("Location\.toString", "g").test(msg)))
			return;
		//ISSUE:[报表模板计算]ESENBI-9473 网络中断后的提示NetworkError,但不影响正常使用。
		if(msg.indexOf("Failed to execute 'send' on 'XMLHttpRequest'") > -1){
			return;
		}
		EUI.hideWaitDialog();
		EUI.hideWaitingDom();
		/**
		* 在保存报表时假如出现异常，关闭错误信息对话框后，等待对话框并不会隐藏。
		* 原因：保存报表时调用了showProgressDlg显示等待对话框而不是showWaitDialog。所以仅仅调用hideWaitDialog
		* 并不会隐藏该对话框。
		*/
		EUI.hideProgressDialog();
		try {
			if (EUI.browser.isChrome && msg.startsWith("Uncaught Error: ")) {
				msg = msg.substr(16);
			}
			if(EUI.browser.isMobile){
				msg = msg.split('\n')[0];
				showMobileTipDlg(msg,I18N.getString("eui.core.dlgs.js.errorhint","错误提示"));
			}else{
				EUI.showError(msg/*,  EUI.browser.isie ? window.onerror.caller : null */);
			}
			
		} catch (e) {
			console.error(e);
		}
		return EUI.browser.isie;
		// 如果是firefox，则不拦截异常
	},
	/**
	* 用于实现inputDialog的扩展方法，Combobox、EditCombobox、TextArea
	* @param {} component 控件名称，如：Combobox、EditCombobox、TextArea，这些控件都是继承于InputDialog的
	* @param {} prompt    标题
	* @param {} caption   对话框的标题
	* @param {} onok      点击确定按钮后的回调函数，返回true表示可以关闭当前窗口，否则不能关闭。回调函数的参数为对话框对象
	* @param {} defValue  缺省值
	* @param {} isModel   为true时表示是模态窗口显示，否则为非模态显示
	* @private
	*/
	__getInstance4InputDialog: function (component, prompt, caption, onok, defValue, isModel, resize, params,required) {
		return getRootDefaultDlg({
			id: "__ESEN$" + component,
			objectName: component,  
			notShowWait: true,
			onfinish: function(rs) {
				if(resize != "" && resize != null && resize != undefined)
					rs.setCanResizable(resize);
				rs.setParams(prompt, caption, onok, defValue, params,required);
				rs.setEnabled(true);// 对话框可能由于上次使用被disabled了
				//这个地方也可能是在父对话框上弹出另外一个对话框，需要模态isModel 就需要是父对话框对象
				rs.open(typeof(isModel) == "boolean" ? isModel : ((isModel && typeof(isModel._initXDialog) == "function")?isModel:!(rs.wnd == window)));
				//BUG:inputDialog控件显示时，输入框外面有输入光标在闪,需要重置焦点
				rs.wnd.setTimeout(rs.setFocus.bind(rs), 0);
			},
			params : params
		});
	},
	/**
	* 取消JspFunc.printJspWaitingDom生成的等待提示面板，参数p为要取消的等待提示面板的id或对象，如果不指定则缺省为id是com.sanlink.irpt.web.waitingdom的等待面板
	* @param {} p
	* @ftype util.root
	*/
	hideWaitingDom: function (p) {
		p = p || "com.sanlink.irpt.web.waitingdom";
		if (typeof(p) == "string") {
			p = document.getElementById(p);
		}
		if (p && EUI.isObject(p) && p.parentNode)
			p.parentNode.removeChild(p);
	}
	// 	/**
	// * 数值输入对话框
	// * @param prompt String 输入框的标题
	// * @param caption String 对话框的标题
	// * @param onok Function 点击确定按钮后的回调函数,返回true可以关闭当前窗口,返回false则不能关闭,回调函数的参数为NumberDialog对象
	// * @param defnumber Number 缺省值
	// * @param maxnumber Number 最大值
	// * @param minnumber Number 最小值 
	// * @param isModel Boolean 是模态窗口显示 
	// * @param width Number 微调控件的宽度，如果不指定则缺省的宽度为48 
	// * @ftype util.root
	// */
	// numberDialog: function (prompt, caption, onok, defnumber, maxnumber, minnumber, isModel, width) {
	// 	getRootDefaultDlg({
	// 		id: "__ESEN$NumberDialog__",
	// 		objectName: "NumberDialog",  
	// 		notShowWait: true,
	// 		onfinish: function(rs) {
	// 			//espinner
	// 			rs.setParams(prompt, caption, onok, defnumber, maxnumber, minnumber, width);
	// 			rs.open(typeof(isModel) == "boolean" ? isModel : !(rs.wnd == window));
	// 		}
	// 	});
	// },
	// 	/**
	// * [BI-3407@jira] 主题集属性界面的小问题
	// * 在指定的DOM结点内显示消息，类似JspFunc.showMessage与JspFunc.showException方法所输出的效果
	// * @param {str,dom} dom
	// * @param {str} msg
	// * @param {str} icon 消息左侧显示的图标，缺省为消息图标
	// * @param {number} staytime 如果为-1则表示永远显示，如没有指定则缺省为停留2秒
	// */
	// showMessageInNode: function (dom, msg, icon, staytime) {
	// 	EUI.includeAsync("xpanel", window, function() {
	// 				var hintContainer = dom && typeof(dom) == "string" ? document.getElementById("hintContainer") : dom;
	// 				if (!hintContainer)
	// 					return;
	// 				var r = window["msgPanel"];
	// 				if (!r) {
	// 					r = new XHintPanel(window, hintContainer);
	// 					window["msgPanel"] = r;
	// 					addDispose(r);
	// 				}
	// 				r.setStayTime(staytime);
	// 				r.setMessage(msg, icon);
	// 			});
	// },
});
}(window, EUI);

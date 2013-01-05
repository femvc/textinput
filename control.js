'use strict';
/*
 * BUI(Baidu UI Library)
 * Copyright 2011 Baidu Inc. All rights reserved.
 *
 * path:    bui.control.js
 * desc:    BUI控件基础类
 * author:  Baidu FE
 * date:    2012/01/01 [用python脚本自动维护]
 */

bui.Control = function ( options ) {
    //状态列表
    this.state = {};
    //指向父控件
    this.parentControl = null;
    // 子控件容器
    this.controlMap = {};
    // 初始化参数
    this.initOptions( options );
    // 生成控件id
    if ( !this.id ) {
        this.id = bui.Control.makeGUID();
    }
};

bui.Control.prototype = {
    /**
     * 获取dom子部件的css class
     *
     * @protected
     * @return {string}
     */
    getClass: function(key) {
        var me = this,
            type = me.type.toLowerCase(),
            className = 'ui-' + type;

        if (key) {
            className += '-' + key;
        }

        return className;
    },

    /**
     * 获取dom子部件的id
     *
     * @protected
     * @return {string}
     */
    getId: function(key) {
        var me = this,
            //uiAttr = bui.Control.UI_ATTRIBUTE || 'ui';
            //idPrefix = 'ctrl' + this.type + this.id;
            idPrefix = this.id;
        
        if (key) {
            idPrefix = idPrefix + key;
        }
        return idPrefix;
    },

    /**
     * 控件渲染接口
     *
     * @protected
     * @param {HTMLElement} main 控件挂载的DOM.
     */
    render: function() {},
    getValue:   new Function(),
    setName:    new Function(),
    setValue:   new Function(),
    /**
     * 初始化参数
     * 
     * @protected
     * @param {Object} options 参数集合
     */
    initOptions: function ( options ) {
        for ( var k in options ) {
            this[ k ] = options[ k ];
        }
    },

    /**
     * 初始化状态事件
     *
     * @protected
     * @desc
     *      默认为控件的主dom元素挂载4个mouse事件
     *      实现hover/press状态切换的样式设置.
     * @autoState属性 控制是否自动绑定事件,见上
     */
    initStateChanger: function() {
        var me = this,
            main = me.main;

        me.state = {};
        if (main) {
            main.onmouseover = me.getMainOverHandler();
            main.onmouseout = me.getMainOutHandler();
            main.onmousedown = me.getMainDownHandler();
            main.onmouseup = me.getMainUpHandler();
        }
    },

    /**
     * 获取主元素over的鼠标事件handler
     *
     * @private
     * @return {Function}
     */
    getMainOverHandler: function() {
        var me = this;
        return function() {
            if (!me.state['disabled'] && !me.state['readonly']) {
                me.setState('hover');
            }
        };
    },

    /**
     * 获取主元素out的鼠标事件handler
     *
     * @private
     * @return {Function}
     */
    getMainOutHandler: function() {
        var me = this;
        return function() {
            if (!me.state['disabled'] && !me.state['readonly']) {
                me.removeState('hover');
                me.removeState('press');
            }
        };
    },

    /**
     * 获取主元素down的鼠标事件handler
     *
     * @private
     * @return {Function}
     */
    getMainDownHandler: function() {
        var me = this;
        return function(e) {
            if (!me.state['disabled']) {
                me.setState('press');
            }
            e = e || window.event;
            //e.returnValue = false;
        };
    },

    /**
     * 获取主元素up的鼠标事件handler
     *
     * @private
     * @return {Function}
     */
    getMainUpHandler: function() {
        var me = this;
        return function() {
            if (!me.state['disabled']) {
                me.removeState('press');
            }
        };
    },

    /**
     * 设置控件的当前状态
     *
     * @protected
     * @param {string} state 要设置的状态.
     */
    setState: function(state) {
        var me = this,main=me.main;
        if (!me.state) {
            me.state = {};
        }
        
        me.state[state] = 1;
        bui.Control.addClass(main,me.getClass(state));
    },

    /**
     * 移除控件的当前状态
     *
     * @protected
     * @param {string} state 要移除的状态.
     */
    removeState: function(state) {
        var me=this,main=me.main;
        if (!me.state) {
            me.state = {};
        }

        me.state[state] = null;
        bui.Control.removeClass(main,me.getClass(state));
        //_.removeClass(this.main, this.getClass(state));
    },

    /**
     * 获取控件状态
     *
     * @protected
     * @param {string} state 要获取的状态.
     * @return {boolean|Null}
     */
    getState: function(state) {
        if (!this.state) {
            this.state = {};
        }

        return !!this.state[state];
    },

    /**
     * 预置状态表
     *
     * @protected
     */
    states: ['hover', 'press', 'active', 'disabled', 'readonly'],

    /**
     * 验证控件的值
     */
    validate: function() {
        var me = this,
            result = true,
            i, 
            len,    
            controlMap = me.controlMap;
        
        if (me.rule && (!me.state || !me.state.disabled)) {
            if (Object.prototype.toString.call(me.rule)!=='[object Array]') {
                me.rule = [me.rule];
            }
            for (i=0, len=me.rule.length; i<len && result; i++) {
                if (me.rule[i]) {
                    result = result && bui.Validator.applyRule(me, me.rule[i]);
                }
            }
        }
        
        if (result && controlMap && (!me.state || !me.state.disabled)) {
            for(i in controlMap){
                if(i && controlMap[i] && controlMap[i].rule){
                    result = controlMap[i].validate() && result;
                }
            }
        }
        
        return result;
    },
    getParamMap: function(paramMap){
        var me = this,
            paramMap = paramMap || {},
            i,   
            controlMap = me.controlMap;
        if (me.getFormName && me.getValue) {
            paramMap[me.getFormName()] = me.getValue();
        }
        else if (controlMap) {
            for (i in controlMap) {
                if(controlMap[i] && (controlMap[i].getFormName || controlMap[i].controlMap)){
                    controlMap[i].getParamMap(paramMap);
                }
            }
        }
        
        return paramMap;
    },
    getParamString: function() {
        var me = this,
            paramString = [],
            paramMap = e.getParamMap;
        
        if (paramMap) {
            for(i in paramMap){
                if(String(i) != '' && paramMap[i]){
                    paramString.push(i + '=' + paramMap[i]);s
                }
            }
        }
        
        return paramString.join('&');
    },
    /**
     * 显示控件
     */
    show: function() {
        this.main.style.display='block';
    },

    /**
     * 隐藏控件
     */
    hide: function() {
        this.main.style.display='none';
    },

    /**
     * 禁用控件
     */
    disable: function(disabled) {
        if (typeof disabled === 'undefined') {
            disabled = true;
        }
        disabled ? this.setState('disabled') : this.removeState('disabled');
    },
    /**
     * 启用控件
     */
    enable: function() {
        this.disable(true);
    },
    /**
     * 设置控件不可用状态
     *
     * @public
     * @param {boolean} disabled
     */
    setDisabled: function ( disabled ) {
        this.disable(disabled);
    },

    /**
     * 设置控件只读
     */
    readonly: function(readonly) {
        if (typeof readonly === 'undefined') {
            readonly = true;
        }
        readonly ? this.setState('readonly') : this.removeState('readonly');
    },
    /**
     * 恢复控件可编辑
     */
    editable: function() {
        this.readonly(true);
    },
    /**
     * 设置控件不可用状态
     *
     * @public
     * @param {boolean} disabled
     */
    setReadonly: function ( readonly ) {
        this.readonly(readonly);
    },
    
    /**
     * 判断控件不可用状态
     * 
     * @public
     * @return {boolean}
     */
    isDisabled: function () {
        return this.getState( 'disabled' );
    },
    isReadOnly: function() {
        return this.getState('readonly');
    },
    
    /**
     * 是否表单控件
     *
     * @param {Object} control
     * @return {boolean}
     */
    isForm: function() {
        return this.form;
    },
    /**
     * 获取表单控件的表单名
     *
     * @param {Object} control
     */
    getFormName: function() {
        return (this.formName || this['name'] || this.main.getAttribute('name'));
    },
    /**
     * 获取控件对象的全局引用字符串
     *
     * @protected
     * @return {string}
     */
    getStrRef: function() {
        return "bui.Control.get('" + this.id + "','"+this.getAction().id+"')";
    },

    /**
     * 释放控件
     *
     * @protected
     */
    dispose: function() {
        var me = this,
            controlMap = me.controlMap,
            main = me.main;

        // dispose子控件
        if (controlMap) {
            for (var k in controlMap) {
                controlMap[k].dispose();
                delete controlMap[k];
            }
        }
        me.controlMap = {};

        // 释放控件主区域的事件以及引用
        if (main) {
            main.onmouseover = null;
            main.onmouseout = null;
            main.onmousedown = null;
            main.onmouseup = null;
            if (main.innerHTML){
                main.innerHTML = '';
            }
            me.main = null;
        }
        
        
        me.rendered = null;
    },
    /**
     * 挂载到父dom节点中
     *
     * @param {Element} wrap 父dom节点.
     */
    appendTo : function(wrap) {
        var uiObj = this,
            elem = wrap,
            control,
            container = document.body;
        if (wrap && wrap.appendChild && wrap.childNodes) {
            while(elem && elem.tagName && elem.tagName.toLowerCase()!='body'){
                if (elem && elem.getAttribute && elem.control) {
                    control = bui.Control.get(elem.control, opt_action);
                    //将控件从临时容器移动到指定控件下
                    bui.Control.prototype.appendControl.call(control, uiObj);
                    break;
                }
                else {
                    elem = elem.parentNode;
                }
            }
            
            if (uiObj.main) {
                wrap.appendChild(uiObj.main);
            }
        }
        else if (wrap && wrap.controlMap) {
            bui.Control.prototype.appendControl.call(wrap, uiObj);
            if (uiObj.main) {
                control = wrap;
                while (control) {
                    if (control.main) {
                        container = control.main;
                        break;
                    }
                    control = control.parentControl;
                }
                container.appendChild(uiObj.main);
            }
        }
    },
    /**
     * 父控件添加子控件
     *
     * @param {Control} uiObj 子控件.
     */
    appendControl : function(uiObj) {
        var parentControl = this;
        if (uiObj.parentControl && uiObj.parentControl.controlMap) {
            uiObj.parentControl.controlMap[uiObj.id] = undefined;
            delete uiObj.parentControl.controlMap[uiObj.id];
        }
        
        parentControl.controlMap[uiObj.id] = uiObj;
        //通过parentControl标识是否为根控件 null:子控件;object:根控件
        uiObj.parentControl = parentControl;
    },
    /**
     * 获取当前控件所在Action实例
     *
     * @return {Action} Action实例.
     */
    getAction: function() {
        var ctrl = this,
            action = null;
        while (ctrl.parentControl) {
            ctrl = ctrl.parentControl;
        }
        if(ctrl.type === 'action'){
            action = ctrl;
        }
        return action;
    }
};

/**
 * BUI组件方法库
 *
 * @static
 * @private
*/
/**
 * 获取唯一id
 *
 * @public
 * @return {string}
 */
bui.Control.makeGUID = (function(){
    var guid = 0;
    return function(){
        return '_innerui_' + ( guid++ );
    };
})();
/**
 * 通过派生实现通用控件的功能
 *
 * @public
 * @param {Function} childClazz 子控件类.
 * @param {Function} parentClazz 父控件类.
 */
bui.Control.derive = function (childClazz) {
    var me = bui.Control.prototype,
        proto = childClazz.prototype,
        i;
    for (i in me) {
        if (proto[i] == undefined && me[i]) {
            proto[i] = me[i];
        }
    }
    proto.constructor = childClazz;
    proto.superClass = bui.Control;
    
    //建立所有组件类的索引
    if (!bui.Control.ctrClassList) {
        bui.Control.ctrClassList = [];
    }
    bui.Control.ctrClassList.push(childClazz);
    
    return childClazz;
};
/**
 * 初始化控件渲染
 * 
 * @public
 * @param {HTMLElement} opt_wrap 渲染的区域容器元素
 * @param {Object}      opt_propMap 控件附加属性值
 * @param {Object}      opt_action 渲染的action,不传则默认为window对象
 * @return {Object} 控件集合
 */
bui.Control.init = function ( opt_wrap, opt_propMap, opt_action ) {
    opt_propMap = opt_propMap || {};
    
    // 容器为空的判断
    opt_wrap = opt_wrap || document.body;
    // opt_action不传默认为window对象
    opt_action = opt_action || window;
    opt_action.controlMap = opt_action.controlMap || {};
    
    var uiAttr = bui.Control.UI_ATTRIBUTE || 'ui';
    var realEls = [];
    var attrs, attrStr, attrArr, attrArrLen, attrSegment;
    var attr, attrName, attrValue, attrItem, extraAttrMap;
    var i, len, k, main, objId, control;
    
    // 把dom元素存储到临时数组中
    // 控件渲染的过程会导致elements的改变
    realEls = bui.Control.findAllNodes(opt_wrap);
    
    // 循环解析自定义的ui属性并渲染控件
    // <div ui="type:UIType;id:uiId;..."></div>
    for ( i = 0, len = realEls.length; i < len; i++ ) {
        main = realEls[ i ];
        
        if (main && main.getAttribute && main.getAttribute( uiAttr )) {
            attrStr = main.getAttribute( uiAttr );
            
            // 解析ui属性
            attrs       = {};
            attrArr     = attrStr.split( /\s*;\s*/ ); //split(';')
            attrArrLen  = attrArr.length;
            while ( attrArrLen-- ) {
                // 判断属性是否为空
                attrItem = attrArr[ attrArrLen ];
                if ( !attrItem ) {
                    continue;
                } 
                // 获取属性
                attrSegment = attrItem.replace(/[ ]*:[ ]*/g,':').split(':');
                attr        = attrSegment[0];
                attrValue   = attrSegment[1];
                //去掉单双引号
                if (typeof attrValue === 'string' && attrValue.length>1 && (
                    (attrValue.indexOf('"') === 0 && attrValue.lastIndexOf('"') === attrValue.length-1) || 
                    (attrValue.indexOf("'") === 0 && attrValue.lastIndexOf("'") === attrValue.length-1) )) {
                    attrValue = attrValue.substr(1,attrValue.length-2);
                }
                //通过@定义的需要到传入的model中找
                else if (typeof attrValue === 'string' && attrValue.indexOf('@') === 0) {
                    attrName = attrValue.substr(1);
                    
                    attrValue = opt_propMap[attrName];
                    // 默认读取opt_propMap中的,没有再到全局context中取,防止强耦合.
                    if (attrValue === undefined && bui && bui.context && bui.context.get) { 
                        attrValue = bui.context.get(attrName);
                    }
                }
                //先默认用数组保存,后面再检测,如只有一个值则直接替换掉数组
                if (!attrs[attr]) {attrs[attr] = [];}
                attrs[attr].push(attrValue);
            }
            //如只有一个值则直接替换掉数组
            for (k in attrs) {
                if (k && attrs[k] && attrs[k].length<2) {
                    attrs[k] = attrs[k][0];
                }
                //因为读取是倒序故需反转一下数组
                else if (k && attrs[k] && attrs[k].length>1) {
                    attrs[k] = attrs[k].reverse();
                }
            }
            
            // 主元素参数初始化
            //attrs.main = main;//注释掉是因为不希望bui.Control.create传入main[字符串]覆盖attrs['main']:[DOM对象]的值
            
            // 创建并渲染控件
            objId = attrs[ 'id' ];
            if ( !objId ) {
                objId = bui.Control.makeGUID();
                attrs[ 'id' ] = objId;
            }
            
            /*extraAttrMap = opt_propMap[ objId ];
            // 将附加属性注入
            for ( k in extraAttrMap ) {
                attrs[ k ] = attrs[ k ] || extraAttrMap[ k ];
            }*/
            
            // 渲染控件
            bui.Control.create( attrs[ 'type' ], attrs, main, opt_action);

           /**
            * 保留ui属性便于调试与学习
            */
            //main.setAttribute( uiAttr, '' );
        }
    }
    
    return opt_action.controlMap;
};
/**
 * 创建控件对象
 * 
 * @public
 * @param {string} type 控件类型
 * @param {Object} options 控件初始化参数
 * @param {HTMLElement} main 控件的容器
 * @param {Object} opt_action 渲染的action,不传则默认为window对象
 * @return {bui.Control} 创建的控件对象
 */
bui.Control.create = function ( type, options, main, opt_action) {
    options = options || {};

    var uiClazz = bui[ type ],
        objId   = options.id,
        uiObj   = null,
        elem,
        control;

    if ( objId && uiClazz ) {
        /**
         * 继承父类的构造函数
         */
        uiObj = new uiClazz( options );
        bui.Control.call( uiObj, options );
        //设置默认main属性,这里设置既不覆盖new uiClazz(options)的设置,也便于后面render时重新设置
        if(uiObj.main == undefined) uiObj.main = main;
        
        // opt_action不传默认为window对象
        opt_action = opt_action || window;
        opt_action.controlMap = opt_action.controlMap || {};
        
        //默认为根控件,若不是则会在后面render时覆盖parentControl属性
        uiObj.parentControl = opt_action;
        uiObj.parentControl.controlMap[ objId ] = uiObj;
        
        //若main为空则自动创建一个div作为控件容器
        if ( !uiObj.main ) {
            uiObj.main = document.createElement('DIV');
        }
        //便于通过main.control找到control
        uiObj.main.control = objId;
        
        if (!uiObj.main.id) {
            uiObj.main.id = uiObj.getId();
        }
        
        //动态生成control需手动维护me.main.id和me.parentControl
        //回溯找到父控件,若要移动控件,则需手动维护parentControl属性!!
        elem = uiObj.main;
        while(elem && elem.tagName && elem.tagName.toLowerCase()!='html'){
            elem = elem.parentNode;
            if (elem && elem.getAttribute && elem.control) {
                control = bui.Control.get(elem.control, opt_action);
                bui.Control.prototype.appendControl.call(control, uiObj);
                break;
            }
        }
        
        //bui.Control.elemList.push(uiObj);
        //设计用来集中缓存索引,最后发现不能建,建了垃圾回收会有问题!!
        uiObj = uiObj;
        //根控件需要放置在action.controlMap中
        /*if (uiObj.parentControl && uiObj.parentControl.controlMap ){
            if (uiObj.parentControl.controlMap[ objId ] && window.console && window.console.log){
                window.console.log('Control "' + objId + '" already exist.');
            }
            
            uiObj.parentControl.controlMap[ objId ] = uiObj;
        }*/
        
        if ( uiObj.main ) {
            // 每个控件渲染开始的时间。
            uiObj.startRenderTime = new Date();
            
            //uiObj.render()参数只能为uiObj
            if (uiObj.render){
                uiObj.render();
            }
            if (!uiObj.isRendered){
                bui.Control.render.call(uiObj);
            }
            uiObj.endRenderTime = new Date();
        }
        
    }    
    return uiObj;
};

/**
 * 渲染控件
 *
 * @protected
 * @param {HTMLElement} main 控件挂载的DOM.
 * @param {boolean} autoState 是否挂载自动状态转换的处理.
 */
bui.Control.render = function() {
    var me = this,
        k,v,
        main = me.main;
    if (main) {
        bui.Control.addClass(main,me.getClass());

        if (me.autoState) {
            me.initStateChanger();
        }

        me.isRendered = true;
    } 
};

/**
 * 获取所有子节点element
 *
 * @param {Object} control
 */
bui.Control.findAllNodes = function(main){
    var i, len, k, v,
        childNode,
        elements,
        list,
        childlist,
        node;
    elements=[],list=[main];
    
    while(list.length){
        childNode= list.pop();
        if(!childNode) continue;
        elements.push(childNode);
        childlist = childNode.childNodes;
        if(!childlist||childlist.length<1) continue;
        for(i=0,len=childlist.length;i<len;i++){
            node = childlist[i];
            list.push(node);
        }
    }
    //去掉顶层main,如不去掉处理复合控件时会导致死循环!!
    if(elements.length>0) elements.shift();
    return elements;
};
/**
 * 获取action下所有控件
 *
 * @param {Object} control
 */
bui.Control.findAllControl = function(action){
    var i, len, k, v,
        childNode,
        elements,
        list,
        childlist,
        node;
    action = action || bui.Control.get();
    elements=[];
    list=[action];
    
    while(list.length){
        childNode= list.pop();
        if(!childNode) continue;
        elements.push(childNode);
        childlist = childNode.controlMap;
        if(!childlist) continue;
        for(i in childlist){
            node = childlist[i];
            list.push(node);
        }
    }
    //去掉顶层action,如不去掉处理复合控件时会导致死循环!!
    if(elements.length>0) elements.shift();
    return elements;
};
/**
 * 所有控件实例的索引
 */
//bui.Control.elemList = [];
/**
 * 根据控件id找到对应控件
 * @parent可不传,默认从当前Action开始找
 * @id 控件ID
 * @param {String} 控件id
 */
bui.Control.get = function(id, parent){
    var me = this,
        i, list, len,
        control = null;
    
    if (bui && bui.Action && bui.Action.get) {
        parent = (typeof parent === 'string') ? bui.Action.get(parent) : parent;
        parent = (parent && parent.controlMap) ? parent : bui.Action.get();
    }
    else {
        parent = (parent && parent.controlMap) ? parent : window;
    }
    
    if (id === undefined) {
        control = parent;
    }
    else if (parent) {
        list = bui.Control.findAllControl(parent);
        for(i = 0, len = list.length;i<len;i++){
            if(list[i].id == id){
                control = list[i];
            }
        }
    }
    
    return control;
};
/**
 * 根据控件formName找到对应控件
 *
 * @param {String} 控件formName
 */
bui.Control.getByFormName = function(id, parentControl){
    var me = this,
        i, list, len, opt_action,
        elem = null;
    if (id && parentControl) {
        if(typeof parentControl === 'string'){
            parentControl = bui.Control.get(parentControl);
        }
        
        //遍历控件树
        if(parentControl){
            list = [parentControl];
            while(list.length){
                opt_action = list.pop();
                if(opt_action.getFormName && opt_action.getFormName() == id){
                    elem = opt_action;
                    break;
                }
                else if(opt_action.controlMap){
                    for(i in opt_action.controlMap){
                        list.push(opt_action.controlMap[i]);
                    }
                }
            }
        }
    }
    
    return elem;
};


/**
 * 为目标元素添加className
 * 
 * @param {HTMLElement|string} element 目标元素或目标元素的id
 * @param {string} className 要添加的className，允许同时添加多个class，中间使用空白符分隔
 * @remark
 * 使用者应保证提供的className合法性，不应包含不合法字符，className合法字符参考：http://www.w3.org/TR/CSS2/syndata.html。
 *     
 *                 
 * @returns {HTMLElement} 目标元素
 */
bui.Control.addClass = function (element, className) {
    bui.Control.removeClass(element, className);
    element.className = (element.className +' '+ className).replace(/(\s)+/ig," ");
    return element;
};
bui.Control.removeClass = function(element, className) {
    var list = className.split(/\s+/),
        str = element.className||'';
    var i,len,k,v;
    for (i=0,len=list.length; i < len; i++){
         str = (" "+str.replace(/(\s)/ig,"  ")+" ").replace(new RegExp(" "+list[i]+" ","g")," ");
    }
    str = str.replace(/(\s)+/ig," ");
    element.className = str;
    return element;
};
/**
 * 对目标字符串进行格式化
 * 
 * @param {string} source 目标字符串
 * @param {Object|string...} opts 提供相应数据的对象或多个字符串
 *             
 * @returns {string} 格式化后的字符串
 */
bui.Control.format = function (source, opts) {
    source = String(source);
    var data = Array.prototype.slice.call(arguments,1), toString = Object.prototype.toString;
    if(data.length){
        data = (data.length == 1 ? 
            /* ie 下 Object.prototype.toString.call(null) == '[object Object]' */
            (opts !== null && (/\[object Array\]|\[object Object\]/.test(toString.call(opts))) ? opts : data) 
            : data);
        return source.replace(/#\{(.+?)\}/g, function (match, key){
            var replacer = data[key];
            // chrome 下 typeof /a/ == 'function'
            if('[object Function]' == toString.call(replacer)){
                replacer = replacer(key);
            }
            return ('undefined' == typeof replacer ? '' : replacer);
        });
    }
    return source;
};

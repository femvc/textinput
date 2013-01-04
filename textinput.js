'use strict';
//    ____     ____                _   _     ____          ____      ____                   
//  /\  __\  /\  __\    /'\_/`\  /\ \/\ \  /\  __`\      /\  __`\  /\  __`\    /'\_/`\      
//  \ \ \_/_ \ \ \_/_  /\      \ \ \ \ \ \ \ \ \ \_\     \ \ \ \_\ \ \ \ \ \  /\      \     
//   \ \  __\ \ \  __\ \ \ \_/\_\ \ \ \ \ \ \ \ \  __     \ \ \  __ \ \ \ \ \ \ \ \_/\_\    
//    \ \ \_/  \ \ \_/_ \ \ \\ \ \ \ \ \_/ \ \ \ \_\ \  __ \ \ \_\ \ \ \ \_\ \ \ \ \\ \ \   
//     \ \_\    \ \____/ \ \_\\ \_\ \ `\___/  \ \____/ /\_\ \ \____/  \ \_____\ \ \_\\ \_\  
//      \/_/     \/___/   \/_/ \/_/  `\/__/    \/___/  \/_/  \/___/    \/_____/  \/_/ \/_/  
//                                                                                          
//                                                                                          

/**  
 * 文本输入框控件 
 * 
 * @desc 唯一标识
 * [闪光点] 可以create或通过模板两种方式创建
 * [缺点] 创建过程步骤不太明确
 * [解决方案] 借鉴Action的创建过程
 *
 * @constructor
 */

/**
 * 文本输入框组件
 *
 * @param {Object} options 控件初始化参数.
 */
bui.TextInput = function(options) {
    this.initOptions(options);
    this.form = 1;

    var value = this.value === 0 ? 0 : (this.value || '');
};

bui.TextInput.prototype = {
    /**
     * 获取文本输入框的值
     *
     * @public
     * @return {string}
     */
    getValue: function() {
        return this.main.value;
    },

    /**
     * 设置文本输入框的值
     *
     * @public
     * @param {string} value
     */
    setValue: function(value) {
        this.main.value = value;
        if (value) {
            this.getFocusHandler()();
        } else {
            this.getBlurHandler()();
        }
    },

    /**
     * 设置输入控件的title提示
     *
     * @public
     * @param {string} title
     */
    setTitle: function(title) {
        this.main.setAttribute('title', title);
    },

    /**
     * 将文本框设置为不可写
     *
     * @public
     * @param {Boolean} disabled
     */
    disable: function(disabled) {
        if (typeof disabled === 'undefined') {
            disabled = true;
        }
        if (disabled) {
            this.main.disabled = 'disabled';
            this.setState('disabled');
        } 
        else {
            this.main.removeAttribute('disabled');
            this.removeState('disabled');
        }
    },
    /**
     * 设置控件为只读
     *
     * @public
     * @param {Boolean} readonly
     */
    readonly: function(readonly) {
        if (typeof readonly === 'undefined') {
            readonly = true;
        }
        if (readonly) {
            this.main.readOnly = 'readonly';
            this.setState('readonly');
        } 
        else {
            this.main.removeAttribute('readonly');
            this.removeState('readonly');
        }
    },
    /**
     * 渲染控件
     *
     * @protected
     * @param {Object} main 控件挂载的DOM.
     */
    render: function(main) {
        var me = this;
        if (main) {
            var tagName = main.tagName,
                inputType = main.getAttribute('type');
            me.main = main;
            // 判断是否input或textarea输入框
            if ((tagName == 'INPUT' && (inputType == 'text' || inputType == 'password'))
                || tagName == 'TEXTAREA') {
                me.type = tagName == 'INPUT' ? 'text' : 'textarea'; // 初始化type用于样式

                // 设置formName
                me.formName = main.getAttribute('name');

                // 绘制控件行为
                bui.Control.render.call(me);

                // 绘制宽度和高度
                if (me.width) {
                    main.style.width = me.width + 'px';
                }
                if (me.height) {
                    main.style.height = me.height + 'px';
                }

                // 绑定事件
                main.onkeypress = me.getPressHandler();

                // 设置readonly状态
                me.setReadOnly(!!me.readOnly);

                main.onfocus = me.getFocusHandler();
                main.onblur = me.getBlurHandler();
            }
        }
        
        if (me.main) {
            if (!me.value && me.virtualValue) {
                me.main.value = me.virtualValue;
                bui.Control.addClass(me.main, me.getClass('virtual'));
            } else {
                me.main.value = me.value;
            }
        }
    },

    /**
     * 获取获焦事件处理函数
     *
     * @private
     * @return {Function}
     */
    getFocusHandler: function() {
        var me = this,
            virtualValue = me.virtualValue;

        return function() {
            var main = me.main;

            me.onfocus();

            bui.Control.removeClass(main, me.getClass('virtual'));
            if ((virtualValue && me.getValue() == virtualValue) || me.autoSelect) {
                setTimeout(function() { main.select(); }, 0); // XXX: Fix Chrome select bug.
            }
        };
    },

    /**
     * 获取失焦事件处理函数
     *
     * @private
     * @return {Function}
     */
    getBlurHandler: function() {
        var me = this,
            virtualValue = me.virtualValue;

        return function() {
            var main = me.main,
                value = me.getValue();

            me.onblur();

            if (virtualValue
                && (value == '' || value == virtualValue)
            ) {
                main.value = virtualValue;
                bui.Control.addClass(main, me.getClass('virtual'));
            }
        };
    },

    /**
     * 获取键盘敲击的事件handler
     *
     * @private
     * @return {Function}
     */
    getPressHandler: function() {
        var me = this;
        return function(e) {
            e = e || window.event;
            var keyCode = e.keyCode || e.which;
            if (keyCode == 13) {
                return me.onenter();
            }
        };
    },

    onenter: new Function(),

    onfocus: new Function(),

    onblur: new Function(),

    /** * 获焦并选中文本
     *
     * @public
     */
    focusAndSelect: function() {
        this.main.select();
    },

    /**
     * 释放控件
     *
     * @public
     */
    dispose: function() {
        // 卸载main的事件
        var main = this.main;
        main.onkeypress = null;
        main.onchange = null;
        main.onpropertychange = null;
        main.onfocus = null;
        main.onblur = null;

        bui.Control.prototype.dispose.call(this);
    }
};
/*通过bui.Control派生bui.Button*/
bui.Control.derive(bui.TextInput);

define(function (require) {

    var T = baidu;
    var Control = require("Control");

    /**
     * 构造函数
     */
    var InputSelect = function () {
        this.constructor.superClass.constructor.apply(this, arguments);
    };

    InputSelect.prototype = {

        constructor: InputSelect,
        
        /**
         * 控件类型标识
         * 
         * @private
         * @type {string}
         */
        type: 'inputselect',
        
        // 控件的配置项（默认状态）
        options: {

            // 控件的容器元素
            main: '',
            
            // 控件class前缀，同时将作为main的class之一
            prefix: 'ui-input-select',


            showflag: false,

            //传递的值
            value: '5',

            //单位
            unit: '',

            //input的placeholder
            info: '',

            //输入的value
            inputValue: '',

            //显示的值
            text: '5万元',

            //完成城市选择后的回调
            onafterselect: null,

            //数据
            data: []
        
        },

        /**
         * 需要绑定 this 的方法名，多个方法以半角逗号分开
         * 
         * @private
         * @type {string}
         */
        binds: 'onclick, onblur, onsubmit',

        /**
         * 控件的初始化
         * @param  {object} options 控件的配置项
         */
        init: function (options) {

            options = this.setOptions(options);
            this.data = options.data;
            this.prefix = options.prefix;
            this.value = options.value;
            this.text = options.text;
            this.eventFlag = false;
            var options = this.options;

            if (options.main) {
                this.main = T.g(options.main);
                T.addClass(this.main, options.prefix);
                T.on(this.main, 'click', this.onclick);
            }
            this.render();

            var input = T.q(options.prefix + '-value', this.main)[0];
            T.on(input, 'keyup', this.onsubmit);
        },

        /**
         * input框提交的时候触发函数
         * @param  {event} e      事件
         * @param  {object} target 事件源
         */
        onsubmit: function (e, target) {

            e && T.event.preventDefault(e);
            target = target || T.event.getTarget(e);
            var options = this.options;
            var errortips = T.q(this.prefix + '-tips', this.main)[0];
            var me = this;

            if (!me.eventFlag) {
                me.eventFlag = true;
                setTimeout(function () {

                    var error = me.prefix + '-error';
                    options.showflag ? me.hide() : '';

                    if (target.value === '') {
                        !options.showflag ? me.show() : '';
                        me.options.inputValue = '';
                    } 

                    //验证值的准确性
                    if (me.validate(target.value)) {
                        me.setValue({
                            'value': target.value,
                            'text': target.value + me.options.unit
                        });

                        me.options.inputValue = target.value;

                        if (T.dom.hasClass(me.main, error)) {
                            T.dom.removeClass(me.main, error);
                        }

                        errortips.style.visibility = 'hidden';
                    }
                    else {
                        T.dom.addClass(me.main, error);
                        errortips.style.visibility = 'visible';
                    }

                    me.eventFlag = false;
                }, 500);
            }
            
        },

        validate: function (value) {
            return (/^((([1-9]{1}\d*)|([0]{1}))(\.(\d){1,2})?)?$/gi)
                        .test(value);
        },

        /**
         * 完成选择后的回调函数
         */
        onafterselect: function () {

            var options = this.options;
            if (options.onafterselect 
                && typeof options.onafterselect === 'function'
            ) {
                options.onafterselect();
            }
        },

        /**
         * 显示下面的一堆东西
         */
        show: function () {

            var eventFlag = false;
            var options = this.options;
            var show = T.q(this.prefix + '-show', this.main)[0];
            
            show.style.visibility = 'visible';
            this.options.showflag = true;
            T.on(document, 'click', this.onblur);
        },

        /**
         * 隐藏下面的一堆东西
         * @return {[type]} [description]
         */
        hide: function () {

            var options = this.options;
            var show = T.q(this.prefix + '-show', this.main)[0];
            show.style.visibility = 'hidden';
            this.options.showflag = false;
            T.un(document, 'click', this.onblur);
        },

        /**
         * 判断是否能向上冒泡到指定元素
         * @param  {element}  target    指定元素
         * @param  {string}  classname  要查找的class名
         * @param  {element}  as        向上查找的边界元素
         * @return {Boolean}            判断结果
         */
        hasClass: function (target, classname, as) {

            while(true) {
                if (target === as || target === document) {
                    return false;
                }
                else if (target && T.dom.hasClass(target, classname)) {
                    return true;
                } 
                else {
                    if (target) {
                        target = target.parentNode
                    } else {
                        return true;
                    }
                }
            }
        },

        /**
         * getvalue
         * @return {string} value值
         */
        getValue: function () {

            return this.options.inputValue === '' 
                ? this.value 
                : this.options.inputValue;
        },

        /**
         * setvalue
         * @param {object} obj 要设置的对象
         */
        setValue: function (obj) {
            var input = T.q(this.prefix + '-value', this.main)[0];
            input.value = this.options.showtype === 'text' 
                ? obj.text 
                : obj.value;
            this.text = obj.text;
            this.value = obj.value;

            this.render();
        }, 

        setInputValue: function (value) {
            var input = T.q(this.prefix + '-value', this.main)[0];
            input.value = this.options.showtype === 'text' 
                ? value 
                : value + this.options.unit;
            this.options.inputValue = value;
            this.value = 0;
            this.render();
        },

        /**
         * gettext
         * @return {string} text值
         */
        getText: function () {

            return this.options.inputValue === '' 
                ? this.text
                :this.options.inputValue + this.options.unit;
        },

        /**
         * 控件失去焦点的事件处理函数
         * @param  {event} e      事件源
         * @param  {element} target 事件元素
         */
        onblur: function (e, target) {

            e && T.event.preventDefault(e);
            target = target || T.event.getTarget(e);

            if (!this.hasClass(target, this.prefix, document)) {
                this.hide();
                var input = T.q(this.prefix + '-value').value;
                if (this.options.inputValue === '') {
                    this.setValue({
                        value: this.value,
                        text: this.value + this.options.unit
                    });
                }
            }
        },

        /**
         * 组装即将渲染的展示部分
         * @return {array} 组装好的html片段
         */
        build: function () {

            var html = [];  
            var data = this.data;
            var options = this.options;

            html.push(''
                + '<span style="padding-left: 5px; color: gray;">' 
                + options.info 
                + '</span>'
            );
            for (var i = 0, len = data.length; i < len; i ++ ) {
                
                var hiclass = '';
                var border = '';

                if (i === data.length - 1) {
                    border = ' style="border-bottom: 0"';
                }

                if (this.value == data[i].value) {
                    hiclass = ' class="' + options.prefix + '-select"';
                }
                html.push(''
                    + '<span' + border + '>'
                    + '<a data-value="' + data[i].value + '"' + hiclass + '>' 
                    + data[i].text 
                    + '</a></span>'
                );
            }
            return html.join('');
        },

        /**
         * 渲染控件的展示部分
         */
        render: function () {

            var main = this.main;
            var options = this.options;
            var html = this.build();
            var show = T.q(options.prefix + '-show', this.main)[0];
            var tips = T.q(options.prefix + '-tips', this.main)[0];

            if (!show && !tips) {
                show = T.dom.create('DIV', {
                    'className': this.options.prefix + '-show'
                });
                tips = T.dom.create('DIV', {
                    'className': this.options.prefix + '-tips'
                });
                show.innerHTML = html;
                tips.innerHTML = '请输入整数或者保留2位的小数<span>▼<span>▼</span></span>'
                main.appendChild(show);
                main.appendChild(tips);
            } 
            else {
                show.innerHTML = html;
            }
        },

        /**
         * 判断是否存在错误
         * @return {Boolean} 判断结果
         */
        isError: function () {
            if(T.dom.hasClass(this.main, error)) {
                return true;
            }
            return false;
        },

        /**
         * 点击控件的事件句柄
         * @param  {event}  e      事件源
         * @param  {object} target 事件对应的dom元素
         */
        onclick: function (e, target) {

            e && T.event.preventDefault(e);
            target = target || T.event.getTarget(e);

            var options = this.options;
            var main = this.main;

            if (this.hasClass(target, options.prefix + '-box', main)) {

                if (!options.showflag) {
                    this.show();
                }
                else {
                    this.hide();
                }
            }
            else if (target.tagName === 'A') {

                this.options.inputValue = '';
                var text = target.childNodes[0].nodeValue;
                var value = T.dom.getAttr(target, 'data-value');
                var error = this.prefix + '-error';
                var errortips = T.q(this.prefix + '-tips', this.main)[0];

                this.setValue({
                    'value': value,
                    'text': text
                });

                if (T.dom.hasClass(this.main, error)) {
                    T.dom.removeClass(this.main, error);
                }
                errortips.style.visibility = 'hidden';
                this.hide();
                this.render();
                this.onafterselect();
            }
        }


    };

    T.inherits(InputSelect, Control);

    return InputSelect;
});
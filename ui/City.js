define(function (require) {

    var T = baidu;
    var Control = require("Control");

    /**
     * 构造函数
     */
    var City = function () {
        this.constructor.superClass.constructor.apply(this, arguments);
    };

    City.prototype = {

        constructor: City,
        
        /**
         * 控件类型标识
         * 
         * @private
         * @type {string}
         */
        type: 'city',
        
        // 控件的配置项（默认状态）
        options: {

            // 控件的容器元素
            main: '',
            
            // 控件class前缀，同时将作为main的class之一
            prefix: 'ui-city',

            // 激活item的标签索引
            tabIndex: 1,

            //tab的激活标签
            tabSelectClass: 'select',

            showflag: false,

            //显示的值
            value: '北京',

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
        binds: 'onclick, onblur',

        /**
         * 控件的初始化
         * @param  {object} options 控件的配置项
         */
        init: function (options) {

            options = this.setOptions(options);
            this.data = options.data;
            
            var options = this.options;

            if (options.main) {
                this.main = T.g(options.main);
                this.prasedata();
                T.addClass(this.main, options.prefix);
                T.on(this.main, 'click', this.onclick);
            }
            this.render();
        },

        show: function () {

            var show = T.q(this.options.prefix + '-show', this.main)[0];
            show.style.visibility = 'visible';
            this.options.showflag = true;
            T.on(document, 'click', this.onblur);
        },

        hide: function () {

            var show = T.q(this.options.prefix + '-show', this.main)[0];
            show.style.visibility = 'hidden';
            this.options.showflag = false;
            T.un(document, 'click', this.onblur);
        },

        hasClass: function (target, classname, as) {

            while(1) {
                if (target == as || target == document) {
                    return false;
                }
                else if (target && T.dom.hasClass(target, classname)) {
                    return true;
                } 
                else {
                    if (target) {
                        target = target.parentNode;
                    } 
                    else {
                        return true;
                    }
                }
            }
        },
 
        getValue: function () {

            return this.options.value;
        },

        setValue: function (value) {
            var input = T.q(this.options.prefix + '-value' ,this.main)[0];
            input.childNodes[0].nodeValue = value;
            this.options.value = value;
        }, 

        /**
         * 组装数据，将外界数据转化为控件所需的格式
         */
        prasedata: function () {

            var data = this.data;

            // 控件的私有的数据容器
            var tabs = this.tabs = [];

            T.array.forEach(data, function (item) {
                var pre = item.split('|');
                tabs.push({
                    title: pre[0],
                    items: pre[1].split(',')
                });
            });
        },

        onblur: function (e, target) {

            e && T.event.preventDefault(e);
            target = target || T.event.getTarget(e);

            if (!this.hasClass(target, this.options.prefix, document)) {
                this.hide();
            }
        },

        /**
         * 组装即将渲染的展示部分
         * @return {array} 组装好的html片段
         */
        build: function () {

            var html = [];
            var tabs = this.tabs;
            var options = this.options;
            var remens = tabs[0].items;
            var defultTab = tabs[options.tabIndex].items;

            // 组装‘热门城市’的html片段
            html.push('<label>热门城市</label><ul>');
            T.array.forEach(remens, function (item) {
                html.push('<li>' + item + '</li>');
            });

            // 组装‘全部城市’的html片段
            html.push(''
                + '</ul>'
                + '<label>全部城市</label>'
                + '<div class="' + options.prefix + '-tabs">'
            );

            //组装‘A - Z’的字母tabs的html片段
            for (var i = 1, len = tabs.length; i < len; i ++ ) {
                var tabSelectClass = '';

                if (i === options.tabIndex) {
                    tabSelectClass = 'class="' 
                        + options.prefix + '-'
                        + options.tabSelectClass + '"';
                }
                html.push(''
                    +'<a ' + tabSelectClass + '>' 
                    + tabs[i].title 
                    + '</a>'
                );
            }

            // 组装tabs下的展示模块html代码
            html.push('</div><ul>');
            T.array.forEach(defultTab, function (item) {
                html.push('<li>' + item + '</li>');
            });
            html.push('</ul>');

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

            if (!show) {
                show = T.dom.create('DIV', {
                    'className': this.options.prefix + '-show'
                });
                show.innerHTML = html;
                main.appendChild(show);
            } 
            else {
                show.innerHTML = html;
            }
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

                var tabs = T.q(options.prefix + '-tabs', this.main)[0].childNodes;

                for (var i = 0, len = tabs.length; i < len; i ++ ) {

                    if (tabs[i] === target) {
                        options.tabIndex = i + 1;
                        this.render();
                    }
                }
            }
            else if (target.tagName === 'LI') {

                var value = target.childNodes[0].nodeValue
                this.setValue(value);
                options.tabIndex = 1;
                this.hide();
                this.render();

                if (options.onafterselect 
                    && typeof options.onafterselect === 'function'
                ) {
                    options.onafterselect();
                }
            }
        }


    };

    T.inherits(City, Control);

    return City;
});

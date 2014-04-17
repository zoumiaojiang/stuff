/**
 * @desc slide控件
 * @author zoumiaojiang@baidu.com
 */


var Slide = (function () {

    var Slide = function (id, options) {
        arguments.length && this.init(id, options);
    }

    var config = {};        //配置信息
    var count = 0;          //轮换的唯一顺序标识
    var currIndex = 0;      //当前显示的下标
    var clickFlag = false;  //轮换过程中判断时候中断（点击中断）
    var time;               //全局的setTimeout函数

    /**
     * 初始化控件
     * @param  {string} id      控件的id
     * @param  {object} options 控件的配置信息
     */
    Slide.prototype.init = function (id, options) {

        var me   = this,
            ele  = document.getElementById(id);

        if (ele) {
            config = options || {};

            config.width = config.width || 690;
            config.height = config.height || 370;

            ele.style.width = config.width + 'px';
            ele.style.height = config.height + 'px';
            
            //填充图片
            me.fillImage(ele);
            var btns = ele.lastChild;
            btns.style.left = (config.width / 2 - btns.clientWidth / 2) + 'px';

            //跑起来～～
            me.run(ele);
            
            //注册点击和hover事件
            me.touch(ele);
        }

    };

    /**
     * 填充图片
     * @param  {HTMLElment} ele 填充的根元素
     */
    Slide.prototype.fillImage = function (ele) {

        var html = [],
            me   = this;

        function done() {
            var imgs = config.images; 
            for (var i = 0, len = imgs.length; i < len; i ++) {
                html.push(''
                    + '<a class="ui-slide-item" href="' 
                    +    imgs[i].url + '" title="' + imgs[i].desc 
                    +    '" style="display:none;">'
                    +    '<img src="' + imgs[i].src + '" '
                    +       'alt="' + imgs[i].desc + '" '
                    +       'width="' + config.width + '" '
                    +       'height="' + config.height + '"/>'
                    + '</a>'
                );
            }
        }

        var children = getChildren(ele);
        var length = config.length = children.length;

        if (length) {
            config.images = [];

            for (var i = 0; i < length; i ++) {
                var as = children[i];
                as.style.display = 'none';
            }
        }
        else {
            done();
        }

        html.push('<div class="ui-slide-nav">');

        for (var i = 0; i < length; i++ ) {
            var className = i == 0 
                ? 'ui-slide-nav-btn current' 
                : 'ui-slide-nav-btn';
            html.push(''
                + '<span class="' + className + '"></span>'
            );
        }
        html.push('</div>');

        ele.innerHTML = ele.innerHTML + html.join('');
        currIndex = 0;
    };

    /**
     * 得到孩子dom节点
     * @param  {object} ele 父节点
     * @return {Array[object]}     返回的子节点列表
     */
    function getChildren(ele) {
        var children = [];

        if (ele && ele.childNodes) {
            for (var i = 0, len = ele.childNodes.length; i < len; i ++) {
                var item = ele.childNodes[i];
                if (item.nodeType === 1) {
                    children.push(item);
                }
            }
        }

        return children;
    }

    /**
     * 图片跑起来
     * @param  {HTMLElement} ele 跑起来的根元素
     */
    Slide.prototype.run = function (ele) {

        var me = this,
            len = config.length;

        //首次加载图片或者在change之后都要进行初始化，其他情况不用
        if (!clickFlag) {

            me.fade('in', ele.childNodes[0], {
                'speed': 20,
                'opacity': 100
            });
        }
        /**
         * 仿线程
         */
        function sleep() {

            time = setTimeout(function () {
                me.change(++ count % len ,ele);
                sleep();
            }, config.showTime || 3000);
        };
        sleep();
    }

    /**
     * 图片的轮换
     * @param  {number} num 下一个将要被轮换的图片下标
     * @param  {HTMLElement} ele 控件根元素
     */
    Slide.prototype.change = function (num, ele) {

        var me   = this,
            len  = ele.childNodes.length - 1,
            foot = ele.childNodes[len];

        for (var i = 0; i < len; i ++) {

            var currImg = ele.childNodes[currIndex],
                nextImg = ele.childNodes[i],
                fcs     = foot.childNodes[i];

            if (i === num) {

                me.transition(currImg, nextImg, {});

                currIndex = i;
                fcs.className = 'ui-slide-nav-btn current';
            }
            else {
                fcs.className = 'ui-slide-nav-btn';
            }
        }
    };


    /**
     * 给按钮注册点击和hover事件
     * @param  {HTMLElement} ele 事件代理的根元素
     */
    Slide.prototype.touch = function (ele) {

        var me = this,
            preClick,
            preHover;
        /**
         * 事件的处理句柄
         * @param  {eventObject} e 事件对象
         */
        function handle (e) {
            var ev     = e || window.event,
                target = ev.target || ev.srcElement;

            if (target.className.indexOf('ui-slide-nav-btn') !== -1) {

                var len = target.parentNode.childNodes.length
                for (var i = 0; i < len; i ++) {

                    var tmp = target.parentNode.childNodes[i];

                    if (tmp == target && i !== currIndex) {
                        me.change(i, ele);
                        clickFlag = true;
                        count = i;
                        clearTimeout(time);

                        //在安全时间内过渡到正常模式，不然会有时间轮换冲突
                        setTimeout(function () {
                            me.run(ele);
                        }, 30);
                    }
                }
            }
        }
        ele.onclick = function (e) {
            /**
             * click点击过了一段时间后再进行事件处理
             */
            clearTimeout(preClick)
            preClick = setTimeout(function () {
                handle(e);
            }, config.hoverTime || 500);
        }
        ele.onmouseover = function (e) {
            clearTimeout(preHover);
            preHover = setTimeout(function () {
                handle(e);
            }, config.hoverTime || 500);
        }
    }

    /**
     * 淡入淡出的函数
     * @param  {string}      type    表示淡入还是淡出， in/out
     * @param  {HTMLElement} ele     淡入淡出的目标元素
     * @param  {object}      options 配置信息{total: xxx, opacity: xxx;}
     */
    Slide.prototype.fade = function (type, ele, options) {

        var me      = this,
            speed   = options.speed || 20,
            opacity = options.opacity || 0, 
            val;

        if (type === 'in') {

            val = 0;
            ele.style.display = 'block';
            me.setOpacity(ele, val);

            (function () {
                me.setOpacity(ele, val);
                val += 5;
                if (val <= opacity) {
                    setTimeout(arguments.callee, speed);
                }
            })();
        }
        else if (type === 'out') {

            val = 100;
            me.setOpacity(ele, val);

            (function () {
                me.setOpacity(ele, val);
                val -= 5;
                
                if (val >= opacity) {
                    setTimeout(arguments.callee, speed);
                }
                else if (val < 0) {
                    ele.style.display = 'none';
                }
            })();
        }
    }


    Slide.prototype.transition = function (outEle, inEle, options) {
        var me      = this;
        var speed   = options.speed || 50;
        

        var inVal = 0;
        var outVal = 100;
        
        me.setOpacity(outEle, outVal);

        (function () {
            me.setOpacity(outEle, outVal);
            outVal -= 5;
            
            if (outVal >= 0) {
                setTimeout(arguments.callee, speed);
            }
            else if (outVal < 0) {
                outEle.style.display = 'none';
                outEle = null;
            }
        })();


        inEle.style.display = 'block';
        me.setOpacity(inEle, inVal);

        (function () {
            me.setOpacity(inEle, inVal);
            inVal += 5;
            if (inVal <= 100) {
                setTimeout(arguments.callee, speed);
            }
            else {
                inEle = null;
            }
        })();

    };  

    /**
     * 设置元素的北京透明度
     * @param {HTMLElemnet} ele   目标元素
     * @param {number} value 将要设置的透明度值
     */
    Slide.prototype.setOpacity = function (ele, value) {

        if (!+[1,]) {
            var val = parseInt(value) || 0;
            ele.style.filter = 'alpha(opacity=' + parseInt(value) + ')';
        }
        else {
            ele.style.opacity = (value/100).toFixed(2);
        }
    }

    return Slide;

}());
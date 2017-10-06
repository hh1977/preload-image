/**
 * 将图片预加载封装成插件
 */
(function ($) {
    function Preload(imgs, options) {
        this.imgs = (typeof imgs === 'string') ? [imgs]: imgs; // 保证为数组
        this.opts = $.extend({}, Preload.DEFAULTS, options); // 用options覆盖默认值，然后生成一个新对象

        // 调用加载方法
        if (this.opts.order === 'ordered') {
            this._orderedLoad();
        } else {
            this._unorderedLoad(); // 无序加载
        }
    }

    // Preload默认值
    Preload.DEFAULTS = {
        order: 'unorder', // 默认无序加载
        each: null, // 接收一个方法，每一张图片加载完成后调用该函数
        all: null // 接收一个方法，所有图片加载完成后调用该函数
    };

    // 有序加载
    Preload.prototype._orderedLoad = function () {
        var imgs = this.imgs;
        var opts = this.opts;
        var count = 0;
        var len = imgs.length;

        function load() {
            var imgObj = new Image();
            imgObj.src = imgs[count];

            $(imgObj).on('load error', function () {
                if (count >= len) {
                    opts.all && opts.all(); // 全部加载完毕
                } else {
                    opts.each && opts.each(count); // 将当前正在加载的图片索引传递出去
                    load();
                }

                count++;
            })
        }

        load();
    }

    // 无序加载
    Preload.prototype._unorderedLoad = function () {
        var imgs = this.imgs;
        var opts = this.opts;
        var count = 0; // 计数器
        var len = imgs.length;

        $.each(imgs, function (index, src) {
            if (typeof src != 'string') { // src路径不是字符串则不往下执行
                console.error('请传入字符串形式的图片路径');
                return;
            }

            var imgObj = new Image();
            imgObj.src = src;

            $(imgObj).on('load error', function () {
                opts.each && opts.each(count); // 首先判断each属性是否存在，存在则执行

                if (count >= len -1) {
                    opts.all && opts.all(); // 同理，不过是在图片加载完成之后调用
                }

                count++;
            });
        });
    }

    // 挂载到jQuery对象上
    $.extend({
        preload: function (imgs, opts) { // 命名为preload
            new Preload(imgs, opts);
        }
    });
})(jQuery);


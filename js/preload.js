/**
 * 将图片预加载封装成插件
 */
(function ($) {
    function Preload(imgs, options) {
        this.imgs = (typeof imgs === 'string') ? [imgs]: imgs; // 保证为数组
        this.opts = $.extend({}, Preload.DEFAULTS, options); // 用options覆盖默认值，然后生成一个新对象

        // 调用加载方法
        this._unorderedload(); // 无序加载
    }

    // Preload默认值
    Preload.DEFAULTS = {
        each: null, // 接收一个方法，每一张图片加载完成后调用该函数
        completed: null // 接收一个方法，所有图片加载完成后调用该函数
    };

    Preload.prototype._unorderedload = function () {
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
                    opts.completed && opts.completed(); // 同理，不过是在图片加载完成之后调用
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


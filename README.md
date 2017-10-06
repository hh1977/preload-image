# 图片预加载
图片预加载说白了就是将所有所需的图片提前请求加载到本地，这样后面在需要用到时就直接从缓存取图片
。图片预加载的原理很简单：new Image()，然后使用onload方法回调预加载完成事件，当浏览器把图片下载到本地后，之后同样的src就直接使用缓存。

## 无序加载
假定有页面要用到一些image，我们可以这样来预加载这些图片:

```
// 所有的图片（要是网络太好，自己加图片吧）
const imgs = [
    "http://op2clp53n.bkt.clouddn.com/20161104122758_cap-hpi.jpg",
    "http://op2clp53n.bkt.clouddn.com/500414621%20%281%29.jpg",
    "http://op2clp53n.bkt.clouddn.com/cover_bg.png",
    "http://img.aotu.io/mamboer/post-aotu.jpg",
    "http://misc.aotu.io/o2/img/books/books-cover.jpg",
    "http://img.aotu.io/Yettyzyt/cover.png",
    "http://img.aotu.io/wengeek/responsive-image.png",
    "https://gw.alicdn.com/tfs/TB1_6wnRXXXXXbwXFXXXXXXXXXX-900-500.jpg",
    "http://op2clp53n.bkt.clouddn.com/_138.jpg",
    "http://op2clp53n.bkt.clouddn.com/0_ocs_fin_cov_1.jpg",
    "http://op2clp53n.bkt.clouddn.com/2voyage.jpg",
    "http://op2clp53n.bkt.clouddn.com/boa_illustrations_master_fb_1200x628-12.jpg",
    "http://op2clp53n.bkt.clouddn.com/building_science_bulletin_cover_2__1x.jpg",
    "http://op2clp53n.bkt.clouddn.com/building-science-bulletin-cover_1x.jpg",
    "http://op2clp53n.bkt.clouddn.com/chemistry4_1x.png",
    "http://op2clp53n.bkt.clouddn.com/first_colony_dribbble_copy.jpg"
];
let len = imgs.length;

/**
 * 遍历imgs数组，将所有图片加载出来
 * 可以通过控制台查看网络请求，会发现所有图片均已加载
 */
for (let i = 0; i < len; i++) {
    let imgObj = new Image(); // 创建图片对象
    imgObj.src = imgs[i];

    imgObj.addEventListener('load', function () { // 这里没有考虑error，实际上要考虑
        console.log('imgs' + i + '加载完毕');
    }, false);
}
```

## 有序加载
上面的方法并不能保证图片按其在数组中的顺序加载，那怎么按顺序加载呢？

```
// 所有的图片（要是网络太好，自己加图片吧）
const imgs = [
    "http://op2clp53n.bkt.clouddn.com/20161104122758_cap-hpi.jpg",
    "http://op2clp53n.bkt.clouddn.com/500414621%20%281%29.jpg",
    "http://op2clp53n.bkt.clouddn.com/cover_bg.png",
    "http://img.aotu.io/mamboer/post-aotu.jpg",
    "http://misc.aotu.io/o2/img/books/books-cover.jpg",
    "http://img.aotu.io/Yettyzyt/cover.png",
    "http://img.aotu.io/wengeek/responsive-image.png",
    "https://gw.alicdn.com/tfs/TB1_6wnRXXXXXbwXFXXXXXXXXXX-900-500.jpg",
    "http://op2clp53n.bkt.clouddn.com/_138.jpg",
    "http://op2clp53n.bkt.clouddn.com/0_ocs_fin_cov_1.jpg",
    "http://op2clp53n.bkt.clouddn.com/2voyage.jpg",
    "http://op2clp53n.bkt.clouddn.com/boa_illustrations_master_fb_1200x628-12.jpg",
    "http://op2clp53n.bkt.clouddn.com/building_science_bulletin_cover_2__1x.jpg",
    "http://op2clp53n.bkt.clouddn.com/building-science-bulletin-cover_1x.jpg",
    "http://op2clp53n.bkt.clouddn.com/chemistry4_1x.png",
    "http://op2clp53n.bkt.clouddn.com/first_colony_dribbble_copy.jpg"
];
let len = imgs.length;

/**
 * 遍历imgs数组，有序将所有图片加载出来
 * 可以通过控制台查看网络请求，会发现所有图片均按顺序加载
 */
let count = 0;
load();

function load() {
    var imgObj = new Image();
    imgObj.src = imgs[count];

    $(imgObj).on('load error', function () { // 没错我使用了jQuery
        console.log(count);
        if (count >= len) {
            console.log('加载完毕');
            $('.container').addClass('active');
        } else {
            load(); // 继续加载下一张
        }

        count++;
    });
}
```

## 将预加载封装成jQuery插件并使用
1. 接下来就上面所介绍的预加载方法封装成jQuery插件

```
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
```

2. 如何使用？
so easy啦，就像这样

```
<script src="js/jquery.min.js"></script>
<script src="js/preload.js"></script>
<script>
// 所有的图片（要是网络太好，自己加图片吧）
const imgs = [
    "http://op2clp53n.bkt.clouddn.com/20161104122758_cap-hpi.jpg",
    "http://op2clp53n.bkt.clouddn.com/500414621%20%281%29.jpg",
    "http://op2clp53n.bkt.clouddn.com/cover_bg.png",
    "http://img.aotu.io/mamboer/post-aotu.jpg",
    "http://misc.aotu.io/o2/img/books/books-cover.jpg",
    "http://img.aotu.io/Yettyzyt/cover.png",
    "http://img.aotu.io/wengeek/responsive-image.png",
    "https://gw.alicdn.com/tfs/TB1_6wnRXXXXXbwXFXXXXXXXXXX-900-500.jpg",
    "http://op2clp53n.bkt.clouddn.com/_138.jpg",
    "http://op2clp53n.bkt.clouddn.com/0_ocs_fin_cov_1.jpg",
    "http://op2clp53n.bkt.clouddn.com/2voyage.jpg",
    "http://op2clp53n.bkt.clouddn.com/boa_illustrations_master_fb_1200x628-12.jpg",
    "http://op2clp53n.bkt.clouddn.com/building_science_bulletin_cover_2__1x.jpg",
    "http://op2clp53n.bkt.clouddn.com/building-science-bulletin-cover_1x.jpg",
    "http://op2clp53n.bkt.clouddn.com/chemistry4_1x.png",
    "http://op2clp53n.bkt.clouddn.com/first_colony_dribbble_copy.jpg"
];

/**
 * 使用插件，并有序加载
 */
$.preload(imgs, {
    order: 'ordered',
    each: function (count) {
        console.log('正在加载第' + (count + 1) + '张图片');
    },
    all: function () {
        console.log('全部加载完成');
    }
});
</script>
```

/**
 * Created by qiyc on 2017/2/6.
 */
//核心依赖
require("./core/jtopo/jtopo-min.js");
if (typeof jQuery == "undefined") {
    throw new Error("need jquery");
}
//QTopo
var QTopo = {
    instance: [],
    util: require('./util.js'),
    constant: require('./constant.js'),
    log: {
        error: true,
        info: true
    }
};
window.QTopo = QTopo;
var Scene = require('./core/Scene.js');
require("./core/tools.js");//加载scene的工具api

//-----------------------对外接口
QTopo.init = function (dom, config) {
    reset();
    dom = dom instanceof Array ? dom[0] : dom;
    var canvas = initCanvas(dom, $(dom).width(), $(dom).height());
    var QtopoInstance = {
        scene: new Scene(new JTopo.Stage(canvas), config),
        setOption: setOption,
        document: dom,
        resize: resize(dom, canvas)
    };
    this.instance.push(QtopoInstance);
    return QtopoInstance;
};
//---------------------
function setOption(option, clear) {
    option = option || {};
    QTopo.util.info("start set topo: ", option);
    var scene = this.scene;
    if (clear) {
        scene.clear();
    }
    createNode(scene, option.node);
    createContainer(scene, option.container);
    createLink(scene, option.link);
    createLine(scene, option.line);
    drawAlarm(scene, option.alarm);
    if (scene.jtopo.childs && scene.jtopo.childs.length > 0) {
        QTopo.util.info("set topo complete: ", scene.children);
        scene.goCenter();
    }
}
function resize(dom, canvas) {
    return function () {
        canvas.setAttribute('width', $(dom).width());
        canvas.setAttribute('height', $(dom).height());
    }
}
function initCanvas(dom, width, height) {
    if (width <= 0 || height <= 0) {
        throw new Error("The dom is not exist /not config width and height!");
    }
    dom.style.position = 'relative';
    dom.style.overflow = 'hidden';
    var canvas = document.createElement('canvas');
    dom.appendChild(canvas);
    canvas.setAttribute('width', width);
    canvas.setAttribute('height', height);
    canvas.style.position = "absolute";
    canvas.style.top = 0;
    canvas.style.left = 0;
    canvas.style['user-select'] = 'none';
    canvas.style['-webkit-tap-highlight-color'] = 'rgba(0, 0, 0, 0)';
    return canvas;
}
function createNode(scene, config) {
    if (config) {
        setDefaults(scene, QTopo.constant.node, config.style);
        if ($.isArray(config.data)) {
            $.each(config.data, function (i, item) {
                var node = scene.createNode(item);
                //额外属性添加
                setExtra(config, node, item);
            });
        }
    }
}
//排除临时元素
function notCasual(arr) {
    if (arr.length == 1) {
        return arr[0];
    } else {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].getUseType() != QTopo.constant.CASUAL) {
                arr = arr[i];
                return arr;
            }
        }
    }
}
function createContainer(scene, config) {
    if (config) {
        var findChild;
        if (config.children) {
            findChild = config.children;
        }
        setDefaults(scene, QTopo.constant.container, config.style);
        if ($.isArray(config.data)) {
            //开始构造分组
            $.each(config.data, function (i, item) {
                //无论是否有子元素，分组先创造出来
                var container = scene.createContainer(item);
                //额外属性添加
                setExtra(config, container, item);
                //确定查找子元素的标记
                var findChild_exact = findChild;
                if (item.children) {
                    findChild_exact = item.children;
                }
                //查找子元素并塞入
                if (findChild_exact) {
                    $.each(item.data, function (j, children) {
                        var child = scene.find(findChild_exact + "=" + children);
                        if (child && child.length > 0) {
                            $.each(child, function (m, one) {
                                if (one.getUseType() != QTopo.constant.CASUAL) {
                                    container.add(one);
                                }
                            });
                        } else {
                            QTopo.util.error("some child not found : " + j, findChild_exact + "=" + children);
                        }
                    });
                } else {
                    QTopo.util.error("can't find children,need config children");
                }
            });
        }
    }
}
function createLink(scene, config) {
    if (config) {
        var path = config.path;
        if ($.isArray(path) && path.length > 0) {
            var findStart;
            var findEnd;
            //path为数组，0为起点条件1为终点条件,确定搜索条件,起始点条件可不同
            if (path.length == 1) {
                findEnd = path[0];
                findStart = findEnd;
            } else {
                findStart = path[0];
                findEnd = path[1];
            }
            //设置默认属性
            setDefaults(scene, QTopo.constant.link, config.style);
            //开始创建
            if ($.isArray(config.data)) {
                $.each(config.data, function (i, item) {
                    var link;
                    //根据确定的条件进行搜索
                    var start = notCasual(scene.find(findStart + "=" + item.start));
                    var end = notCasual(scene.find(findEnd + "=" + item.end));
                    if (start && end) {
                        item.start = start;
                        item.end = end;
                        link = scene.addLink(item);
                        //额外属性添加
                        setExtra(config, link, item);
                    } else {
                        QTopo.util.error("some link path invalid : " + i, item);
                        if (!start) {
                            QTopo.util.error("start not found : ", item.start);
                        }
                        if (!end) {
                            QTopo.util.error("end not found : ", item.end);
                        }
                    }
                });
            }

        } else {
            QTopo.util.error("can not draw link,need config 'path' and 'path' is Array and not empty, path used to find start and end");
        }
    }
}
function createLine(scene, config) {
    if (config) {
        //设置默认属性
        //设置默认属性
        setDefaults(scene, QTopo.constant.line, config.style);
        //开始创建
        if ($.isArray(config.data)) {
            $.each(config.data, function (i, v) {
                var line = scene.createLine(v);
                //额外属性添加
                setExtra(config, line, v);
            });
        } else {
            QTopo.util.error("can not draw line,need config 'path' and 'path' is Array and not empty,path's element need config x y, path used to find start and end");
        }
    }
}
function drawAlarm(scene, config) {
    if (config) {
        if ($.isArray(config.data) && config.node) {
            var alarmData = config.data;
            QTopo.util.info("设置告警条目 :", alarmData.length);
            var findNode = config.node;
            var alarmNodes = [];
            $.each(alarmData, function (k, v) {
                var node = notCasual(scene.find(findNode + "=" + v["node"], "node"));
                if (node) {
                    alarmNodes.push({
                        node: node,
                        alarm: {
                            show: typeof v.show == "boolean" ? v.show : true,
                            text: v.text,
                            color: v.color,
                            font: v.font
                        }
                    });
                    setExtra(config, node, v);
                }
            });
            QTopo.util.info("实际告警数目 :", alarmNodes.length);
            if (config.animate) {
                alarmAnimate(config.animate, alarmNodes);
            } else {
                $.each(alarmNodes, function (i, v) {
                    v.node.set({
                        alarm: v.alarm
                    });
                });
            }
        }
    }
}
var animateRuning;
function alarmAnimate(animate, alarmNodes) {
    if (animate) {
        if ($.isNumeric(animate.time)) {
            clearAnimat();
            QTopo.util.info("启用告警动画");
            animateRuning = setInterval(function () {
                if (alarmNodes.length > 0) {
                    var data = alarmNodes.pop();
                    data.node.set({
                        alarm: data.alarm
                    });
                    QTopo.util.info("未启动:", alarmNodes.length);
                    if ($.isFunction(animate.callBack)) {
                        animate.callBack(data.node);
                    }
                } else {
                    QTopo.util.info("告警动画结束");
                    clearAnimat();
                }
            }, parseInt(animate.time));
        }
    }
}
function clearAnimat() {
    if (animateRuning) {
        clearInterval(animateRuning);
        animateRuning = "";
    }
}
function setExtra(config, element, data) {
    if (config && $.isArray(config.value) && element && data) {
        $.each(config.value, function (j, key) {
            if (data[key]) {
                if (!element.extra) {
                    element.extra = {};
                }
                element.extra[key] = data[key];
            }
        });
    }
}
function setDefaults(scene, typeArr, style) {
    if (style) {
        $.each(typeArr, function (i, types) {
            scene.setDefault(types, style);
        })
    }
}
function reset() {
    //重写日志函数，加入时间标记
    if (!$.isFunction(new Date().Format)) {
        Date.prototype.Format = function (fmt) { //author: meizz
            var o = {
                "M+": this.getMonth() + 1, //月份
                "d+": this.getDate(), //日
                "h+": this.getHours(), //小时
                "m+": this.getMinutes(), //分
                "s+": this.getSeconds(), //秒
                "q+": Math.floor((this.getMonth() + 3) / 3), //季度
                "S": this.getMilliseconds() //毫秒
            };
            if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
            for (var k in o)
                if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            return fmt;
        };
    }
}
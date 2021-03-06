/**
 * @module component
 */
/**
 * 窗口管理,所有窗口统一用instance.open(type,config)接口打开,type和窗口名对应指示打开哪种窗口，根据config做配置,
 * @class windows
 * @static
 */
require("./tools/style.css");
require("./windows.css");
require("./tools.css");
//-----工具类窗口
var tools = {
    imageSelect: require("./tools/imageSelect.js"),
    styleSelect:require("./tools/styleSelect.js"),
    confirm: require("./tools/confirm.js"),
    view: require("./tools/view.js"),
    tips: require("./tools/tips.js"),
    progress: require("./tools/progress.js"),
    loading: require("./tools/loading.js")
};
//-----设置类窗口
var wins = {
    imageNode: require("./imageNode/win.js"),
    textNode: require("./textNode/win.js"),
    link: require("./link/win.js"),
    autoLayout: require("./autoLayout/win.js"),
    container: require("./container/win.js")
};
module.exports = {
    init: init
};
/*
 * 初始化窗口组件
 * @param instance topo实例化对象
 * @param filter 禁止载入一些窗口
 */
function init(instance,config) {
    config=config||{};
    var wrap = getWrap(instance.document, "qtopo-windows");
    //公用窗口
    var tools = initToolsWindow(wrap, instance.document, instance.scene);
    //私有窗口
    var wins = initPrivateWin(wrap, tools, instance.document, instance.scene,config.filter);
    return {
        open:function (type, config) {
            var opened=tools[type]||wins[type];
            if(opened&&$.isFunction(opened.open)){
                return opened.open(config);
            }
        },
        setImages:function(images){
            tools.imageSelect.setImage(images);
        }
    }
}

function initToolsWindow(wrap, dom, scene) {
    var commonWrap = getWrap(wrap, "qtopo-windows-tools");
    var result = {};
    $.each(tools, function (name, jq) {
            result[name] = jq.init(dom, scene);
            commonWrap.append(result[name]);
    });
    return result;
}
function initPrivateWin(wrap, tools, dom, scene,filter) {
    //---windows
    filter=filter||[];
    var elementWrap = getWrap(wrap, "qtopo-windows-elements");
    var result={};
    $.each(wins,function(name,jq){
        if(filter.indexOf(name)<0){
            result[name]=jq.init(dom, scene, tools);
            elementWrap.append(result[name]);
        }
    });
    return result;
}
function getWrap(dom, clazz) {
    //添加外壳
    dom = $(dom);
    var wrap = dom.find("." + clazz);
    if (wrap.length == 0) {
        wrap = $("<div class='" + clazz + "'></div>");
        dom.append(wrap);
    }
    return wrap;
}

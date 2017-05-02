/**
 * @module core
 */
/**
 * 直线链路
 * @class  DirectLink
 * @constructor
 * @extends [L] Link
 * @param [config] 配置参数，无参则按全局配置创建
 */
var Link = require("./Link.js");
module.exports = {
    constructor: DirectLink,
    setDefault: setDefault,
    getDefault: getDefault
};
//-
var DEFAULT = {
    number: 1,
    alpha: 1,
    color: '22,124,255',
    arrow: {
        type:'close',
        size: 10,
        offset: 2,
        start: false,
        end: false
    },
    jsonId: "",
    gap: 20,
    width: 3,
    dashed: [],
    zIndex: 2,
    font: {
        size: 16,
        type: "微软雅黑",
        color: '255,255,255'
    },
    expendAble: true,
    useType: QTopo.constant.link.DIRECT,
    offset: 60// 多条直线时，线条折线拐角处的长度
};
function setDefault(config) {
    QTopo.util.extend(DEFAULT, config || {});
}
function getDefault() {
    return QTopo.util.deepClone(DEFAULT);
}
//------
//------
//-
function DirectLink(config) {
    if (!config.start || !config.end || !config.start.jtopo || !config.end.jtopo) {
        QTopo.util.error("Create Link need start and end");
        return;
    }
    this.attr = QTopo.util.extend(getDefault(), config || {});
    Link.call(this, new JTopo.Link(config.start.jtopo, config.end.jtopo));
    //函数
    this.set = setJTopo;
    //初始化
    this.set(this.attr);
}
QTopo.util.inherits(DirectLink, Link);
/**
 *  元素对属性的统一设置函数，推荐使用
 *
 *  参数可设置一项或多项,未设置部分参考全局配置
 *  @method set
 *  @param config
 *  @example
 *          实际参数参考attr内属性,只会修改有对应set函数的属性,若新增属性且添加了setXXX函数，也可用此函数配置
 *          如:name 对应 setName("..")
 *          参数格式如下
 *          config={
 *              xx:...,
 *              xx:...
 *          }
 */
function setJTopo(config) {
    if (config) {
        var self = this;
        self._setAttr(config);
    }
}
/**
 * 获取元素全局样式
 * @method getDefault
 * @return {object}
 * @example
 *          var DEFAULT = {
                                number: 1,
                                alpha: 1,
                                color: '22,124,255',
                                arrow: {
                                    size: 10,
                                    offset: 0,
                                    start: false,
                                    end: false
                                },
                                jsonId:"",
                                gap: 20,
                                width: 3,
                                dashed: null,
                                zIndex: 2,
                                font: {
                                    size: 16,
                                    type: "微软雅黑",
                                    color: '255,255,255'
                                },
                                expendAble: true,
                                useType: QTopo.constant.link.DIRECT,
                                offset: 60
                            };
 */
DirectLink.prototype.getDefault = getDefault;
/**
 * @module core
 */
/**
 * @class Scene
 */
var events = {
    init: function (scene) {
        /**
         * 在图层上双击时
         *
         * 目标是分组,则分组可进行缩放和还原
         *
         * 目标为链路,QTopo.constant.link.DIRECT类型的链路计数大于1时可展开和合并
         * @event dbclick
         */
        scene.on("dbclick", dbClick(scene));
    }
};
function dbClick(scene) {
    return function (e, qtopo) {
        toggleGroup(e, qtopo, scene);
        toggleLink(e, qtopo, scene);
    }
}
function toggleGroup(e, qtopo, scene) {
    //分组隐藏，显示缩放节点，节点位置根据分组长宽计算
    if (qtopo) {
        if (qtopo.getType() == QTopo.constant.CONTAINER) {
            qtopo.toggle();
        } else if (qtopo.getType() == QTopo.constant.NODE && qtopo.getUseType() == QTopo.constant.CASUAL) {
            //分组显示，隐藏缩放节点，分组新位置根据节点位置和分组长宽计算
            if (qtopo.toggleTo) {
                qtopo.toggleTo.toggle();
            }
        }
    }
}
function toggleLink(e, qtopo, scene) {
    if (qtopo && qtopo.getType() == QTopo.constant.LINK) {
        qtopo.jtopo.expand=!qtopo.jtopo.expand;
    }
}
module.exports = events;

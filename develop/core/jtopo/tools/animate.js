module.exports = function (jtopo) {
    jtopo.Animate = {};
    jtopo.Effect = {};
    var stopAnimate = !1;
    jtopo.Effect.spring = spring;
    jtopo.Effect.gravity = ef_gravity;
    jtopo.Animate.stepByStep = stepByStep;
    jtopo.Animate.rotate = rotate;
    jtopo.Animate.scale = scale;
    jtopo.Animate.move = move;
    jtopo.Animate.cycle = cycle;
    jtopo.Animate.repeatThrow = repeatThrow;
    jtopo.Animate.dividedTwoPiece = dividedTwoPiece;
    jtopo.Animate.gravity = an_gravity;
    jtopo.Animate.startAll = startAll;
    jtopo.Animate.stopAll = stopAll;
    function AnimateObject(fn, time) {
        var intervalId;
        var messageBus = null;
        return {
            stop: function () {
                var self;
                if (intervalId) {
                    window.clearInterval(intervalId);
                    if (messageBus) {
                        messageBus.publish("stop");
                    }
                }
                return this;
            },
            start: function () {
                var self = this;
                intervalId = setInterval(function () {
                    fn.call(self)
                }, time);
                return this
            },
            onStop: function (fn) {
                if (null == messageBus) {
                    messageBus = new jtopo.util.MessageBus();
                }
                messageBus.subscribe("stop", fn);
                return this;
            }
        }
    }

    function stepByStep(target, configs, time, e, f) {
        var intervalTime = 1e3 / 24;
        var temp = {};
        for (var config in configs) {
            var targetValue = configs[config];
            var needValue = targetValue - target[config];
            temp[config] = {
                oldValue: target[config],
                targetValue: targetValue,
                step: needValue / time * intervalTime,
                isDone: function (b) {
                    return this.step > 0 && target[b] >= this.targetValue || this.step < 0 && target[b] <= this.targetValue;
                }
            }
        }
        return new AnimateObject(function () {
            var notDone = !0;
            for (var config in configs) {
                if (!temp[config].isDone(config)) {
                    target[config] += temp[config].step;
                    notDone = !1;
                }
            }
            if (notDone) {
                if (!e) {
                    return this.stop();
                }
                for (var item in configs) {
                    if (f) {
                        var g = temp[item].targetValue;
                        temp[item].targetValue = temp[item].oldValue;
                        temp[item].oldValue = g;
                        temp[item].step = -temp[item].step;
                    } else {
                        target[item] = temp[item].oldValue;
                    }
                }
            }
            return this
        }, intervalTime);
    }

    function spring(config) {
        config = config || {};
        var spring = config.spring || .1; // 弹性系数
        var friction = config.friction || .8;// 摩擦系数
        var grivity = config.grivity || 0; // 重力大小
        var minLength = config.minLength || 0;   // 节点之间最终距离
        return {
            items: [],
            id: null,
            isPause: !1,
            addNode: function (node, target) {
                var item = {
                    node: node,
                    target: target,
                    vx: 0,
                    vy: 0
                };
                this.items.push(item);
                return this
            },
            play: function (interval) {
                this.stop();
                interval = interval || 1e3 / 24;
                var self = this;
                this.id = setInterval(function () {
                    self.nextFrame()
                }, interval)
            },
            stop: function () {
                window.clearInterval(this.id);
                this.id = null;
            },
            nextFrame: function () {
                this.items.forEach(function (item) {
                    var node = item.node;
                    var vx = item.vx;
                    var vy = item.vy;
                    var root = item.target;
                    var distanceX = root.x - node.x;
                    var distanceY = root.y - node.y;
                    var angle = Math.atan2(disY, disX);
                    if (0 != minLength) {
                        var targetX = root.x - Math.cos(angle) * minLength;
                        var targetY = root.y - Math.sin(angle) * minLength;
                        distanceX = targetX - node.x;
                        distanceY = targetY - node.y;
                    }
                    vx += distanceX * spring;
                    vy += distanceY * spring;
                    vx *= friction;
                    vy *= friction;
                    vy += grivity;
                    node.x += vx;
                    node.y += vy;
                    item.vx = vx;
                    item.vy = vy;
                });
            }
        }
    }

    function rotate(a, b) {
        function c() {
            return e = setInterval(function () {
                return stopAnimate ? void f.stop() : (a.rotate += g || .2, void(a.rotate > 2 * Math.PI && (a.rotate = 0)))
            }, 100), f
        }

        function d() {
            return window.clearInterval(e), f.onStop && f.onStop(a), f
        }

        var e = (b.context, null), f = {}, g = b.v;
        return f.run = c, f.stop = d, f.onStop = function (a) {
            return f.onStop = a, f
        }, f
    }

    function an_gravity(element, config) {
        var stage;
        if (config.context instanceof jtopo.Stage) {
            stage = config.context;
        } else if (config.context instanceof jtopo.Scene) {
            stage = config.context.stage;
        }
        var gravity = config.gravity || 0.1;
        var intervalId = null;
        return {
            run: function () {
                var stepX = config.stepX || 0;
                var stepY = config.stepY || 2;
                intervalId = setInterval(function () {
                    if (stopAnimate || typeof stage == 'undefined') {
                        this.stop();
                    } else {
                        stepY += gravity;
                        if (element.y + element.height < stage.canvas.height) {
                            element.setLocation(element.x + stepX, element.y + stepY)
                        } else {
                            stepY = 0;
                            this.stop();
                        }
                    }
                }, 20);
                return this;
            },
            stop: function () {
                window.clearInterval(intervalId);
                if (typeof this.onStop == 'function') {
                    this.onStop(element);
                }
                return this;
            },
            onStop: null
        };
    }

    function ef_gravity(element, config) {
        config = config || {};
        var gravity = config.gravity || 0.1;
        var DX = config.dx || 0;
        var DY = config.dy || 5;
        var stop = config.stop;
        var times = config.interval || 30;
        return new AnimateObject(function () {
            if (stop && stop()) {
                DY = 0.5;
                this.stop();
            } else {
                DY += gravity;
                element.setLocation(element.x + DX, element.y + DY);
            }
        }, times);
    }

    function dividedTwoPiece(node, config) {
        var scene = config.context;
        var messageBus;
        return {
            onStop: function (fn) {
                if (null == messageBus) {
                    messageBus = new jtopo.util.MessageBus();
                }
                messageBus.subscribe("stop", fn);
                return this;
            },
            run: function () {
                var angle = config.angle;
                var g = angle + Math.PI;
                var leftPiece = createPieceNode(node.x, node.y, node.width, angle, g);
                var rightPiece = createPieceNode(node.x - 2 + 4 * Math.random(), node.y, node.width, angle + Math.PI, angle);
                node.visible = !1;
                scene.add(leftPiece);
                scene.add(rightPiece);
                jtopo.Animate.gravity(leftPiece, {context: scene, dx: .3})
                    .run()
                    .onStop(function () {
                        scene.remove(leftPiece);
                        scene.remove(rightPiece);
                        this.stop();
                    });
                jtopo.Animate.gravity(rightPiece, {context: scene, dx: -.2}).run();
                return this
            },
            stop: function () {
                if (messageBus) {
                    messageBus.publish("stop");
                }
                return this
            }
        };
        function createPieceNode(x, y, radius, startAngle, endAngle) {
            var node = new jtopo.Node;
            node.setImage(node.image);
            node.setSize(node.width, node.height);
            node.setLocation(x, y);
            node.showSelected = !1;
            node.draggable = !1;
            node.paint = function (context) {
                context.save();
                context.arc(0, 0, radius, startAngle, endAngle);
                context.clip();
                context.beginPath();
                if (null != this.image) {
                    context.drawImage(this.image, -this.width / 2, -this.height / 2)
                } else {
                    context.fillStyle = "rgba(" + this.style.fillStyle + "," + this.alpha + ")";
                    context.rect(-this.width / 2, -this.height / 2, this.width / 2, this.height / 2);
                    context.fill();
                }
                context.closePath();
                context.restore();
            };
            return node
        }
    }

    function repeatThrow(a, b) {
        function c(a) {
            a.visible = !0, a.rotate = Math.random();
            var b = g.stage.canvas.width / 2;
            a.x = b + Math.random() * (b - 100) - Math.random() * (b - 100), a.y = g.stage.canvas.height, a.vx = 5 * Math.random() - 5 * Math.random(), a.vy = -25
        }

        function d() {
            return c(a), h = setInterval(function () {
                return stopAnimate ? void i.stop() : (a.vy += f, a.x += a.vx, a.y += a.vy, void((a.x < 0 || a.x > g.stage.canvas.width || a.y > g.stage.canvas.height) && (i.onStop && i.onStop(a), c(a))))
            }, 50), i
        }

        function e() {
            window.clearInterval(h)
        }

        var f = .8, g = b.context, h = null, i = {};
        return i.onStop = function (a) {
            return i.onStop = a, i
        }, i.run = d, i.stop = e, i
    }

    function stopAll() {
        stopAnimate = !0
    }

    function startAll() {
        stopAnimate = !1
    }

    function cycle(b, c) {
        function d() {
            return n = setInterval(function () {
                if (stopAnimate)return void m.stop();
                var a = f.y + h + Math.sin(k) * j;
                b.setLocation(b.x, a), k += l
            }, 100), m
        }

        function e() {
            window.clearInterval(n)
        }

        var f = c.p1, g = c.p2, h = (c.context, f.x + (g.x - f.x) / 2), i = f.y + (g.y - f.y) / 2, j = jtopo.util.getDistance(f, g) / 2, k = Math.atan2(i, h), l = c.speed || .2, m = {}, n = null;
        return m.run = d, m.stop = e, m
    }

    function move(element, config) {
        config = config || {};
        var position = config.position;
        var easing = config.easing || 0.2;
        return {
            id: null,
            run: function () {
                var self = this;
                if (self.id == null) {
                    self.id = setInterval(function () {
                        if (!stopAnimate) {
                            var totalX = position.x - element.x;
                            var totalY = position.y - element.y;
                            var stepX = totalX * easing;
                            var stepY = totalY * easing;
                            element.x += stepX;
                            element.y += stepY;
                            if (0.1 > stepX && 0.1 > stepY) {
                                self.stop();
                            }
                        } else {
                            self.stop()
                        }
                    }, 100);
                }
                return self;
            },
            stop: function () {
                window.clearInterval(this.id);
                this.id = null;
                if (this.onStop && typeof this.onStop == 'function') {
                    this.onStop();
                }
                return this;
            }
        };
    }

    function scale(a, b) {
        function c() {
            return j = setInterval(function () {
                a.scaleX += f, a.scaleY += f, a.scaleX >= e && d()
            }, 100), i
        }

        function d() {
            i.onStop && i.onStop(a), a.scaleX = g, a.scaleY = h, window.clearInterval(j)
        }

        var e = (b.position, b.context, b.scale || 1), f = .06, g = a.scaleX, h = a.scaleY, i = {}, j = null;
        return i.onStop = function (a) {
            return i.onStop = a, i
        }, i.run = c, i.stop = d, i
    }
};
window.zsj = window.zsj || {};
(function () {
    function Trail(width, height) {
        this.canvasWidth = width;
        this.canvasHeight = height;
    }
    Trail.prototype = {
        create: function (options) {
            this.trial = options.trail;//移动轨迹
            this.moveStyle = options.moveStyle;//移动方式
            this.startPos = options.startPos;//初始目标点
            this.endPos = options.endPos;//最终目的点 或者是 圆心
            this.duration = options.duration;//移动时间
            this.starttime = options.starttime || 0;//开始运动时间点
            this.endtime = this.starttime + this.duration;//结束运动时间点
            this.rotatedir = options.rotatedir || 0;//0 为顺时针 1 为逆时针
            this.rotatecount = options.rotatecount || 0;//0 为一直转 整数位旋转次数
            this.ctrlPos1 = options.ctrlPos1 || null;
            this.ctrlPos2 = options.ctrlPos2 || null;
            this._step = options.step || 1;
            this._rotatedcount = 0;
            this._movedtime = 0;
            this.curPos = this.startPos;
            this.selectTrail();
        },
        getDistance: function (p1, p2) {
            return Math.sqrt(Math.pow((p2.x - p1.x), 2) + Math.pow((p2.y - p1.y), 2));
        },
        calculateAngle: function (figureX, figureY, orignX, orignY) {
            //正下方0 正上方180
            var cx = figureX - orignX;
            var cy = figureY - orignY;
            var oAngle;
            if (cy == 0 && cx == 0) {
                oAngle = 0;
            } else if (cy == 0 && cx != 0) {
                if (cx > 0) {
                    oAngle = -90;
                } else {
                    oAngle = 90;
                }
            } else if (cy != 0 && cx == 0) {
                if (cy > 0) {
                    oAngle = 0;
                } else {
                    oAngle = -180;
                }
            } else {
                var tanValue = cx / cy;
                if ((cy > 0 && cx > 0) || ((cx < 0 && cy > 0))) {
                    oAngle = (Math.atan(tanValue) / Math.PI / 2) * 360;
                } else if (cx < 0 && cy < 0) {
                    oAngle = (Math.atan(tanValue) / Math.PI / 2) * 360 - 180;
                } else {
                    oAngle = (Math.atan(tanValue) / Math.PI / 2) * 360 + 180;
                }
            }
            return -oAngle / 180 * Math.PI;
        },
        curve2equation: function (t, p0, p1, p2) {
            return Math.pow((1 - t), 2) * p0 + 2 * (1 - t) * t * p1 + Math.pow(t, 2) * p2;
        },
        curve3equation: function (t, p0, p1, p2, p3) {
            return Math.pow((1 - t), 3) * p0 + 3 * Math.pow((1 - t), 2) * t * p1 + 3 * (1 - t) * Math.pow(t, 2) * p2 + Math.pow(t, 3) * p3;
        },
        selectTrail: function () {
            if (this.duration != 0) {

                switch (this.trial) {
                    case 'line':
                        this._rateX = (this.endPos.x - this.startPos.x) / this.duration;
                        this._rateY = (this.endPos.y - this.startPos.y) / this.duration;
                        break;
                    case 'curve2':
                        if (!this.ctrlPos1) {
                            this.ctrlPos1 = {
                                x: Math.floor(Math.random() * this.canvasWidth),
                                y: Math.floor(Math.random() * this.canvasHeight)
                            }
                        }
                        break;
                    case 'curve3':
                        if (!this.ctrlPos1) {
                            this.ctrlPos1 = {
                                x: Math.floor(Math.random() * this.canvasWidth),
                                y: Math.floor(Math.random() * this.canvasHeight)
                            }
                        }
                        if (!this.ctrlPos2) {
                            this.ctrlPos2 = {
                                x: Math.floor(Math.random() * this.canvasWidth),
                                y: Math.floor(Math.random() * this.canvasHeight)
                            }
                        }
                        break;
                    case 'tween':
                        break;
                    case 'round':
                        this._r = this.getDistance(this.endPos, this.startPos);
                        this._startAngle = this.calculateAngle(this.startPos.x, this.startPos.y, this.endPos.x, this.endPos.y);
                        this._rateR = (this.rotatedir) ? (2 * Math.PI) / this.duration : (-2 * Math.PI) / this.duration;
                        break;
                    default:
                        break;
                }
            } else {
                return;
            }
        },
        controlTime: function (mt) {
            if (this._movedtime < this.duration) {
                if (this.rotatecount != 0) {
                    this._rotatedcount++;
                }
                this._movedtime += this._step;
            } else {
                if (this._rotatedcount > this.rotatecount && this.rotatecount != 0) {
                    return;
                } else {
                    this._movedtime = 0;
                }
            }
        },
        calculatePos: function () {
            var pos = {};
            if (this.duration != 0) {

                switch (this.trial) {
                    case 'line':
                        pos.x = this.startPos.x + this._rateX * this._movedtime;
                        pos.y = this.startPos.y + this._rateY * this._movedtime;
                        break;
                    case 'curve2':
                        var curt = this._movedtime / this.duration;
                        pos.x = this.curve2equation(curt, this.startPos.x, this.ctrlPos1.x, this.endPos.x);
                        pos.y = this.curve2equation(curt, this.startPos.y, this.ctrlPos1.y, this.endPos.y);
                        break;
                    case 'curve3':
                        var curt = this._movedtime / this.duration;
                        pos.x = this.curve3equation(curt, this.startPos.x, this.ctrlPos1.x, this.ctrlPos2.x, this.endPos.x);
                        pos.y = this.curve3equation(curt, this.startPos.y, this.ctrlPos1.y, this.ctrlPos2.y, this.endPos.y);
                        break;
                    case 'tween':
                        break;
                    case 'round':
                        var curAngle = this._startAngle + this._movedtime * this._rateR;
                        if (curAngle > 180) {
                            curAngle -= Math.PI * 2;
                        } else if (curAngle < -180) {
                            curAngle += Math.PI * 2;
                        }
                        pos.x = this.endPos.x + Math.sin(curAngle) * this._r;
                        pos.y = this.endPos.y + Math.cos(curAngle) * this._r;
                        break;
                    default:
                        break;
                }
            } else {
                pos = this.startPos;
            }
            return pos;
        },
        controlMove: function (t) {
            if (t > this.starttime) {
                this.controlTime();
                this.curPos = this.calculatePos();
            }
        }
    }
    zsj.Trail = Trail;
})();
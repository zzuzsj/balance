window.zsj = window.zsj || {};
(function () {
    function Particle(board, ctx, canvasW, canvasH) {
        this._board = board;
        this._ctx = ctx;
        this._canvasW = canvasW;
        this._canvasH = canvasH;
        this._trail = new zsj.Trail(this._canvasW, this._canvasH);
    }
    Particle.prototype = {
        create: function (options) {
            this._shape = options.shape;//rect round
            this._size = options.size;//{w,h} r
            this._color = options.color;
            this._twikle = options.twikle;//0不闪烁 1闪烁
            this._gradient = options.gradient;//0不渐变 1渐变
            var alpha = Math.random() * 0.7 + 0.5;
            this._alpha = (this._twikle) ? ((alpha) > 1 ? 1 : alpha) : 1;
            if (this._twikle) {
                this._alphaMax = this._alpha;
                this._alphaMin = this._alpha - 0.5;
                this._alphaDuration = Math.floor(Math.random() * 80) + 20;
                this._alphaStep = -0.5 / this._alphaDuration;
            }
            this._trail.create({
                trail: options.trail,
                startPos: options.startPos,
                endPos: options.endPos,
                duration: options.duration,
                starttime: options.starttime,
                rotatecount: options.movecount,
                rotatedir: 1
            });
            if (this._gradient) {
                this.creaetGradient(options);
            }
            this.drawDot();
        },
        drawDot: function () {
            switch (this._shape) {
                case 'rect':
                    this._ctx.beginPath();
                    this._ctx.fillStyle = (this._gradient) ? this._grdStyle : this._color;
                    this._ctx.globalAlpha = this._alpha;
                    this._ctx.fillRect(this._trail.curPos.x - this._size.w / 2, this._trail.curPos.y - this._size.h / 2, this._size.w, this._size.h);
                    this._ctx.closePath();
                    break;
                case 'round':
                    this._ctx.beginPath();
                    this._ctx.fillStyle = (this._gradient) ? this._grdStyle : this._color;
                    this._ctx.globalAlpha = this._alpha;
                    this._ctx.arc(this._trail.curPos.x, this._trail.curPos.y, this._size, 0, 2 * Math.PI);
                    this._ctx.fill();
                    this._ctx.closePath();
                    break;
                default:
                    break;
            };
            this._ctx.restore();
        },
        creaetGradient: function (options) {
            var startPos = this._trail.startPos;
            var endPos = this._trail.endPos;
            var curPos=this._trail.curPos;
            this._ctx.save();
            switch (this._shape) {
                case 'rect':
                    var w = this._size.w;
                    var h = this._size.h;
                    this._grdStyle = this._ctx.createRadialGradient(curPos.x - w / 2, curPos.y - h, Math.max(w, h) / 2, curPos.x + w / 2, curPos.y + h / 2, Math.max(w, h));
                    this._grdStyle.addColorStop(0, 'transparent');
                    this._grdStyle.addColorStop(1, this._color);
                    break;
                case 'round':
                    var r = this._size;
                    this._grdStyle = this._ctx.createRadialGradient(curPos.x, curPos.y, r / 2, curPos.x , curPos.y, r);
                    this._grdStyle.addColorStop(0, this._color);
                    this._grdStyle.addColorStop(1, 'transparent');
                    break;
                default:
                    break;
            };
        },
        alphaChange: function () {
            this._alpha += this._alphaStep
            if (this._alpha >= this._alphaMax) {
                this._alphaStep *= -1;
            } else if (this._alpha <= this._alphaMin) {
                this._alphaStep *= -1;
            }
        },
        animate: function (t) {
            this._trail.controlMove(t);
            this.creaetGradient();
            this.alphaChange();
            this.drawDot();
        }

    };
    zsj.Particle = Particle;
})();
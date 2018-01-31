/**
 * 2018/01/30
 * @author liang
 */
class relation {
    constructor ({
        dom,
        option = {
            theta: 30,
            headlen: 15,
            lineWidth: 2,
            lineColor: '#0ff',
            imgSize: {
                width: 54,
                height: 58
            }
        },
        imgUrl = {
            home: './images/icon_1p.png',
            com: './images/icon_4p.png',
            point: './images/icon_5p.png',
            set: './images/icon_8p.png'
        },
        data
    }) {
        let me = this
        if (!dom) {
            console.error('请传入dom')
            return
        }
        this.dom = dom
        this.option = option
        this.imgUrl = imgUrl
        this.data = data
        createjs.Ticker.timingMode = createjs.Ticker.RAF
        this.canvas = document.createElement('canvas')
        this.canvas.width = this.dom.offsetWidth
        this.canvas.height = this.dom.offsetHeight
        this.dom.appendChild(this.canvas)
        // 移动缩放
        this.moveAndZoom = {
            x1: 0,
            x2: 0,
            y1: 0,
            y2: 0,
            regX: 0, // 画布偏移量
            regY: 0,
            moveSensitivity: 1, //平移灵敏度
            zoom: 1,
            maxZoom: 5,
            minZoom: 0.2,
            zoomSensitivity: 1.5 //缩放灵敏度
        }
        // 创建舞台
        this.stage = new createjs.Stage(this.canvas)
        createjs.Ticker.on('tick', this.stage)
        // 创建动画时间线
        this.duration = 0
        this.timeLine = new TimelineMax({
            repeat: 0,
            // onRepeat () {
            onComplete () {
                // console.log(me.timeLine);
                // me.stage.clear()
                // setTimeout(() => {
                //     console.log('a');
                //     me.stage.clear()
                // }, 1000)
                // me.stage.removeAllChildren()
                // me.createContent()
                // me.mouseEvent()
                // console.log(me.stage, me.timeLine);
            }
        })
        this.animationOp = {
            imgShowTime: 0.5,
            lineTime: 0.8
        }
        this.createContent()
        this.mouseEvent()
    }
    // 创建容器
    createContent () {
        let me = this
        this.data.point.forEach(p => {
            me.addNode(p)
        })
        this.data.line.forEach(l => {
            me.drawArrows(...l)
        })
    }
    /**
     * 画箭头
     * from,to 为起止点名称
    */
    drawArrows (from, to) {
        let me = this,
            fromPoint = me.stage.getChildByName(from),
            toPoint = me.stage.getChildByName(to),
            start = [fromPoint.x, fromPoint.y],
            end = [toPoint.x, toPoint.y];
        if (fromPoint.alpha === 0) {
            // 图片显示
            let M1 = new TimelineMax()
            M1.to(fromPoint, me.animationOp.imgShowTime, {
                alpha: 1
            })
            me.timeLine.add(M1, me.duration);
            me.duration += me.animationOp.imgShowTime
        }
        let shape = new createjs.Shape()
        this.stage.addChild(shape)
        // 箭头长度
        let headlen = me.option.headlen
        // 箭头角度
        let angle = Math.atan2(end[1] - start[1], end[0] - start[0]) * 180 / Math.PI,
            angleR = angle * Math.PI / 180,
            // 弧度制
            angle1 = (angle + me.option.theta) * Math.PI / 180,
            angle2 = (angle - me.option.theta) * Math.PI / 180,
            topX = headlen * Math.cos(angle1),
            topY = headlen * Math.sin(angle1),
            botX = headlen * Math.cos(angle2),
            botY = headlen * Math.sin(angle2),
            sX = start[0] + me.option.imgSize.width / 1.414 * Math.cos(angleR),
            sY = start[1] + me.option.imgSize.height / 1.414 * Math.sin(angleR),
            eX = end[0] - me.option.imgSize.width / 1.414 * Math.cos(angleR),
            eY = end[1] - me.option.imgSize.height / 1.414 * Math.sin(angleR)
        // 动画画线
        let L1 = new TimelineMax()
        let op = { a: 0 }
        L1.to(op, me.animationOp.lineTime, {
            a: 1,
            onUpdate () {
                shape.graphics.c().ss(me.option.lineWidth).s(me.option.lineColor)
                .mt(sX, sY).lt(sX + (eX - sX ) * op.a, sY + (eY - sY) * op.a)
            },
            onComplete () {
                shape.graphics.mt(eX - topX, eY - topY).lt(eX, eY).lt(eX - botX, eY - botY)
            }
        })
        me.timeLine.add(L1, me.duration);
        me.duration += me.animationOp.lineTime
        // 判断结束点是否已经显示,未显示加入动画
        if (toPoint.alpha === 0) {
            // 图片显示
            let M2 = new TimelineMax()
            M2.to(toPoint, me.animationOp.imgShowTime, {
                alpha: 1
            })
            me.timeLine.add(M2, me.duration);
            me.duration += me.animationOp.imgShowTime
        }
    }
    /**
     * 添加节点
     * 节点类型需在option中配置url路径
     * pos为数组,x、y定位
    */
    addNode (d) {
        let me = this
        let img = new createjs.Bitmap(me.imgUrl[d.type])
        img.set({
            name: d.name,
            regX: me.option.imgSize.width / 2,
            regY: me.option.imgSize.height / 2,
            x: d.pos[0],
            y: d.pos[1],
            alpha: 0
        })
        me.stage.addChild(img)
    }
    /**
     * 鼠标事件
     */
    mouseEvent () {
        let me = this
        // 鼠标拖动事件
        me.dom.addEventListener('mousedown', e => {
            me.dom.style.cursor = 'url("./images/closedhand.cur"), auto'
            me.moveAndZoom.x1 = e.pageX
            me.moveAndZoom.y1 = e.pageY
            this.dom.addEventListener('mousemove', mousemove)
        })
        me.dom.style.cursor = 'url("./images/openhand.cur"), auto'
        const mousemove = e => {
            // 一定要除以放大倍数，不然放大之后就等着拖拽飞起吧~
            me.moveAndZoom.regX += (me.moveAndZoom.x1 - e.pageX) / me.moveAndZoom.zoom / me.moveAndZoom.moveSensitivity
            me.moveAndZoom.regY += (me.moveAndZoom.y1 - e.pageY) / me.moveAndZoom.zoom / me.moveAndZoom.moveSensitivity
            me.moveAndZoom.x1 = e.pageX
            me.moveAndZoom.y1 = e.pageY
            me.stage.set({
                regX: me.moveAndZoom.regX,
                regY: me.moveAndZoom.regY
            })
        }
        me.dom.addEventListener('mouseup', e => {
            this.dom.removeEventListener('mousemove', mousemove)
            me.dom.style.cursor = 'url("./images/openhand.cur"), auto'
            // console.log(me.moveAndZoom.regX, me.moveAndZoom.regY);
        })
        // 缩放
        me.dom.addEventListener('mousewheel', e => {
            if (e.wheelDelta > 0) {
                me.moveAndZoom.zoom *= me.moveAndZoom.zoomSensitivity
            } else {
                me.moveAndZoom.zoom /= me.moveAndZoom.zoomSensitivity
            }
            // 缩放限制
            if (me.moveAndZoom.zoom > me.moveAndZoom.maxZoom) {
                me.moveAndZoom.zoom = me.moveAndZoom.maxZoom
            }
            if (me.moveAndZoom.zoom < me.moveAndZoom.minZoom) {
                me.moveAndZoom.zoom = me.moveAndZoom.minZoom
            }
            me.stage.set({
                scale: me.moveAndZoom.zoom
            })
        })
    }
}

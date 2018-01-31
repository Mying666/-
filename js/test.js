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
            zoomSensitivity: 1.5 //缩放灵敏度
        }
        // 创建舞台
        this.stage = new createjs.Stage(this.canvas)
        this.shape = new createjs.Shape()
        this.stage.addChild(this.shape)
        createjs.Ticker.on('tick', this.stage)
        this.createContent()
        this.mouseEvent()
    }
    // 创建容器
    createContent () {
        let me = this
        this.data.point.forEach(p => {
            me.addNode(p.type, p.pos)
        })
        this.data.line.forEach(l => {
            me.drawArrows(...l)
        })
    }
    /**
     * 画箭头
     * start,end为数组，起止点坐标
    */
    drawArrows (start, end) {
        let me = this
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
        me.shape.graphics.ss(me.option.lineWidth).s(me.option.lineColor).mt(sX, sY).lt(eX, eY)
        me.shape.graphics.mt(eX - topX, eY - topY).lt(eX, eY).lt(eX - botX, eY - botY)
    }
    /**
     * 添加节点
     * 节点类型需在option中配置url路径
     * pos为数组,x、y定位
    */
    addNode (type, pos) {
        let me = this
        let img = new createjs.Bitmap(me.imgUrl[type])
        img.set({
            regX: me.option.imgSize.width / 2,
            regY: me.option.imgSize.height / 2,
            x: pos[0],
            y: pos[1]
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
            me.dom.style.cursor = 'url("../images/closedhand.cur"), auto'
            me.moveAndZoom.x1 = e.pageX
            me.moveAndZoom.y1 = e.pageY
            this.dom.addEventListener('mousemove', mousemove)
        })
        me.dom.style.cursor = 'url("../images/openhand.cur"), auto'
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
            me.dom.style.cursor = 'url("../images/openhand.cur"), auto'
            // console.log(me.moveAndZoom.regX, me.moveAndZoom.regY);
        })
        // 缩放
        me.dom.addEventListener('mousewheel', e => {
            // console.log('a');
            if (e.wheelDelta > 0) {
                me.moveAndZoom.zoom *= me.moveAndZoom.zoomSensitivity
            } else {
                me.moveAndZoom.zoom /= me.moveAndZoom.zoomSensitivity
            }
            // me.moveAndZoom.regX = me.moveAndZoom.regX * me.moveAndZoom.zoom - e.pageX
            // me.moveAndZoom.regY = me.moveAndZoom.regY * me.moveAndZoom.zoom - e.pageY
            // console.log(-me.moveAndZoom.regX - me.moveAndZoom.regX * 2);
            me.stage.set({
                regX: me.moveAndZoom.regX * me.moveAndZoom.zoom,
                regY: me.moveAndZoom.regY * me.moveAndZoom.zoom,
                scale: me.moveAndZoom.zoom
            })
        })
    }
}

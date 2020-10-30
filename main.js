

const GRAVITY = 0.00001, AIR_DENSITY_DRAG = 1 //0.991

let air_velocity, air_thickness, p1gamepad, debug1, debug2, needRelease, needRelease2, planeTexture, droneTexture



const controls = {
    p1: {
        up: false,
        down: false,
        left: false,
        right: false,
        shoot: false,
        engine: false,
        flipped: false
    },
    p2: {
        up: false,
        down: false,
        left: false,
        right: false,
        shoot: false
    }
}

const config = {
    antialias: false,
    transparent: false,
    resolution: 1,
    sharedTicker: true,
}

const app = new PIXI.Application(config)
const renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight, config)
app.renderer = renderer

const stage = app.stage

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST

renderer.view.style.imageRendering = 'pixelated'
renderer.backgroundColor = 0x181425

PIXI.loader.add('player-1.png')
PIXI.loader.add('player-drone.png')
PIXI.loader.add('engine.png')
PIXI.loader.load(startGame)




function startGame() {
    
    air_velocity = 0
    air_thickness = 0.01

    needRelease = false
    needRelease2 = false

    droneTexture = PIXI.Texture.fromImage('player-drone.png')
    planeTexture = PIXI.Texture.fromImage('player-1.png')

    for (var i = 0; i < 100; i++) {
        const star = new PIXI.Graphics()
        star.game = { type: 'star' }
        star.position.x = Math.floor(Math.random() * window.innerWidth)
        star.position.y = Math.floor(Math.random() * window.innerHeight)
        star.beginFill(0xccccdd)
        star.drawRect(0, 0, 1, 1)
        stage.addChild(star)
    }

    for (var i = 0; i < 20; i++) {
        const cloud = new PIXI.Graphics()
        cloud.game = { type: 'cloud' }
        cloud.position.x = Math.floor(Math.random() * window.innerWidth)
        cloud.position.y = Math.floor(Math.random() * window.innerHeight)
        cloud.beginFill(0xcccccc)
        cloud.drawRect(0, 0, 10, 10)
        cloud.alpha = 0.1
        stage.addChild(cloud)
    }

    const aoa = new PIXI.Graphics()
    aoa.game = { type: 'aoa' }
    aoa.position.x = 0
    aoa.position.y = 0
    aoa.visible = false
    aoa.beginFill(0xff0000)
    aoa.drawRect(0, 0, 2, 2)
    stage.addChild(aoa)

    const aoa2 = new PIXI.Graphics()
    aoa2.game = { type: 'aoa2' }
    aoa2.position.x = 0
    aoa2.position.y = 0
    aoa2.visible = false
    aoa2.beginFill(0x00ff00)
    aoa2.drawRect(0, 0, 2, 2)
    stage.addChild(aoa2)

    const aoa3 = new PIXI.Graphics()
    aoa3.game = { type: 'aoa3' }
    aoa3.position.x = 0
    aoa3.position.y = 0
    aoa3.visible = false
    aoa3.beginFill(0x0000ff)
    aoa3.drawRect(-4, -4, 8, 8)
    stage.addChild(aoa3)

    const aoa4 = new PIXI.Graphics()
    aoa4.game = { type: 'aoa4' }
    aoa4.position.x = 0
    aoa4.position.y = 0
    aoa4.visible = false
    aoa4.beginFill(0x00ffff)
    aoa4.drawRect(0, 0, 2, 2)
    stage.addChild(aoa4)

    debug1 = new PIXI.Graphics()
    debug1.game = { type: 'debug1' }
    debug1.position.x = 0
    debug1.position.y = 0
    debug1.visible = false
    debug1.beginFill(0xff0000)
    debug1.drawRect(0, 0, 10, 10)
    stage.addChild(debug1)

    debug2 = new PIXI.Graphics()
    debug2.game = { type: 'debug2' }
    debug2.position.x = 0
    debug2.position.y = 0
    debug2.visible = false
    debug2.beginFill(0x00ff00)
    debug2.drawRect(0, 0, 10, 10)
    stage.addChild(debug2)


    spawnDrone()

    animationLoop()
}









function animationLoop() {
    requestAnimationFrame(animationLoop)

    getGamePadInput()

    stage.children.forEach(tickEntities)

    renderer.render(stage)
}


const shuffleArray = arr => arr
  .map(a => [Math.random(), a])
  .sort((a, b) => a[0] - b[0])
  .map(a => a[1]);




const isCollision = (sprite1, sprite2) => {
    const dx = sprite2.position.x - sprite1.position.x
    const dy = sprite2.position.y - sprite1.position.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    const collisionDistance = (sprite1.width + sprite2.width) / 2
    return distance < collisionDistance
}


function tickEntities(child) {

    switch (child.game && child.game.type) {

        case 'debug1':

            debug1.position.x = 300
            debug1.position.y = 100 + p1gamepad.axes[3] * 100
            break;

        case 'debug2':
            
            debug2.position.x = 320
            debug2.position.y = 100 + expo(p1gamepad.axes[3]) * 100
            break;

        case 'star':
            /*if (air_thickness === 0) return

            child.position.x -= air_velocity
            if (child.position.x < 0) {
                child.position.x = window.innerWidth
            }*/

            {
                const player = stage.children.find(isPlayer)
                if (!player) return

                child.position.x += player.game.vx * -1
                child.position.y += player.game.vy * -1

                const { x, y } = wrap(child.position)
                child.position.x = x
                child.position.y = y
            }

            break;

        case 'cloud':
            
            {
                const player = stage.children.find(isPlayer)
                if (!player) return

                child.position.x += player.game.vx * -20 //(dragVector({ x: p1Sprite.game.vx, y: p1Sprite.game.vy }, p1Sprite.game.angle) * 0.1) * -20
                child.position.y += player.game.vy * -20

                const { x, y } = wrap(child.position)
                child.position.x = x
                child.position.y = y
            }

            break;

        case 'aoa':
            {
                const player = stage.children.find(isPlayer)
                if (!player) return

                const aoa = child
                aoa.position.x = player.position.x + player.game.vx * 50
                aoa.position.y = player.position.y + player.game.vy * 50
            }
            break;
        case 'aoa2':
            {
                const player = stage.children.find(isPlayer)
                if (!player) return
                const aoa2 = child
                aoa2.position.x = player.position.x + Math.cos(player.game.angle) * 50
                aoa2.position.y = player.position.y + Math.sin(player.game.angle) * 50
            }
            break;
        case 'aoa3':
            //const angleOfAttack = (Math.atan2(p1Sprite.game.vy, p1Sprite.game.vx ) - p1Sprite.game.angle + (Math.PI/2)) % (Math.PI*2)

            //const mahManPythageraous = Math.sqrt(p1Sprite.game.vx**2 + p1Sprite.game.vy**2)
            {
                const player = stage.children.find(isPlayer)
                if (!player) return
                const aoa3 = child
                const { x, y } = dragVector({ x: player.game.vx, y: player.game.vy }, player.game.angle)
                aoa3.position.x = player.position.x + x // + angleOfAttack(player.game.vy, player.game.vx, player.game.angle) * 0.5
                aoa3.position.y = player.position.y + y
            }
            //aoa3.position.y = player.position.y + Math.sin(angleOfAttack) * 100 * mahManPythageraous
            break;
        case 'aoa4':
            {
                const player = stage.children.find(isPlayer)
                if (!player) return
                const aoa4 = child   
                aoa4.position.x = player.position.x + player.game.vx * -100
                aoa4.position.y = player.position.y + player.game.vy * -100
            }
            break;
        case 'plane':
            {
                const p = child
                const g = p.game
                const engine = child.children.find(isEngine)

                if (p1gamepad.buttons[0].pressed && needRelease2 === false) {
                    g.mode = g.mode === 'plane' ? 'drone' : 'plane'
                    p.texture = g.mode === 'plane' ? planeTexture : droneTexture
                    needRelease2 = true
                } else if (!p1gamepad.buttons[0].pressed) {
                    needRelease2 = false
                }

                g.angle += expo(p1gamepad.axes[3]) / 15 * (g.flipped ? -1 : 1)
                if (p1gamepad.buttons[5].pressed) {
                    engine.visible = true
                    g.vx += Math.sin(g.angle + (Math.PI*0.5)) * 0.01
                    g.vy += Math.cos(g.angle + (Math.PI*-0.5)) * 0.01
                } else {
                    engine.visible = false
                }

                if (p1gamepad.buttons[4].pressed && needRelease === false) {
                    g.flipped = !g.flipped
                    needRelease = true
                } else if (!p1gamepad.buttons[4].pressed) {
                    needRelease = false
                }
                
                const d = drag(g.angle) * air_thickness * 0 // no drag here
                
                //const multiplier = 1 - (angleOfAttack(g.vy, g.vx, g.angle) / 180) / 10

                //console.log(multiplier)

                const multiplier = 1

                g.vx = g.vx + (dragVector({ x: g.vx, y: g.vy }, g.angle).x * -0.001)
                g.vy = (g.vy + GRAVITY) * multiplier
                p.rotation = g.angle

                p.position.x += g.vx
                p.position.y += g.vy

                p.position.x = wrap(p.position).x
                p.position.y = wrap(p.position).y
                
                p.scale.y = g.flipped ? -1 : 1
            }

            break
            case 'drone':
                {
                    const sprite = child
                    const game = sprite.game
                    const airflow = child.children.find(isAirflow)
                    
                    game.angle += expo(p1gamepad.axes[3]) / 15 * (game.flipped ? -1 : 1)

                    if (p1gamepad.buttons[5].pressed) {
                        airflow.visible = true
                        game.vx += Math.sin(game.angle + (Math.PI*2)) * 0.0001
                        game.vy += Math.cos(game.angle + (Math.PI)) * 0.0001
                    } else {
                        airflow.visible = false
                    }

                    game.vx += 0
                    game.vy += GRAVITY

                    sprite.position.x += game.vx
                    sprite.position.y += game.vy
                    sprite.rotation = game.angle
                }
                break;
    }
}

function spawnPlane() {
    const planeSprite = new PIXI.Sprite(planeTexture)
    planeSprite.game = {
        type: 'plane',
        vx: 0,
        vy: 0,
        angle: 0
    }
    planeSprite.anchor.set(0.5, 0.5)
    planeSprite.position.x = window.innerWidth / 2
    planeSprite.position.y = window.innerHeight / 2
    stage.addChild(planeSprite)

    const engine = new PIXI.Sprite(PIXI.Texture.fromImage('engine.png'))
    engine.game = { type: 'engine' }
    engine.position.x = -15
    engine.position.y = 0
    planeSprite.addChild(engine)
}

function spawnDrone() {
    const droneSprite = new PIXI.Sprite(droneTexture)
    droneSprite.game = {
        type: 'drone',
        vx: 0,
        vy: 0,
        angle: 0
    }
    droneSprite.anchor.set(0.5, 0.5)
    droneSprite.position.x = window.innerWidth / 2
    droneSprite.position.y = window.innerHeight / 2
    stage.addChild(droneSprite)

    const airflow = new PIXI.Sprite(PIXI.Texture.fromImage('airflow.png'))
    airflow.game = { type: 'airflow' }
    airflow.position.x = -5
    airflow.position.y = 2
    droneSprite.addChild(airflow)
}

function killPlayer() {
    stage.children.forEach(child => {
        if (child.game && child.game.type === 'plane' || child.game.type === 'drone') {
            stage.removeChild(child)
        }
    })
}

function getGamePadInput() {
    var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);


    if (gamepads['0']) {
        p1gamepad = gamepads['0']
    } else {
        p1gamepad = {
            axes: [0,0,0,0],
            buttons: new Array(18).fill().map(() => ({ pressed: false }))
        }
    }
}


const expo = x => {
    const f = 10
    if (x < 0) {
        return Math.abs(x ** f)
    } else if (x > 0) {
        return Math.abs(x ** f) * -1
    }
    return 0
}

// Old version where i attempted drag
function drag(angle) {
    return Math.abs(Math.sin(angle))
}

function wrap(pos) {
    let { x, y } = pos
    
    if (x > window.innerWidth) {
        x = 0
    }
    if (x < 0) {
        x = window.innerWidth
    }
    if (y > window.innerHeight) {
        y = 0
    }
    if (y < 0) {
        y = window.innerHeight
    }
    return { x, y }
}

/*
Old function where i tried to just calculate the intensity of the angle of attack
This turned out to be pretty difficult so it might be better to shoot for the holy grail right away
*/

function old_angleOfAttack(vy, vx, angle) {
    const alphaRadians = Math.atan2(vy, vx)
    const betaRadians = (angle * 2) - (Math.PI/2)
    const alphaDegrees = radianToDegrees(alphaRadians)
    const betaDegrees = radianToDegrees(betaRadians)

    const phi = Math.abs(betaDegrees - alphaDegrees) % 360
    const distance = phi > 180 ? 360 - phi : phi;
    return distance
}

//console.log(angleOfAttack(0.02, 0, -3.14).toFixed(1))
//console.log(angleOfAttack(0.02, 0, -1.5).toFixed(1))
//console.log(angleOfAttack(0.02, 0, 0).toFixed(1))// === '1.6') // startpos - pekar höger och faller
//console.log(angleOfAttack(0.02, 0, 1.5).toFixed(1))// === '0.1') // faller och pekar rakt ner
//console.log(angleOfAttack(0.02, 0, 3.14).toFixed(1))// === '-1.6') // faller och pekar rakt till vänster (uppochner)
//console.log(angleOfAttack(0.02, 0, 4.7).toFixed(1))// === '0.1') // faller och pekar rakt upp (baklänges)
//console.log(angleOfAttack(0.02, 0, 6.23).toFixed(1))// === '1.6') // faller och pekar rakt till höger (nästan 360)


function dragVector({x, y}, angle) {
    const a = angle % Math.PI

    if (y > 0 && a > 0 && a < 1.2) {
        return { x: -50, y: 0 }
    }
    if (y > 0 && a > 1.8 && a < 3.14) {
        return { x: 50, y: 0 }
    }
    return { x: 0, y: 0 }
}

console.log(dragVector({x: 0, y: 2}, 0.01)) // x 90 y 0
console.log(dragVector({x: 0, y: 2}, 90)) // x 0 y -90

function radianToDegrees(rad) {
    return rad * 180 / Math.PI
}


const isPlayer = ({game}) => game && game.type === 'plane' || game.type === 'drone'
const isEngine = ({game}) => game && game.type === 'engine'
const isAirflow = ({game}) => game && game.type === 'airflow'

function keyboardKeyDown(e) {
    
    if (e.keyCode === 68) { //d
        spawnDrone()
    }
    if (e.keyCode === 75) { //k
        killPlayer()
    }
    if (e.keyCode === 65) {
        controls.p1.left = true
    }
    if (e.keyCode === 87) {
        p1gamepad.axes[3] = 1
    }
    if (e.keyCode === 83) {
        p1gamepad.axes[3] = -1
    }
    if (e.keyCode === 32) {
        controls.p1.shoot = true
    }
    if (e.keyCode === 13) { //enter
        console.log('angle', p1Sprite.game.angle)
        console.log('vector', p1Sprite.game.vx, p1Sprite.game.vy)
        console.log('drag', dragVector({ x: p1Sprite.game.vx, y: p1Sprite.game.vy }, p1Sprite.game.angle))
    }

    if (e.keyCode === 39) {
        controls.p2.right = true
    }
    if (e.keyCode === 37) {
        controls.p2.left = true
    }
    if (e.keyCode === 38) {
        controls.p2.up = true
    }
    if (e.keyCode === 40) {
        controls.p2.down = true
    }
    if (e.keyCode === 80) { //p
        spawnPlane()
    }
}

function keyboardKeyUp(e) {
    if (e.keyCode === 49) { // 1
        air_velocity += 1
    }
    if (e.keyCode === 50) { // 2
        air_velocity -= 1
    }

    if (e.keyCode === 68) {
        controls.p1.right = false
    }
    if (e.keyCode === 65) {
        controls.p1.left = false
    }
    if (e.keyCode === 87) {
        //controls.p1.up = false

    }
    if (e.keyCode === 83) {
        controls.p1.down = false
    }
    if (e.keyCode === 32) {
        controls.p1.shoot = false
    }
    if (e.keyCode === 13) { //enter
        controls.p1.engine = false
    }

    if (e.keyCode === 39) {
        controls.p2.right = false
    }
    if (e.keyCode === 37) {
        controls.p2.left = false
    }
    if (e.keyCode === 38) {
        controls.p2.up = false
    }
    if (e.keyCode === 40) {
        controls.p2.down = false
    }
}

window.addEventListener('keydown', keyboardKeyDown)
window.addEventListener('keyup', keyboardKeyUp)

window.addEventListener("gamepadconnected", function(e) {
  console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
    e.gamepad.index, e.gamepad.id,
    e.gamepad.buttons.length, e.gamepad.axes.length);
});

document.getElementById('container').appendChild(app.view)
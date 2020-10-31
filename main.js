
const GRAVITY = 0.001, AIR_DENSITY_DRAG = 1 //0.991

let air_velocity, air_thickness, p1gamepad, planeTexture, droneTexture, camera, paused

const width = window.innerWidth
const height = window.innerHeight

const cameraMovement = {
    up: false,
    down: false
}

const config = {
    antialias: false,
    transparent: false,
    resolution: 1,
    sharedTicker: true
}

const app = new PIXI.Application(config)
const renderer = PIXI.autoDetectRenderer(width, height, config)
app.renderer = renderer

const stage = app.stage

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST

renderer.view.style.imageRendering = 'pixelated'

PIXI.loader.add('player-1.png')
PIXI.loader.add('player-drone.png')
PIXI.loader.add('engine.png')
PIXI.loader.load(startGame)

document.getElementById('container').appendChild(app.view)



function startGame() {
    
    droneTexture = PIXI.Texture.fromImage('player-drone.png')
    planeTexture = PIXI.Texture.fromImage('player-1.png')

    for (var i = 0; i < 100; i++) {
        spawnStar()
    } 

    for (var i = 0; i < 20; i++) {
        spawnCloud()
    }

    window.addEventListener('keydown', keyboardKeyDown)
    window.addEventListener('keyup', keyboardKeyUp)
    window.addEventListener("gamepadconnected", gamepadConnected)    

    animationLoop()
}



function animationLoop() {
    if (paused) return
    requestAnimationFrame(animationLoop)
    gametick()
}

function gametick() {
    getGamePadInput()

    stage.children.forEach(child => typeof child.func === 'function' && child.func())

    const playerSprite = stage.children.find(isPlayer)

    if (playerSprite) {
        stage.x = -playerSprite.x + (width/2)
        stage.y = -playerSprite.y + (height/2)
    } else {
        const { up, down } = cameraMovement
        if (up) stage.y += 10
        if (down) stage.y -= 10        
    }

    renderer.backgroundColor = 0xffffff - (stage.y * 10) //0x181425

    renderer.render(stage)
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
    planeSprite.x = width / 2
    planeSprite.y = height / 2
    stage.addChild(planeSprite)

    const engine = new PIXI.Sprite(PIXI.Texture.fromImage('engine.png'))
    engine.game = { type: 'engine' }
    engine.x = -15
    engine.y = 0
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
    droneSprite.x = 100
    droneSprite.y = 100
    stage.addChild(droneSprite)

    const airflow = new PIXI.Sprite(PIXI.Texture.fromImage('airflow.png'))
    airflow.game = { type: 'airflow' }
    airflow.x = -5
    airflow.y = 2
    droneSprite.addChild(airflow)

    droneSprite.func = function() {
        const sprite = droneSprite
        const game = sprite.game
        const airflow = sprite.children.find(isAirflow)
        
        game.angle += expo(p1gamepad.axes[3]) / 15 * (game.flipped ? -1 : 1)

        if (p1gamepad.buttons[5].pressed) {
            airflow.visible = true
            game.vx += Math.sin(game.angle + (Math.PI*2)) * 0.01 //0.0001
            game.vy += Math.cos(game.angle + (Math.PI)) * 0.01 //0.0001
        } else {
            airflow.visible = false
        }

        game.vx += 0
        game.vy += GRAVITY

        sprite.x += game.vx
        sprite.y += game.vy
        sprite.rotation = game.angle
    }
}



function spawnStar() {
    const star = new PIXI.Graphics()
    star.game = {
        type: 'star',
        x: Math.floor(Math.random() * width),
        y: Math.floor(Math.random() * height)
    }
    star.beginFill(0xccccdd)
    star.drawRect(0, 0, 1, 1)
    stage.addChild(star)

    star.func = function() {
        star.x = (stage.x + star.game.x) % width - stage.x
        star.y = (stage.y + star.game.y) % height - stage.y
    }
}



function spawnCloud() {
    const cloud = new PIXI.Graphics()
    cloud.game = {
        type: 'cloud',
        x: Math.floor(Math.random() * width),
        y: Math.floor(Math.random() * height)
    }
    cloud.x = Math.floor(Math.random() * width)
    cloud.y = Math.floor(Math.random() * height)
    cloud.beginFill(0xcccccc)
    cloud.drawRect(0, 0, 10, 10)
    cloud.alpha = 0.1
    stage.addChild(cloud)

    cloud.func = function() {
        cloud.x = (stage.x + cloud.game.x) % width - stage.x
        cloud.y = (stage.y + cloud.game.y) % height - stage.y
    }
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



function keyboardKeyDown(e) {
    
    if (e.keyCode === 68) { //d
        spawnDrone()
    }
    if (e.keyCode === 75) { //k
        killPlayer()
    }
    if (e.keyCode === 87) {
        p1gamepad.axes[3] = 1
    }
    if (e.keyCode === 83) {
        p1gamepad.axes[3] = -1
    }
    if (e.keyCode === 80) { //p
        spawnPlane()
    }
    if (e.keyCode === 87) { //w
        cameraMovement.up = true
    }
    if (e.keyCode === 83) { //s
        cameraMovement.down = true
    }
}



function keyboardKeyUp(e) {
    if (e.keyCode === 49) { // 1
        air_velocity += 1
    }
    if (e.keyCode === 50) { // 2
        air_velocity -= 1
    }
    if (e.keyCode === 87) { //w
        cameraMovement.up = false
    }
    if (e.keyCode === 83) { //s
        cameraMovement.down = false
    }
    if (e.keyCode === 32) { //space
        paused = !paused
        if (!paused) {
            animationLoop()
        }
    }
    if (e.keyCode === 84) { //t
        gametick()
    }
    if (e.keyCode === 89) { //y
        for (var i = 0; i < 10; i++) {
            gametick()
        }
    }
}



function gamepadConnected(e) {
    console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
    e.gamepad.index, e.gamepad.id,
    e.gamepad.buttons.length, e.gamepad.axes.length);
}














// Pure limit

const shuffleArray = arr => arr
  .map(a => [Math.random(), a])
  .sort((a, b) => a[0] - b[0])
  .map(a => a[1]);

const isCollision = (sprite1, sprite2) => {
    const dx = sprite2.x - sprite1.x
    const dy = sprite2.y - sprite1.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    const collisionDistance = (sprite1.width + sprite2.width) / 2
    return distance < collisionDistance
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
    
    if (x > width) {
        x = 0
    }
    if (x < 0) {
        x = width
    }
    if (y > height) {
        y = 0
    }
    if (y < 0) {
        y = height
    }
    return { x, y }
}

/* Old function where i tried to just calculate the intensity of the angle of attack
This turned out to be pretty difficult so it might be better to shoot for the holy grail right away */
function old_angleOfAttack(vy, vx, angle) {
    const alphaRadians = Math.atan2(vy, vx)
    const betaRadians = (angle * 2) - (Math.PI/2)
    const alphaDegrees = radianToDegrees(alphaRadians)
    const betaDegrees = radianToDegrees(betaRadians)

    const phi = Math.abs(betaDegrees - alphaDegrees) % 360
    const distance = phi > 180 ? 360 - phi : phi;
    return distance
}

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

function radianToDegrees(rad) {
    return rad * 180 / Math.PI
}


const isPlayer = ({game}) => game && game.type === 'plane' || game.type === 'drone'
const isEngine = ({game}) => game && game.type === 'engine'
const isAirflow = ({game}) => game && game.type === 'airflow'

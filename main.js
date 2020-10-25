
const controls = {
    p1: {
        up: false,
        down: false,
        left: false,
        right: false,
        shoot: false,
        engine: false
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

let air_velocity, air_thickness, p1gamepad, p1Sprite, engine, debug1, debug2

const app = new PIXI.Application(config)
const renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight, config)
app.renderer = renderer

const stage = app.stage

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST

renderer.view.style.imageRendering = 'pixelated'
renderer.backgroundColor = 0x181425

PIXI.loader.add('player-1.png')
PIXI.loader.add('engine.png')
PIXI.loader.load(startGame)




function startGame() {
    
    air_velocity = 0
    air_thickness = 0.01

	p1Sprite = new PIXI.Sprite(PIXI.Texture.fromImage('player-1.png'))
    p1Sprite.game = {
        type: 'p1',
        vx: 0,
        vy: 0,
        angle: 0
    }
    p1Sprite.anchor.set(0.5, 0.5)
	p1Sprite.position.x = 50
	p1Sprite.position.y = 50
	stage.addChild(p1Sprite)

    engine = new PIXI.Sprite(PIXI.Texture.fromImage('engine.png'))
    engine.position.x = -15
    engine.position.y = 0
    p1Sprite.addChild(engine)

    for (var i = 0; i < 100; i++) {
        const star = new PIXI.Graphics()
        star.game = { type: 'star' }
        star.position.x = Math.floor(Math.random() * window.innerWidth)
        star.position.y = Math.floor(Math.random() * window.innerHeight)
        star.beginFill(0xcccccc)
        star.drawRect(0, 0, 1, 1)
        stage.addChild(star)
    }

    debug1 = new PIXI.Graphics()
    debug1.game = { type: 'debug1' }
    debug1.position.x = 0
    debug1.position.y = 0
    debug1.beginFill(0xff0000)
    debug1.drawRect(0, 0, 10, 10)
    stage.addChild(debug1)

    debug2 = new PIXI.Graphics()
    debug2.game = { type: 'debug2' }
    debug2.position.x = 0
    debug2.position.y = 0
    debug2.beginFill(0x00ff00)
    debug2.drawRect(0, 0, 10, 10)
    stage.addChild(debug2)


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
            debug1.position.y = 100 + p1gamepad.axes[3] * 10
            break;

        case 'debug2':
            //const gp = p1gamepad.axes[3]
            //const s = 1 / 1 - (Math.E ** gp / 50)
            const exp = x => (2 ** x) * 10
            debug2.position.x = 320
            debug2.position.y = 100 + exp(p1gamepad.axes[3]) * 10
            break;

        case 'star':
            if (air_thickness === 0) return

            child.position.x -= air_velocity
            if (child.position.x < 0) {
                child.position.x = window.innerWidth
            }
            break;

        case 'p1':
            //const gp = p1gamepad.axes[3]
            //const s = 1 / -1 + (Math.E ** input)

            //console.log(p1gamepad.axes[3], sigmoid)

            //p1Sprite.game.angle += s * 0.1
            /*
            if (controls.p1.left) {
                p1Sprite.game.angle -= 0.06
                
            } else if (controls.p1.right) {
                p1Sprite.game.angle += 0.02
            }
            */

            
            if (p1gamepad.buttons[5].pressed) {
                engine.visible = true
                p1Sprite.game.vx += Math.sin(p1Sprite.game.angle + (Math.PI*0.5)) * 0.01
                p1Sprite.game.vy += Math.cos(p1Sprite.game.angle + (Math.PI*-0.5)) * 0.01
            } else {
                engine.visible = false
            }
            

            //console.log(p1Sprite.game.angle)

            //p1Sprite.game.angle = drag(angle)

            /*if (controls.p1.up) {
                p1Sprite.position.x += 1
            }
            if (controls.p1.down) {
                p1Sprite.position.x -= 1
            }*/

            const d = drag(p1Sprite.game.angle) * air_thickness
            
            p1Sprite.game.vx = Math.min(3, p1Sprite.game.vx - d)
            p1Sprite.game.vy = Math.min(3, p1Sprite.game.vy)
            p1Sprite.rotation = p1Sprite.game.angle

            //p1Sprite.position.x += p1Sprite.game.vx 
            p1Sprite.position.y += p1Sprite.game.vy

            //p1Sprite.position.x += p1gamepad.axes[0]
            //p1Sprite.position.y += p1gamepad.axes[1]

            return
            if (child.position.y > window.innerHeight) {
                /*child.position.y = 230
                p1Sprite.game.vy = 0
                p1Sprite.game.angle = 0*/
                child.position.y = 70
                child.position.x = 70
                p1Sprite.game.vx = 0
                p1Sprite.game.vy = 0
                p1Sprite.game.angle = 0
            }

            if (child.position.y < 0) {
                /*child.position.y = 30
                p1Sprite.game.vy = 0
                p1Sprite.game.angle = 0
                */
                child.position.y = 70
                child.position.x = 70
                p1Sprite.game.vx = 0
                p1Sprite.game.vy = 0
                p1Sprite.game.angle = 0
            }

            if (child.position.x > window.innerWidth) {
                /*child.position.x = 240
                p1Sprite.game.vx = 0
                p1Sprite.game.angle = 0*/
                child.position.y = 70
                child.position.x = 70
                p1Sprite.game.vx = 0
                p1Sprite.game.vy = 0
                p1Sprite.game.angle = 0
            }


            if (child.position.x < 0) {
                /*child.position.x = 15
                p1Sprite.game.vx = 0
                p1Sprite.game.angle = 0*/
                child.position.y = 70
                child.position.x = 70
                p1Sprite.game.vx = 0
                p1Sprite.game.vy = 0
                p1Sprite.game.angle = 0
            }


            break

    }
}

function getGamePadInput() {
    var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);


    if (gamepads['0']) {
        p1gamepad = gamepads['0']
        //console.log(gamepads['0'].axes)
    } else {
        p1gamepad = {
            axes: [0,0,0,0],
            buttons: new Array(18).fill().map(() => ({ pressed: false }))
        }
    }
}


function drag(angle) {
    return Math.abs(Math.sin(angle))
}

const isEnemy = ({prefixObject}) => prefixObject === 'enemy'
const isMine = ({prefixObject}) => prefixObject === 'mine'
const isBlast = ({prefixObject}) => prefixObject === 'blast'
const isPlayer = ({prefixObject}) => prefixObject === 'p1' || prefixObject === 'p2'
const isPew = ({prefixObject}) => prefixObject === 'pew'
const isPewPuff = ({prefixObject}) => prefixObject === 'pew-puff'
const isStunEffect = ({prefixObject}) => prefixObject === 'stun-effect'
const isRocket = ({prefixObject}) => prefixObject === 'rocket'
const isRocketCollisionFilter = ({prefixObject}) => ['p1', 'p2', 'mine', 'pew', 'enemy', 'blast', 'rocket'].includes(prefixObject)

function keyboardKeyDown(e) {
    
    if (e.keyCode === 68) {
        controls.p1.right = true
    }
    if (e.keyCode === 65) {
        controls.p1.left = true
    }
    if (e.keyCode === 87) {
        controls.p1.up = true
    }
    if (e.keyCode === 83) {
        controls.p1.down = true
    }
    if (e.keyCode === 32) {
        controls.p1.shoot = true
    }
    if (e.keyCode === 13) { //enter
        controls.p1.engine = true
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
        controls.p1.up = false
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
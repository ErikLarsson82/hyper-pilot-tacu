
const controls = {
    p1: {
        up: false,
        down: false,
        left: false,
        right: false,
        shoot: false
    },
    p2: {
        up: false,
        down: false,
        left: false,
        right: false,
        shoot: false
    }
}

const RENDER_SIZE = 256

const config = {
    antialias: false,
    transparent: false,
    resolution: 1,
    sharedTicker: true,
}

const app = new PIXI.Application(config)
const renderer = PIXI.autoDetectRenderer(RENDER_SIZE, RENDER_SIZE, config)
app.renderer = renderer

const stage = app.stage

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST

renderer.view.style.imageRendering = 'pixelated'
renderer.backgroundColor = 0x181425

PIXI.loader.add('player-1.png')
PIXI.loader.load(startGame)




function startGame() {
    
	p1Sprite = new PIXI.Sprite(PIXI.Texture.fromImage('player-1.png'))
    p1Sprite.game = {
        type: 'p1',
        vx: 0,
        vy: 0,
        angle: 0
    }
    p1Sprite.anchor.set(0.5, 0.5)
	p1Sprite.position.x = 10
	p1Sprite.position.y = 10
	stage.addChild(p1Sprite)

    animationLoop()
}









function animationLoop() {
    requestAnimationFrame(animationLoop)

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


let touchFactor = 0, touchDir = 'left'

function tickEntities(child) {
    switch (child.game && child.game.type) {

        case 'p1':

            if (controls.p1.left) {
                p1Sprite.game.angle -= 0.06
                
                /*
                touchFactor += 2
                if (touchDir === 'right') {
                    touchFactor = 1
                }
                touchDir = 'left'*/

                
            } else if (controls.p1.right) {
                p1Sprite.game.angle += 0.02
                /*
                touchFactor += 2
                if (touchDir === 'left') {
                    touchFactor = 1
                }
                touchDir = 'right'*/

                
            } else {
                //touchFactor -= 1
                //touchFactor = Math.max(touchFactor, 0)
            }


            if (controls.p1.up) {
                p1Sprite.position.x += 1
            }
            if (controls.p1.down) {
                p1Sprite.position.x -= 1
            }

            p1Sprite.game.vx = Math.min(3, p1Sprite.game.vx)
            p1Sprite.game.vy = Math.min(3, p1Sprite.game.vy)
            p1Sprite.rotation = p1Sprite.game.angle

            p1Sprite.position.x += p1Sprite.game.vx 
            p1Sprite.position.y += p1Sprite.game.vy

            if (child.position.y > RENDER_SIZE) {
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

            if (child.position.x > RENDER_SIZE) {
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




function drag(angle) {
    return Math.abs(angle) > 0.7 ? -1 : 1
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

window.addEventListener('keydown', e => {
    hasInput = true

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
	if (e.keyCode === 13) {
		controls.p2.shoot = true
	}
})

window.addEventListener('keyup', e => {
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
	if (e.keyCode === 13) {
		controls.p2.shoot = false
	}
})

document.getElementById('container').appendChild(app.view)
import {
  Vector2,
  WebGLRenderTarget,
  LinearFilter,
  RGBAFormat,
  Scene,
  ShaderMaterial,
  OrthographicCamera,
  Mesh,
  BufferGeometry,
  BufferAttribute,
  NoBlending
} from 'three'

/* ------------------------------------------
Classes
------------------------------------------ */
import BaseClass from './BaseClass'
import RendererClass from './RendererClass'

/* ------------------------------------------
Shaders
------------------------------------------ */
import PassThroughVert from '../../shaders/passThrough.vert'
import MousePosFrag from '../../shaders/mousePos.frag'

class InputClass extends BaseClass {
  init () {
    this.frame = 0

    this.prevMousePos = new Vector2(0, 0)
    this.mouseDelta = new Vector2(0, 0)
    this.movement = new Vector2()
    this.mousePos = new Vector2()
    this.normalizedMousePos = new Vector2()
    this.prevNormalizedMousePos = new Vector2()
    this.mousePressed = false
    this.downscaleDivisor = 5

    this.initRenderTargets()
  }

  initRenderTargets () {
    this.width = window.innerWidth / this.downscaleDivisor
    this.height = window.innerHeight / this.downscaleDivisor

    this.mousePosRT1 = new WebGLRenderTarget(
      this.width,
      this.height,
      {
        minFilter: LinearFilter,
        magFilter: LinearFilter,
        format: RGBAFormat,
        type: this.config.renderTargetFloatType,
        depthWrite: false,
        depthBuffer: false,
        stencilBuffer: false
      })

    this.mousePosRT2 = this.mousePosRT1.clone()

    this.mousePosScene = new Scene()
    this.mousePosMaterial = new ShaderMaterial({
      uniforms: {
        uMousePosTexture: {
          type: 't',
          value: null
        },
        uMousePos: {
          type: 'v2',
          value: new Vector2(0, 0)
        },
        uPrevMousePos: {
          type: 'v2',
          value: new Vector2(0, 0)
        },
        uDir: {
          type: 'v2',
          value: new Vector2(0, 0)
        },
        uAspect: {
          type: 'f',
          value: 1.0
        },
        uResolution: {
          type: 'v2',
          value: new Vector2(this.width / this.downscaleDivisor, this.height / this.downscaleDivisor)
        },
        uRadius: {
          type: 'f',
          value: 0.03
        }
      },
      vertexShader: PassThroughVert,
      fragmentShader: MousePosFrag,
      blending: NoBlending,
      transparent: false,
      fog: false,
      lights: false,
      depthWrite: false,
      depthTest: false
    })

    this.geometry = new BufferGeometry()

    // full screen triangle
    const vertices = new Float32Array([
      -1.0, -1.0,
      3.0, -1.0,
      -1.0, 3.0
    ])

    this.geometry.setAttribute('position', new BufferAttribute(vertices, 2))

    const uvs = new Float32Array([
      0, 0,
      2, 0,
      0, 2
    ])
    this.geometry.setAttribute('uv', new BufferAttribute(uvs, 2))

    this.mousePosMesh = new Mesh(this.geometry, this.mousePosMaterial)
    this.mousePosMesh.frustumCulled = false
    this.mousePosScene.add(this.mousePosMesh)

    this.mousePosCamera = new OrthographicCamera()
    this.mousePosCamera.position.z = 1
    this.mousePosCamera.updateMatrixWorld()

    this.mousePosTexture = null
  }

  resize (width, height) {
    this.width = width / this.downscaleDivisor
    this.height = height / this.downscaleDivisor
    this.mousePosRT1.setSize(width, height)
    this.mousePosRT2.setSize(width, height)

    this.mousePosMaterial.uniforms.uAspect.value = this.width / this.height
    this.mousePosMaterial.uniforms.uResolution.value = new Vector2(this.width, this.height)
  }

  onMouseMove (e) {
    this.prevNormalizedMousePos.x = this.normalizedMousePos.x
    this.prevNormalizedMousePos.y = this.normalizedMousePos.y

    this.prevMousePos.x = this.mousePos.x
    this.prevMousePos.y = this.mousePos.y

    this.mousePos.x = e.clientX - RendererClass.getInstance().renderer.domElement.offsetLeft
    this.mousePos.y = this.height - (e.clientY - RendererClass.getInstance().renderer.domElement.offsetTop)

    this.mouseDelta = this.mousePos.clone().sub(this.prevMousePos)

    this.movement.x = e.movementX
    this.movement.y = e.movementY

    const x = e.clientX - RendererClass.getInstance().renderer.domElement.offsetLeft
    const y = e.clientY - RendererClass.getInstance().renderer.domElement.offsetTop

    this.normalizedMousePos.x = x / RendererClass.getInstance().renderer.domElement.width
    this.normalizedMousePos.y = 1 - y / RendererClass.getInstance().renderer.domElement.height
  }

  onMouseDown (e) {
    this.mousePressed = true
  }

  onMouseUp (e) {
    this.mousePressed = false
  }

  renderFrame ({ dt } = {}) {
    this.frame++

    this.mousePosMaterial.uniforms.uMousePos.value = this.normalizedMousePos
    this.mousePosMaterial.uniforms.uPrevMousePos.value = this.prevNormalizedMousePos

    let inputPositionRenderTarget = this.mousePosRT1
    this.outputPositionRenderTarget = this.mousePosRT2
    if (this.frame % 2 === 0) {
      inputPositionRenderTarget = this.mousePosRT2
      this.outputPositionRenderTarget = this.mousePosRT1
    }

    this.mousePosMaterial.uniforms.uMousePosTexture.value = inputPositionRenderTarget.texture
    this.mousePosTexture = this.outputPositionRenderTarget.texture

    RendererClass.getInstance().renderer.setRenderTarget(this.outputPositionRenderTarget)
    RendererClass.getInstance().renderer.render(this.mousePosScene, this.mousePosCamera)

    // render to screen
    // RendererClass.getInstance().renderer.setRenderTarget(null)
    // RendererClass.getInstance().renderer.render(this.mousePosScene, this.mousePosCamera)
  }
}

export default InputClass

import {
  WebGLRenderer
} from 'three'

import BaseClass from './BaseClass'
import CameraClass from './CameraClass'
import SceneClass from './SceneClass'

class RendererClass extends BaseClass {
  init () {
    this.canvas = document.querySelector('#' + this.config.scene.canvasID)

    this.renderer = new WebGLRenderer({
      antialias: false,
      canvas: this.canvas,
      powerPreference: 'high-performance'
    })

    super.init()
  }

  resize (width, height) {
    this.renderer.setSize(width, height, false)

    super.resize()
  }

  renderFrame ({
    renderTarget = null,
    scene = SceneClass.getInstance().scene,
    camera = CameraClass.getInstance().camera
  } = {}) {
    this.renderer.setRenderTarget(renderTarget)
    this.renderer.render(scene, camera)

    super.renderFrame()
  }

  destroy () {
    this.renderer.dispose()

    super.destroy()
  }
}

export default RendererClass

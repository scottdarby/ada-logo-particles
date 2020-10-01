import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import CameraClass from './CameraClass'
import RendererClass from './RendererClass'
import BaseClass from './BaseClass'

class ControlsClass extends BaseClass {
  init () {
    this.controls = new OrbitControls(CameraClass.getInstance().camera, RendererClass.getInstance().renderer.domElement)
    this.controls.enablePan = true
    this.controls.enableRotate = true
    this.controls.enableZoom = true
    this.controls.zoomSpeed = 0.7
    this.controls.rotateSpeed = 0.7
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.04
    this.controls.minDistance = 0.5
    this.controls.maxDistance = 10.5
    // this.controls.zoomSpeed = 0.07
    // this.controls.dampingFactor = 0.0004
    // this.controls.maxPolarAngle = 2.0
    // this.controls.minPolarAngle = 1.5
    // this.controls.maxAzimuthAngle = 0.5
    // this.controls.minAzimuthAngle = -0.35

    super.init()
  }

  destroy () {
    this.controls.dispose()
    super.destroy()
  }

  renderFrame () {
    this.controls.update()
    super.renderFrame()
  }
}

export default ControlsClass

import {
  HalfFloatType,
  FloatType
} from 'three'

import Detector from '../libs/Detector'

import { getGPUTier } from 'detect-gpu'

class Config {
  constructor () {
    if (!Config.instance) {
      this.init()
      Config.instance = this
    }

    return Config.instance
  }

  init () {
    const GPUTier = getGPUTier()

    this.data = {
      scene: {
        fullScreen: true,
        width: 800,
        height: 600,
        bgColor: 0x000000,
        canvasID: 'stage' // ID of webgl canvas element
      },
      camera: {
        fov: 60,
        initPos: { x: 0, y: 0, z: 1.5 },
        near: 0.01,
        far: 10,
        enableZoom: true // enable camera zoom on mousewheel/pinch gesture
      },
      dev: {
        debug: true
      },
      GPUTier: GPUTier,
      detector: Detector,
      floatType: Detector.isIOS ? HalfFloatType : FloatType
    }
  }

  get (id) {
    return this.data[id]
  }
}

const instance = new Config()
Object.freeze(instance)

export default Config

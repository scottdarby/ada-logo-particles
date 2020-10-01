/* ------------------------------------------
3rd Party
------------------------------------------ */
import React, { Component } from 'react'
import {
  Clock,
  Vector2
} from 'three'
import EventEmitter from 'eventemitter3'
import mixin from 'mixin'

/* ------------------------------------------
Post
------------------------------------------ */
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { HorizontalTiltShiftShader } from 'three/examples/jsm/shaders/HorizontalTiltShiftShader'
import { BrightnessContrastShader } from 'three/examples/jsm/shaders/BrightnessContrastShader'

/* ------------------------------------------
Config
------------------------------------------ */
import Config from './Config'

/* ------------------------------------------
Classes
------------------------------------------ */
import RendererClass from './classes/RendererClass'
import SceneClass from './classes/SceneClass'
import CameraClass from './classes/CameraClass'
import ControlsClass from './classes/ControlsClass'
import InputClass from './classes/InputClass'
import DatGUIClass from './classes/DatGUIClass'
import ParticleClass from './classes/ParticleClass'

class Main extends mixin(EventEmitter, Component) {
  constructor (props) {
    super(props)

    this.config = new Config().data
    this.clock = new Clock()
  }

  componentDidMount () {
    this.initStage()
  }

  initStage () {
    DatGUIClass.getInstance().init()
    SceneClass.getInstance().init()
    CameraClass.getInstance().init()
    RendererClass.getInstance().init()
    ControlsClass.getInstance().init()
    InputClass.getInstance().init()
    ParticleClass.getInstance().init()

    this.buildScene()
    this.initPost()
    this.addEvents()
    this.animate()
  }

  initPost () {
    const controls = DatGUIClass.getInstance().gui.addFolder('Post')

    this.composer = new EffectComposer(RendererClass.getInstance().renderer)
    this.renderPass = new RenderPass(SceneClass.getInstance().scene, CameraClass.getInstance().camera)
    this.composer.addPass(this.renderPass)

    this.horizontalTiltShiftPass = new ShaderPass(HorizontalTiltShiftShader)
    this.horizontalTiltShiftPass.material.uniforms.h.value = 0.003
    this.horizontalTiltShiftPass.material.uniforms.r.value = 0.56
    controls.add(this.horizontalTiltShiftPass.material.uniforms.h, 'value').name('Blur h')
    controls.add(this.horizontalTiltShiftPass.material.uniforms.r, 'value').name('Blur r')
    this.composer.addPass(this.horizontalTiltShiftPass)

    this.brightnessContrastPass = new ShaderPass(BrightnessContrastShader)
    this.brightnessContrastPass.material.uniforms.brightness.value = 0.1
    this.brightnessContrastPass.material.uniforms.contrast.value = 0.2
    controls.add(this.brightnessContrastPass.material.uniforms.brightness, 'value').name('Brightness').min(0).max(1)
    controls.add(this.brightnessContrastPass.material.uniforms.contrast, 'value').name('Contrast').min(0).max(1)
    this.composer.addPass(this.brightnessContrastPass)

    this.afterimagePass = new AfterimagePass(0.8)
    this.composer.addPass(this.afterimagePass)
    controls.add(this.afterimagePass.uniforms.damp, 'value').name('Motion Blur').min(0).max(0.99)

    // resolution, strength, radius, threshold
    this.unrealBloomPass = new UnrealBloomPass(new Vector2(window.innerWidth, window.innerHeight), 0.45, 0.3, 0.27)
    this.composer.addPass(this.unrealBloomPass)
    controls.add(this.unrealBloomPass, 'strength').name('Bloom Strength').min(0).max(1.5)
    controls.add(this.unrealBloomPass, 'radius').name('Bloom Radius').min(0).max(1)
    controls.add(this.unrealBloomPass, 'threshold').name('Bloom Threshold').min(0).max(1)
  }

  buildScene () {
    SceneClass.getInstance().scene.add(ParticleClass.getInstance().mesh)
  }

  animate () {
    window.requestAnimationFrame(this.animate.bind(this))
    this.renderFrame()
  }

  renderFrame () {
    const dt = this.clock.getDelta()

    ControlsClass.getInstance().renderFrame({ dt: dt })
    ParticleClass.getInstance().renderFrame({ dt: dt })

    this.composer.render()

    InputClass.getInstance().renderFrame({ dt: dt })
  }

  addEvents () {
    window.addEventListener('resize', this.resize.bind(this), false)
    this.resize()

    RendererClass.getInstance().renderer.domElement.addEventListener('mousemove', (e) => {
      InputClass.getInstance().onMouseMove(e)
    }, false)

    RendererClass.getInstance().renderer.domElement.addEventListener('mousedown', (e) => {
      InputClass.getInstance().onMouseDown(e)
    }, false)

    RendererClass.getInstance().renderer.domElement.addEventListener('mouseup', (e) => {
      InputClass.getInstance().onMouseUp(e)
    }, false)

    RendererClass.getInstance().renderer.domElement.addEventListener('touchmove', (e) => {
      if (typeof e.touches[0] === 'undefined') {
        return
      } else {
        e = e.touches[0]
      }
      InputClass.getInstance().onMouseMove(e)
    }, false)

    RendererClass.getInstance().renderer.domElement.addEventListener('touchstart', (e) => {
      e.preventDefault()
      InputClass.getInstance().onMouseDown(e)
    }, false)

    RendererClass.getInstance().renderer.domElement.addEventListener('touchend', (e) => {
      e.preventDefault()
      InputClass.getInstance().onMouseUp(e)
    }, false)
  }

  resize () {
    this.width = window.innerWidth
    this.height = window.innerHeight

    CameraClass.getInstance().resize(this.width, this.height)
    RendererClass.getInstance().resize(this.width, this.height)
    InputClass.getInstance().resize(this.width, this.height)

    this.composer.setSize(this.width, this.height)
  }

  destroy () {
    RendererClass.getInstance().dispose()
    SceneClass.getInstance().destroy()
    ControlsClass.getInstance().destroy()

    if (this.composer) {
      delete this.composer
    }

    window.cancelAnimationFrame(this.animate)
    this.running = false
  }

  render () {
    return (
      <canvas width={this.width} height={this.height} id={this.config.scene.canvasID} />
    )
  }
}

export default Main

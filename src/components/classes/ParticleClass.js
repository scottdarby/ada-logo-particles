import {
  ShaderLib,
  TextureLoader,
  PointsMaterial,
  Points, BufferGeometry, BufferAttribute, AdditiveBlending
} from 'three'

import { gsap } from 'gsap'

/* ------------------------------------------
Classes
------------------------------------------ */
import BaseClass from './BaseClass'
import DatGUIClass from './DatGUIClass'
import InputClass from './InputClass'

/* ------------------------------------------
Shaders
------------------------------------------ */
import vertexShader from '../../shaders/particles.vert'
import fragmentShader from '../../shaders/particles.frag'

/* ------------------------------------------
Textures
------------------------------------------ */
import logoTexture from '../../assets/textures/ada.png'

/* ------------------------------------------
Data
------------------------------------------ */
import positions from '../../data/circle'

class ParticleClass extends BaseClass {
  init () {
    this.map = new TextureLoader().load(logoTexture)

    this.particleCount = positions.length

    this.material = new ParticleMaterial({
      size: 0.021,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending
    })

    this.material.uniforms.uMap.value = this.map

    this.positionAttr = new BufferAttribute(new Float32Array(this.particleCount * 3).fill(99999), 3)
    this.idAttr = new BufferAttribute(new Float32Array(this.particleCount), 1)
    this.scalesAttr = new BufferAttribute(new Float32Array(this.particleCount), 1)
    this.isHoveredAttr = new BufferAttribute(new Float32Array(this.particleCount), 1)

    this.geometry = new BufferGeometry()
    this.geometry.setAttribute('position', this.positionAttr)
    this.geometry.setAttribute('scale', this.scalesAttr)
    this.geometry.setAttribute('isHovered', this.isHoveredAttr)
    this.geometry.setAttribute('id', this.idAttr)

    const scaleRange = 1.5
    const scaleMin = 0.2

    for (let index = 0; index < this.particleCount; index++) {
      this.positionAttr.array[index * 3 + 0] = positions[index][0]
      this.positionAttr.array[index * 3 + 1] = positions[index][1]
      this.positionAttr.array[index * 3 + 2] = positions[index][2]

      this.scalesAttr.array[index] = Math.max(Math.random() * scaleRange, scaleMin)

      this.idAttr.array[index] = index
    }

    const controls = DatGUIClass.getInstance().gui.addFolder('Noise Params')
    controls.add(this.material.uniforms.uNoiseFrequency1, 'value').name('uNoiseFrequency1')
    controls.add(this.material.uniforms.uNoiseTimeScale1, 'value').name('uNoiseTimeScale1')
    controls.add(this.material.uniforms.uNoiseAmount1, 'value').name('uNoiseAmount1')

    controls.add(this.material.uniforms.uNoiseFrequency2, 'value').name('uNoiseFrequency2')
    controls.add(this.material.uniforms.uNoiseTimeScale2, 'value').name('uNoiseTimeScale2')
    controls.add(this.material.uniforms.uNoiseAmount2, 'value').name('uNoiseAmount2')

    controls.add(this.material.uniforms.uNoiseAmount, 'value').name('uNoiseAmount').listen()

    this.geometry.attributes.position.needsUpdate = true
    this.geometry.attributes.scale.needsUpdate = true
    this.geometry.attributes.isHovered.needsUpdate = true
    this.geometry.attributes.id.needsUpdate = true

    this.mesh = new Points(
      this.geometry,
      this.material
    )

    // const depthMaterial = new ShaderMaterial({
    //   uniforms: this.material.uniforms,
    //   vertexShader: depthVert,
    //   fragmentShader: depthFrag
    // })

    // this.mesh.customDepthMaterial = depthMaterial
    // this.mesh.customDistanceMaterial = depthMaterial

    this.mesh.receiveShadow = true
    this.mesh.castShadow = true
    this.mesh.frustumCulled = false

    this.animateIn()
  }

  animateIn () {
    this.tl = gsap.timeline()
    this.tl.to(this.material.uniforms.uNoiseAmount, {
      value: 0.9,
      duration: 2.5
    })
  }

  renderFrame ({ dt } = {}) {
    this.material.uniforms.uTime.value += dt
    this.material.uniforms.uMousePosTexture.value = InputClass.getInstance().mousePosMaterial.uniforms.uMousePosTexture.value

    if (InputClass.getInstance().mousePressed) {
      if (this.material.uniforms.uNoiseAmount.value < 10) {
        this.material.uniforms.uNoiseAmount.value += 0.01
      }
    } else {
      if (this.material.uniforms.uNoiseAmount.value > 0.9) {
        this.material.uniforms.uNoiseAmount.value -= 0.05
      }
    }
  }
}

class ParticleMaterial extends PointsMaterial {
  constructor (cfg) {
    super(cfg)
    this.type = 'ShaderMaterial'

    this.uniforms = ShaderLib.points.uniforms

    this.uniforms.uTime = {
      type: 'f',
      value: 0.0
    }

    this.uniforms.uNoiseFrequency1 = {
      type: 'f',
      value: 0.8
    }

    this.uniforms.uNoiseTimeScale1 = {
      type: 'f',
      value: 0.2
    }

    this.uniforms.uNoiseAmount1 = {
      type: 'f',
      value: 0.131
    }

    this.uniforms.uNoiseFrequency2 = {
      type: 'f',
      value: 6.3
    }

    this.uniforms.uNoiseTimeScale2 = {
      type: 'f',
      value: 0.1
    }

    this.uniforms.uNoiseAmount2 = {
      type: 'f',
      value: 0.131
    }

    this.uniforms.uNoiseAmount = {
      type: 'f',
      value: 100
    }

    this.uniforms.uMap = {
      type: 't',
      value: null
    }

    this.uniforms.uMousePosTexture = {
      type: 't',
      value: null
    }

    this.vertexShader = vertexShader
    this.fragmentShader = fragmentShader
  }
}

export default ParticleClass

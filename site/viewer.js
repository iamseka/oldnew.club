// Old New Club -- 3D jacket viewer.
//
// Plain-JS port of the Framer code component "GLB Model Viewer" (the
// version fixed and verified on 2026-10-13). The behavior is the same;
// only React and Framer's property controls are gone. Each viewer is a
// <div class="jacket" data-glb="..."> with its settings as data-
// attributes (see index.html).
//
// Life cycle of one viewer:
//   scrolls into view -> build scene, load GLB, spin
//   scrolls out of view -> tear everything down (frees WebGL memory)
//   load fails -> tear down, show "Tap to retry" (never auto-retries)

const THREE_BASE = "https://unpkg.com/three@0.136.0"

// Add one <script> tag and resolve once it has actually loaded
function loadScript(url) {
    return new Promise((resolve, reject) => {
        const script = document.createElement("script")
        script.src = url
        script.async = true
        script.onload = () => resolve()
        script.onerror = () => reject(new Error(`Failed to load ${url}`))
        document.head.appendChild(script)
    })
}

// Page-wide shared load. Every viewer waits on the same download.
// three.min.js must finish before the add-ons start: they attach
// themselves to the global THREE when they run, and crash if it is not
// there yet. On failure the promise is cleared so a retry starts fresh.
let threePromise = null
function loadThreeOnce() {
    if (!threePromise) {
        threePromise = (async () => {
            // Step 1: the core library, alone
            if (!window.THREE) {
                await loadScript(`${THREE_BASE}/build/three.min.js`)
            }
            // Step 2: the add-ons, now that THREE exists
            await Promise.all([
                loadScript(`${THREE_BASE}/examples/js/loaders/GLTFLoader.js`),
                loadScript(`${THREE_BASE}/examples/js/loaders/DRACOLoader.js`),
                loadScript(
                    `${THREE_BASE}/examples/js/controls/OrbitControls.js`
                ),
            ])
            const THREE = window.THREE
            if (!THREE || !THREE.GLTFLoader || !THREE.DRACOLoader) {
                throw new Error("Three.js add-ons did not register")
            }
            return THREE
        })().catch((err) => {
            threePromise = null
            throw err
        })
    }
    return threePromise
}

// Device detection
const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent) && !window.MSStream

// Renderer quality based on device and the viewer's mobileQuality setting
function getQualitySettings(mobileQuality) {
    const settings = {
        pixelRatio: isMobile ? 1 : window.devicePixelRatio,
        antialias: !isMobile,
        precision: isMobile ? "mediump" : "highp",
        powerPreference: "default",
    }

    if (isMobile) {
        if (mobileQuality === "low") {
            settings.pixelRatio = Math.min(1.0, window.devicePixelRatio)
            settings.precision = "lowp"
        } else if (mobileQuality === "medium") {
            settings.pixelRatio = Math.min(1.5, window.devicePixelRatio)
            settings.precision = "mediump"
        } else {
            settings.pixelRatio = Math.min(2.0, window.devicePixelRatio)
            settings.precision = "mediump"
            settings.antialias = true
        }
    }

    if (isIOS) {
        settings.powerPreference = "low-power"
        settings.antialias = false
        settings.precision = mobileQuality === "low" ? "lowp" : "mediump"
        settings.pixelRatio =
            mobileQuality === "low" ? 1.0 : mobileQuality === "medium" ? 1.2 : 1.5
    }

    return settings
}

// Read a viewer's settings from its data- attributes
function readOptions(el) {
    const num = (name, fallback) => {
        const value = parseFloat(el.dataset[name])
        return Number.isFinite(value) ? value : fallback
    }
    return {
        glbUrl: el.dataset.glb,
        modelX: num("modelX", 0),
        modelY: num("modelY", 0),
        modelZ: num("modelZ", 0),
        modelScale: num("modelScale", 2),
        rotationSpeed: num("rotationSpeed", 0.01),
        rotationDirection: num("rotationDirection", 1),
        ambientLightIntensity: num("ambientLight", 1),
        directionalLightIntensity: num("directionalLight", 1),
        mobileQuality: el.dataset.mobileQuality || "medium",
    }
}

class JacketViewer {
    constructor(el) {
        this.el = el
        this.options = readOptions(el)
        this.isInViewport = false
        this.hasBeenSeen = false // first appearance waits 100ms, like Framer
        this.hasError = false
        this.resetState()

        // Visibility tracking only. It must never clear errors, or a
        // failing load retries in a tight loop.
        const observer = new IntersectionObserver(
            (entries) => this.onVisibility(entries[0].isIntersecting),
            { threshold: 0.1, rootMargin: "50px" }
        )
        observer.observe(el)
    }

    resetState() {
        this.state = {
            isMounted: false,
            renderer: null,
            scene: null,
            camera: null,
            controls: null,
            model: null,
            animationFrame: null,
            isUserInteracting: false,
            lastInteractionTime: Date.now(),
            rotationVelocity: 0,
            eventListeners: [],
            loadTimeout: null,
        }
    }

    onVisibility(isVisible) {
        this.isInViewport = isVisible
        if (!isVisible) {
            this.teardown()
            return
        }
        if (this.hasBeenSeen) {
            this.start()
        } else {
            this.hasBeenSeen = true
            setTimeout(() => this.start(), 100)
        }
    }

    // Build the scene if visible, not already running, and not errored
    start() {
        if (!this.isInViewport || this.hasError || this.state.isMounted) return
        if (!this.options.glbUrl) return
        this.state.isMounted = true
        this.initScene()
    }

    // Show the retry message. Tapping it clears the error and tries again.
    showError() {
        this.hasError = true
        this.teardown()

        const box = document.createElement("div")
        box.className = "jacket-error"
        box.innerHTML =
            "<div><div>Model loading issue</div>" +
            '<div class="jacket-error-hint">Tap to retry</div></div>'
        box.addEventListener("click", () => {
            box.remove()
            this.hasError = false
            this.start()
        })
        this.el.appendChild(box)
    }

    addListener(target, event, handler, options) {
        if (!target) return
        target.addEventListener(event, handler, options)
        this.state.eventListeners.push({ target, event, handler, options })
    }

    async initScene() {
        const state = this.state
        const opts = this.options

        try {
            let THREE
            try {
                THREE = await loadThreeOnce()
            } catch (err) {
                console.error("Failed to load Three.js:", err)
                throw err
            }
            if (!state.isMounted || state !== this.state) return

            const container = document.createElement("div")
            container.className = "jacket-stage"
            this.el.appendChild(container)

            const quality = getQualitySettings(opts.mobileQuality)

            const scene = new THREE.Scene()
            scene.background = null
            state.scene = scene

            const camera = new THREE.PerspectiveCamera(
                50,
                container.clientWidth / container.clientHeight,
                0.1,
                1000
            )
            camera.position.set(0, 0, 5)
            state.camera = camera

            const renderer = new THREE.WebGLRenderer({
                alpha: true,
                antialias: quality.antialias,
                precision: quality.precision,
                powerPreference: quality.powerPreference,
                preserveDrawingBuffer: false,
            })
            renderer.setSize(container.clientWidth, container.clientHeight)
            renderer.setPixelRatio(quality.pixelRatio)
            renderer.domElement.className = "jacket-canvas"

            if (isMobile) {
                this.setUpTouch(container, renderer)
            } else {
                this.setUpOrbitControls(THREE, camera, renderer)
            }

            container.appendChild(renderer.domElement)
            state.renderer = renderer

            // Lighting: ambient + key light + a dim fill from below/behind
            const ambientLight = new THREE.AmbientLight(
                0xffffff,
                opts.ambientLightIntensity
            )
            const dirLight = new THREE.DirectionalLight(
                0xffffff,
                opts.directionalLightIntensity
            )
            dirLight.position.set(5, 10, 5)
            const fillLight = new THREE.DirectionalLight(
                0xffffff,
                opts.directionalLightIntensity * 0.3
            )
            fillLight.position.set(-5, -5, -5)
            scene.add(ambientLight, dirLight, fillLight)

            state.rotationVelocity = opts.rotationSpeed * opts.rotationDirection

            this.loadModel(THREE, scene, camera, quality)
            this.animate()

            const handleResize = () => {
                if (!state.camera || !state.renderer) return
                state.camera.aspect = container.clientWidth / container.clientHeight
                state.camera.updateProjectionMatrix()
                state.renderer.setSize(container.clientWidth, container.clientHeight)
            }
            this.addListener(window, "resize", handleResize)
        } catch (err) {
            console.error("Error initializing scene:", err)
            if (state === this.state) this.showError()
        }
    }

    // Phones: horizontal swipes spin the jacket, vertical swipes scroll
    // the page. The canvas only takes pointer events mid-swipe.
    setUpTouch(container, renderer) {
        const state = this.state
        renderer.domElement.style.pointerEvents = "none"

        let touchStartX = 0
        let touchStartY = 0
        let lastTouchX = 0
        let isHorizontalMove = null

        const handleTouchStart = (e) => {
            if (e.touches.length !== 1) return
            touchStartX = e.touches[0].clientX
            touchStartY = e.touches[0].clientY
            lastTouchX = touchStartX
            isHorizontalMove = null
            state.isUserInteracting = false
        }

        const handleTouchMove = (e) => {
            if (e.touches.length !== 1) return

            const currentX = e.touches[0].clientX
            const currentY = e.touches[0].clientY
            const deltaX = Math.abs(currentX - touchStartX)
            const deltaY = Math.abs(currentY - touchStartY)

            // Decide the swipe direction once it has moved 8px
            if (isHorizontalMove === null && (deltaX > 8 || deltaY > 8)) {
                isHorizontalMove = deltaX > deltaY
                if (isHorizontalMove) {
                    renderer.domElement.style.pointerEvents = "auto"
                    if (e.cancelable) e.preventDefault()
                    state.isUserInteracting = true
                } else {
                    renderer.domElement.style.pointerEvents = "none"
                    state.isUserInteracting = false
                }
            }

            if (isHorizontalMove === true && state.model) {
                state.isUserInteracting = true
                state.lastInteractionTime = Date.now()
                if (e.cancelable) e.preventDefault()

                const rotateAmount = (currentX - lastTouchX) * 0.01
                state.model.rotation.y += rotateAmount
                // Carry the swipe speed into the spin (momentum)
                state.rotationVelocity = rotateAmount * 10
                lastTouchX = currentX
            }
        }

        const handleTouchEnd = () => {
            renderer.domElement.style.pointerEvents = "none"
            state.isUserInteracting = false
            state.lastInteractionTime = Date.now()
        }

        this.addListener(container, "touchstart", handleTouchStart, { passive: true })
        this.addListener(container, "touchmove", handleTouchMove, { passive: false })
        this.addListener(container, "touchend", handleTouchEnd, { passive: true })
    }

    // Desktop: drag to orbit around the jacket, level only (no tilt, zoom or pan)
    setUpOrbitControls(THREE, camera, renderer) {
        const state = this.state
        try {
            const controls = new THREE.OrbitControls(camera, renderer.domElement)
            controls.enableDamping = true
            controls.dampingFactor = 0.05
            controls.enableZoom = false
            controls.enablePan = false
            controls.minPolarAngle = Math.PI / 2
            controls.maxPolarAngle = Math.PI / 2
            controls.rotateSpeed = 0.7

            controls.addEventListener("start", () => {
                state.isUserInteracting = true
            })
            controls.addEventListener("end", () => {
                state.isUserInteracting = false
                state.lastInteractionTime = Date.now()
            })
            state.controls = controls
        } catch (err) {
            console.warn("Could not initialize OrbitControls:", err)
        }
    }

    // Load the Draco-compressed GLB, with a 15s timeout
    loadModel(THREE, scene, camera, quality) {
        const state = this.state
        const opts = this.options

        try {
            const loader = new THREE.GLTFLoader()
            const dracoLoader = new THREE.DRACOLoader()
            dracoLoader.setDecoderPath(`${THREE_BASE}/examples/js/libs/draco/`)
            // WebAssembly decoder: much faster than the pure-JS one
            dracoLoader.setDecoderConfig({ type: "wasm" })
            loader.setDRACOLoader(dracoLoader)

            let loaded = false
            state.loadTimeout = setTimeout(() => {
                if (!loaded && state.isMounted) {
                    console.warn("Model loading timeout")
                    this.showError()
                }
            }, 15000)

            loader.load(
                opts.glbUrl,
                (gltf) => {
                    loaded = true
                    clearTimeout(state.loadTimeout)
                    dracoLoader.dispose() // release decoder memory
                    if (!state.isMounted) return

                    const model = gltf.scene

                    // Phones: cheaper materials and texture filtering
                    if (isMobile) {
                        model.traverse((node) => {
                            if (!node.isMesh) return
                            node.castShadow = false
                            node.receiveShadow = false
                            const materials = Array.isArray(node.material)
                                ? node.material
                                : node.material
                                  ? [node.material]
                                  : []
                            materials.forEach((mat) => {
                                mat.precision = quality.precision
                                if (quality.pixelRatio === 1 && mat.map) {
                                    mat.map.minFilter = THREE.LinearFilter
                                    mat.map.anisotropy = 1
                                }
                            })
                        })
                    }

                    model.scale.setScalar(opts.modelScale)
                    model.position.set(opts.modelX, opts.modelY, opts.modelZ)
                    scene.add(model)
                    state.model = model
                    camera.lookAt(new THREE.Vector3(0, 0, 0))
                },
                undefined,
                (err) => {
                    clearTimeout(state.loadTimeout)
                    dracoLoader.dispose()
                    console.error("Error loading model:", err)
                    if (state.isMounted) this.showError()
                }
            )
        } catch (err) {
            console.error("Error setting up model loader:", err)
            this.showError()
        }
    }

    // Spin loop. After the user lets go, the spin eases from their
    // swipe speed back to the idle speed (5% per frame).
    animate() {
        const state = this.state
        const opts = this.options

        const tick = () => {
            if (!state.isMounted) return
            state.animationFrame = requestAnimationFrame(tick)

            if (state.controls) state.controls.update()

            if (state.model && !state.isUserInteracting) {
                const elapsed = (Date.now() - state.lastInteractionTime) / 1000
                if (elapsed > 0.1) {
                    const dampingFactor = 0.95
                    const targetVelocity = opts.rotationSpeed * opts.rotationDirection
                    state.rotationVelocity =
                        state.rotationVelocity * dampingFactor +
                        targetVelocity * (1 - dampingFactor)
                    state.model.rotation.y += state.rotationVelocity
                }
            }

            if (state.renderer && state.scene && state.camera) {
                state.renderer.render(state.scene, state.camera)
            }
        }
        tick()
    }

    // Free everything: animation, listeners, geometry, textures, WebGL
    teardown() {
        const state = this.state
        state.isMounted = false

        if (state.loadTimeout) clearTimeout(state.loadTimeout)
        if (state.animationFrame) cancelAnimationFrame(state.animationFrame)

        state.eventListeners.forEach(({ target, event, handler, options }) => {
            target.removeEventListener(event, handler, options)
        })

        if (state.model) {
            if (state.scene) state.scene.remove(state.model)
            state.model.traverse((node) => {
                if (!node.isMesh) return
                if (node.geometry) node.geometry.dispose()
                const materials = Array.isArray(node.material)
                    ? node.material
                    : node.material
                      ? [node.material]
                      : []
                materials.forEach((mat) => {
                    if (mat.map) mat.map.dispose()
                    mat.dispose()
                })
            })
        }

        if (state.controls) state.controls.dispose()

        if (state.renderer) {
            state.renderer.dispose()
            state.renderer.forceContextLoss()
        }

        // Remove the stage (canvas wrapper); keep any error message
        this.el.querySelectorAll(".jacket-stage").forEach((node) => node.remove())

        // Fresh state object: any async work still holding the old one
        // sees isMounted === false and stops
        this.resetState()
    }
}

document.querySelectorAll(".jacket[data-glb]").forEach((el) => new JacketViewer(el))

// iOS Safari: release WebGL contexts when leaving the page
window.addEventListener("beforeunload", () => {
    document.querySelectorAll(".jacket-canvas").forEach((canvas) => {
        const gl = canvas.getContext("webgl2") || canvas.getContext("webgl")
        const ext = gl && gl.getExtension("WEBGL_lose_context")
        if (ext) ext.loseContext()
    })
})

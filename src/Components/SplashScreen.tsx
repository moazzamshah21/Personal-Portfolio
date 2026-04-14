import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import gsap from 'gsap'
import './SplashScreen.css'
import {
  BACKDROP_FADE_DUR_S,
  EXPAND_DUR_S,
  HOME_REVEAL_DUR_S,
  LINE_GROW_DUR_S,
  LINE_GROW_STAGGER_S,
  LINES_FADE_DUR_S,
  MERGE_DUR_S,
  MERGE_END_S,
  MERGE_START_S,
  SHRINK_DUR_S,
  SHRINK_START_S,
} from './splashTiming'

const LINE_COUNT = 10
const PRELOADER_MIN_MS = 3600
const PRELOADER_MAX_WAIT_MS = 12000

/** Treat splash as “fully” in view (avoids 0.999… never hitting 1 on some browsers). */
const INTERSECTION_MIN = 0.99

type SplashScreenProps = {
  onFinish?: () => void
  /** Main content wrapper to zoom/fade in with the white film shrink. */
  homeRevealTarget?: RefObject<HTMLElement | null>
}

function mergeXVw(index: number): string {
  const vw = 50 - (index * 100) / 9
  return `${vw}vw`
}

export default function SplashScreen({
  onFinish,
  homeRevealTarget,
}: SplashScreenProps) {
  const [viewportReady, setViewportReady] = useState(false)
  const [loadProgress, setLoadProgress] = useState(0)
  const [preloaderDone, setPreloaderDone] = useState(false)

  const onFinishRef = useRef(onFinish)
  onFinishRef.current = onFinish

  const splashRef = useRef<HTMLElement>(null)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)
  const loaderTweenRef = useRef<gsap.core.Tween | null>(null)
  const revealTriggeredRef = useRef(false)
  const revealStartedRef = useRef(false)
  const destroyedRef = useRef(false)
  const lastProgressShownRef = useRef(0)

  useEffect(() => {
    const html = document.documentElement
    const body = document.body
    const prevHtmlOverflow = html.style.overflow
    const prevBodyOverflow = body.style.overflow
    html.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    return () => {
      html.style.overflow = prevHtmlOverflow
      body.style.overflow = prevBodyOverflow
    }
  }, [])

  useLayoutEffect(() => {
    const home = homeRevealTarget?.current
    if (!home) return
    gsap.set(home, {
      opacity: 0,
      scale: 0.88,
      transformOrigin: '50% 0%',
    })
  }, [homeRevealTarget])

  useEffect(() => {
    const root = splashRef.current
    if (!root) return

    if (typeof IntersectionObserver === 'undefined') {
      const rafId = requestAnimationFrame(() => setViewportReady(true))
      return () => {
        cancelAnimationFrame(rafId)
      }
    }

    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0]
        if (
          !e?.isIntersecting ||
          e.intersectionRatio < INTERSECTION_MIN
        ) {
          return
        }
        io.disconnect()
        setViewportReady(true)
      },
      { threshold: [0, INTERSECTION_MIN, 1], root: null, rootMargin: '0px' },
    )
    io.observe(root)

    return () => {
      io.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!viewportReady) return

    const root = splashRef.current
    if (!root) return
    if (timelineRef.current) return

    let targets: {
      backdrop: HTMLDivElement
      lines: HTMLDivElement
      film: HTMLDivElement
      linesEls: HTMLDivElement[]
    } | null = null

    const clearSplashTransforms = () => {
      if (!targets) return
      gsap.set(targets.linesEls, { clearProps: 'transform' })
      gsap.set(targets.lines, { clearProps: 'opacity' })
      gsap.set(targets.film, { clearProps: 'transform' })
      gsap.set(targets.backdrop, { clearProps: 'opacity' })
    }

    const backdrop = root.querySelector<HTMLDivElement>('.splash-backdrop')
    const lines = root.querySelector<HTMLDivElement>('.lines')
    const film = root.querySelector<HTMLDivElement>('.splash-film')
    if (!backdrop || !lines || !film) return

    const linesEls = Array.from(lines.querySelectorAll<HTMLDivElement>(':scope > .line'))
    if (linesEls.length !== LINE_COUNT) return

    const home = homeRevealTarget?.current ?? null
    targets = { backdrop, lines, film, linesEls }

    const lineOrigin = '50% 100%'
    const lineFromScaleY = 0.0001

    gsap.ticker.wake()

    gsap.set(linesEls, {
      transformOrigin: lineOrigin,
      scaleX: 1,
      scaleY: lineFromScaleY,
      x: 0,
    })
    gsap.set(lines, { opacity: 1 })
    gsap.set(film, { transformOrigin: '50% 50%', scaleX: 0, scaleY: 1 })
    gsap.set(backdrop, { opacity: 1 })

    if (home) {
      gsap.set(home, {
        opacity: 0,
        scale: 0.88,
        transformOrigin: '50% 0%',
      })
    }

    const timeline = gsap.timeline({
      paused: true,
      onComplete: () => {
        onFinishRef.current?.()
      },
    })
    timelineRef.current = timeline

    linesEls.forEach((line, i) => {
      timeline.fromTo(
        line,
        {
          transformOrigin: lineOrigin,
          scaleX: 1,
          scaleY: lineFromScaleY,
        },
        {
          transformOrigin: lineOrigin,
          scaleX: 1,
          scaleY: 1,
          duration: LINE_GROW_DUR_S,
          ease: 'back.out(1.05)',
          immediateRender: true,
        },
        LINE_GROW_STAGGER_S[i],
      )
    })

    linesEls.forEach((line, i) => {
      timeline.to(
        line,
        {
          x: mergeXVw(i),
          transformOrigin: lineOrigin,
          duration: MERGE_DUR_S,
          ease: 'power2.inOut',
        },
        MERGE_START_S,
      )
    })

    timeline.to(lines, {
      opacity: 0,
      duration: LINES_FADE_DUR_S,
      ease: 'power2.out',
    }, MERGE_END_S)

    timeline.to(film, {
      scaleX: 1,
      scaleY: 1,
      duration: EXPAND_DUR_S,
      ease: 'back.out(1.06)',
    }, MERGE_END_S)

    const backdropFadeStartS = Math.max(
      MERGE_END_S,
      SHRINK_START_S - BACKDROP_FADE_DUR_S,
    )
    timeline.to(backdrop, {
      opacity: 0,
      duration: BACKDROP_FADE_DUR_S,
      ease: 'power2.out',
    }, backdropFadeStartS)

    timeline.to(film, {
      scaleY: 0,
      duration: SHRINK_DUR_S * 0.6,
      ease: 'back.in(1.12)',
      overwrite: false,
    }, SHRINK_START_S)

    timeline.to(film, {
      scaleX: 0,
      duration: SHRINK_DUR_S,
      ease: 'back.in(1.06)',
      overwrite: false,
    }, SHRINK_START_S)

    if (home) {
      timeline.to(home, {
        opacity: 1,
        scale: 1,
        duration: HOME_REVEAL_DUR_S,
        ease: 'power2.out',
      }, MERGE_END_S)
    }

    timeline.progress(0)

    const cleanup = () => {
      loaderTweenRef.current?.kill()
      loaderTweenRef.current = null
      timelineRef.current?.kill()
      timelineRef.current = null
      destroyedRef.current = true
      clearSplashTransforms()
    }

    return () => {
      cleanup()
    }
  }, [homeRevealTarget, viewportReady])

  useEffect(() => {
    if (!viewportReady) return
    const tl = timelineRef.current
    if (!tl || revealTriggeredRef.current) return
    if (loaderTweenRef.current) return

    const drive = { p: 0 }
    let disposed = false

    const setProgressSafe = (next: number) => {
      if (disposed) return
      const clamped = Math.max(0, Math.min(100, next))
      if (clamped !== lastProgressShownRef.current) {
        lastProgressShownRef.current = clamped
        setLoadProgress(clamped)
      }
    }

    const waitForLoadEvent = (): Promise<void> => {
      if (document.readyState === 'complete') return Promise.resolve()
      return new Promise((resolve) => {
        const onLoad = () => {
          window.removeEventListener('load', onLoad)
          resolve()
        }
        window.addEventListener('load', onLoad, { once: true })
      })
    }

    const waitForFontsReady = (): Promise<void> => {
      const fontsApi = document.fonts
      if (!fontsApi?.ready) return Promise.resolve()
      return fontsApi.ready.then(() => undefined).catch(() => undefined)
    }

    const waitForImagesReady = (): Promise<void> => {
      const images = Array.from(document.images)
      if (!images.length) return Promise.resolve()
      return Promise.all(
        images.map((img) => {
          if (img.complete) return Promise.resolve()
          return new Promise<void>((resolve) => {
            const done = () => {
              img.removeEventListener('load', done)
              img.removeEventListener('error', done)
              resolve()
            }
            img.addEventListener('load', done, { once: true })
            img.addEventListener('error', done, { once: true })
          })
        }),
      ).then(() => undefined)
    }

    const hardTimeout = new Promise<void>((resolve) => {
      window.setTimeout(resolve, PRELOADER_MAX_WAIT_MS)
    })

    const minimumDuration = new Promise<void>((resolve) => {
      window.setTimeout(resolve, PRELOADER_MIN_MS)
    })

    void Promise.all([
      waitForLoadEvent().then(() => setProgressSafe(12)),
      waitForFontsReady().then(() => setProgressSafe(24)),
      waitForImagesReady().then(() => setProgressSafe(36)),
      minimumDuration.then(() => setProgressSafe(95)),
      Promise.race([
        Promise.all([
          waitForLoadEvent(),
          waitForFontsReady(),
          waitForImagesReady(),
          minimumDuration,
        ]),
        hardTimeout,
      ]),
    ]).then(() => {
      if (disposed) return
      setProgressSafe(100)
      revealTriggeredRef.current = true
      setPreloaderDone(true)
    })

    loaderTweenRef.current = gsap.to(drive, {
      p: MERGE_END_S,
      duration: Math.max(0.9, MERGE_END_S),
      ease: 'none',
      onUpdate: () => {
        tl.time(drive.p, false)
        const visualCap = revealTriggeredRef.current ? 100 : 95
        const next = Math.round((drive.p / MERGE_END_S) * visualCap)
        setProgressSafe(next)
      },
      onComplete: () => {
        tl.time(MERGE_END_S, false)
      },
    })

    return () => {
      disposed = true
      loaderTweenRef.current?.kill()
      loaderTweenRef.current = null
    }
  }, [viewportReady])

  useEffect(() => {
    if (!preloaderDone) return
    if (revealStartedRef.current) return
    const tl = timelineRef.current
    if (!tl || destroyedRef.current) return
    revealStartedRef.current = true

    const preloaderEl = splashRef.current?.querySelector<HTMLDivElement>('.splash-preloader')
    if (!preloaderEl) {
      tl.play(MERGE_END_S)
      return
    }
    gsap.to(preloaderEl, {
      opacity: 0,
      duration: 0.35,
      ease: 'power2.out',
      onComplete: () => {
        tl.play(MERGE_END_S)
      },
    })
  }, [preloaderDone])

  return (
    <section ref={splashRef} className="splash" aria-label="Loading">
      <div
        className="splash-preloader"
        aria-hidden={preloaderDone}
      >
        <div className="preloader-progress">{loadProgress}%</div>
      </div>
      <div className="splash-backdrop">
        <div className="lines">
          {Array.from({ length: LINE_COUNT }, (_, i) => (
            <div key={i} className="line" />
          ))}
        </div>
      </div>
      <div className="splash-film" aria-hidden />
    </section>
  )
}

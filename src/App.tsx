import { useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Home from './Pages/Home'
import './App.css'
import SplashScreen from './Components/SplashScreen'

function App() {
  const [splashDone, setSplashDone] = useState(false)
  const homeRootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) return

    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      touchMultiplier: 1.1,
    })

    const handleLenisScroll = () => ScrollTrigger.update()
    lenis.on('scroll', handleLenisScroll)

    const raf = (time: number) => {
      lenis.raf(time * 1000)
    }

    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    return () => {
      lenis.off('scroll', handleLenisScroll)
      lenis.destroy()
      gsap.ticker.remove(raf)
      gsap.ticker.lagSmoothing(500, 33)
    }
  }, [])

  return (
    <>
      <div ref={homeRootRef} className="app-root">
        <Home revealReady={splashDone} />
      </div>
      {!splashDone && (
        <SplashScreen
          homeRevealTarget={homeRootRef}
          onFinish={() => setSplashDone(true)}
        />
      )}
    </>
  )
}

export default App
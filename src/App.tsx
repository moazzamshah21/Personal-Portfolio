import { useRef, useState } from 'react'
import Home from './Pages/Home'
import './App.css'
import SplashScreen from './Components/SplashScreen'

function App() {
  const [splashDone, setSplashDone] = useState(false)
  const homeRootRef = useRef<HTMLDivElement>(null)

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
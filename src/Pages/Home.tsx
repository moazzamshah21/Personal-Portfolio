import { useEffect, useRef } from 'react'
import './Home.css'
import approachImage from '/panet.svg'

type HomeProps = {
  revealReady?: boolean
}

const orbitText = 'eveloper   ★   MOBILE   ★   WEBSITE   ★   APPLICATION   ★  D'

function renderAnimatedWords(
  words: string[],
  lineClass: string,
  lineLabel: string,
  emphasizeWord?: string,
) {
  return (
    <span className={lineClass} aria-label={lineLabel}>
      {words.map((word, wordIndex) => {
        const isEmphasized = emphasizeWord === word
        const isFeatureWord = /WEBSITE/.test(word)
        return (
          <span
            key={`${lineClass}-${word}-${wordIndex}`}
            className={`hero-word ${isEmphasized ? 'hero-word-em' : ''} ${isFeatureWord ? 'hero-word-feature' : ''}`}
            style={{ '--word-index': wordIndex } as React.CSSProperties}
            aria-hidden="true"
          >
            {word.split('').map((char, charIndex) => (
              <span
                key={`${lineClass}-${word}-${wordIndex}-${char}-${charIndex}`}
                className="hero-char"
                style={{ '--char-index': charIndex } as React.CSSProperties}
              >
                {char}
              </span>
            ))}
          </span>
        )
      })}
    </span>
  )
}

export default function Home({ revealReady = false }: HomeProps) {
  const rafRef = useRef<number | null>(null)
  const enableParallaxRef = useRef(true)
  const approachAttractRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    enableParallaxRef.current = canHover && !reducedMotion
  }, [])

  useEffect(() => {
    const node = approachAttractRef.current
    if (!node) return

    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!canHover || reducedMotion) return

    let mouseX = 0
    let mouseY = 0
    let pointerActive = false
    let currentX = 0
    let currentY = 0
    let frameId: number | null = null

    const maxPullPx = 34
    const influenceRadiusPx = 320
    const easing = 0.18

    const update = () => {
      if (!node) return
      let targetX = 0
      let targetY = 0

      if (pointerActive) {
        const rect = node.getBoundingClientRect()
        const cx = rect.left + rect.width / 2
        const cy = rect.top + rect.height / 2
        const dx = mouseX - cx
        const dy = mouseY - cy
        const distance = Math.hypot(dx, dy)

        if (distance < influenceRadiusPx && distance > 0.001) {
          const proximity = 1 - distance / influenceRadiusPx
          const strength = Math.pow(proximity, 1.35)
          const normX = dx / distance
          const normY = dy / distance
          targetX = normX * maxPullPx * strength
          targetY = normY * maxPullPx * strength
        }
      }

      currentX += (targetX - currentX) * easing
      currentY += (targetY - currentY) * easing
      node.style.setProperty('--ax', `${currentX.toFixed(2)}px`)
      node.style.setProperty('--ay', `${currentY.toFixed(2)}px`)

      frameId = requestAnimationFrame(update)
    }

    const onPointerMove = (event: PointerEvent) => {
      mouseX = event.clientX
      mouseY = event.clientY
      pointerActive = true
    }

    const onPointerLeave = () => {
      pointerActive = false
    }

    frameId = requestAnimationFrame(update)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerleave', onPointerLeave)
    window.addEventListener('blur', onPointerLeave)

    return () => {
      if (frameId !== null) cancelAnimationFrame(frameId)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerleave', onPointerLeave)
      window.removeEventListener('blur', onPointerLeave)
      node.style.setProperty('--ax', '0px')
      node.style.setProperty('--ay', '0px')
    }
  }, [])

  const handleHeroMouseMove = (event: React.MouseEvent<HTMLElement>) => {
    if (!enableParallaxRef.current) return
    const hero = event.currentTarget
    const rect = hero.getBoundingClientRect()
    const nx = (event.clientX - rect.left) / rect.width - 0.5
    const ny = (event.clientY - rect.top) / rect.height - 0.5

    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      hero.style.setProperty('--mx', `${nx * 2}`)
      hero.style.setProperty('--my', `${ny * 2}`)
    })
  }

  const resetHeroMouse = (event: React.MouseEvent<HTMLElement>) => {
    if (!enableParallaxRef.current) return
    const hero = event.currentTarget
    hero.style.setProperty('--mx', '0')
    hero.style.setProperty('--my', '0')
  }

  return (
    <main className="home">
      <section
        className={`hero ${revealReady ? 'hero-revealed' : ''}`}
        id="home-intro"
        onMouseMove={handleHeroMouseMove}
        onMouseLeave={resetHeroMouse}
      >
        <div className="wave-layer wave-layer-a" aria-hidden />
        <div className="wave-layer wave-layer-b" aria-hidden />
        <div className="wave-layer wave-layer-c" aria-hidden />

        <header className="hero-header">
          <button className="brand-mark" aria-label="Brand logo">
            MSK
          </button>
        </header>

        <div className="hero-meta">
          <span>18+ Projects Completed</span>
          <span>6+ Years of Experience</span>
          <span>53,810 Average Performance Score</span>
        </div>

        <div className="hero-copy">
          <h1>
            {renderAnimatedWords(
              ['I', 'BUILD', 'MODERN', 'WEBSITES'],
              'line-1',
              'I BUILD MODERN WEBSITES',
              'WEBSITES',
            )}
            {renderAnimatedWords(['THAT', 'WORK'], 'line-2', 'THAT WORK')}
          </h1>
        </div>


        <p className="about-copy">
          I&apos;m a web developer focused on building modern, fast, and
          reliable websites. I care not only about how a site looks, but also
          about how it performs, scales, and feels for real users. From clean
          code and responsive layouts to performance optimization and SEO, I
          make sure every project is built with attention to detail and long-term
          quality in mind.
        </p>


        <aside className="name-rail" aria-label="Social links">
          <a
            className="social-link"
            href="https://github.com/"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 .5A12 12 0 0 0 8.2 23.9c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.4-4-1.4-.5-1.3-1.2-1.7-1.2-1.7-1-.7.1-.7.1-.7 1.1.1 1.7 1.2 1.7 1.2 1 1.7 2.6 1.2 3.3 1 .1-.7.4-1.2.7-1.5-2.7-.3-5.6-1.3-5.6-6A4.7 4.7 0 0 1 6 8.8c-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.2 1.2a10.9 10.9 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.7.2 2.9.1 3.2A4.7 4.7 0 0 1 19.7 12c0 4.7-2.9 5.7-5.6 6 .4.3.8 1 .8 2v3c0 .3.2.7.8.6A12 12 0 0 0 12 .5Z" />
            </svg>
          </a>
          <a
            className="social-link"
            href="https://linkedin.com/"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4.98 3.5A2.5 2.5 0 1 1 5 8.5a2.5 2.5 0 0 1-.02-5Zm-2 6h4v12h-4v-12Zm7 0h3.8v1.7h.1c.5-1 1.8-2 3.8-2 4 0 4.7 2.6 4.7 6v6.3h-4v-5.6c0-1.4 0-3.1-2-3.1s-2.3 1.5-2.3 3v5.7h-4v-12Z" />
            </svg>
          </a>
        </aside>
      </section>
      <section className="approach-section">
          <div className="approach-container">
            <div className="approach-content">
              <h2 className="approach-title">My Approach</h2>
              <p className="approach-description">
                I approach each project with 
              </p>
              <p className='approach-description-1'>
                A systematic and collaborative process.
              </p>
            </div>
            <div className="approach-spacer"></div>
            <div className="approach-image">
              <div ref={approachAttractRef} className="approach-image-container">
                <svg
                  className="approach-orbit-text"
                  viewBox="0 0 320 320"
                  aria-hidden="true"
                >
                  <defs>
                    <path
                      id="approach-text-circle"
                      d="M 160,160 m -124,0 a 124,124 0 1,1 248,0 a 124,124 0 1,1 -248,0"
                    />
                  </defs>
                  <text className="approach-orbit-text-content">
                    <textPath
                      href="#approach-text-circle"
                      startOffset="0%"
                      textLength="779"
                      lengthAdjust="spacing"
                    >
                      {orbitText}
                    </textPath>
                  </text>
                </svg>
                <img className='approach-image-img' src={approachImage} alt="Approach Image" />
              </div>
            </div>
          </div>

          
          <div className="approach-cards">
          <div className="approach-card">
              <div className="approach-card-content">
                <div className="approach-card-content-top">
                  <h4>Design</h4>
                  <h2>ڈیزائن</h2>
                </div>

                <div className="approach-card-content-middle">
                  <div className="approach-card-texts">
                    <p> work closely with brands to craft thoughtful, scalable 
                        design systems built for long-term growth and consistency, 
                        translating ideas into structured and cohesive visual 
                        language from art direction and strong visual foundations to 
                        responsive interfaces and polished digital experiences that 
                        feel intuitive, refined, and built to evolve over time.</p>
                  </div>
                </div>

                <div className="approach-card-content-bottom">
                  {/* <h4>Project</h4> */}
                  <h2>1</h2>
                </div>
                <button className="approach-toggle-btn" aria-pressed="false" aria-label="Toggle more">
                  <span className="approach-icon" aria-hidden="true"></span>
                </button>
              </div>
            </div>
            
            <div className="approach-card">
              <div className="approach-card-content">
                <div className="approach-card-content-top">
                  <h4>Engineering</h4>
                  <h2>انجینئرنگ</h2>
                </div>

                <div className="approach-card-content-middle">
                  <div className="approach-card-texts">
                    <p> Web systems built to move fast, test ideas, and measure real 
                        results. Full-stack development across front-end, back-end, 
                        and databases, with experience in custom architectures and 
                        production-ready builds. From clean interfaces to reliable 
                        server logic, the focus is on performance, maintainability, 
                        and systems that scale without unnecessary complexity.</p>
                  </div>
                </div>

                <div className="approach-card-content-bottom">
                  {/* <h4>Project</h4> */}
                  <h2>2</h2>
                </div>
                <button className="approach-toggle-btn" aria-pressed="false" aria-label="Toggle more">
                  <span className="approach-icon" aria-hidden="true"></span>
                </button>
              </div>
            </div>

            <div className="approach-card">
              <div className="approach-card-content">
                <div className="approach-card-content-top">
                  <h4>Strategy</h4>
                  <h2>حکمت عملی</h2>
                </div>

                <div className="approach-card-content-middle">
                  <div className="approach-card-texts">
                    <p> Strategic thinking built on precision, efficiency, and
                        technical expertise. Every project considers goals,
                        competitive context, SEO, and conversion from the start,
                        forming a clear foundation for design and development. The
                        process stays focused and deliberate, removing unnecessary
                        discussions and early bottlenecks to keep projects moving
                        fast and predictable.</p>
                  </div>
                </div>

                <div className="approach-card-content-bottom">
                  {/* <h4>3</h4> */}
                  <h2>3</h2>
                </div>
                <button className="approach-toggle-btn" aria-pressed="false" aria-label="Toggle more">
                  <span className="approach-icon" aria-hidden="true"></span>
                </button>
              </div>
            </div>
          </div>
          <div className="apprach-footer">
            <h2>CLARITY + PERFORMANCE</h2>
          </div>
      </section>
    </main>
  )
}

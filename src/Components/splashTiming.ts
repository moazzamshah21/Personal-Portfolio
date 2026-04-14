/**
 * Splash timeline (seconds). Used by `SplashScreen.tsx` + GSAP.
 * Wait after splash is fully in view, then: line grow → merge → …
 */
/** ms — delay after splash is 100% visible before GSAP timeline starts. */
export const SPLASH_VIEWPORT_DELAY_MS = 2000

/**
 * Timeline (seconds) after the above delay.
 * Sequence: line grow → merge → lines fade + film expand → hold → shrink + home.
 */
export const LINE_GROW_DUR_S = 3.2
export const MERGE_START_S = 2.6
export const MERGE_DUR_S = 0.85
export const MERGE_END_S = MERGE_START_S + MERGE_DUR_S

export const EXPAND_DUR_S = .8
export const FILM_HOLD_S = .2
export const SHRINK_START_S = MERGE_END_S + EXPAND_DUR_S + FILM_HOLD_S
export const SHRINK_DUR_S = .8
export const HOME_REVEAL_DUR_S = 1

/** Stagger offsets (s) for line grow — symmetric. */
export const LINE_GROW_STAGGER_S = [
  0, 0.1, 0.2, 0.3, 0.4, 0.4, 0.3, 0.2, 0.1, 0,
] as const

export const LINES_FADE_DUR_S = 0.28
export const BACKDROP_FADE_DUR_S = 0.38

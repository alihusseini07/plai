/**
 * Exponential moving average smoother for a single numeric value.
 * alpha close to 1 = fast response; alpha close to 0 = heavy smoothing.
 */
export class EMAFilter {
  constructor(alpha = 0.4) {
    this.alpha = alpha;
    this.value = null;
  }

  update(newValue) {
    if (this.value === null) {
      this.value = newValue;
    } else {
      this.value = this.alpha * newValue + (1 - this.alpha) * this.value;
    }
    return this.value;
  }

  reset() {
    this.value = null;
  }
}

/**
 * Smooth an array of {x, y} landmark coords using per-landmark EMA filters.
 * Call with the same smoother instance each frame.
 */
export class LandmarkSmoother {
  constructor(landmarkCount = 21, alpha = 0.4) {
    this.xFilters = Array.from({ length: landmarkCount }, () => new EMAFilter(alpha));
    this.yFilters = Array.from({ length: landmarkCount }, () => new EMAFilter(alpha));
  }

  smooth(landmarks) {
    return landmarks.map((lm, i) => ({
      ...lm,
      x: this.xFilters[i].update(lm.x),
      y: this.yFilters[i].update(lm.y),
    }));
  }

  reset() {
    this.xFilters.forEach(f => f.reset());
    this.yFilters.forEach(f => f.reset());
  }
}

import * as d3 from 'd3'
import * as mmwr from 'mmwr-week'

/**
 * Get index to start the plot at
 */
export const getFirstPlottingIndex = (data, isLiveSeason) => {
  if (isLiveSeason) {
    // Start at the latest prediction
    return Math.max(...data.models.map(m => {
      let index = m.predictions.length - 1
      for (let i = index; i >= 0; i--) {
        if (m.predictions[i] !== null) return i
      }
      return 0
    }))
  } else {
    // Start at the first prediction
    let modelPredictions = data.models
        .map(m => {
          return m.predictions[0].week
        }).filter(d => d !== -1)

    if (modelPredictions.length === 0) {
      // Start at the most recent actual data
      return data.actualIndices[data.actualIndices.length - 1]
    } else {
      return Math.min(...modelPredictions)
    }
  }
}

/**
 * Return points where the predictions were made
 * This is used as the first point in prediction marker
 */
export const getPredictionStartingPoints = data => {
  return data.observed.map(d => {
    // Handle zero length values
    if (d.length !== 0) {
      return d.filter(ld => ld.lag === 0)[0].value
    } else {
      return null
    }
  })
}

export const getXDateDomain = (data, pointType) => {
  return d3.extent(data.timePoints.map(d => {
    if (pointType === 'mmwr-week') {
      return (new mmwr.MMWRDate(d.year, d.week)).toMomentDate()
    } else if (pointType === 'regular-week') {
      return d3.timeParse('%Y-%W')(d.year + '-' + d.week)
    } else {
      return null
    }
  }))
}

export const getYDomain = data => {
  // Max from actual data
  let maxValues = [Math.max(...data.actual.filter(d => d))]
  // Max from observed data
  maxValues.push(Math.max(...data.observed.map(d => {
    return Math.max(...d.map(dl => dl.value))
  })))
  // Max from historical data
  data.history.forEach(h => {
    maxValues.push(Math.max(...h.actual))
  })
  // Max from all the models
  data.models.map(mdl => {
    maxValues.push(Math.max(...mdl.predictions.filter(m => m).map(d => Math.max(...[
      Math.max(...d.oneWk.high),
      Math.max(...d.twoWk.high),
      Math.max(...d.threeWk.high),
      Math.max(...d.fourWk.high),
      Math.max(...d.peakPercent.high)
    ]))))
  })
  // Clipping at 13 since we don't predict beyond that
  return [0, Math.max(13, 1.1 * Math.max(...maxValues))]
}

/**
 * Return next four indices for given index
 */
export const getNextIndices = (currentIndex, limit) => {
  let nextIndices = []
  for (let i = 0; i < 4; i++) {
    currentIndex += 1
    if (currentIndex < limit) nextIndices.push(currentIndex)
  }
  return nextIndices
}

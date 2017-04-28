import * as d3 from 'd3'
import * as commonComponents from '../common'
// import Actual from './actual'
import Prediction from './prediction'
import * as utils from '../../utilities/distribution-chart'

/**
 * A panel displaying distributions for one curve
 */
export default class DistributionPanel {
  constructor (svg, width, height, infoTooltip) {
    this.xScale = d3.scalePoint().range([0, width])
    this.yScale = d3.scaleLinear().range([height, 0])

    this.xAxis = new commonComponents.XAxis(
      svg,
      width,
      height,
      0,
      {},
      infoTooltip
    )
    this.yAxis = new commonComponents.YAxis(
      svg,
      height,
      0,
      {
        title: 'Probability'
      },
      infoTooltip
    )

    this.svg = svg
    this.height = height
    this.width = width
    // this.actual = new Actual(this)
    this.predictions = []
    this.selectedCurveIdx = null
  }

  hideModel (modelId) {
    this.predictions[modelId].hidden = true
  }

  plot (data) {
    this.xScale.domain(utils.getXDomain(data, this.selectedCurveIdx))
    this.yScale.domain(utils.getYDomain(data, this.selectedCurveIdx))

    this.xAxis.plot(this.xScale, 10)
    this.yAxis.plot(this.yScale)

    // Use actual from first model
    // this.actual.plot(data.models[0].curves[this.selectedCurveIdx].actual, this.xScale)

    // Setup colors
    if (data.models.length > 10) {
      this.colors = d3.schemeCategory20
    } else {
      this.colors = d3.schemeCategory10
    }

    // Clear markers not needed
    let currentPredictionIds = data.models.map(m => m.id)
    this.predictions = this.predictions.filter(p => {
      if (currentPredictionIds.indexOf(p.id) === -1) {
        p.clear()
        return false
      } else {
        return true
      }
    })

    // Generate markers for predictions if not already there
    // Assume unique model ids
    data.models.forEach((m, idx) => {
      let predMarker
      let markerIndex = this.predictions.map(p => p.id).indexOf(m.id)
      if (markerIndex === -1) {
        // The marker is not present from previous calls to plot
        predMarker = new Prediction(
          this.svg, m.id, m.meta, m.stats, this.colors[idx]
        )
        this.predictions.push(predMarker)
      } else {
        this.predictions[markerIndex].stats = m.stats
        predMarker = this.predictions[markerIndex]
      }
      predMarker.plot(this, m.curves[this.selectedCurveIdx])
    })
  }
}
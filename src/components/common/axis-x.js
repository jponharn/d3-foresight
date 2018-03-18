import * as d3 from 'd3'
import textures from 'textures'
import * as tt from '../../utilities/tooltip'

/**
 * Simple linear X axis with informative label
 */
export class XAxis {
  constructor (svg, width, height, yOffset, axisConfig, tooltip) {
    let axisGroup = svg.append('g')
        .attr('class', 'axis axis-x')
        .attr('transform', `translate(0, ${height - yOffset})`)

    let xText = axisGroup
        .append('text')
        .attr('text-anchor', 'start')
        .attr('transform', `translate(${width + 10}, -15)`)

    // Setup multiline text
    let xTitle = axisConfig.title
    if (Array.isArray(xTitle)) {
      xText.append('tspan')
        .text(xTitle[0])
        .attr('x', 0)
      xTitle.slice(1).forEach(txt => {
        xText.append('tspan')
          .text(txt)
          .attr('x', 0)
          .attr('dy', '1em')
      })
    } else {
      xText.append('tspan')
        .text(xTitle)
        .attr('x', 0)
    }

    xText.style('cursor', 'pointer')
      .on('mouseover', () => { tooltip.hidden = false })
      .on('mouseout', () => { tooltip.hidden = true })
      .on('mousemove', () => {
        tooltip.render(tt.parseText({ text: axisConfig.description }))
        tt.moveTooltip(tooltip, d3.select('.overlay'), 'left')
      })
      .on('click', () => {
        window.open(axisConfig.url, '_blank')
      })
    this.svg = svg
    this.width = width
  }

  plot (xScale, maxTicks) {
    let xAxis = d3.axisBottom(xScale)
    let totalTicks = xScale.domain().length
    if (maxTicks && (maxTicks < totalTicks / 2)) {
      // Show upto maxTicks ticks
      let showAt = parseInt(totalTicks / maxTicks)
      xAxis.tickValues(xScale.domain().filter((d, i) => !(i % showAt)))
    }
    this.svg.select('.axis-x')
      .transition().duration(200).call(xAxis)
  }
}

/**
 * X axis with week numbers, time and onset panel
 */
export class XAxisDate {
  constructor (svg, width, height, yOffset, onsetOffset, axisConfig, tooltip) {
    // Keep onset panel between xaxis and plot
    let xAxisPos = height + onsetOffset
    // Main axis with ticks below the onset panel
    svg.append('g')
      .attr('class', 'axis axis-x')
      .attr('transform', `translate(0,${xAxisPos})`)

    let axisXDate = svg.append('g')
        .attr('class', 'axis axis-x-date')
        .attr('transform', `translate(0,${xAxisPos + 25})`)

    let xText = axisXDate
        .append('text')
        .attr('text-anchor', 'start')
        .attr('transform', `translate(${width + 10},-15)`)

    // Setup multiline text
    let xTitle = axisConfig.title
    if (Array.isArray(xTitle)) {
      xText.append('tspan')
        .text(xTitle[0])
        .attr('x', 0)
      xTitle.slice(1).forEach(txt => {
        xText.append('tspan')
          .text(txt)
          .attr('x', 0)
          .attr('dy', '1em')
      })
    } else {
      xText.append('tspan')
        .text(xTitle)
        .attr('x', 0)
    }

    xText.style('cursor', 'pointer')
      .on('mouseover', () => { tooltip.hidden = false })
      .on('mouseout', () => { tooltip.hidden = true })
      .on('mousemove', () => {
        tooltip.render(tt.parseText({ text: axisConfig.description }))
        tt.moveTooltip(tooltip, d3.select('.overlay'), 'left')
      })
      .on('click', () => {
        window.open(axisConfig.url, '_blank')
      })

    // Setup reverse axis (over onset offset)
    // Clone of axis above onset panel, without text
    svg.append('g')
      .attr('class', 'axis axis-x-ticks')
      .attr('transform', `translate(0, ${height - yOffset})`)

    // Create onset panel
    let onsetTexture = textures.lines()
        .lighter()
        .strokeWidth(0.5)
        .size(8)
        .stroke('#ccc')
    svg.call(onsetTexture)

    svg.append('rect')
      .attr('class', 'onset-texture')
      .attr('height', onsetOffset)
      .attr('width', width)
      .attr('x', 0)
      .attr('y', height)
      .style('fill', onsetTexture.url())

    this.svg = svg
    this.width = width
  }

  plot (xScalePoint, xScaleDate) {
    let xAxis = d3.axisBottom(xScalePoint)
        .tickValues(xScalePoint.domain().filter((d, i) => !(i % 2)))

    let xAxisReverseTick = d3.axisTop(xScalePoint)
        .tickValues(xScalePoint.domain().filter((d, i) => !(i % 2)))

    let xAxisDate = d3.axisBottom(xScaleDate)
        .ticks(d3.timeMonth)
        .tickFormat(d3.timeFormat('%b %y'))

    // Mobile view fix
    if (this.width < 420) {
      xAxisDate.ticks(2)
      xAxis.tickValues(xScalePoint.domain().filter((d, i) => !(i % 10)))
    }

    this.svg.select('.axis-x')
      .transition().duration(200).call(xAxis)

    // Copy over ticks above the onsetpanel
    let tickOnlyAxis = this.svg.select('.axis-x-ticks')
        .transition().duration(200).call(xAxisReverseTick)

    tickOnlyAxis.selectAll('text').remove()

    this.svg.select('.axis-x-date')
      .transition().duration(200).call(xAxisDate)
  }
}

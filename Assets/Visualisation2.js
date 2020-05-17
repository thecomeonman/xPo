fBuildVisualisation = function (
    allSetNames,
    allSetCodes,
    selectedSetCode,
    nBlockWidth,
    cWhatScaleToUse,
    bExplainerTest,
    postCode,
    cContentPanelId = 'AttackContent',
    setSelectionPanelId = 'setSelection'
) {

    selectedSetName = allSetNames[allSetCodes.indexOf(selectedSetCode)]
        
    // common constants
    if ( true ) {


        cHighlightColour = '#FF69B4'

        // https://codepen.io/fieldwork/pen/RaKLrJ pitch code

        pitch = {
            width: 80,
            length: 120,
            centerCircleRadius: 10,
            penaltyArea: {
                width: 36,
                height: 18
            },
            padding: {
                top: 12,
                bottom: 12,
                right: 12,
                left: 12
            },
            paintColor: "#FFFFFF",
            // grassColor: "#000000"
            grassColor: "#CCCCCC",
        };

        zeroColour = "#000000"
        // zeroColour = pitch.grassColor

        colorPalette = [
            // '#b3e2cd',
            // '#fdcdac',
            // '#cbd5e8',
            // '#f4cae4',
            // '#e6f5c9',
            // '#fff2ae',
            // '#f1e2cc',
            // '#cccccc'

            // '#1b9e77',
            // '#d95f02',
            // '#7570b3',
            // '#e7298a',
            // '#66a61e',
            // '#e6ab02',
            // '#a6761d',
            // '#666666'

            // '#e41a1c',
            // '#377eb8',
            // '#4daf4a',
            // '#984ea3',
            // '#ff7f00',
            // '#ffff33',
            // '#ffffff',
            // // '#a65628',
            // "#e7298a"
            // // '#f781bf'

            '#a65628',
            '#ffffff',

            '#ff0000',
            // '#e31a1c',
            '#00ff00',
            // '#33a02c',

            // '#1f78b4',
            '#0092FF',
            '#ff7f00',

            '#ffff33',
            '#984ea3'
            // '#a6cee3',
            // '#b2df8a',
            // '#fb9a99',
            // '#fdbf6f',

        ]

        // it's a little confusing with the widths and lengths
        pitch['frame'] = []
        pitch['frame']['width'] = pitch.padding.left + pitch.length + pitch.padding.right
        pitch['frame']['length'] = pitch.padding.top + pitch.width + pitch.padding.bottom

        nPitchDomainSize4 = 300


    }





    // global functions
    if ( true ) {

        xScale4 = d3.scaleLinear()
            .domain([0, 120])
            .range([0, nPitchDomainSize4]);

        yScale4 = d3.scaleLinear()
            .domain([80, 0])
            .range([0, nPitchDomainSize4 * 80 / 120]);

        xScale2 = d3.scaleLinear()
            .domain([0, 120])
            .range([0, 2 * nPitchDomainSize4]);

        yScale2 = d3.scaleLinear()
            .domain([80, 0])
            .range([0, 2 * nPitchDomainSize4 * 80 / 120]);

        addPitchOutlines = function ( 
            pitchElementMarkings,
            xScale
        ) {

            pitchElementMarkings.append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("height", xScale(pitch.width))
                .attr("width", xScale(pitch.length))
                .attr("stroke", pitch.paintColor)
                .attr("fill", "none")


            var centerSpot = pitchElementMarkings.append("circle")
                .attr("cy", xScale(pitch.width/2))
                .attr("cx", xScale(pitch.length/2))
                .attr("r", 1)
                .attr("fill", pitch.paintColor)

            var centerCircle = pitchElementMarkings.append("circle")
                .attr("cy", xScale(pitch.width/2))
                .attr("cx", xScale(pitch.length/2))
                .attr("r", xScale(pitch.centerCircleRadius))
                .attr("fill", 'none')
                .attr("stroke", pitch.paintColor)

            var halfwayLine = pitchElementMarkings.append("line")
                .attr("x1", xScale(pitch.length/2))
                .attr("x2", xScale(pitch.length/2))
                .attr("y1", 0)
                .attr("y2", xScale(pitch.width))
                .attr("stroke", pitch.paintColor)

            // corners

            function addPath(pathData, parentElement){
                parentElement.append("path")
                    .attr("d", pathData)
                    .attr("stroke", pitch.paintColor)
                    .attr("fill", "none") 
            }

            // top left
            var pathData = "M0," + xScale(1) + "A " + xScale(1) +" " + xScale(1) + " 45 0 0" + xScale(1) + ",0";
            addPath(pathData, pitchElementMarkings);

            // top right
            var pathData = "M"+xScale(pitch.length - 1)+",0 A " + xScale(1) +" " + xScale(1) + " 45 0 0" + xScale(pitch.length) + ","+ xScale(1);
            addPath(pathData, pitchElementMarkings);

            // bottom left
            var pathData = "M0," + xScale(pitch.width-1) + "A " + xScale(1) +" " + xScale(1) + " 45 0 1" + xScale(1) + "," + xScale(pitch.width);
            addPath(pathData, pitchElementMarkings);

            // bottom right
            var pathData = "M" + xScale(pitch.length - 1) + ',' + xScale(pitch.width) + "A " + xScale(1) +" " + xScale(1) + " 45 0 1" + xScale(pitch.length) + "," + xScale(pitch.width - 1);
            addPath(pathData, pitchElementMarkings);

            // Top Penalty Area
            var penaltyAreaTop = pitchElementMarkings.append("g");
            var pathData = "M0," + xScale(pitch.width/2 - 4 - 18) +"L" + xScale(18) + "," + xScale(pitch.width/2 - 4 - 18) + "V" + xScale(pitch.width/2 + 4 + 18) + "H0";
            addPath(pathData, penaltyAreaTop);

            // Top Penalty Area
            var pathData = "M0," + xScale(pitch.width/2 - 4 - 6) +"L" + xScale(6) + "," + xScale(pitch.width/2 - 4 - 6) + "v" + xScale(20) + "H0";
            // var pathData = "M" + xScale(pitch.width/2 - 4 - 6) +",0L" + xScale(pitch.width/2 - 4 - 6) + "," + xScale(6) + "h" + xScale(20) + "V0";
            addPath(pathData, penaltyAreaTop);

            // Top D
            var pathData = "M" + xScale(18) + "," + xScale(pitch.width/2 - 8) + "A" + xScale(10) + " " + xScale(10) + " 5 0 1 " + xScale(18) + "," + xScale(pitch.width/2 + 8);
            // var pathData = "M" + xScale(pitch.width/2 - 8) +","+xScale(18)+"A "+xScale(10)+" "+ xScale(10) +" 5 0 0 " + xScale(pitch.width/2 + 8) +","+xScale(18);
            addPath(pathData, penaltyAreaTop);

            // Top Penalty Spot
            var penaltySpotTop = penaltyAreaTop.append("circle")
                .attr("cy", xScale(pitch.width/2))
                .attr("cx", xScale(12))
                .attr("r", 1)
                .attr("fill", pitch.paintColor)
                .attr("stroke", pitch.paintColor)

            penaltyAreaBottom = pitchElementMarkings.append("g");
            penaltyAreaBottom.html(penaltyAreaTop.html());
            penaltyAreaBottom.attr("transform", "rotate(180) translate(-" + xScale(pitch.length)+",-"+xScale(pitch.width)+")")


            // Direction of attack
            nOffsetFromPitch = 3
            nVerticalHeight = 3
            var pathData = "M" + xScale(0) + "," + xScale(pitch.width + nOffsetFromPitch) + 
                "V" + ( xScale4(nVerticalHeight) + xScale(pitch.width + nOffsetFromPitch) ) + 
                "L" + ( xScale(0) + xScale4(5) ) + "," + ( xScale(pitch.width + nOffsetFromPitch) + xScale4(nVerticalHeight/2) ) + 
                "L" + xScale(0) + "," + xScale(pitch.width + nOffsetFromPitch);
            // var pathData = "M" + xScale(pitch.length/2) + "," + xScale(pitch.width + nOffsetFromPitch) + 
            //     "V" + xScale(pitch.width + nVerticalHeight + nOffsetFromPitch) + 
            //     "L" + xScale((pitch.length/2) + 5) + "," + xScale(pitch.width + (nVerticalHeight/2) + nOffsetFromPitch) + 
            //     "L" + xScale(pitch.length/2) + "," + xScale(pitch.width + nOffsetFromPitch);

            // var pathData = "M" + xScale(pitch.width/2 - 4 - 6) +",0L" + xScale(pitch.width/2 - 4 - 6) + "," + xScale(6) + "h" + xScale(20) + "V0";
            pitchElementMarkings.append("path")
                .attr("d", pathData)
                .attr("stroke", pitch.grassColor)
                .attr("fill", pitch.grassColor) ;
            
            pitchElementMarkings.append("text")
                .attr("text-anchor", "start")
                .attr("alignment-baseline", "central")
                .attr("font-size", "0.7em")
                .attr("x", xScale4( nOffsetFromPitch + nVerticalHeight ) )//padding of 4px
                .attr("y", ( xScale(pitch.width + nOffsetFromPitch) + xScale4(nVerticalHeight/1.8) ))
                .text("Direction of attack");


            // top right
            // var pathData = "M"+xScale(pitch.length - 1)+","+xScale(pitch.width)+" A " + xScale(1) +" " + xScale(1) + " 45 0 1" + xScale(pitch.length) + ","+ xScale(pitch.length-1);
            // addPath(pathData, pitchElementMarkings);



        }

        
        addPitchColor = function ( 
            pitchElement,
            xScale
        ) {

            pitchElement.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("height", xScale(pitch.width))
            .attr("width", xScale(pitch.length))
            // .attr("x", -nBlockWidth / 2)
            // .attr("y", -nBlockWidth / 2)
            // .attr("height", xScale(pitch.width + (nBlockWidth)))
            // .attr("width", xScale(pitch.length + (nBlockWidth)))
            .attr("fill", pitch.grassColor)

            return pitchElement

        }

        addPlotTitle = function ( 
            pitchElement,
            titleText,
            xScale,
            nBlockWidth,
            selectedSetName,
            cContentPanelId
        ) {

            pitchElement
                .append('text')
                .attr('class', 'plotTitle ' + cContentPanelId)
                .text(selectedSetName)
                .attr("alignment-baseline", "bottom")
                .attr('x', 0)
                .attr('y', -xScale(1 * nBlockWidth) - 15)

            pitchElement
                .append('text')
                .attr('class', 'plotTitle ' + cContentPanelId)
                .text(titleText)
                .attr("alignment-baseline", "bottom")
                .attr('x', 0)
                .attr('y', -xScale(1 * nBlockWidth))

        }

        addPlotLegend = function ( 
            pitchElement,
            xScale,
            nBlockWidth,
            colorScale,
            pitchlength
        ) {

            pitchElement
                .append('rect')
                .attr("alignment-baseline", "bottom")
                .attr('x', xScale(pitchlength - (nBlockWidth * 1)))
                .attr('y', -xScale(1.8 * nBlockWidth))
                .attr('height',xScale(nBlockWidth))
                .attr('width', xScale(nBlockWidth * 1))
                .attr('fill', colorScale(colorScale.domain()[1]) )

        }


        addPitchData = function(
            pitchElement,
            data,
            PlottingWhichCoordinate,
            className,
            xScale,
            yScale,
            nBlockWidth,
            colorScale,
            PlottingWhichColumn
        ) {

            pitchElement.selectAll()
                .data(
                    data
                )
                .enter()
                .append("rect")
                .attr('class', function(d) { 
                    return className +  ' x' + d.x + '_y' + d.y 
                })
                .attr("x", function(d) { 
                    if ( PlottingWhichCoordinate == 'Origin' ) {
                        return xScale(d.x) - xScale(1.02*nBlockWidth/2)
                    } else {
                        return xScale(d.endX) - xScale(1.02*nBlockWidth/2)
                    } 
                })
                .attr("y", function(d) { 
                    if ( PlottingWhichCoordinate == 'Origin' ) {
                        return yScale(d.y) - xScale(1.02*nBlockWidth/2)
                    } else {
                        return yScale(d.endY) - xScale(1.02*nBlockWidth/2)
                    } 
                })
                .attr("width", xScale(nBlockWidth * 1.02) )
                .attr("height", xScale(nBlockWidth * 1.02) )
                // .attr("x", function(d) { return xScale4(d.x) - xScale4(nBlockWidth/2) })
                // .attr("y", function(d) { return xScale4(d.y) - xScale4(nBlockWidth/2) })
                // .attr("width", xScale4(nBlockWidth) )
                // .attr("height", xScale4(nBlockWidth) )
                .style("color", function(d) { return colorScale(d[PlottingWhichColumn])} )
                .style("fill", function(d) { return colorScale(d[PlottingWhichColumn])} )
                .style("fill-opacity", 1 )
                .style("stroke-opacity", 1 )

        }

        d3.selection.prototype.moveToFront = function() {
            return this.each(function(){
            this.parentNode.appendChild(this);
            });
        };



        addHighlightObject = function (
            pitchElement,
            dataOriginProbabilitiesFor,
            eventName
        ) {

            if ( false ) {
                    
                pitchElement.selectAll()
                    .data(
                        dataOriginProbabilitiesFor,
                        function(d) { 

                            return 'x' + d.x + '_y' + d.y

                        }
                    )
                    .enter()
                    .append("rect")
                    .attr('class', function(d) { return eventName +  ' x' + d.endX + '_y' + d.endY })
                    .attr("x", function(d) { 

                        return xScale4(d.x) - xScale4(nBlockWidth/2) 
                    })
                    .attr("y", function(d) { 

                        return yScale4(d.y) - xScale4(nBlockWidth/2) 

                    })
                    .attr("width", xScale4(nBlockWidth) )
                    .attr("height", xScale4(nBlockWidth) )
                    // .style("fill-opacity", 0 )
                    // .style("stroke-opacity", 0 )
                    // .attr("width", 10 )
                    // .attr("height", 10 )
                    .style("fill-opacity", 1 )
                    .style("stroke-opacity", 1 )
                    .style("color", function(d) { return colorScales['myShotProbabilityColor'](0)} )
                    .style("fill", function(d) { return colorScales['myShotProbabilityColor'](0)} )

            }


            pitchElement
                .append("circle")
                .attr('class', 'highlight')
                .attr("cx", 0)
                .attr("cy", 0)
                .attr("r", xScale4(12 * ( 1.02 / 4 ) ) )
                // .style("fill-opacity", 0 )
                // .style("stroke-opacity", 0 )
                // .attr("width", 10 )
                // .attr("height", 10 )
                .style("fill-opacity", '0' )
                .style("stroke-opacity", '0' )
                .style(
                    "stroke", 
                    cHighlightColour
                )
                .style(
                    "fill", 
                    // cHighlightColour
                    // 'none'
                    '#cccccc'
                    // "url(#circles-1)"
                )
                .style(
                    "stroke-width",
                    '4px'
                )
                .style(
                    'pointer-events',
                    'none'
                )

        }

        updateBallMovementHeatmap = function (
            pitchElement,
            xHovered,
            yHovered,
            eventName,
            dataGranular,
            cumulative = false,
            colorScales
        ) {

            pitchElement.selectAll('.'+eventName)
                // .transition()
                // .duration(100)
                .style("fill-opacity", 0.2 )
                .style("stroke-opacity", 0.2 )
                .remove()


            pitchElement.selectAll()
                .data(
                    dataGranular.filter(function(d) { 
                        return ( d.event == eventName ) 
                    })
                    // ,
                    // function(d) { 

                    //    if ( eventName == 'Shot' ) { 
                    //       plotX = d.x
                    //    } else {
                    //       plotX = d.endX 
                    //    }

                    //    if ( eventName == 'Shot' ) { 
                    //       plotY = d.y
                    //    } else {
                    //       plotY = d.endY 
                    //    }

                    //    return 'x' + plotX + '_y' + plotY

                    // }
                )
                .enter()
                .append("rect")
                .attr('class', function(d) { return eventName +  ' x' + d.endX + '_y' + d.endY })
                .attr("x", function(d) { 

                    if ( eventName == 'Shot' ) { 
                        plotX = d.x
                    } else {
                        plotX = d.endX 
                    }

                    return xScale2(plotX) - xScale2(1.02 * nBlockWidth/2) 
                })
                .attr("y", function(d) { 

                    if ( eventName == 'Shot' ) { 
                        plotY = d.y
                    } else {
                        plotY = d.endY 
                    }

                    return yScale2(plotY) - xScale2(1.02 * nBlockWidth/2) 

                })
                .attr("width", xScale2(nBlockWidth * 1.02) )
                .attr("height", xScale2(nBlockWidth * 1.02) )
                // .style("fill-opacity", 0 )
                // .style("stroke-opacity", 0 )
                // .attr("width", 10 )
                // .attr("height", 10 )
                .style("fill-opacity", 1 )
                .style("stroke-opacity", 1 )
                .style(
                    "color", 
                    function(d) { 
                        if (cumulative == true) {
                            return colorScales["myGranularNonShotGoalsColor"](d.WeightedExpectedGoals)
                        } else {
                            return colorScales["myGranularNonShotProbabilityColor"](d.GoalProbability)
                        }
                    } 
                )
                .style(
                    "fill", 
                    function(d) { 
                        if (cumulative == true) {
                            return colorScales["myGranularNonShotGoalsColor"](d.WeightedExpectedGoals)
                        } else {
                            return colorScales["myGranularNonShotProbabilityColor"](d.GoalProbability)
                        }
                    } 
                )

            
        }

        highlightHeatmapCoordinate = function (
            pitchElement,
            xHovered,
            yHovered,
            xScale,
            yScale
        ) {
            
            pitchElement.selectAll('.highlight')
                // .append("circle")
                // .attr('class', 'highlight')
                // .attr("r", xScale4(nBlockWidth * ( 1.02 / 2 ) ) )
                // .style("fill-opacity", 0 )
                // .style("stroke-opacity", 0 )
                // .attr("width", 10 )
                // .attr("height", 10 )
                // .style("fill-opacity", '1' )
                .style("stroke-opacity", '1' )
                // .style(
                //     "stroke", 
                //     cHighlightColour
                // )
                // .style(
                //     "fill", 
                //     // cHighlightColour
                //     'none'
                // )
                // .style(
                //     "stroke-width",
                //     '5px'
                // )
                .attr('cx', xScale(xHovered))
                .attr('cy', yScale(yHovered))
                .moveToFront()

        }

        unhighlightHeatmapCoordinate = function (
            pitchElement,
            xHovered,
            yHovered,
            eventName
        ) {

            pitchElement.selectAll('.highlight').remove()

        }


        fCreatePanel0 = function(
            cContentPanelId,
            dataOriginProbabilitiesShotFor,
            colorScales,
            selectedSetName
        ) {

            var svgPanel0 = d3.select("#" + cContentPanelId).append("svg")
                .attr(
                    "width", 
                    2 * xScale2(pitch.frame.width)
                )
                .attr(
                    "height", 
                    xScale2(pitch.frame.length)
                )
                // .attr(
                //     "style", 
                //     "display:block;"
                // )
                // .attr(
                //    "style", 
                //    "margin-left:-" + 0 * xScale4(pitch.frame.width) + "px;margin-top:-" + 0 * xScale4(pitch.frame.length)
                // )
                ;


            var pitchElementShotPanel0 = svgPanel0.append("g")
                .attr(
                    "transform", 
                    "translate(" + xScale2(pitch.padding.left) + "," + xScale2(pitch.padding.top) + ")"
                )
                
            addPlotTitle( 
                pitchElementShotPanel0,
                'xPo from shots',
                xScale2,
                nBlockWidth,
                selectedSetName,
                cContentPanelId
            )

            // addPlotLegend( 
            //     pitchElementShotPanel0,
            //     xScale2,
            //     nBlockWidth,
            //     colorScales['myShotProbabilityColor'],
            //     pitch.length
            // )

            
            addPitchColor(
                pitchElementShotPanel0,
                xScale2
            )
                
            var pitchElementShotMarkingsPanel0 = pitchElementShotPanel0
                .append("g")
                .attr('class','pitchMarkings');

            addPitchOutlines(
                pitchElementShotMarkingsPanel0,
                xScale = xScale2
            )

            addPitchData(
                pitchElementShotPanel0,
                dataOriginProbabilitiesShotFor,
                'Origin',
                className = 'shot',
                xScale2,
                yScale2,
                nBlockWidth,
                colorScales['myShotProbabilityColor'],
                'GoalProbability'
            )

            pitchElementShotMarkingsPanel0.moveToFront()


            var pitchElementShotCumulativePanel0 = svgPanel0.append("g")
                .attr(
                    "transform", 
                    "translate(" +xScale2(pitch.frame.width + pitch.padding.left) + "," + xScale2(pitch.padding.top) + ")"
                )

            addPlotTitle( 
                pitchElementShotCumulativePanel0,
                'Total xPo generated from shots',
                xScale2,
                nBlockWidth,
                selectedSetName,
                cContentPanelId
            )

            addPitchColor(
                pitchElementShotCumulativePanel0,
                xScale2
            )
                
            var pitchElementShotMarkingsPanel0 = pitchElementShotCumulativePanel0
                .append("g")
                .attr('class','pitchMarkings');

            addPitchOutlines(
                pitchElementShotMarkingsPanel0,
                xScale = xScale2
            )
                

            addPitchData(
                pitchElementShotCumulativePanel0,
                dataOriginProbabilitiesShotFor,
                'Origin',
                className = 'shot',
                xScale2,
                yScale2,
                nBlockWidth,
                colorScales['myShotGoalsColor'],
                'WeightedExpectedGoals'
            )

            pitchElementShotMarkingsPanel0.moveToFront()

        }


        fCreatePanel4 = function(
            cContentPanelId,
            dataOriginProbabilitiesPassFor,
            colorScales,
            selectedSetName
        ) {
                
            var svgPanel4 = d3.select("#" + cContentPanelId).append("svg")
                .attr(
                    "width", 
                    2 * xScale2(pitch.frame.width)
                )
                .attr(
                    "height", 
                    xScale2(pitch.frame.length)
                )
                // .attr(
                //    "style", 
                //    "margin-left:-" + 0 * xScale4(pitch.frame.width) + "px;margin-top:-" + 0 * xScale4(pitch.frame.length)
                // )
                ;

            var pitchElementPassPanel4 = svgPanel4.append("g")
                .attr("transform", "translate(" + xScale2(pitch.padding.left) + "," + xScale2(pitch.padding.top) + ")")
            
            addPlotTitle(
                pitchElementPassPanel4,
                'xPo from passes',
                xScale2,
                nBlockWidth,
                selectedSetName,
                cContentPanelId
            )

            addPitchColor(
                pitchElementPassPanel4,
                xScale2
            )
                
            var pitchElementMarkingsOriginPanel4 = pitchElementPassPanel4
                .append("g")
                .attr('class','pitchMarkings');

            addPitchOutlines(
                pitchElementMarkingsOriginPanel4,
                xScale = xScale2
            )         

            addPitchData(
                pitchElementPassPanel4,
                dataOriginProbabilitiesPassFor,
                'Origin',
                'OriginProbabilities',
                xScale2,
                yScale2,
                nBlockWidth,
                colorScales['myNonShotProbabilityColor'],
                'GoalProbability'
            )
                
            pitchElementMarkingsOriginPanel4.moveToFront()


            var pitchElementPassCumulativePanel4 = svgPanel4.append("g")
                .attr("transform", "translate(" +xScale2(pitch.frame.width + pitch.padding.left) + "," + xScale2(pitch.padding.top) + ")")

            
            addPlotTitle(
                pitchElementPassCumulativePanel4,
                'Total xPo generated from passes',
                xScale2,
                nBlockWidth,
                selectedSetName,
                cContentPanelId
            )

            addPitchColor(
                pitchElementPassCumulativePanel4,
                xScale2
            )
                
            var pitchElementMarkingsOriginCumulativePanel4 = pitchElementPassCumulativePanel4
                .append("g")
                .attr('class','pitchMarkings');

            addPitchOutlines(
                pitchElementMarkingsOriginCumulativePanel4,
                xScale = xScale2
            )
            
            addPitchData(
                pitchElementPassCumulativePanel4,
                dataOriginProbabilitiesPassFor,
                'Origin',
                'OriginProbabilitiesCumulative',
                xScale2,
                yScale2,
                nBlockWidth,
                colorScales['myNonShotGoalsColor'],
                'WeightedExpectedGoals'
            )
                
            pitchElementMarkingsOriginCumulativePanel4.moveToFront()

        }


                            
        fCreatePanel5 = function(
            cContentPanelId,
            dataOriginProbabilitiesRunFor,
            colorScales,
            selectedSetName
        ) {        

            var svgPanel5 = d3.select("#" + cContentPanelId).append("svg")
                .attr(
                    "width", 
                    2 * xScale2(pitch.frame.width)
                )
                .attr(
                    "height", 
                    xScale2(pitch.frame.length)
                )
                // .attr(
                //    "style", 
                //    "margin-left:-" + 0 * xScale4(pitch.frame.width) + "px;margin-top:-" + 0 * xScale4(pitch.frame.length)
                // )
                ;

            var pitchElementRunPanel5 = svgPanel5.append("g")
                .attr("transform", "translate(" +xScale2(pitch.padding.left) + "," + xScale2(pitch.padding.top) + ")")

            
            addPlotTitle(
                pitchElementRunPanel5,
                'xPo from runs',
                xScale2,
                nBlockWidth,
                selectedSetName,
                cContentPanelId
            )


            addPitchColor(
                pitchElementRunPanel5,
                xScale2
            )
                
            var pitchElementMarkingsOriginPanel5 = pitchElementRunPanel5
                .append("g")
                .attr('class','pitchMarkings');

            addPitchOutlines(
                pitchElementMarkingsOriginPanel5,
                xScale2
            )  

            addPitchData(
                pitchElementRunPanel5,
                dataOriginProbabilitiesRunFor,
                'Origin',
                'OriginProbabilities',
                xScale2,
                yScale2,
                nBlockWidth,
                colorScales['myNonShotProbabilityColor'],
                'GoalProbability'
            )

            pitchElementMarkingsOriginPanel5.moveToFront()


            var pitchElementRunCumulativePanel5 = svgPanel5.append("g")
                .attr("transform", "translate(" +xScale2(pitch.frame.width + pitch.padding.left) + "," + xScale2(pitch.padding.top) + ")")

            addPlotTitle(
                pitchElementRunCumulativePanel5,
                'Total xPo generated from runs',
                xScale2,
                nBlockWidth,
                selectedSetName,
                cContentPanelId
            )

            addPitchColor(
                pitchElementRunCumulativePanel5,
                xScale2
            )
                
            var pitchElementMarkingsOriginCumulativePanel5 = pitchElementRunCumulativePanel5
                .append("g")
                .attr('class','pitchMarkings');

            addPitchOutlines(
                pitchElementMarkingsOriginCumulativePanel5,
                xScale2
            )

            addPitchData(
                pitchElementRunCumulativePanel5,
                dataOriginProbabilitiesRunFor,
                'Origin',
                'OriginProbabilitiesCumulative',
                xScale2,
                yScale2,
                nBlockWidth,
                colorScales['myNonShotGoalsColor'],
                'WeightedExpectedGoals'
            ) 

                
            pitchElementMarkingsOriginCumulativePanel5.moveToFront()

        }





        fCreatePanel1 = function(
            cContentPanelId,
            dataOriginProbabilitiesFor,
            colorScales,
            selectedSetName
        ) {
            

            var svgPanel1 = d3.select("#" + cContentPanelId).append("svg")
                .attr(
                    "width", 
                    2 * xScale2(pitch.frame.width)
                )
                .attr(
                    "height", 
                    xScale2(pitch.frame.length)
                )
                // .attr(
                //    "style", 
                //    "margin-left:-" + 0 * xScale4(pitch.frame.width) + "px;margin-top:-" + 0 * xScale4(pitch.frame.length)
                // )
                ;

            var pitchElementOriginPanel1 = svgPanel1.append("g")
                .attr("transform", "translate(" + xScale2(pitch.padding.left) + "," + xScale2(pitch.padding.top) + ")")

            addPlotTitle(
                pitchElementOriginPanel1,
                'xPo overall',
                xScale2,
                nBlockWidth,
                selectedSetName,
                cContentPanelId
            )

            addPitchColor(
                pitchElementOriginPanel1,
                xScale2
            )
                
            var pitchElementMarkingsOriginPanel1 = pitchElementOriginPanel1
                .append("g")
                .attr('class','pitchMarkings');

            addPitchOutlines(
                pitchElementMarkingsOriginPanel1,
                xScale2
            )         

            addPitchData(
                pitchElementOriginPanel1,
                dataOriginProbabilitiesFor,
                'Origin',
                'OriginProbabilities',
                xScale2,
                yScale2,
                nBlockWidth,
                colorScales['myProbabilityColor'],
                'GoalProbability'
            )

            pitchElementMarkingsOriginPanel1.moveToFront()


            var pitchElementOriginCumulativePanel1 = svgPanel1.append("g")
                .attr("transform", "translate(" + xScale2(pitch.frame.width + pitch.padding.left) + "," + xScale2(pitch.padding.top) + ")")

            addPlotTitle(
                pitchElementOriginCumulativePanel1,
                'Total xPo generated overall',
                xScale2,
                nBlockWidth,
                selectedSetName,
                cContentPanelId
            )

            addPitchColor(
                pitchElementOriginCumulativePanel1,
                xScale2
            )
                
            var pitchElementMarkingsOriginCumulativePanel1 = pitchElementOriginCumulativePanel1
                .append("g")
                .attr('class','pitchMarkings');

            addPitchOutlines(
                pitchElementMarkingsOriginCumulativePanel1,
                xScale2
            )             

            addPitchData(
                pitchElementOriginCumulativePanel1,
                dataOriginProbabilitiesFor,
                'Origin',
                'OriginProbabilitiesCumulative',
                xScale2,
                yScale2,
                nBlockWidth,
                colorScales['myGoalsColor'],
                'WeightedExpectedGoals'
            )

            pitchElementMarkingsOriginCumulativePanel1.moveToFront()

        }



        fCreatePanel3 = function(
            cContentPanelId,
            dataOriginProbabilitiesFor,
            dataOriginProbabilitiesShotFor,
            dataOriginProbabilitiesPassFor,
            dataOriginProbabilitiesRunFor,
            colorScales,
            setCode,
            selectedSetName
        ) {

            Panel3Click = {}
            Panel3Click['x'] = null
            Panel3Click['y'] = null
            

            var svg = d3.select("#" + cContentPanelId).append("svg")
                .attr(
                    "width", 
                    ( 1 * xScale4(pitch.frame.width) ) +
                    ( 2 * xScale2(pitch.frame.width) )
                )
                .attr(
                    "height", 
                    // ( 1 * xScale4(pitch.frame.length)) +
                    ( 2 * xScale2(pitch.frame.length))
                )
                // .attr(
                //    "transform", 
                //    "translate(" +xScale4(pitch.padding.left) + "," + xScale4(xScale4(pitch.frame.length)) + ")"
                // )
                // .attr(
                //    "style", 
                //    "margin-left:-" + 0 * xScale4(pitch.frame.width) + "px;margin-top:-" + 0 * xScale4(pitch.frame.length)
                // )
                ;

            var pitchElementOriginPanel3 = svg.append("g")
                .attr('id','pitchElementOriginPanel3')
                .attr("transform", "translate(" +xScale4(pitch.padding.left) + "," + xScale4(pitch.padding.top) + ")")

            addPlotTitle(
                pitchElementOriginPanel3,
                'xPo overall',
                xScale4,
                nBlockWidth,
                selectedSetName,
                cContentPanelId
            )

            addPitchColor(
                pitchElementOriginPanel3,
                xScale4
            )
                
            var pitchElementOriginMarkingsPanel3 = pitchElementOriginPanel3
                .append("g")
                .attr('class','pitchMarkings');

            addPitchOutlines(
                pitchElementOriginMarkingsPanel3,
                xScale4
            )         

            pitchElementOriginPanel3.selectAll()
                .data(
                    dataOriginProbabilitiesFor
                )
                .enter()
                .append("rect")
                .attr('class', function(d) { 
                    return 'OriginProbabilities' +  ' x' + d.x + '_y' + d.y 
                })
                .attr("x", function(d) { return xScale4(d.x) - xScale4(1.02*nBlockWidth/2) })
                .attr("y", function(d) { return yScale4(d.y) - xScale4(1.02*nBlockWidth/2) })
                .attr("width", xScale4(nBlockWidth * 1.02) )
                .attr("height", xScale4(nBlockWidth * 1.02) )
                // .attr("x", function(d) { return xScale4(d.x) - xScale4(nBlockWidth/2) })
                // .attr("y", function(d) { return xScale4(d.y) - xScale4(nBlockWidth/2) })
                // .attr("width", xScale4(nBlockWidth) )
                // .attr("height", xScale4(nBlockWidth) )
                .style("color", function(d) { return colorScales['myProbabilityColor'](d.GoalProbability)} )
                .style("fill", function(d) { return colorScales['myProbabilityColor'](d.GoalProbability)} )
                .style("fill-opacity", 1 )
                .style("stroke-opacity", 1 )
                .on('mouseover', function ( d ) {

                    if ( Panel3Click['x'] == null ) {

                        updatePanel3ForInterations(
                            setCode,
                            d.x,
                            d.y,
                            pitchElementOriginPanel3,
                            pitchElementOriginCumulativePanel3,
                            pitchElementShotPanel3,
                            pitchElementShotCumulativePanel3,
                            pitchElementPassPanel3,
                            pitchElementPassCumulativePanel3,
                            pitchElementRunPanel3,
                            pitchElementRunCumulativePanel3,
                            colorScales,
                            cContentPanelId
                        )

                    }

                })
                .on('click', function ( d ) {

                    Panel3Click['x'] = d.x
                    Panel3Click['y'] = d.y
                    
                    updatePanel3ForInterations(
                        setCode,
                        d.x,
                        d.y,
                        pitchElementOriginPanel3,
                        pitchElementOriginCumulativePanel3,
                        pitchElementShotPanel3,
                        pitchElementShotCumulativePanel3,
                        pitchElementPassPanel3,
                        pitchElementPassCumulativePanel3,
                        pitchElementRunPanel3,
                        pitchElementRunCumulativePanel3,
                        colorScales,
                        cContentPanelId
                    )

                })
                .on('dblclick', function ( d ) {

                    Panel3Click['x'] = null
                    Panel3Click['y'] = null

                })
                
            pitchElementOriginMarkingsPanel3.moveToFront()

            var pitchElementOriginCumulativePanel3 = svg.append("g")
                .attr('id','pitchElementOriginCumulativePanel3')
                .attr("transform", "translate(" +xScale4(pitch.padding.left) + "," + xScale4(pitch.padding.top + pitch.frame.length) + ")")


            addPlotTitle(
                pitchElementOriginCumulativePanel3,
                'Total xPo generated overall',
                xScale4,
                nBlockWidth,
                selectedSetName,
                cContentPanelId
            )

            addPitchColor(
                pitchElementOriginCumulativePanel3,
                xScale4
            )
                
            var pitchElementOriginCumulativeMarkingsPanel3 = pitchElementOriginCumulativePanel3
                .append("g")
                .attr('class','pitchMarkings');

            addPitchOutlines(
                pitchElementOriginCumulativeMarkingsPanel3,
                xScale4
            )         

            pitchElementOriginCumulativePanel3.selectAll()
                .data(
                    dataOriginProbabilitiesFor
                )
                .enter()
                .append("rect")
                .attr('class', function(d) { 
                    return 'OriginProbabilities' +  ' x' + d.x + '_y' + d.y 
                })
                .attr("x", function(d) { return xScale4(d.x) - xScale4(1.02*nBlockWidth/2) })
                .attr("y", function(d) { return yScale4(d.y) - xScale4(1.02*nBlockWidth/2) })
                .attr("width", xScale4(nBlockWidth * 1.02) )
                .attr("height", xScale4(nBlockWidth * 1.02) )
                // .attr("x", function(d) { return xScale4(d.x) - xScale4(nBlockWidth/2) })
                // .attr("y", function(d) { return xScale4(d.y) - xScale4(nBlockWidth/2) })
                // .attr("width", xScale4(nBlockWidth) )
                // .attr("height", xScale4(nBlockWidth) )
                .style("color", function(d) { return colorScales['myGoalsColor'](d.WeightedExpectedGoals)} )
                .style("fill", function(d) { return colorScales['myGoalsColor'](d.WeightedExpectedGoals)} )
                .style("fill-opacity", 1 )
                .style("stroke-opacity", 1 )
                .on('mouseover', function ( d ) {
                    
                    if ( Panel3Click['x'] == null ) {

                        updatePanel3ForInterations(
                            setCode,
                            d.x,
                            d.y,
                            pitchElementOriginPanel3,
                            pitchElementOriginCumulativePanel3,
                            pitchElementShotPanel3,
                            pitchElementShotCumulativePanel3,
                            pitchElementPassPanel3,
                            pitchElementPassCumulativePanel3,
                            pitchElementRunPanel3,
                            pitchElementRunCumulativePanel3,
                            colorScales,
                            cContentPanelId
                        )

                    }

                })
                .on('click', function ( d ) {

                    Panel3Click['x'] = d.x
                    Panel3Click['y'] = d.y
                    
                    updatePanel3ForInterations(
                        setCode,
                        d.x,
                        d.y,
                        pitchElementOriginPanel3,
                        pitchElementOriginCumulativePanel3,
                        pitchElementShotPanel3,
                        pitchElementShotCumulativePanel3,
                        pitchElementPassPanel3,
                        pitchElementPassCumulativePanel3,
                        pitchElementRunPanel3,
                        pitchElementRunCumulativePanel3,
                        colorScales,
                        cContentPanelId
                    )

                })
                .on('dblclick', function ( d ) {

                    Panel3Click['x'] = null
                    Panel3Click['y'] = null

                })

            pitchElementOriginCumulativeMarkingsPanel3.moveToFront()








            var pitchElementRunPanel3 = svg.append("g")
                .attr('id','pitchElementRunPanel3')
                .attr(
                    "transform", 
                    "translate(" + ( xScale2(pitch.padding.left) + xScale4(pitch.frame.width) ) + "," + xScale2(pitch.padding.top) + ")"               
                )

            addPlotTitle(
                pitchElementRunPanel3,
                'Running from there to here, xPo',
                xScale2,
                nBlockWidth,
                selectedSetName,
                cContentPanelId
            )


            addPitchColor(
                pitchElementRunPanel3,
                xScale2
            )

            var pitchElementRunMarkingsPanel3 = pitchElementRunPanel3
                .append("g")
                .attr('class','pitchMarkings');

            addPitchOutlines(
                pitchElementRunMarkingsPanel3,
                xScale2
            )
                


            var pitchElementRunCumulativePanel3 = svg.append("g")
                .attr('id','pitchElementRunCumulativePanel3')
                .attr(
                    "transform", 
                    "translate(" + ( xScale2(pitch.padding.left) + xScale4(pitch.frame.width) ) + "," + ( xScale2(pitch.frame.length + pitch.padding.top) ) + ")"               
                )

                
            addPlotTitle(
                pitchElementRunCumulativePanel3,
                'Running from there to here, total xPo generated',
                xScale2,
                nBlockWidth,
                selectedSetName,
                cContentPanelId
            )


            addPitchColor(
                pitchElementRunCumulativePanel3,
                xScale2
            )

            var pitchElementRunCumulativeMarkingsPanel3 = pitchElementRunCumulativePanel3
                .append("g")
                .attr('class','pitchMarkings');

            addPitchOutlines(
                pitchElementRunCumulativeMarkingsPanel3,
                xScale2
            )
                






            var pitchElementPassPanel3 = svg.append("g")
                .attr('id','pitchElementPassPanel3')
                .attr(
                    "transform", 
                    "translate(" + ( xScale2(pitch.frame.width + pitch.padding.left) + xScale4(pitch.frame.width ) ) + "," + xScale2(pitch.padding.top) + ")"
                )

            addPlotTitle(
                pitchElementPassPanel3,
                'Passing from there to here, xPo',
                xScale2,
                nBlockWidth,
                selectedSetName,
                cContentPanelId
            )

            addPitchColor(
                pitchElementPassPanel3,
                xScale2
            )

            var pitchElementPassMarkingsPanel3 = pitchElementPassPanel3
                .append("g")
                .attr('class','pitchMarkings');

            addPitchOutlines(
                pitchElementPassMarkingsPanel3,
                xScale2
            )
                
            var pitchElementPassCumulativePanel3 = svg.append("g")
                .attr('id','pitchElementPassCumulativePanel3')
                .attr(
                    "transform", 
                    "translate(" + ( xScale2(pitch.frame.width + pitch.padding.left) + xScale4(pitch.frame.width ) ) + "," + ( xScale2(pitch.frame.length + pitch.padding.top) ) + ")"               
                )


            addPlotTitle(
                pitchElementPassCumulativePanel3,
                'Passing from there to here, total xPo generated',
                xScale2,
                nBlockWidth,
                selectedSetName,
                cContentPanelId
            )

            addPitchColor(
                pitchElementPassCumulativePanel3,
                xScale2
            )

            var pitchElementPassCumulativeMarkingsPanel3 = pitchElementPassCumulativePanel3
                .append("g")
                .attr('class','pitchMarkings');

            addPitchOutlines(
                pitchElementPassCumulativeMarkingsPanel3,
                xScale2
            )
                














            var pitchElementShotPanel3 = svg.append("g")
                .attr('id','pitchElementShotPanel3')
                .attr(
                    "transform", 
                    "translate(" +xScale4(pitch.padding.left) + "," + xScale4(pitch.padding.top + pitch.frame.length + pitch.frame.length) + ")"
                    // "translate(" +xScale4(pitch.frame.width + pitch.frame.width + pitch.frame.width + pitch.padding.left) + "," + xScale4(pitch.padding.top) + ")"
                )

            addPlotTitle(
                pitchElementShotPanel3,
                'xPo from shots',
                xScale4,
                nBlockWidth,
                selectedSetName,
                cContentPanelId
            )

            addPitchColor(
                pitchElementShotPanel3,
                xScale4
            )

            var pitchElementShotMarkingsPanel3 = pitchElementShotPanel3
                .append("g")
                .attr('class','pitchMarkings');

            addPitchOutlines(
                pitchElementShotMarkingsPanel3,
                xScale4
            )

            pitchElementShotPanel3.selectAll()
                .data(
                    dataOriginProbabilitiesShotFor
                )
                .enter()
                .append("rect")
                .attr('class', function(d) { 
                    return 'Shot' +  ' x' + d.x + '_y' + d.y 
                })
                .attr("x", function(d) { return xScale4(d.x) - xScale4(1.02*nBlockWidth/2) })
                .attr("y", function(d) { return yScale4(d.y) - xScale4(1.02*nBlockWidth/2) })
                .attr("width", xScale4(nBlockWidth * 1.02) )
                .attr("height", xScale4(nBlockWidth * 1.02) )
                // .attr("x", function(d) { return xScale4(d.x) - xScale4(nBlockWidth/2) })
                // .attr("y", function(d) { return xScale4(d.y) - xScale4(nBlockWidth/2) })
                // .attr("width", xScale4(nBlockWidth) )
                // .attr("height", xScale4(nBlockWidth) )
                .style("color", function(d) { return colorScales['myShotProbabilityColor'](d.GoalProbability)} )
                .style("fill", function(d) { return colorScales['myShotProbabilityColor'](d.GoalProbability)} )
                .style("fill-opacity", 1 )
                .style("stroke-opacity", 1 )

                pitchElementShotMarkingsPanel3.moveToFront()


            var pitchElementShotCumulativePanel3 = svg.append("g")
                .attr('id','pitchElementShotPanel3')
                .attr(
                    "transform", 
                    "translate(" +xScale4(pitch.padding.left) + "," + xScale4(pitch.padding.top + pitch.frame.length + pitch.frame.length + pitch.frame.length) + ")"
                )

            addPlotTitle(
                pitchElementShotCumulativePanel3,
                'Total xPo generated from shots',
                xScale4,
                nBlockWidth,
                selectedSetName,
                cContentPanelId
            )

            addPitchColor(
                pitchElementShotCumulativePanel3,
                xScale4
            )
                
            var pitchElementShotMarkingsPanel3 = pitchElementShotCumulativePanel3
                .append("g")
                .attr('class','pitchMarkings');

            addPitchOutlines(
                pitchElementShotMarkingsPanel3,
                xScale4
            )
                
            pitchElementShotCumulativePanel3.selectAll()
                .data(
                    dataOriginProbabilitiesShotFor
                )
                .enter()
                .append("rect")
                .attr('class', function(d) {
                    return 'Shot' +  ' x' + d.x + '_y' + d.y 
                })
                .attr("x", function(d) { return xScale4(d.x) - xScale4(1.02*nBlockWidth/2) })
                .attr("y", function(d) { return yScale4(d.y) - xScale4(1.02*nBlockWidth/2) })
                .attr("width", xScale4(nBlockWidth * 1.02) )
                .attr("height", xScale4(nBlockWidth * 1.02) )
                // .attr("x", function(d) { return xScale4(d.x) - xScale4(nBlockWidth/2) })
                // .attr("y", function(d) { return xScale4(d.y) - xScale4(nBlockWidth/2) })
                // .attr("width", xScale4(nBlockWidth) )
                // .attr("height", xScale4(nBlockWidth) )
                .style("color", function(d) { return colorScales['myShotGoalsColor'](d.WeightedExpectedGoals)} )
                .style("fill", function(d) { return colorScales['myShotGoalsColor'](d.WeightedExpectedGoals)} )
                .style("fill-opacity", 1 )
                .style("stroke-opacity", 1 )

            pitchElementShotMarkingsPanel3.moveToFront()

            addHighlightObject(
                pitchElementOriginPanel3,
                dataOriginProbabilitiesFor,
                'Pass'
            )

            addHighlightObject(
                pitchElementOriginCumulativePanel3,
                dataOriginProbabilitiesFor,
                'Run'
            )

            addHighlightObject(
                pitchElementPassPanel3,
                dataOriginProbabilitiesFor,
                'Pass'
            )

            addHighlightObject(
                pitchElementRunPanel3,
                dataOriginProbabilitiesFor,
                'Run'
            )

            addHighlightObject(
                pitchElementPassCumulativePanel3,
                dataOriginProbabilitiesFor,
                'Pass'
            )

            addHighlightObject(
                pitchElementRunCumulativePanel3,
                dataOriginProbabilitiesFor,
                'Run'
            )

            addHighlightObject(
                pitchElementShotPanel3,
                dataOriginProbabilitiesFor,
                'Shot'
            )

            addHighlightObject(
                pitchElementShotCumulativePanel3,
                dataOriginProbabilitiesFor,
                'Shot'
            )

            // addHighlightObject(
            //    pitchElementShotPanel3,
            //    dataOriginProbabilitiesFor,
            //    'Shot'
            // )

        }

        updatePanel3ForInterations = function(
            setCode,
            x,
            y,
            pitchElementOriginPanel3,
            pitchElementOriginCumulativePanel3,
            pitchElementShotPanel3,
            pitchElementShotCumulativePanel3,
            pitchElementPassPanel3,
            pitchElementPassCumulativePanel3,
            pitchElementRunPanel3,
            pitchElementRunCumulativePanel3,
            colorScales,
            cContentPanelId
        ) {

            
            d3.select("#" + cContentPanelId)
                .select('#ScenarioText')
                .text(null)

            // when updated from the secnario drop down, that's taken care
            // of in the drop down's change function itself
            d3.select("#" + cContentPanelId)
                .select('#ScenarioSelection')
                .selectAll("option")
                .property(
                    "selected", 
                    function(d){ 
                        
                        return d === '--No Scenario--'; 

                    }
                )

            highlightHeatmapCoordinate(
                pitchElementOriginPanel3,
                x,
                y,
                xScale4,
                yScale4
            )

            highlightHeatmapCoordinate(
                pitchElementOriginCumulativePanel3,
                x,
                y,
                xScale4,
                yScale4
            )

            highlightHeatmapCoordinate(
                pitchElementShotPanel3,
                x,
                y,
                xScale4,
                yScale4
            )

            highlightHeatmapCoordinate(
                pitchElementShotCumulativePanel3,
                x,
                y,
                xScale4,
                yScale4
            )

            d3.csv(
                './Data/' + setCode.replace(/_/g,'/') + "/DataGranular/x" + x + "_y" + y + ".csv", 
                function(dataGranular) {
                    
                    updateBallMovementHeatmap(
                        pitchElementPassPanel3,
                        x,
                        y,
                        'Pass',
                        dataGranular,
                        cumulative = false,
                        colorScales
                    )
                    pitchElementPassPanel3.selectAll('.pitchMarkings').moveToFront();

                    highlightHeatmapCoordinate(
                        pitchElementPassPanel3,
                        x,
                        y,
                        xScale2,
                        yScale2
                    )

                    updateBallMovementHeatmap(
                        pitchElementRunPanel3,
                        x,
                        y,
                        'Run',
                        dataGranular,
                        cumulative = false,
                        colorScales
                    )
                    pitchElementRunPanel3.selectAll('.pitchMarkings').moveToFront();


                    highlightHeatmapCoordinate(
                        pitchElementRunPanel3,
                        x,
                        y,
                        xScale2,
                        yScale2
                    )

                    updateBallMovementHeatmap(
                        pitchElementPassCumulativePanel3,
                        x,
                        y,
                        'Pass',
                        dataGranular,
                        cumulative = true,
                        colorScales
                    )
                    pitchElementPassCumulativePanel3.selectAll('.pitchMarkings').moveToFront();
                    
                    highlightHeatmapCoordinate(
                        pitchElementPassCumulativePanel3,
                        x,
                        y,
                        xScale2,
                        yScale2
                    )
                    
                    updateBallMovementHeatmap(
                        pitchElementRunCumulativePanel3,
                        x,
                        y,
                        'Run',
                        dataGranular,
                        cumulative = true,
                        colorScales
                    )
                    pitchElementRunCumulativePanel3.selectAll('.pitchMarkings').moveToFront();
                        

                    highlightHeatmapCoordinate(
                        pitchElementRunCumulativePanel3,
                        x,
                        y,
                        xScale2,
                        yScale2
                    )
                    


                }
            )
            
        


        }



    }

    var colorScaleChoice = d3.select("#" + setSelectionPanelId).selectAll("input")
        .data(['Scale color relative only to selection'])
        .enter()
        .append('label')
            .attr('for',function(d,i){ return 'a'+i; })
            .text(function(d) { return d; })
        .append("input")
            // .attr("checked", true)
            .attr("type", "checkbox")
            .attr("id", "colorScaleCheckbox")

    var dropdownSet = d3.select("#" + setSelectionPanelId)
        .append("select")
        .attr("id","setSelection")


    dropdownSet.selectAll("option")
        .data(allSetCodes)
        .enter().append("option")
        .attr("value", function (d) { return d; })
        .text(function (d, i) { return allSetNames[i]; })
        .property("selected", function(d){ return d === selectedSetCode; })

    createPanelParent = function(
        setCode,
        cContentPanelId,
        bExplainerTest
    ) {



        // Panel0
        if ( true ) {


            d3.select("#" + cContentPanelId).append("h3").text(
                "\
                xPo for Shots\
                "
            )

            if ( bExplainerTest ) {

                d3.select("#" + cContentPanelId)
                    // .append('div')
                    .append("p").text(
                        "\
                        xPo for shots is the probability\
                        of scoring if one were to shoot from that area of the pitch.\
                        The plot on the left below is the xPo for shots.\
                        The brigher it is, the more likely it is that a shot from there will\
                        be a goal. The parts of the pitch still showing the naked field\
                        are areas from where shots have not been attempted and so I can't\
                        calculate the probability of scoring from there.\
                        "
                    )

                d3.select("#" + cContentPanelId).append("p").text(
                    "\
                    The plot on the right indicates the total xPo contributed from \
                    that area on the pitch. The brighter it is, the more xPo has \
                    been generated from that area on the pitch. An area with very high \
                    contribution could have a very low xPo but if a lot of shots have been taken \
                    from that position then the team may still have scored many goals from it.\
                    Also, vice versa, very few shots taken from a very high xPo area could\
                    also result in a low overall contribution.\
                    "
                )
                

            }

            d3.select("#" + cContentPanelId)
                .append("div")
                .attr("id", cContentPanelId + "Panel0")                                    

        
            d3.select("#" + cContentPanelId).append("p")
                .text(
                    "\
                    For instance, Liverpool seem to have two spots of relatively\
                    high total xPo contribution, one from near the penalty spot,\
                    and one from a little to the left of the penalty spot. The\
                    xPo from those areas don't look as relateively high compared\
                    to other areas around it. This means that Liverpool have a\
                    tendency to shoot from those two areas far more than than\
                    other areas around it.\
                    "
                )
                .attr('class','TeamAttackPost setSpecificContent Liverpool_For_Scoring_Team')

            d3.select("#" + cContentPanelId).append("p")
                .text(
                    "\
                    Thanks, Scott McTominay and Ederson, for that hilarious\
                    red spot near the half line.\
                    "
                )
                .attr('class','TeamAttackPost setSpecificContent ManUtd_For_Scoring_Team')

            d3.select("#" + cContentPanelId).append("p")
                .text(
                    "\
                    Most of Salah's high probability shots seem to be from six spots,\
                    one right in front of the goal, one near the penalty spot, and four\
                    more spots around the penalty spots. The spot near the penalty spot\
                    is the area where a lot of his goals come from.\
                    "
                )
                .attr('class','PlayerAttackPost setSpecificContent Liverpool_For_Scoring_Player_MohamedSalah')


            d3.select("#" + cContentPanelId).append("p")
                .text(
                    "\
                    TAA doesn't really shoot a lot on an absolute scale, it looks like.\
                    "
                )
                .attr('class','PlayerAttackPost setSpecificContent Liverpool_For_Scoring_Player_TrentAlexander-Arnold')


            d3.select("#" + cContentPanelId).append("p")
                .text(
                    "\
                    It's very interesting how the xPo that Liverpool concede from shots\
                    is so concentrated to one side. Either they don't concede shots from\
                    the right of their goal or they block or save most of them. There\
                    are a couple of other teams that also have interesting patterns to\
                    this, so you could try to find them!\
                    "
                )
                .attr('class','TeamConcedePost setSpecificContent Liverpool_Against_Scoring_Team')


            if ( bExplainerTest ) {                                    


                d3.select("#" + cContentPanelId).append("p")
                    .text(
                        "The same concept of xPo as a probability and the\
                        total xPo generated as a sum xPo of actions from that\
                        area follows through the rest of this guide."
                    )

            }

        }


        // Panel4
        if ( true ) {

            d3.select("#" + cContentPanelId).append("h3").text(
                "\
                xPo for Passes\
                "
            )

            if ( bExplainerTest ) {                                    
                
                d3.select("#" + cContentPanelId).append("p").text(
                    "\
                    As described in the Introduction section, I have looked through\
                    all the plays and calculated an xPo value for a pass between\
                    any pair of coordinates. If I now aggregate these up to\
                    just the start coordinates, discarding the end coordinates\
                    in the process, then we get an estimate of the typical xPo\
                    and the total xPo generated from the start coordinates.\
                    This can be interpreted as the threat posed by the team\
                    with their passing from any point on the pitch.\
                    "
                )


            }

            d3.select("#" + cContentPanelId)
                .append("div")
                .attr("id", cContentPanelId + "Panel4")                                    


            d3.select("#" + cContentPanelId).append("p")
                .text(
                    "\
                    The ratio of goals scored to passes is quite low\
                    and that is evident given the low xPo values for\
                    passes across the pitch except for areas really\
                    close to goal. However the pitch is quite lit up\
                    in terms of the total xPo generated from passes so\
                    passing is probably an action which doesn't offer\
                    a lot of return per pass but over many passes the\
                    returns are quite decent.\
                    "
                )
                .attr('class','TeamAttackPost setSpecificContent Liverpool_For_Scoring_Team')

            d3.select("#" + cContentPanelId).append("p")
                .text(
                    "\
                    There are also some patterns emerging with some parts of the\
                    pitch looking like high overall contributors. Some sort of\
                    overall organisation is emerging to which areas of the pitch\
                    Liverpool usually pass from on their way to scoring.\
                    "
                )
                .attr('class','TeamAttackPost setSpecificContent Liverpool_For_Scoring_Team')


            d3.select("#" + cContentPanelId).append("p")
                .text(
                    "\
                    Salah is really active with his passes in the right half of the pitch\
                    in the attacking half. There are noticeably two high value areas, the\
                    first is the strip extending from the right end of the half way line\
                    to the D, and the second is the corner.\
                    "
                )
                .attr('class','PlayerAttackPost setSpecificContent Liverpool_For_Scoring_Player_MohamedSalah')


            d3.select("#" + cContentPanelId).append("p")
                .text(
                    "\
                    Except for a blob slightly to the right, on the edge of the final\
                    third there seems to be a clear distinction between areas from where there\
                    is a high probability of eventually leading to a goal and where most\
                    goals have actually come from. This is probably because TAA has so much\
                    activity on the right side which dilutes the overall contribution from\
                    that area. Passing is an action that has a low probability but high overall\
                    return actions and you'll notice this pattern across players or teams.\
                    "
                )
                .attr('class','PlayerAttackPost setSpecificContent Liverpool_For_Scoring_Player_TrentAlexander-Arnold')


            d3.select("#" + cContentPanelId).append("p")
                .text(
                    "\
                    In their own half, the passes that Liverpool concede from have\
                    some areas more prominent than others. Most noticeably, on the\
                    right side of their goal teams tend to get pushed towards the\
                    sideline with relatively high xPo values and high overall xPo\
                    generated with the more central areas having much lower numbers.\
                    The left side of the goal has a more diffused area\
                    over which relatively high xPo values are noticed including an\
                    area right in front of the box which has a noticeably high xPo\
                    value and also a high xPo contribution. Also note the contrast\
                    in the shot xPo map, with the area to the right of the goal in\
                    the box being relatively inactive, vs. the xPo from passes with\
                    the right of goal being more active.\
                    "
                )
                .attr('class','TeamConcedePost setSpecificContent Liverpool_Against_Scoring_Team')

                
        }


        // Panel5
        if ( true ) { 

            d3.select("#" + cContentPanelId).append("h3").text(
                "\
                xPo for Runs\
                "
            )


            if ( bExplainerTest ) {                                    

                d3.select("#" + cContentPanelId).append("p").text(
                    "Just like passes but for runs.\
                    "
                )

            }


            d3.select("#" + cContentPanelId)
                .append("div")
                .attr("id", cContentPanelId + "Panel5")                                    

            
            d3.select("#" + cContentPanelId).append("p")
                .text(
                    "\
                    In contrast to passes, there are areas all over\
                    the pitch that have a relatively high xPo but\
                    the cumulative xPo generated is not that high.\
                    Runs are, therefore, likely actions that promise high rewards\
                    every time they happen but don't happen that often\
                    to be a significantly high contributor to Liverpool's\
                    total generated xPo.\
                    "
                )
                .attr('class','TeamAttackPost setSpecificContent Liverpool_For_Scoring_Team')

            d3.select("#" + cContentPanelId).append("p")
                .text(
                    "\
                    Runs remain high probability but low overall contribution events.\
                    Again a pattern you'll notice across data sets.\
                    "
                )
                .attr('class','PlayerAttackPost setSpecificContent Liverpool_For_Scoring_Player_MohamedSalah')


            d3.select("#" + cContentPanelId).append("p")
                .text(
                    "\
                    Runs remain high probability but low overall contribution events.\
                    Again a pattern you'll notice across data sets.\
                    "
                )
                .attr('class','PlayerAttackPost setSpecificContent Liverpool_For_Scoring_Player_TrentAlexander-Arnold')

            
        }




        // Panel1
        if ( true ) {


            d3.select("#" + cContentPanelId).append("h3").text(
                "\
                xPo Overall\
                "
            )


            if ( bExplainerTest ) {                                    


                d3.select("#" + cContentPanelId).append("p").text(
                    "\
                    Now that we have these three sets of numbers, we can\
                    effectively evaluate a combined xPo for all of those three\
                    actions anywhere on the pitch.\
                    "
                )

                d3.select("#" + cContentPanelId).append("p").text(
                    "\
                    As before, on the left is an estimate of the typical xPo a team\
                    has when they have the ball in a particular part of the pitch.\
                    However, it now considers the possibility that any of the three\
                    events, shot, runs, or passes, could happen from that area.\
                    Similarly, the plot on the right indicates how much total xPo the team has\
                    generated from having the ball in a particular part of the pitch.\
                    "
                )

            }


            d3.select("#" + cContentPanelId)
                .append("div")
                .attr("id", cContentPanelId + "Panel1")                                    

            
            d3.select("#" + cContentPanelId).append("p")
                .text(
                    "\
                    Higher XPo regions, as expected, are primarily near the goal.\
                    In terms of the overall contributions\
                    though, we can make out some patterns. We can sort of see\
                    three regions, one just behind, around the centre\
                    circle and two just ahead of the centre line on both sides\
                    of the centre circle.\
                    There is one spot halfway between the centre circle\
                    and the box, another bright\
                    box on the left edge of the box, and one slightly dull spot\
                    on the right edge of the box. And then the corners.\
                    This figure summarises Liveprool's attacking returns from\
                    various areas of the pitch.\
                    "
                )
                .attr('class', 'TeamAttackPost setSpecificContent Liverpool_For_Scoring_Team')

            d3.select("#" + cContentPanelId).append("p")
                .text(
                    "\
                    Here's the overall picture of how Salah contributes to his team\
                    scoring. He contributes from all over the front right half of the\
                    pitch pretty much, mostly with passes and shots.\
                    "
                )
                .attr('class','PlayerAttackPost setSpecificContent Liverpool_For_Scoring_Player_MohamedSalah')


            d3.select("#" + cContentPanelId).append("p")
                .text(
                    "\
                    Here's the overall picture of how TAA contributes to his team\
                    scoring. He is quite dangerous on the left side of the pitch,\
                    whenever he does get the ball there, maybe after set pieces, etc.\
                    but his contribution is far higher from the right wing in the area\
                    spanning from around the halfway line all the way to the edge of\
                    the final third with some activity on the right edge of the box\
                    as well.\
                    "
                )
                .attr('class','PlayerAttackPost setSpecificContent Liverpool_For_Scoring_Player_TrentAlexander-Arnold')


            d3.select("#" + cContentPanelId).append("p")
                .text(
                    "\
                    A lot of interesting observation have already been listed above\
                    but one thing that pops out more in this overall map which hadn't\
                    popped out before is how the opposition RCB area has higher xPo\
                    values and contributions than the LCB area.\
                    "
                )
                .attr('class','TeamConcedePost setSpecificContent Liverpool_Against_Scoring_Team')

        }









        // panel3
        if ( true ) {


            d3.select("#" + cContentPanelId).append("h3").text(
                "\
                Understanding Actions\
                "
            )

            if ( bExplainerTest ) {

                d3.select("#" + cContentPanelId).append("p").text(
                    "\
                    This below is an interactive visualisation to help\
                    you unearth more patterns in the xPo numbers. It is quite data\
                    heavy and might be a liiiiittle slow as a result.\
                    "
                )

                var InteractiveVizBullets = [
                    "\
                    You can\
                    move your cursor around on the two top-left plots,\
                    the ones capturing the overall xPo across events\
                    to indicate the area of the pitch you're\
                    interested in exploring more.\
                    ",
                    "\
                    The plot with shots, on the bottom right, is static since the\
                    shot xPo is just a function of the start coordinates.\
                    ",
                    "The\
                    xPo for passes and runs are a function of both the start\
                    and end coordinates though. When you hover over an area,\
                    the visualisation marks that as the start area and\
                    updates the two big sets of plots to reveal details\
                    for xPo for passes or runs ending in various areas of\
                    the pitch.\
                    "
                ]
                

                var ul = d3.select("#" + cContentPanelId).append('ul');

                ul.selectAll('li')
                    .data(InteractiveVizBullets)
                    .enter()
                    .append('li')
                    .html(String);
                    

                d3.select("#" + cContentPanelId).append("p").text(
                    "Hovering over an area will update the pass and run plots.\
                    Clicking will freeze the start area to where\
                    you have clicked, and disable the change on hover.\
                    Double clicking anywhere on the pitch will unfreeze\
                    the start area and enable the response to hover again.\
                    "
                )


                d3.select("#" + cContentPanelId).append("p").text(
                    "You can go on full screen for easier viewing. F11 is the\
                    shortcut to go full screen on most browsers.\
                    "
                )

            }

            d3.select("#" + cContentPanelId)
                .append("div")
                .attr("id", cContentPanelId + "Panel3")                                    



        }


    }

    updatePanelParentWithData = function(
        setCode,
        cContentPanelId,
        typeOfDataset,
        selectedSetName,
        postCode
    ) {

        d3.select('#' + cContentPanelId)
            .selectAll('.setSpecificContent')
            .style(
                'display',
                'none'
            )


        d3.select('#' + cContentPanelId)
            .selectAll('.' + postCode + '.setSpecificContent.' + setCode)
            .style(
                'display',
                'block'
            )


        d3.csv('./Data/' + setCode.replace(/_/g,'/') + '/OriginProbabilities.csv', function(dataOriginProbabilitiesFor) {

            d3.csv('./Data/' + setCode.replace(/_/g,'/') + '/OriginProbabilitiesPass.csv', function(dataOriginProbabilitiesPassFor) {

                d3.csv('./Data/' + setCode.replace(/_/g,'/') + '/OriginProbabilitiesRun.csv', function(dataOriginProbabilitiesRunFor) {

                    d3.csv('./Data/' + setCode.replace(/_/g,'/') + '/OriginProbabilitiesShot.csv', function(dataOriginProbabilitiesShotFor) {
                        
                        d3.csv('./Data/' + typeOfDataset.replace(/_/g,'/') + 'OriginScale.csv', function(dataOriginScale) {

                            d3.csv('./Data/' + typeOfDataset.replace(/_/g,'/') + 'GranularScale.csv', function(dataGranularScale) {


                                // local functions
                                if ( true ) {

                                    var colorScales = {}

                                    // Build color scale
                                    colorScales["myGranularNonShotProbabilityColor"] = d3.scaleLinear()
                                        .range(
                                            [
                                                zeroColour, 
                                                colorPalette[0]
                                            ]
                                        )
                                        .domain(
                                            [
                                                0,
                                                dataGranularScale[0]['GoalProbability']
                                            ]
                                        )

                                    // Build color scale
                                    colorScales["myGranularNonShotGoalsColor"] = d3.scaleLinear()
                                        .range(
                                            [
                                                zeroColour, 
                                                // "#f781bf"
                                                colorPalette[1]
                                            ]
                                        )
                                        .domain(
                                            [
                                                0,
                                                dataGranularScale[0]['WeightedExpectedGoals']
                                            ]
                                        )

                                    nMaxShotProbability = d3.max(
                                        [
                                            // d3.max(dataOriginProbabilitiesPassFor, function (d) { return d.GoalProbability } ),
                                            // d3.max(dataOriginProbabilitiesRunFor, function (d) { return d.GoalProbability } ),
                                            d3.max(dataOriginProbabilitiesShotFor, function (d) { return d.GoalProbability } )
                                            // d3.max(dataOriginProbabilitiesPassAgainst, function (d) { return d.GoalProbability } ),
                                            // d3.max(dataOriginProbabilitiesShotAgainst, function (d) { return d.GoalProbability } ),
                                            // d3.max(dataOriginProbabilitiesRunAgainst, function (d) { return d.GoalProbability } )
                                        ]
                                    )
                                
                                    // Build color scale
                                    colorScales["myShotProbabilityColor"] = d3.scaleLinear()
                                        .range(
                                            [
                                                zeroColour, 
                                                // "#00003F",
                                                // "#00007F",
                                                colorPalette[2]
                                            ]
                                        )
                                        .domain(
                                            [
                                                0,
                                                // nMaxShotProbability / 64,
                                                // nMaxShotProbability / 16,
                                                // nMaxShotProbability / 4,
                                                // nMaxShotProbability
                                                dataOriginScale[0]['Shot_GoalProbability']
                                            ]
                                        )
                                        // .range(["#ffffff", "#FF0000"])
                                        // .domain([0,1])

                                    // Build color scale
                                    var nMaxShotGoals = d3.max(
                                        [
                                            // d3.max(dataOriginProbabilitiesPassFor, function (d) { return d.WeightedExpectedGoals } ),
                                            // d3.max(dataOriginProbabilitiesRunFor, function (d) { return d.WeightedExpectedGoals } ),
                                            d3.max(dataOriginProbabilitiesShotFor, function (d) { return d.WeightedExpectedGoals } )
                                            // d3.max(dataOriginProbabilitiesPassAgainst, function (d) { return d.WeightedExpectedGoals } ),
                                            // d3.max(dataOriginProbabilitiesRunAgainst, function (d) { return d.WeightedExpectedGoals } ),
                                            // d3.max(dataOriginProbabilitiesShotAgainst, function (d) { return d.WeightedExpectedGoals } )
                                        ]
                                    )

                                    // Build color scale
                                    colorScales['myShotGoalsColor'] = d3.scaleLinear()
                                        .range(
                                            [
                                                zeroColour, 
                                                // "#00003F",
                                                // "#00007F",
                                                colorPalette[3]
                                            ]
                                        )
                                        .domain(
                                            [
                                                0,
                                                // nMaxNonShotProbability / 64,
                                                // nMaxNonShotProbability / 16,
                                                // nMaxNonShotProbability / 4,
                                                // nMaxShotGoals
                                                dataOriginScale[0]['Shot_WeightedExpectedGoals']
                                            ]
                                        )
                                        // .range(["#ffffff", "#FF0000"])
                                        // .domain([0,1])

                                    // Build color scale
                                    var nMaxNonShotProbability = d3.max(
                                        [
                                            d3.max(dataOriginProbabilitiesPassFor, function (d) { return d.GoalProbability } ),
                                            d3.max(dataOriginProbabilitiesRunFor, function (d) { return d.GoalProbability } )
                                            // d3.max(dataOriginProbabilitiesPassAgainst, function (d) { return d.WeightedExpectedGoals } ),
                                            // d3.max(dataOriginProbabilitiesRunAgainst, function (d) { return d.WeightedExpectedGoals } )
                                        ]
                                    )

                                    colorScales['myNonShotProbabilityColor'] = d3.scaleLinear()
                                        .range(
                                            [
                                                zeroColour, 
                                                // "#3F0000",
                                                // "#7F0000",
                                                colorPalette[4]
                                            ]
                                        )
                                        .domain(
                                            [
                                                0,
                                                // nMaxNonShotGoals / 64,
                                                // nMaxNonShotGoals / 16,
                                                // nMaxNonShotGoals / 4,
                                                // nMaxNonShotProbability
                                                dataOriginScale[0]['NonShot_GoalProbability']
                                            ]
                                        )

                                    // Build color scale
                                    var nMaxNonShotGoals = d3.max(
                                        [
                                            d3.max(dataOriginProbabilitiesPassFor, function (d) { return d.WeightedExpectedGoals } ),
                                            d3.max(dataOriginProbabilitiesRunFor, function (d) { return d.WeightedExpectedGoals } )
                                            // d3.max(dataOriginProbabilitiesPassAgainst, function (d) { return d.WeightedExpectedGoals } ),
                                            // d3.max(dataOriginProbabilitiesRunAgainst, function (d) { return d.WeightedExpectedGoals } )
                                        ]
                                    )

                                    colorScales['myNonShotGoalsColor'] = d3.scaleLinear()
                                        .range(
                                            [
                                                zeroColour, 
                                                // "#3F0000",
                                                // "#7F0000",
                                                colorPalette[5]
                                            ]
                                        )
                                        .domain(
                                            [
                                                0,
                                                // nMaxNonShotGoals / 64,
                                                // nMaxNonShotGoals / 16,
                                                // nMaxNonShotGoals / 4,
                                                // nMaxNonShotGoals
                                                dataOriginScale[0]['NonShot_WeightedExpectedGoals']
                                            ]
                                        )


                                    // Build color scale
                                    colorScales['myProbabilityColor'] = d3.scaleLinear()
                                        .range(
                                            [
                                                zeroColour, 
                                                colorPalette[6]
                                            ]
                                        )
                                        .domain(
                                            [
                                                0,
                                                // d3.max(
                                                //     [
                                                //         d3.max(dataOriginProbabilitiesFor, function (d) { return d.GoalProbability } )
                                                //         // d3.max(dataOriginProbabilitiesAgainst, function (d) { return d.GoalProbability } )
                                                //     ]
                                                // )
                                                dataOriginScale[0]['_GoalProbability']
                                            ]
                                        )
                                        // .range(["#ffffff", "#FF0000"])
                                        // .domain([0,1])

                                    // Build color scale
                                    colorScales['myGoalsColor'] = d3.scaleLinear()
                                        .range(
                                            [
                                                zeroColour, 
                                                colorPalette[7]
                                            ]
                                        )
                                        .domain(
                                            [
                                                0,
                                                // d3.max(
                                                //     [
                                                //         d3.max(dataOriginProbabilitiesFor, function (d) { return d.WeightedExpectedGoals } )
                                                //         // d3.max(dataOriginProbabilitiesAgainst, function (d) { return d.WeightedExpectedGoals } )
                                                //     ]
                                                // )
                                                dataOriginScale[0]['_WeightedExpectedGoals']
                                            ]
                                        )
                                        // .range(["#ffffff", "#FF0000"])
                                        // .domain([0,1])


                                    // Handler for dropdownScenario value change
                                    var dropdownScenarioChange = function(
                                        whichScenario,
                                        cContentPanelId,
                                        dropdownScenarioOptions,
                                        selectedSetName
                                    ) {

                                        if ( whichScenario == dropdownScenarioOptions[0] ) {

                                            d3
                                                .select("#" + cContentPanelId)
                                                .select('#ScenarioText')
                                                .text(null)

                                        } else if ( whichScenario == dropdownScenarioOptions[1] ) {


                                            updatePanel3ForInterations(
                                                setCode,                                                
                                                88,
                                                36,
                                                d3.select('#' + cContentPanelId).select('#pitchElementOriginPanel3'),
                                                d3.select('#' + cContentPanelId).select('#pitchElementOriginCumulativePanel3'),
                                                d3.select('#' + cContentPanelId).select('#pitchElementShotPanel3'),
                                                d3.select('#' + cContentPanelId).select('#pitchElementShotCumulativePanel3'),
                                                d3.select('#' + cContentPanelId).select('#pitchElementPassPanel3'),
                                                d3.select('#' + cContentPanelId).select('#pitchElementPassCumulativePanel3'),
                                                d3.select('#' + cContentPanelId).select('#pitchElementRunPanel3'),
                                                d3.select('#' + cContentPanelId).select('#pitchElementRunCumulativePanel3'),
                                                colorScales,
                                                cContentPanelId,
                                                selectedSetName
                                            )

                                            d3
                                                .select("#" + cContentPanelId)
                                                .select('#ScenarioText')
                                                .text(
                                                    "\
                                                    The xPo contributed from passing plot is hotter than the\
                                                    xPo contributed from running. This means that when Liverpool\
                                                    have the ball around the pointer, passing has eventually led to\
                                                    more goals than running. Quite a bit of the total xPo has come\
                                                    from short sideward or diagonally forward passes. However, in terms\
                                                    of just the xPo itself, \
                                                    there are spots towards the left of the box, spots on the left wing,\
                                                    the left of midfield, and a less lucrative area towards the right wing\
                                                    which are attractive options.\
                                                    Passes to the later set of spots has not yielded too much xG overall but\
                                                    that is probably because not too many passes were aimed there. Whenever\
                                                    a pass was indeed made to these areas, a relatively high xG shot usually\
                                                    followed. Similarly, despite not generating an overall high amount of xPo,\
                                                    Liverpool do generate a relatively high xG shot often when they run towards\
                                                    the box slightly to the left.\
                                                    "
                                                )


                                        } else if ( whichScenario == dropdownScenarioOptions[2] ) {


                                            updatePanel3ForInterations(
                                                setCode,
                                                36,
                                                52,
                                                d3.select('#' + cContentPanelId).select('#pitchElementOriginPanel3'),
                                                d3.select('#' + cContentPanelId).select('#pitchElementOriginCumulativePanel3'),
                                                d3.select('#' + cContentPanelId).select('#pitchElementShotPanel3'),
                                                d3.select('#' + cContentPanelId).select('#pitchElementShotCumulativePanel3'),
                                                d3.select('#' + cContentPanelId).select('#pitchElementPassPanel3'),
                                                d3.select('#' + cContentPanelId).select('#pitchElementPassCumulativePanel3'),
                                                d3.select('#' + cContentPanelId).select('#pitchElementRunPanel3'),
                                                d3.select('#' + cContentPanelId).select('#pitchElementRunCumulativePanel3'),
                                                colorScales,
                                                cContentPanelId,
                                                selectedSetName
                                            )


                                            d3
                                                .select("#" + cContentPanelId)
                                                .select('#ScenarioText')
                                                .text(
                                                    "\
                                                    Neither of the total xPo generated plots look\
                                                    very hot for either runs or passes, except for a short\
                                                    pass towards the left wing. This means that\
                                                    having the ball around the pointers hasn't eventually\
                                                    results in a lot of overall xG for Liverpool. However, when\
                                                    the player manages to either run into the midfield area,\
                                                    or towards the left of the box, or the player has managed\
                                                    get long balls either far up the left wing, near the\
                                                    right side of the box, in the box, or towards the right wing,\
                                                    near the centre line, then a high xG shot usually follows.\
                                                    "
                                                )

                                        } else if ( whichScenario == dropdownScenarioOptions[3] ) {

                                            updatePanel3ForInterations(
                                                setCode,
                                                88,
                                                8,
                                                d3.select('#' + cContentPanelId).select('#pitchElementOriginPanel3'),
                                                d3.select('#' + cContentPanelId).select('#pitchElementOriginCumulativePanel3'),
                                                d3.select('#' + cContentPanelId).select('#pitchElementShotPanel3'),
                                                d3.select('#' + cContentPanelId).select('#pitchElementShotCumulativePanel3'),
                                                d3.select('#' + cContentPanelId).select('#pitchElementPassPanel3'),
                                                d3.select('#' + cContentPanelId).select('#pitchElementPassCumulativePanel3'),
                                                d3.select('#' + cContentPanelId).select('#pitchElementRunPanel3'),
                                                d3.select('#' + cContentPanelId).select('#pitchElementRunCumulativePanel3'),
                                                colorScales,
                                                cContentPanelId,
                                                selectedSetName
                                            )

                                            d3
                                                .select("#" + cContentPanelId)
                                                .select('#ScenarioText')
                                                .text(
                                                    "\
                                                    There are hot patches on xPo and\
                                                    total xPo generated. This means that Liverpool tend\
                                                    to eventually score often and with high probability when\
                                                    the ball is in the area around the marker. Running towards\
                                                    the goal and towards the corner, and passing into\
                                                    midfield and on the opposite wing are actions that\
                                                    eventually end in goals with quite high probability.\
                                                    However, in the case of running with the ball, most of\
                                                    their goals have come from runs towards the box too, but\
                                                    the passes that have led to more goals have been either\
                                                    along the edge of the last third of the pitch, or passes\
                                                    into the box, which are probably crosses.\
                                                    "
                                                )

                                        }

                                        d3.select("#" + cContentPanelId)
                                            .select('#ScenarioSelection')
                                            .selectAll("option")
                                            .property(
                                                "selected", 
                                                function(d){ 

                                                    return d === whichScenario; 

                                                }
                                            )

                                    };



                                }


                                d3.select('#' + cContentPanelId + "Panel0").selectAll('*').remove()
                                d3.select('#' + cContentPanelId + "Panel4").selectAll('*').remove()
                                d3.select('#' + cContentPanelId + "Panel1").selectAll('*').remove()
                                d3.select('#' + cContentPanelId + "Panel5").selectAll('*').remove()
                                d3.select('#' + cContentPanelId + "Panel3").selectAll('*').remove()

                                fCreatePanel0(
                                    cContentPanelId + "Panel0",
                                    dataOriginProbabilitiesShotFor,
                                    colorScales,
                                    selectedSetName
                                )

                                fCreatePanel4(
                                    cContentPanelId + "Panel4",
                                    dataOriginProbabilitiesPassFor,
                                    colorScales,
                                    selectedSetName
                                )


                                fCreatePanel5(
                                    cContentPanelId + "Panel5",
                                    dataOriginProbabilitiesRunFor,
                                    colorScales,
                                    selectedSetName
                                )


                                fCreatePanel1(
                                    cContentPanelId + "Panel1",
                                    dataOriginProbabilitiesFor,
                                    colorScales,
                                    selectedSetName
                                )

                                var cContentPanel3Id = cContentPanelId + "Panel3"

                                if ( setCode == 'Liverpool_For_Scoring_Team' & postCode == 'TeamAttackPost' ) { 
                                    
                                    d3.select("#" + cContentPanel3Id).append("p").text(
                                        "You can pick a scenario from the dropdown below\
                                        to get started with some examples.\
                                        "
                                    )

                                    var dropdownScenario = d3.select("#" + cContentPanel3Id)
                                        .append("select")
                                        .attr("id","ScenarioSelection")

                                    dropdownScenarioOptions = [
                                        '--No Scenario--',
                                        'Scenario 1: In the hole',
                                        'Scenario 2: Deep down the pitch on the left',
                                        'Scenario 3: Wide on the right wing'
                                    ]

                                    dropdownScenario.selectAll("option")
                                        .data(dropdownScenarioOptions)
                                        .enter().append("option")
                                        .attr("value", function (d) { return d; })
                                        .text(function (d) { return d; })

                                    dropdownScenario
                                        .on("change", function(d) { 

                                            dropdownScenarioChange(
                                                d3.select(this).property("value"),
                                                cContentPanel3Id,
                                                dropdownScenarioOptions
                                            )

                                        });


                                    d3.select("#" + cContentPanel3Id).append("p")
                                        .attr('id','ScenarioText')


                                }

                                fCreatePanel3(
                                    cContentPanel3Id,
                                    dataOriginProbabilitiesFor,
                                    dataOriginProbabilitiesShotFor,
                                    dataOriginProbabilitiesPassFor,
                                    dataOriginProbabilitiesRunFor,
                                    colorScales,
                                    setCode,
                                    selectedSetName
                                )


                            });

                        });

                    });

                });

            });

        });

    }


    initiateSetChange = function(
        selectedSetCode,
        cContentPanelId,
        selectedSetName,
        colorScaleRelativetoSelection
    ) {

        d3.selectAll('.plotTitle.' + cContentPanelId).text('Updating')

        // d3.select('#' + cContentPanelId).selectAll('*').remove()

        // d3.select("#" + cContentPanelId).selectAll("*").remove()

        // createPanelParent(
        //     selectedSetCode,
        //     cContentPanelId
        // )

        if ( colorScaleRelativetoSelection == true ) {

            cWhatScaleToUseFinally = selectedSetCode + '/'

        } else {
            
            cWhatScaleToUseFinally = cWhatScaleToUse

        }

        updatePanelParentWithData(
            selectedSetCode,
            cContentPanelId,
            cWhatScaleToUseFinally,
            selectedSetName,
            postCode
        )
        
    }

    colorScaleChoice
        .on("click", function(d) {

            selectedSetCode = dropdownSet.property("value")

            console.log(d3.select(this).property('checked'))

            initiateSetChange(
                selectedSetCode,
                cContentPanelId,
                allSetNames[allSetCodes.indexOf(selectedSetCode)],
                d3.select(this).property('checked')
            )

        });

    dropdownSet
        .on("change", function(d) { 

            selectedSetCode = d3.select(this).property("value")

            initiateSetChange(
                selectedSetCode,
                cContentPanelId,
                allSetNames[allSetCodes.indexOf(selectedSetCode)],
                colorScaleChoice.property('checked')
            )

        });

    createPanelParent(
        selectedSetCode,
        cContentPanelId,
        bExplainerTest
    )

    updatePanelParentWithData(
        selectedSetCode,
        cContentPanelId,
        cWhatScaleToUse,
        selectedSetName,
        postCode
    )

}
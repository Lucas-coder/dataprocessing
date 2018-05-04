/**
* scatter.js
* Lucas Lumeij - 10353062
* UvA programming - Dataprocessing
*
* This script supports scatter.html to show a scatterplot of Star Wars planets.
*/

// determine size of svg
var fullWidth = 900;
var fullHeight = 500;

// determine margins
var margin = {top: 50, right: 130, bottom: 100, left: 100};

// determine size of graph
var width = fullWidth - margin.left - margin.right;
var height = fullHeight - margin.top - margin.bottom;

window.onload = function() {
/**
* When the page is loaded, this function queries the data.
*/

    // define API link
    var planets = "https://swapi.co/api/planets/";

    // make queue within queue to know how many pages to query
    d3.queue()
      .defer(d3.request, planets)
      .awaitAll(function(error, result) {
          if (error) throw error;

          // count shows how many planets there are
          var numPlanets = JSON.parse(result[0].responseText).count;

          // import each planet page seperately
          var line = d3.queue();
          for (let i = 1; i <= numPlanets; i++) {
              line.defer(d3.request, planets + i);
          };

          // call next function to retrieve wanted data
          line.awaitAll(getData);
      });
};

function getData(error, results) {
/**
* This function takes the data from the JSON and puts it in a list.
*/
    if (error) throw error;

    // initialize list for data
    var planetList = [];

    // loop through results from queue
    for (let i = 0; i < results.length; i++) {

        // parse the info of
        var planet = JSON.parse(results[i].responseText);

        // convert all used data into numbers
        planet.diameter = +planet.diameter;
        planet.population = +planet.population;
        planet.surface_water = +planet.surface_water;

        // filter out planets with relevant data missing and remove outliers
        if (isNaN(planet.diameter) || planet.diameter > 100000 ||
            isNaN(planet.population) || planet.population > 18000000000 ||
            isNaN(planet.surface_water)) {
                continue;
        };

        // put planet objects in list
        planetList.push(planet);
    };

    // call next function to draw (list with data as input)
    drawPlot(planetList);
};


function drawPlot(planetList) {
/**
* This function creates an svg and puts the graph in it.
*/
    // create svg
    var svg = d3.select("body")
                .append("svg")
                .attr("width", fullWidth)
                .attr("height", fullHeight);

    // make scale for x and yaxis (domain margin ensures no circles on axis)
    var xScale = d3.scaleLinear()
                   .domain([d3.max(planetList, function(d) {
                       return d.population;
                   }) * -(1/16), d3.max(planetList, function(d) {
                       return d.population;
                   }) * (9/8)])
                   .range([margin.left, width + margin.left]);

    var yScale = d3.scaleLinear()
                   .domain([d3.max(planetList, function(d) {
                       return d.diameter;
                   }) * -(1/16), d3.max(planetList, function(d) {
                       return d.diameter;
                   }) * (9/8)])
                   .range([height + margin.top, margin.top]);

     // make scale for radius size (based on surface_water)
     var rScale = d3.scaleLinear()
                    .domain([0, d3.max(planetList, function(d) {
                        return d.surface_water;
                    })])
                    .range([5, 20]);

    // set color scale for different circle colors
    var cScale = d3.scaleOrdinal(d3.schemeCategory20);

    // define x and y axis based on the scales
    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);

    // draw x axis
    svg.append("g")
       .attr("class", "axis")
       .attr("transform", "translate(0," + (height + margin.top) + ")")
       .call(xAxis)
       .selectAll("text")
       .attr("y", 5)
       .attr("x", 7)
       .attr("transform", "rotate(45)")
       .style("text-anchor", "start");

    // draw y axis
    svg.append("g")
       .attr("class", "axis")
       .attr("transform", "translate(" + margin.left + ",0)")
       .call(yAxis);

    // write name for x axis
    svg.append("text")
     .attr("class", "axisTitle")
     .attr("y", fullHeight - 10)
     .attr("x", margin.left + width / 2)
     .text("Population");

    // write name for y axis
    svg.append("text")
      .attr("class", "axisTitle")
      .attr("transform", "rotate(-90)")
      .attr("y", margin.left / 2)
      .attr("x", -(height / 2) - margin.top)
      .text("Diameter (km)");

    // write plot title
    svg.append("text")
       .attr("id", "plotTitle")
       .attr("y", margin.top / 2)
       .attr("x", margin.left + width / 2)
       .text("Population vs Diameter of Planets")

    // create var for tooltip
    // inspired by: https://bl.ocks.org/d3noob/257c360b3650b9f0a52dd8257d7a2d73
    var div = d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

    // draw dots in graph for scatterplot
    svg.selectAll("circle")
       .data(planetList)
       .enter()
       .append("circle")

       // give classes to circles based on film var (used in updatePlot)
       .attr("class", function(d) {
           var planetClass = "dot "
           for (let i = 0; i < d.films.length; i++) {
               planetClass = planetClass + "f" + d.films[i].substring(27,28) + " ";
           };
           return planetClass;
       })

       // determine location and circle size and color on data and scales
       .attr("r", function(d) { return rScale(d.surface_water); })
       .attr("cx", function(d) { return xScale(d.population); })
       .attr("cy", function(d) { return yScale(d.diameter); })
       .style("fill", function(d) { return cScale(d.climate); })

       // show tooltip when mouse over dot
       .on("mouseover", function(d) {
         div.transition()
           .duration(200)
         div.style("opacity", .9);
         div.html(d.name + "<br/>" + "water: " + d.surface_water + " km2")
           .style("left", (d3.event.pageX) + "px")
           .style("top", (d3.event.pageY - 28) + "px");
         })

       // hide tooltip when mouse moves away from dot
       .on("mouseout", function(d) {
           div.style("opacity", 0);
         });

    // make legend var for colors
    // inspired by: http://bl.ocks.org/weiglemc/6185069
    var legend = svg.selectAll(".legend")
                    .data(cScale.domain())
                    .enter()
                    .append("g")
                    .attr("class", "legend")
                    .attr("transform", function(d, i) {
                        return "translate(200," + (i * 20 + margin.top + 50) + ")";
                    });

    // draw legend colored rectangles
    legend.append("rect")
          .attr("x", width)
          .attr("width", 18)
          .attr("height", 18)
          .style("fill", cScale);

    // draw legend text
    legend.append("text")
          .attr("x", width - 6)
          .attr("y", 9)
          .attr("dy", ".35em")
          .style("text-anchor", "end")
          .text(function(d) { return d;})

    // write legend title
    svg.append("text")
       .attr("id", "legendTitle")
       .attr("y", margin.top + 40)
       .attr("x", fullWidth - 35)
       // .style("text-anchor", "end")
       .text("Climate type:");

    // write legend for circle size
    svg.append("text")
       .attr("id", "sizeLegend")
       .attr("y", margin.top + 10)
       .attr("x", fullWidth - 35)
       .text("Circle size: surface water on planet")
};


function updatePlot(series) {
/**
* This updates the scatterplot that it only shows the planets that occur in
* specific episodes of the Star Wars movies.
*/

    // first option makes all dots (planets) visible
    if (series == 1) {
        d3.select("body").select("svg").selectAll(".dot").transition()
          .style("visibility", "visible");
    }

    // second option only shows dots of episodes 4-6
    else if (series == 2) {
        d3.select("body").select("svg").selectAll(".dot")
          .style("visibility", "hidden");
        d3.select("body").select("svg").selectAll(".f4,.f5,.f6")
          .style("visibility", "visible");
    }

    // third option only shows dots of episodes 1-3
    else if (series == 3) {
        d3.select("body").select("svg").selectAll(".dot")
          .style("visibility", "hidden");
        d3.select("body").select("svg").selectAll(".f1,.f2,.f3")
          .style("visibility", "visible");
    }
};

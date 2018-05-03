var fullWidth = 900;
var fullHeight = 600;

var margin = {top: 200, right: 130, bottom: 100, left: 100};

var width = fullWidth - margin.left - margin.right;
var height = fullHeight - margin.top - margin.bottom;

window.onload = function() {

    var planets = "https://swapi.co/api/planets/";

    d3.queue()
      .defer(d3.request, planets)
      .awaitAll(function(error, result) {
          if (error) throw error;

          var numPlanets = JSON.parse(result[0].responseText).count;

          var line = d3.queue();
          for (let i = 1; i <= numPlanets; i++) {
              line.defer(d3.request, planets + i);
          };

          line.awaitAll(getData);
      });
};

function getData(error, results) {
    if (error) throw error;

    var planetList = [];
    for (let i = 0; i < results.length; i++) {
        planet = JSON.parse(results[i].responseText);

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

        // console.log(planet.surface_water);

        // put planet objects in list
        planetList.push(planet);
    };

    console.log(planetList);

    drawPlot(planetList);
};

function drawPlot(planetList) {

    // create svg
    var svg = d3.select("body")
                .append("svg")
                .attr("width", fullWidth)
                .attr("height", fullHeight);

    // write title
    svg.append("text")
       .attr("class", "title")
       .attr("y", (margin.top / 2))
       .attr("x", margin.left + width / 2)
       .style("text-anchor", "middle")
       // .style("font-size", "20px")
       .text("The Planets of the Star Wars Universe");

    // var xValue = function(d) { return d.population; };
    // var yValue = function(d) { return d.diameter; };

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

     var rScale = d3.scaleLinear()
                    .domain([0, d3.max(planetList, function(d) {
                        return d.surface_water;
                    })])
                    .range([5, 20]);

    var cScale = d3.scaleOrdinal(d3.schemeCategory20);

    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);

    svg.append("g")
       .attr("class", "axis")
       .attr("transform", "translate(0," + (height + margin.top) + ")")
       .call(xAxis)
       .selectAll("text")
       .attr("y", 5)
       .attr("x", 7)
       .attr("transform", "rotate(45)")
       .style("text-anchor", "start");

    svg.append("g")
       .attr("class", "axis")
       .attr("transform", "translate(" + margin.left + ",0)")
       .call(yAxis);

    var div = d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

    svg.selectAll("circle")
       .data(planetList)
       .enter()
       .append("circle")
       .attr("class", function(d) {
           var planetClass = "dot "
           for (let i = 0; i < d.films.length; i++) {
               planetClass = planetClass + "f" + d.films[i].substring(27,28) + " ";
           };
           return planetClass;
       })
       .attr("r", function(d) { return rScale(d.surface_water); })
       .attr("cx", function(d) { return xScale(d.population); })
       .attr("cy", function(d) { return yScale(d.diameter); })
       .style("fill", function(d) { return cScale(d.climate); })
       .on("mouseover", function(d) {
         div.transition()
           .duration(200)
         div.style("opacity", .9);
         div.html(d.name)
           .style("left", (d3.event.pageX) + "px")
           .style("top", (d3.event.pageY - 28) + "px");
         })
       .on("mouseout", function(d) {
         // div.transition()
           // .duration(500)
           div.style("opacity", 0);
         });

    var legend = svg.selectAll(".legend")
                    .data(cScale.domain())
                    .enter()
                    .append("g")
                    .attr("class", "legend")
                    .attr("transform", function(d, i) {
                        return "translate(200," + (i * 20 + margin.top) + ")";
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

    // write name for x axis
    svg.append("text")
      .attr("y", fullHeight - 10)
      .attr("x", margin.left + width / 2)
      .style("text-anchor", "middle")
      .style("font-size", "20px")
      .text("Population");

    // write name for y axis
    svg.append("text")
       .attr("transform", "rotate(-90)")
       .attr("y", margin.left / 2)
       .attr("x", -(height / 2) - margin.top)
       .style("text-anchor", "middle")
       .style("font-size", "20px")
       .text("Diameter (km)");
};

function updatePlot(series) {

    if (series == 1) {
        d3.select("body").select("svg").selectAll(".dot").transition()
          .style("visibility", "visible");
    }

    else if (series == 2) {
        d3.select("body").select("svg").selectAll(".dot")
          .style("visibility", "hidden");
        d3.select("body").select("svg").selectAll(".f4,.f5,.f6")
          .style("visibility", "visible");
    }

    else if (series == 3) {
        d3.select("body").select("svg").selectAll(".dot")
          .style("visibility", "hidden");
        d3.select("body").select("svg").selectAll(".f1,.f2,.f3")
          .style("visibility", "visible");
    }
};

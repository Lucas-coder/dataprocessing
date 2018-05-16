/**
* Lucas Lumeij - 10353062
* Voor vervolg: ik wil graag dat elk EU-land in de kaart een waarde krijgt die
* het totaal aantal doden (aan neurologische aandoeningen) aangeeft. Dit staat
* in dataset countries. In drawMap staat dit als barchart uitgecomment.
* Verder worstel ik het met het hergebruiken van variabelen in de updateChart
* functie om een nieuwe barchart met, bijvoorbeeld, dezelfde scales te kunnen maken.
*/

window.onload = function() {

    var populations = "http://ec.europa.eu/eurostat/wdds/rest/data/v2.1/json/en/tps00001?geo=AT&geo=BE&geo=BG&geo=CH&geo=CY&geo=CZ&geo=DE&geo=DK&geo=EE&geo=EL&geo=ES&geo=EU28&geo=FI&geo=FR&geo=HR&geo=HU&geo=IE&geo=IS&geo=IT&geo=LI&geo=LT&geo=LU&geo=LV&geo=MT&geo=NL&geo=NO&geo=PL&geo=PT&geo=RO&geo=RS&geo=SE&geo=SI&geo=SK&geo=TR&geo=UK&precision=1&time=2015&indic_de=JAN";
    var countries = "https://ec.europa.eu/eurostat/wdds/rest/data/v2.1/json/en/hlth_cd_aro?sex=T&geo=AT&geo=BE&geo=BG&geo=CH&geo=CY&geo=CZ&geo=DE&geo=DK&geo=EE&geo=EL&geo=ES&geo=FI&geo=FR&geo=HR&geo=HU&geo=IE&geo=IS&geo=IT&geo=LI&geo=LT&geo=LU&geo=LV&geo=MT&geo=NL&geo=NO&geo=PL&geo=PT&geo=RO&geo=RS&geo=SE&geo=SI&geo=SK&geo=TR&geo=UK&geo=EU28&resid=TOT_RESID&precision=1&unit=NR&time=2015&age=TOTAL&icd10=G_H";
    var diseases = "https://ec.europa.eu/eurostat/wdds/rest/data/v2.1/json/en/hlth_cd_aro?sex=T&geo=AT&geo=BE&geo=BG&geo=CH&geo=CY&geo=CZ&geo=DE&geo=DK&geo=EE&geo=EL&geo=ES&geo=FI&geo=FR&geo=HR&geo=HU&geo=IE&geo=IS&geo=IT&geo=LI&geo=LT&geo=LU&geo=LV&geo=MT&geo=NL&geo=NO&geo=PL&geo=PT&geo=RO&geo=RS&geo=SE&geo=SI&geo=SK&geo=TR&geo=UK&geo=EU28&resid=TOT_RESID&precision=1&unit=NR&time=2015&age=TOTAL&icd10=G20&icd10=G30&icd10=G_H&icd10=G_H_OTH";

    d3.queue()
      .defer(d3.request, populations)
      .defer(d3.request, countries)
      .defer(d3.request, diseases)
      .awaitAll(function(error, result) {
          if (error) throw error;

          var popData = JSON.parse(result[0].responseText);
          var perCountry = JSON.parse(result[1].responseText);
          var perDisease = JSON.parse(result[2].responseText);

          var mapData = convertData(perCountry, popData, 1);
          var barData = convertData(perDisease, popData, 2);

          drawMap(mapData, barData);
          drawBarchart(barData);
      });
};


function drawMap(mapData, barData) {
/**
*
* Outline from: https://bl.ocks.org/MariellaCC/0055298b94fcf2c16940
*/

    // create tooltip
    // based on: https://bl.ocks.org/alandunning/274bf248fd0f362d64674920e85c1eb7
    var tooltip = d3.select("body")
                    .append("div")
                    .attr("class", "toolTip")
                    .attr("id", "mapTip");

    // determine map dimensions
    var w = 800;
    var h = 600;

    // create svg
    var svgMap = d3.select("#container")
                .append("svg")
                .attr("id", "map")
                .attr("width", w)
                .attr("height", h);

    // write map title
    svgMap.append("text")
          .attr("id", "mapTitle")
          .attr("y", 40)
          .attr("x", w / 4)
          .text("EU mortality rate to neurological diseases in 2015");

    // write map subtitle
    svgMap.append("text")
          .attr("id", "mapSubtitle")
          .attr("y", 55)
          .attr("x", w / 4)
          .text("per 1000 population");

    // var totalMin = d3.min(Object.values(mapData), function(d) {
    //     return d.scaled;
    // });
    var rateMax = d3.max(Object.values(mapData), function(d) {
        return d.scaled;
    });

    var cScaleRate = d3.scaleSequential(d3.interpolateCool)
                       .domain([rateMax, 0]);

    var populationData = Object.values(mapData);
    populationData.splice(11, 1);

    var popMax = d3.max(populationData, function(d) {
       return d.population;
    });

    var cScalePop = d3.scaleSequential(d3.interpolateCool)
                      .domain([popMax, 0]);

    // define map projection
    var projection = d3.geoMercator()
                       .center([ 13, 56 ])
                       .translate([ w / 2, h / 2 ])
                       .scale([ w / 1.5 ]);

    // define path generator
    var path = d3.geoPath()
                 .projection(projection);

    createLegend(cScaleRate);

    // load in GeoJSON data
    d3.json("eu_geo.json", function(json) {

        // bind data and create one path per GeoJSON feature
        svgMap.selectAll("path")
              .data(json.features)
              .enter()
              .append("path")
              .attr("d", path)

              // determine class based on whether data of country is available
              .attr("class", function(d){
                  if ((Object.keys(mapData)).indexOf(d.properties.name_long) == -1) {
                      return "notUnion";
                  }
                  else {
                      return "union";
                  };
              })
              .attr("stroke", "rgba(8, 81, 156, 0.2)");

        d3.selectAll(".union")
              .attr("fill", function(d) {
                  return cScaleRate(mapData[d.properties.name_long].scaled);
              })
              .on("mousemove", function(d) {
                  tooltip
                      .style("left", d3.event.pageX - 50 + "px")
                      .style("top", d3.event.pageY - 90 + "px")
                      .style("display", "inline-block")
                      .html(d.properties.name_long + "<br>" + "Population: " +
                          mapData[d.properties.name_long].population + "<br>" +
                          "Rate: " + mapData[d.properties.name_long].scaled);
              })
              .on("mouseout", function(d) { tooltip.style("display", "none"); })
              .on("click", function(d) {
                  updateChart(barData, d.properties.name_long);
              });

        d3.selectAll(".notUnion")
              .on("mousemove", function(d) {
                  tooltip
                      .style("left", d3.event.pageX - 50 + "px")
                      .style("top", d3.event.pageY - 70 + "px")
                      .style("display", "inline-block")
                      .html(d.properties.name_long + "<br>" + "No data");
              })
              .on("mouseout", function(d) { tooltip.style("display", "none"); });

        d3.selectAll(".update")
          .on("click", function(d) {
              var choice = this.getAttribute("value");

              if (choice == "mort") {
                  d3.select("#mapTitle")
                    .text("EU mortality rate to neurological diseases in 2015");
                  d3.select("#mapSubtitle")
                    .text("per 1000 population");

                  d3.selectAll(".union")
                    .attr("fill", function(d) {
                        return cScaleRate(mapData[d.properties.name_long].scaled);
                    });
              }
              else if (choice == "pop") {
                  d3.select("#mapTitle")
                    .text("EU populations on Januari 1 2015");
                  d3.select("#mapSubtitle")
                    .text(" ");

                  d3.selectAll(".union")
                    .attr("fill", function(d) {
                        return cScalePop(mapData[d.properties.name_long].population);
                    });
              };
          });
    });
};


function drawBarchart(barData) {

    var fullWidthChart = 400;
    var fullHeightChart = 300;

    var margin = { top: 50, right: 0, bottom: 80, left: 80 };

    var width = fullWidthChart - margin.left - margin.right;
    var height = fullHeightChart - margin.top - margin.bottom;

    var svgChart = d3.select("#container")
                     .append("svg")
                     .attr("id", "barchart")
                     .attr("width", fullWidthChart)
                     .attr("height", fullHeightChart);

    // write barchart title
    svgChart.append("text")
            .attr("id", "barTitle")
            .attr("y", 30)
            .attr("x", margin.left + width / 2)
            .text("European Union");

    // write barchart subtitle
    svgChart.append("text")
            .attr("id", "barSubtitle")
            .attr("y", 45)
            .attr("x", margin.left + width / 2)
            .text("mortality rate per disease");

    // write barchart x axis name
    svgChart.append("text")
            .attr("class", "axisText")
            .attr("y", fullHeightChart - margin.bottom / 2)
            .attr("x", margin.left + width / 2)
            .text("Neurological disease");

    // write barchart y axis name
    svgChart.append("text")
            .attr("class", "axisText")
            .attr("transform", "rotate(-90)")
            .attr("y", margin.left / 2)
            .attr("x", -(height / 2) - margin.top)
            .text("Mortality rate (per 1000 population)");

    var tooltip = d3.select("body").append("div")
                    .attr("class", "toolTip")
                    .attr("id", "barTip");

    var country = barData["European Union"];

    var xScale = d3.scaleBand()
                   .domain((Object.keys(country)).map(function(d) { return d; }))
                   .range([margin.left, width + margin.left])
                   .padding(0.1);

    var valuesDeaths = [];
    Object.values(barData).forEach(function(element) {
       Object.values(element).forEach(function(number) {
           valuesDeaths.push(number);
       });
    });

    var deathsMin = d3.min(valuesDeaths);
    var deathsMax = d3.max(valuesDeaths);

    var yScale = d3.scaleLinear()
                   .domain([0, deathsMax])
                   .range([height + margin.top, margin.top]);

    // create x axis variable and put at bottom
    var xAxis = d3.axisBottom(xScale);

    // create y axis variable and put at left
    var yAxis = d3.axisLeft(yScale)
                  .ticks(7);

    svgChart.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + (height + margin.top) + ")")
            .call(xAxis);

    svgChart.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(" + margin.left + ",0)")
            .call(yAxis);

    // create all rectangles that function as bars
    var bars = svgChart.selectAll("rect")
            .data(Object.keys(country))
            .enter()
            .append("rect")
            .attr("class", "bar")

            // determine coordinates where to start drawing
            .attr("x", function(d) {
                return xScale(d);
            })
            .attr("y", function(d) {
                return yScale(country[d]);
            })

            // determine dimensions of each rectangle
            .attr("width", function(d) {
                return xScale.bandwidth();
            })
            .attr("height", function(d) {
                return height + margin.top - yScale(country[d])
            })
            .on("mousemove", function(d) {
                tooltip
                  .style("left", d3.event.pageX - 50 + "px")
                  .style("top", d3.event.pageY - 70 + "px")
                  .style("display", "inline-block")
                  .html((d) + "<br>" + "Rate: " + (country[d]));
            })
            .on("mouseout", function(d) { tooltip.style("display", "none"); });
};


function updateChart(barData, countryClick) {

    var fullWidthChart = 400;
    var fullHeightChart = 300;

    var margin = { top: 50, right: 0, bottom: 80, left: 80 };

    var width = fullWidthChart - margin.left - margin.right;
    var height = fullHeightChart - margin.top - margin.bottom;

    d3.select("#container").select("#barchart").select("#barTitle")
      .text(countryClick);

    var tooltip = d3.select("body").select("#barTip");

    var country = barData[countryClick];

    var xScale = d3.scaleBand()
                   .domain((Object.keys(country)).map(function(d) { return d; }))
                   .range([margin.left, width + margin.left])
                   .padding(0.1);

    var valuesDeaths = [];
    Object.values(barData).forEach(function(element) {
       Object.values(element).forEach(function(number) {
           valuesDeaths.push(number);
       });
    });

    var deathsMin = d3.min(valuesDeaths);
    var deathsMax = d3.max(valuesDeaths);

    var yScale = d3.scaleLinear()
                   .domain([0, deathsMax])
                   .range([height + margin.top, margin.top]);

    var bars = d3.select("#container").select("#barchart").selectAll(".bar");

    bars.transition()
        .duration(700)
        .attr("x", function(d) {
            return xScale(d);
        })
        .attr("y", function(d) {
            return yScale(country[d]);
        })

        // determine dimensions of each rectangle
        .attr("width", function(d) {
            return xScale.bandwidth();
        })
        .attr("height", function(d) {
            return height + margin.top - yScale(country[d])
        });

    bars.on("mousemove", function(d) {
            tooltip
              .style("left", d3.event.pageX - 50 + "px")
              .style("top", d3.event.pageY - 70 + "px")
              .style("display", "inline-block")
              .html((d) + "<br>" + "Rate: " + (country[d]));
        })
        .on("mouseout", function(d) { tooltip.style("display", "none"); });

};

function createLegend(cScale) {

    var svg = d3.select("#map");

    svg.append("g")
       .attr("class", "legend")
       .attr("transform", "translate(20,200)");

    var legend = d3.legendColor()
                   .shapeWidth(30)
                   .cells(10)
                   .orient("vertical")
                   .scale(cScale);

    svg.select(".legend")
       .call(legend);
};


function convertData(dataset, popData, choice) {

    // give two labels shorter names
    dataset.dimension.geo.category.label.DE = "Germany";
    dataset.dimension.geo.category.label.EU28 = "European Union";
    popData.dimension.geo.category.label.DE = "Germany";
    popData.dimension.geo.category.label.EU28 = "European Union";

    var countryList = [];
    for (let key in dataset.dimension.geo.category.label) {
        var name = dataset.dimension.geo.category.label[key];
        countryList.push(name);
    };

    if (choice == 1) {
        var data = {};
        for (let i = 0; i < dataset.size[5]; i++) {
            var object = data[countryList[i]] = {};
            object.deaths = dataset.value[i];
            object.population = popData.value[i];
            object.scaled = +((dataset.value[i] / popData.value[i]) * 1000).toFixed(2);
        };
    }

    else if (choice == 2) {
        var data = {};
        for (let i = 0; i < dataset.size[5]; i++) {
            var object = data[countryList[i]] = {};
            object.Parkinson = +((dataset.value[i] / popData.value[i]) * 1000).toFixed(2);
            object.Alzheimer = +((dataset.value[i + dataset.size[5]] /
                popData.value[i]) * 1000).toFixed(2);
            object.Other = +((dataset.value[i + 3 * dataset.size[5]] /
                popData.value[i]) * 1000).toFixed(2);
        };
    };

    return data;
};

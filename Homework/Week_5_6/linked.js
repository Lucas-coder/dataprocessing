/**
* Lucas Lumeij - 10353062
* Voor vervolg: ik wil graag dat elk EU-land in de kaart een waarde krijgt die
* het totaal aantal doden (aan neurologische aandoeningen) aangeeft. Dit staat
* in dataset countries. In drawMap staat dit als barchart uitgecomment.
* Verder worstel ik het met het hergebruiken van variabelen in de updateChart
* functie om een nieuwe barchart met, bijvoorbeeld, dezelfde scales te kunnen maken.
*/

window.onload = function() {

    var countries = "https://ec.europa.eu/eurostat/wdds/rest/data/v2.1/json/en/hlth_cd_aro?sex=T&geo=AT&geo=BE&geo=BG&geo=CH&geo=CY&geo=CZ&geo=DE&geo=DK&geo=EE&geo=EL&geo=ES&geo=FI&geo=FR&geo=HR&geo=HU&geo=IE&geo=IS&geo=IT&geo=LI&geo=LT&geo=LU&geo=LV&geo=MT&geo=NL&geo=NO&geo=PL&geo=PT&geo=RO&geo=RS&geo=SE&geo=SI&geo=SK&geo=TR&geo=UK&resid=TOT_RESID&precision=1&unit=NR&time=2015&age=TOTAL&icd10=G_H";
    var diseases = "https://ec.europa.eu/eurostat/wdds/rest/data/v2.1/json/en/hlth_cd_aro?sex=T&geo=AT&geo=BE&geo=BG&geo=CH&geo=CY&geo=CZ&geo=DE&geo=DK&geo=EE&geo=EL&geo=ES&geo=FI&geo=FR&geo=HR&geo=HU&geo=IE&geo=IS&geo=IT&geo=LI&geo=LT&geo=LU&geo=LV&geo=MT&geo=NL&geo=NO&geo=PL&geo=PT&geo=RO&geo=RS&geo=SE&geo=SI&geo=SK&geo=TR&geo=UK&geo=EU28&resid=TOT_RESID&precision=1&unit=NR&time=2015&age=TOTAL&icd10=G20&icd10=G30&icd10=G_H&icd10=G_H_OTH";

    d3.queue()
      .defer(d3.request, countries)
      .defer(d3.request, diseases)
      .awaitAll(function(error, result) {
          if (error) throw error;

          var perCountry = JSON.parse(result[0].responseText);
          var perDisease = JSON.parse(result[1].responseText);

          drawMap(perCountry, perDisease);
          drawBarchart(perDisease);
      });
};


function drawMap(perCountry, perDisease) {

    var tooltip = d3.select("body").append("div").attr("class", "toolTip");

    //Width and height
    var w = 800;
    var h = 600;

    //Define map projection
    var projection = d3.geoMercator()
                 .center([ 13, 52 ])
                 .translate([ w/2, h/2 ])
                 .scale([ w/1.5 ]);

    //Define path generator
    var path = d3.geoPath()
             .projection(projection);


    //Create SVG
    var svg = d3.select("#container")
          .append("svg")
          .attr("width", w)
          .attr("height", h);

    //Load in GeoJSON data
    d3.json("geo.json", function(json) {

      //Bind data and create one path per GeoJSON feature
      svg.selectAll("path")
         .data(json.features)
         .enter()
         .append("path")
         .attr("d", path)
         .attr("stroke", "rgba(8, 81, 156, 0.2)")
         .attr("fill", "rgba(8, 81, 156, 0.6)")
         .on("mousemove", function(d) {
             tooltip
               .style("left", d3.event.pageX - 50 + "px")
               .style("top", d3.event.pageY - 70 + "px")
               .style("display", "inline-block")
               .html(d.properties.name_long);
         })
         .on("mouseout", function(d) { tooltip.style("display", "none");});
    });

    // var fullWidthMap = 800;
    // var fullHeightMap = 600;
    //
    // var margin = {top: 10, right: 75, bottom: 125, left: 100};
    //
    // var w = fullWidthMap - margin.left - margin.right;
    // var h = fullHeightMap - margin.top - margin.bottom;
    //
    // var svgMap = d3.select("#container")
    //                  .append("svg")
    //                  .attr("id", "barchart")
    //                  .attr("width", fullWidthMap)
    //                  .attr("height", fullHeightMap);
    //
    // var tooltip = d3.select("body").append("div").attr("class", "toolTip");
    //
    // var mapData = convertData(perCountry, 1);
    //
    // // console.log(mapData);
    //
    // var xScale = d3.scaleBand()
    //                .domain((Object.keys(mapData)).map(function(d) { return d; }))
    //                .range([margin.left, w + margin.left])
    //                .padding(0.1);
    //
    // var deathsMin = d3.min(Object.values(mapData), function(d) { return d.total });
    // var deathsMax = d3.max(Object.values(mapData), function(d) { return d.total });
    //
    // var yScale = d3.scaleLog()
    //                .domain([deathsMin, deathsMax])
    //                .range([h + margin.top, margin.top])
    //                .nice();
    //
    // // create x axis variable and put at bottom
    // var xAxis = d3.axisBottom(xScale);
    //
    // // create y axis variable and put at left
    // var yAxis = d3.axisLeft(yScale)
    //               .ticks(4);
    //
    // svgMap.append("g")
    //         .attr("class", "axis")
    //         .attr("transform", "translate(0," + (h + margin.top) + ")")
    //         .call(xAxis)
    //         .selectAll("text")
    //         .attr("y", 5)
    //         .attr("x", 7)
    //         .attr("transform", "rotate(45)")
    //         .style("text-anchor", "start");
    //
    // svgMap.append("g")
    //         .attr("class", "axis")
    //         .attr("transform", "translate(" + margin.left + ",0)")
    //         .call(yAxis);
    //
    // // create all rectangles that function as bars
    // svgMap.selectAll("rect")
    //         .data(Object.keys(mapData))
    //         .enter()
    //         .append("rect")
    //         .attr("class", "mapBar")
    //
    //         // determine coordinates where to start drawing
    //         .attr("x", function(d) {
    //             return xScale(d);
    //         })
    //         .attr("y", function(d) {
    //             return yScale(mapData[d].total);
    //         })
    //
    //         // determine dimensions of each rectangle
    //         .attr("width", function(d) {
    //             return xScale.bandwidth();
    //         })
    //         .attr("height", function(d) {
    //             return h + margin.top - yScale(mapData[d].total)
    //         })
    //         .on("mousemove", function(d) {
    //             tooltip
    //               .style("left", d3.event.pageX - 50 + "px")
    //               .style("top", d3.event.pageY - 70 + "px")
    //               .style("display", "inline-block")
    //               .html((d) + "<br>" + "Deaths: " + (mapData[d].total));
    //         })
    //         .on("mouseout", function(d) { tooltip.style("display", "none");})
    //         .on("click", function(d) { updateChart(d, perDisease); } );
};


function drawBarchart(perDisease) {

    var fullWidthChart = 400;
    var fullHeightChart = 300;

    var margin = {top: 10, right: 75, bottom: 125, left: 50};

    var width = fullWidthChart - margin.left - margin.right;
    var height = fullHeightChart - margin.top - margin.bottom;

    var svgChart = d3.select("#container")
                     .append("svg")
                     .attr("id", "barchart")
                     .attr("width", fullWidthChart)
                     .attr("height", fullHeightChart);

    var tooltip = d3.select("body").append("div").attr("class", "toolTip");

    var barData = convertData(perDisease, 2);

    var country = barData["European Union"];

    var xScale = d3.scaleBand()
                   .domain((Object.keys(country)).map(function(d) { return d; }))
                   .range([margin.left, width + margin.left])
                   .padding(0.1);

    var valuesDeaths = []
    Object.values(barData).forEach(function(element) {
       Object.values(element).forEach(function(number) {
           valuesDeaths.push(number);
       });
    });

    var deathsMin = d3.min(valuesDeaths);
    var deathsMax = d3.max(valuesDeaths);

    var yScale = d3.scaleLog()
                   .domain([deathsMin, deathsMax])
                   .range([height + margin.top, margin.top])
                   .nice();

    // var yScale = d3.scaleLinear()
    //                .domain([0, deathsMax])
    //                .range([height + margin.top, margin.top]);

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
                  .html((d) + "<br>" + "Deaths: " + (country[d]));
            })
            .on("mouseout", function(d) { tooltip.style("display", "none");});
};


// function updateChart(country) {
//
// };


function convertData(dataset, choice) {

    // give two labels shorter names
    dataset.dimension.geo.category.label.DE = "Germany";
    dataset.dimension.geo.category.label.EU28 = "European Union";

    var countryList = [];
    for (let key in dataset.dimension.geo.category.label) {
        var name = dataset.dimension.geo.category.label[key];
        countryList.push(name);
    };

    if (choice == 1) {
        var data = {};
        for (let i = 0; i < dataset.size[5]; i++) {
            var object = data[countryList[i]] = {};
            object.total = dataset.value[i];
        };
    }

    else if (choice == 2) {
        var data = {};
        for (let i = 0; i < dataset.size[5]; i++) {
            var object = data[countryList[i]] = {};
            object.Parkinson = dataset.value[i];
            object.Alzheimer = dataset.value[i + dataset.size[5]];
            object.Other = dataset.value[i + 3 * dataset.size[5]];
            // object.Total = dataset.value[i + 2 * dataset.size[5]];
        };
    };

    return data;
};

window.onload = function() {

    var countries = "http://ec.europa.eu/eurostat/wdds/rest/data/v2.1/json/en/hlth_cd_aro?sex=T&geo=AT&geo=BE&geo=BG&geo=CH&geo=CY&geo=CZ&geo=DE&geo=DK&geo=EE&geo=EL&geo=ES&geo=FI&geo=FR&geo=HR&geo=HU&geo=IE&geo=IS&geo=IT&geo=LI&geo=LT&geo=LU&geo=LV&geo=MT&geo=NL&geo=NO&geo=PL&geo=PT&geo=RO&geo=RS&geo=SE&geo=SI&geo=SK&geo=TR&geo=UK&geo=EU28&resid=TOT_RESID&precision=1&unit=NR&time=2015&age=TOTAL&icd10=G_H";
    var diseases = "http://ec.europa.eu/eurostat/wdds/rest/data/v2.1/json/en/hlth_cd_aro?sex=T&geo=AT&geo=BE&geo=BG&geo=CH&geo=CY&geo=CZ&geo=DE&geo=DK&geo=EE&geo=EL&geo=ES&geo=FI&geo=FR&geo=HR&geo=HU&geo=IE&geo=IS&geo=IT&geo=LI&geo=LT&geo=LU&geo=LV&geo=MT&geo=NL&geo=NO&geo=PL&geo=PT&geo=RO&geo=RS&geo=SE&geo=SI&geo=SK&geo=TR&geo=UK&geo=EU28&resid=TOT_RESID&precision=1&unit=NR&time=2015&age=TOTAL&icd10=G20&icd10=G30&icd10=G_H&icd10=G_H_OTH";

    d3.queue()
      .defer(d3.request, countries)
      .defer(d3.request, diseases)
      .awaitAll(function(error, result) {
          if (error) throw error;

          var perCountry = JSON.parse(result[0].responseText);
          var perDisease = JSON.parse(result[1].responseText);

          drawBarchart(perDisease);
      });
};

function drawBarchart(perDisease) {

    var fullWidthChart = 800;
    var fullHeightChart = 600;

    var margin = {top: 10, right: 75, bottom: 125, left: 100};

    var width = fullWidthChart - margin.left - margin.right;
    var height = fullHeightChart - margin.top - margin.bottom;

    var svgChart = d3.select("body")
                     .append("svg")
                     .attr("id", "barchart")
                     .attr("width", fullWidthChart)
                     .attr("height", fullHeightChart);

    var barData = convertData(perDisease, 2);

    var country = barData["European Union"];

    console.log(barData);

    var xScale = d3.scaleBand()
                   .domain((Object.keys(country)).map(function(d) { return d; }))
                   .range([margin.left, width + margin.left])
                   .padding(0.1);

    var deathsMax = d3.max(Object.values(country), function(d) { return d });

    var yScale = d3.scaleLinear()
                   .domain([0, deathsMax])
                   .range([height + margin.top, margin.top]);

    // create x axis variable and put at bottom
    var xAxis = d3.axisBottom(xScale);

    // create y axis variable and put at left
    var yAxis = d3.axisLeft(yScale);

    svgChart.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + (height + margin.top) + ")")
            .call(xAxis);

    svgChart.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(" + margin.left + ",0)")
            .call(yAxis);

    // create all rectangles that function as bars
    svgChart.selectAll("rect")
            .data(Object.keys(country))
            .enter()
            .append("rect")
            .attr("class", "bar")

            // determine coordinates where to start drawing
            .attr("x", function(d) {
              // console.log(d, country[d]);
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
};

// function drawMap(perCountry) {
//
// };
//
// function drawBarchart(perDisease) {
//
//
// };


function convertData(dataset, choice) {

    // give two labels shorter names
    dataset.dimension.geo.category.label.DE = "Germany";
    dataset.dimension.geo.category.label.EU28 = "European Union";

    // console.log(perCountry);

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
        // console.log(data);
        // console.log(Object.keys(mapData));
    }

    else if (choice == 2) {
        var data = {};
        for (let i = 0; i < dataset.size[5]; i++) {
            var object = data[countryList[i]] = {};
            object.Parkinson = dataset.value[i];
            object.Alzheimer = dataset.value[i + dataset.size[5]];
            object.Other = dataset.value[i + 3 * dataset.size[5]];
            object.Total = dataset.value[i + 2 * dataset.size[5]];
        };
    };

    return data;
};

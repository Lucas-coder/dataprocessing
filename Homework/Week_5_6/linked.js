window.onload = function() {

    // console.log("It works, motherfuckers!");

    var countries = "http://ec.europa.eu/eurostat/wdds/rest/data/v2.1/json/en/hlth_cd_aro?sex=T&geo=AT&geo=BE&geo=BG&geo=CH&geo=CY&geo=CZ&geo=DE&geo=DK&geo=EE&geo=EL&geo=ES&geo=FI&geo=FR&geo=HR&geo=HU&geo=IE&geo=IS&geo=IT&geo=LI&geo=LT&geo=LU&geo=LV&geo=MT&geo=NL&geo=NO&geo=PL&geo=PT&geo=RO&geo=RS&geo=SE&geo=SI&geo=SK&geo=TR&geo=UK&resid=TOT_RESID&precision=1&unit=NR&time=2015&age=TOTAL&icd10=G_H";
    var diseases = "http://ec.europa.eu/eurostat/wdds/rest/data/v2.1/json/en/hlth_cd_aro?sex=T&geo=AT&geo=BE&geo=BG&geo=CH&geo=CY&geo=CZ&geo=DE&geo=DK&geo=EE&geo=EL&geo=ES&geo=FI&geo=FR&geo=HR&geo=HU&geo=IE&geo=IS&geo=IT&geo=LI&geo=LT&geo=LU&geo=LV&geo=MT&geo=NL&geo=NO&geo=PL&geo=PT&geo=RO&geo=RS&geo=SE&geo=SI&geo=SK&geo=TR&geo=UK&resid=TOT_RESID&precision=1&unit=NR&time=2015&age=TOTAL&icd10=G20&icd10=G30&icd10=G_H&icd10=G_H_OTH";

    d3.queue()
      .defer(d3.request, countries)
      .defer(d3.request, diseases)
      .awaitAll(function(error, result) {
          if (error) throw error;

          var perCountry = JSON.parse(result[0].responseText);
          var perDisease = JSON.parse(result[1].responseText);

          pagePrep(perCountry, perDisease);
      });
};

function pagePrep(perCountry, perDisease) {

    var fullWidthChart = 800;
    var fullHeightChart = 600;

    var svgChart = d3.select("body")
                     .append("svg")
                     .attr("id", "barchart")
                     .attr("width", fullWidthChart)
                     .attr("height", fullHeightChart);

    // drawBarchart(perDisease);

    convertData(perCountry, perDisease);
};

// function drawMap(perCountry) {
//
// };
//
// function drawBarchart(perDisease) {
//
//     var xScale =
// };

function convertData(perCountry, perDisease) {

    perDisease.dimension.geo.category.label.DE = "Germany";

    console.log(perCountry);

    var countryList = [];
    for (let key in perDisease.dimension.geo.category.label) {
        var name = perDisease.dimension.geo.category.label[key];
        countryList.push(name);
    };

    var mapData = {};
    for (let i = 0; i < perCountry.size[5]; i++) {
        var object = mapData[countryList[i]] = {};
        object.total = perCountry.value[i];
    };
    console.log(mapData);
    console.log(Object.keys(mapData));

    var pieData = {};
    for (let i = 0; i < perDisease.size[5]; i++) {
        var object = pieData[countryList[i]] = {};
        object.PD = perDisease.value[i];
        object.AD = perDisease.value[i + perDisease.size[5]];
        object.other = perDisease.value[i + 3 * perDisease.size[5]];
        object.total = perDisease.value[i + 2 * perDisease.size[5]];
    };
    // console.log(pieData);
    //
    // console.log(Object.keys(pieData));
    // console.log(Object.keys(pieData.Austria));
    // return pieData;
};

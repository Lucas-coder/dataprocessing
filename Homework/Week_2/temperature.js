/**
* Lucas Lumeij - 10353062
* JavaScript line graph
* Depicts data from text file in plot on html page.
*/

// make XML Http request and link to text file with data
var request = new XMLHttpRequest();
var dataFile = "https://Lucas-coder.github.io/dataprocessing/Homework/Week_2/tempfile.txt";

// run code in mainEvents when page loaded
request.addEventListener("load", mainEvents);
// open text file with data
request.open("GET", dataFile);
// send request to server
request.send();

function mainEvents() {

    // get text file and split all lines (rows)
    var data = this.responseText;
    var lines = data.split('\n');

    // make empty arrays to push date and temp elements to
    var dates = [];
    var temps = [];

    // split each line into temps and dates and push these to separate arrays
    for (let line = 1; line < lines.length - 1; line++) {
        let chunks = lines[line].split(',');
        // date chunk is left of comma
        dateString = chunks[0].trim();
        // new Date needs 0-11 instead 1-12 for months
        let month = Number(dateString.substring(4,6)) - 1;
        // convert dates to JS date type and push to array
        dates.push(new Date(dateString.substring(0,4), month, dateString.substring(6,8)));
        // push temps to array (temp chunk is right of comma)
        temps.push(Number(chunks[1]));
    }

    // get canvas from html and assign 2d context
    var canvas = document.getElementById('lineplot');
    var context = canvas.getContext('2d');

    // determine parameters of canvas
    canvas.width = 1000;
    canvas.height = 600;

    // convert dates to milliseconds
    var datesMilli = [];
    for (let date = 0; date < dates.length; date++) {
        datesMilli.push(dates[date].getTime());
    }

    // determine date and temp domains (to put in createTransform)
    var datesDomain = [Math.min(...datesMilli), Math.max(...datesMilli)];
    var tempsDomain = [Math.min(...temps), Math.max(...temps)];

    // determine width and height ranges (to put in createTransform)
    var widthRange = [60, canvas.width - 60];
    var heightRange = [canvas.height - 60, 60];

    // use createTransform to create proper coordinate formulas
    var datesTransform = createTransform(datesDomain, widthRange);
    var tempsTransform = createTransform(tempsDomain, heightRange);

    // draw line of y-axis
    context.beginPath();
    context.moveTo(60, 30);
    context.lineTo(60, canvas.height - 30);
    context.stroke();

    // draw line of x-axis on location of temp  = 0
    var zeroLocation = tempsTransform(0);
    context.beginPath();
    context.moveTo(60, zeroLocation);
    context.lineTo(canvas.width - 60, zeroLocation);
    context.stroke();

    // draw line of graph
    context.beginPath();
    for (let i = 0; i < temps.length; i++) {
        // determine x and y coordinate of each data point
        let dateTransformed = datesTransform(datesMilli[i]);
        let tempTransformed = tempsTransform(temps[i]);

        // truncate coordinate values
        let x = Math.floor(dateTransformed);
        let y = Math.floor(tempTransformed);

        // tell line which coordinate to move to
        context.lineTo(x, y);
    }

    // give graph line color and draw it
    context.strokeStyle = '#00ff00';
    context.stroke();

    // determine font of text and color of tics
    context.font = '15px Calibri';
    context.strokeStyle = '#000000';

    // start at lowest value on y-axis
    var value = -5

    // iterate through values of y-axis in steps of 5 degrees celsius
    for (let temp = -50; temp < 300; temp += 50) {
        // determine y-coordinates
        let tempLocation = tempsTransform(temp);

        // write y values and draw tics on proper locations
        context.fillText(value, 35, tempLocation);
        context.beginPath();
        context.moveTo(60, tempLocation);
        context.lineTo(55, tempLocation);
        context.stroke();
        // update y-value to write down
        value += 5;
    }

    // make array with abbreviated names of months
    var datesMonths = [];
    for (let date = 0; date < dates.length; date++) {
        // take proper substring from date array
        datesMonths.push(dates[date].toString().substring(4,7));
    }

    // write month name in middle of each month on x-axis
    context.font = '20px Calibri';
    context.textAlign = "center";
    for (let i = 15; i < 365; i += 30) {
        let month = datesMonths[i];
        // determine x coordinate of given date (middle of month)
        let xLoc = datesTransform(datesMilli[i]);
        context.fillText(month, xLoc, zeroLocation + 18);
    }

    // write plot title
    context.font = '25px Calibri';
    context.fillText('Temperatures De Bilt 2017', 500, 25);

    // write x-axis title
    context.font = 'bold 20px Calibri';
    context.fillText('Time (days)', 500, 525);

    // rotate canvas 90 degrees back and forth to write y-axis title
    context.save();
    context.translate(0, 0);
    context.rotate(-Math.PI/2);
    context.fillText("Temperature (degrees celsius)", -300, 20);
    context.restore();

    /**
    * createTransform() takes the domain and range from the data for the x and
    * y axes to create a formula that calculates the proper coordinates.
    */
    function createTransform(domain, range) {
        // domain is a two-element array of the data bounds [domain_min, domain_max]
        // range is a two-element array of the screen bounds [range_min, range_max]
        // this gives you two equations to solve:
        // range_min = alpha * domain_min + beta
        // range_max = alpha * domain_max + beta
        // a solution would be:

        var domain_min = domain[0];
        var domain_max = domain[1];
        var range_min = range[0];
        var range_max = range[1];

        // formulas to calculate the alpha and the beta
       	var alpha = (range_max - range_min) / (domain_max - domain_min)
        var beta = range_max - alpha * domain_max

        // returns the function for the linear transformation (y= a * x + b)
        return function(x) {
            return alpha * x + beta;
        }
    }
}

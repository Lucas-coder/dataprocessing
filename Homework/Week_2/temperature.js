function mainEvents() {

    // var data = document.getElementById('rawdata').innerHTML;
    var data = this.responseText;

    var lines = data.split('\n');

    var dates = [];
    var temps = [];

    for (let line = 1; line < lines.length - 1; line++) {
        let chunks = lines[line].split(',');

        dateString = chunks[0].trim();
        let month = Number(dateString.substring(4,6)) - 1;
        dates.push(new Date(dateString.substring(0,4), month, dateString.substring(6,8)));
        temps.push(Number(chunks[1]));
    }

    var canvas = document.getElementById('lineplot');
    var context = canvas.getContext('2d');

    canvas.width = 1000;
    canvas.height = 600;

    var datesMilli = [];
    for (let date = 0; date < dates.length; date++) {
        datesMilli.push(dates[date].getTime());
    }

    var datesDomain = [Math.min(...datesMilli), Math.max(...datesMilli)];
    var tempsDomain = [Math.min(...temps), Math.max(...temps)];

    var widthRange = [40, canvas.width - 40];
    var heightRange = [canvas.height - 40, 40];

    var datesTransform = createTransform(datesDomain, widthRange);
    var tempsTransform = createTransform(tempsDomain, heightRange);

    // var gradient = context.createLinearGradient(0, 0, 0, canvas.height);
    // gradient.addColorStop("0.3", "red");
    // gradient.addColorStop("0.6", "black");
    // gradient.addColorStop("1.0", "blue");

    context.beginPath();
    // context.moveTo(40, 40);
    // context.lineTo(40, canvas.height - 40);
    context.strokeStyle = '#000000';
    context.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

    context.beginPath();
    for (let i = 0; i < temps.length; i++) {
        let dateTransformed = datesTransform(datesMilli[i]);
        let tempTransformed = tempsTransform(temps[i]);

        let x = Math.floor(dateTransformed);
        let y = Math.floor(tempTransformed);

        context.lineTo(x, y);
    }

    context.strokeStyle = '#0000ff';
    context.stroke();

    for (let temp = 0; temp < temps.length; temp++) {
        context.fillText(Math.floor(temps[temp]*0.1), 2, tempsTransform(temps[temp]) - 10);
    }

    context.font = '20px Calibri';
    context.textAlign = "center";
    context.fillText('Temperaturen De Bilt 2017', 500, 25);

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

var request = new XMLHttpRequest();
var dataFile = "tempfile.txt";

request.addEventListener("load", mainEvents);
request.open("GET", dataFile);
request.send();

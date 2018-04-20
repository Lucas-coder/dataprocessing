function mainEvents() {

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
    canvas.color = "green";

    var datesMilli = [];
    for (let date = 0; date < dates.length; date++) {
        datesMilli.push(dates[date].getTime());
    }

    var datesDomain = [Math.min(...datesMilli), Math.max(...datesMilli)];
    var tempsDomain = [Math.min(...temps), Math.max(...temps)];

    var widthRange = [60, canvas.width - 60];
    var heightRange = [canvas.height - 60, 60];

    var datesTransform = createTransform(datesDomain, widthRange);
    var tempsTransform = createTransform(tempsDomain, heightRange);

    context.beginPath();
    context.moveTo(60, 30);
    context.lineTo(60, canvas.height - 30);
    context.stroke();

    var zeroLocation = tempsTransform(0);
    context.beginPath();
    context.moveTo(60, zeroLocation);
    context.lineTo(canvas.width - 60, zeroLocation);
    context.stroke();

    context.beginPath();
    for (let i = 0; i < temps.length; i++) {
        let dateTransformed = datesTransform(datesMilli[i]);
        let tempTransformed = tempsTransform(temps[i]);

        let x = Math.floor(dateTransformed);
        let y = Math.floor(tempTransformed);

        context.lineTo(x, y);
    }
    
    context.strokeStyle = '#00ff00';
    context.stroke();

    context.font = '15px Calibri';
    context.strokeStyle = '#000000';
    var value = -5
    for (let temp = -50; temp < 300; temp += 50) {
        let tempLocation = tempsTransform(temp);
        context.fillText(value, 35, tempLocation);
        context.beginPath();
        context.moveTo(60, tempLocation);
        context.lineTo(55, tempLocation);
        context.stroke();
        value += 5;
    }

    var datesMonths = [];
    for (let date = 0; date < dates.length; date++) {
        datesMonths.push(dates[date].toString().substring(4,7));
    }

    context.font = '20px Calibri';
    for (let i = 15; i < 365; i += 30) {
        let month = datesMonths[i];
        let xSpot = datesTransform(datesMilli[i]);
        context.fillText(month, xSpot, zeroLocation + 18);
    }

    context.font = '25px Calibri';
    context.textAlign = "center";
    context.fillText('Temperatures De Bilt 2017', 500, 25);

    context.font = 'bold 20px Calibri';
    context.fillText('Time (days)', 500, 525);

    context.save();
    context.translate(canvas.width - 1, 0);
    context.rotate(3 * Math.PI/2);
    context.fillText("Temperature (degrees celsius)", -300, -975);
    context.restore();

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

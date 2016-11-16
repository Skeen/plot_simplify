var Converter = require("csvtojson").Converter;

// Find the distance from p3, to the line specified by p1,p2
var point_to_line_distance = function(p1, p2, p3)
{
    var sqrd = function(num)
    {
        return Math.pow(num, 2);
    }

    var numerator = Math.abs((p2.y - p1.y) * p3.x - (p2.x - p1.x) * p3.y + p2.x * p1.y - p2.y * p1.x);
    var denominator = Math.sqrt(sqrd(p2.y - p1.y) + sqrd(p2.x - p1.x));

    return numerator / denominator;
}

var row_to_point = function(row)
{
    return {x: row.Time, y: row.Value};
}

var options = require('commander');

options
  .version('0.0.1')
  .usage('[options] <file>')
  .option('-e, --epsilon <n>', 'Remove all data within this distance (default=1)', parseFloat)
  //.option('-v, --verbose', 'Print A LOT of output')
  .parse(process.argv);

var epsilon = (options.epsilon || 1);

var input_file = options.args[0];
if(input_file == undefined)
{
    console.error();
    console.error("Fatal error: No input file provided");
    options.help();
}

// TODO: Handle spurious arguments somehow

var converter = new Converter({});
converter.fromFile(input_file, function(err, result)
{
    if(err)
    {
        console.error();
        console.error("Fatal error: Unable to use input file");
        console.error();
        console.error(err);
        process.exit(-1);
    }

    for (var i = 2; i < result.length; i++)
    {
        var p1 = row_to_point(result[i-2]);
        var p2 = row_to_point(result[i]);
        var p3 = row_to_point(result[i-1]);
        var distance = point_to_line_distance(p1,p2,p3);
        if(distance < epsilon)
        {
            result.splice(i-1, 1);
            i--;
        }
    }

    console.log("Time, Value");
    for (var i = 0; i < result.length; i++) 
    {
        var res = result[i];
        console.log(res.Time + ", " + res.Value);
    }
});

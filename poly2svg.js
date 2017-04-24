// Reads JSON from stdin and writes equivalent
// nicely-formatted JSON to stdout.

var stdin = process.stdin,
    stdout = process.stdout,
    inputChunks = [];

stdin.resume();
stdin.setEncoding('utf8');

stdin.on('data', function (chunk) {
    inputChunks.push(chunk);
});

stdin.on('end', function () {
    var inputJSON = inputChunks.join(),
        parsedData = JSON.parse(inputJSON),
        processedData = processJSON(parsedData),
//        outputJSON = JSON.stringify(processedData, null, '    ');
        outputSVG = svg(processedData);
    stdout.write(outputJSON);
    stdout.write('\n');
});

const processJSON = function(jsonObj) {
  const reversedCoordGroups = jsonObj.features[0].geometry.coordinates
    .map(array => array.reverse())
  ;

  return {
      "type": "FeatureCollection",
      "features": [
        { "type": "Feature",
          "geometry": {
            "type": "Polygon",
            "coordinates": reversedCoordGroups,
          },
          "properties": {"dataset":"ppp-2015","format":"AAIGrid"}
        }
      ]
    };
}


const polygon2svg = function(polygon) {
  const out = ['<polygon points="'];

  var points = "";

  for (i=0; i<polygon.length; i++) {
    points = points + polygon[0] + ',' + polygon[1] + ' ';
  }

  out.push(points + '"/>');
  return out.join('');
}

const svg = function(obj) {
  var polygons = obj.features[0].geometry.coordinates;
  var out = [];
  var v = minmax(polygons);

  out.push('<svg viewBox="' + v.xmin + ' ' + v.ymin + ' ' + v.width + ' ' + v.height + '" xmlns="http://www.w3.org/2000/svg">');

  out.push(polygons.map(polygon2svg));

  out.push('</svg>');
  return out.join('');

}

const minmax = function(poly) {
  var xmin=2000, ymin=2000, xmax = -2000, ymax=-2000;
  for (var i=0; i < poly.length; i++) {
    var line = poly[0];
    for (var j=0; j < line.length; j++) {
      var p = line[j];
      xmin = Math.min(xmin, p[0]);
      xmax = Math.max(xmax, p[1]);
      ymin = Math.min(ymin, p[0]);
      ymax = Math.min(ymax, p[1]);
    }
  }
  return { xmin: xmin, ymin: ymin, width: xmax-xmin, height: ymax-ymin };
}

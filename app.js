var http = require('http'),
    request = require('request'),
    nconf = require('nconf'),
    stats = [];

nconf.env()
     .file({ file: 'config.json' });

http.createServer(function(req, res) {
  if (stats.length) {
    writeStats(req, res);

    return;
  }

  // Else
  var options = {
    url: 'https://api.clicky.com/api/stats/4',
    qs: {
      sitekey: nconf.get('api-key'),
      site_id: '34742',
      type: 'pages',
      date: 'this-month',
      output: 'json',
      limit: 7
    }
  };

  request.get(options, function(err, response, body) {
    if (err) {
      res.writeHead(500);

      res.end();

      return;
    }

    stats = body;

    // Cache these stats for an hour before fetching fresh data.
    setTimeout(function() { stats = [ ]; }, 1000 * 60 * 60);

    writeStats(req, res);
  });
}).listen(process.env.port || 8080);

function writeStats(req, res) {
    res.writeHead(200, {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=600',
        'Access-Control-Allow-Origin': '*'
    });

    var url = require('url').parse(req.url, true);

    if (url.query.callback)
        res.write(url.query.callback + '(');

    res.write(stats);

    if (url.query.callback)
        res.write(');');

    res.end();
}
var express = require('express'),
    faye = require('faye'),
    port = process.ARGV[2] || '8000';

var bayeux = new faye.NodeAdapter({
  mount:    '/faye',
  timeout:  45
});

var app = express.createServer();

app.configure(function(){
	//app.use(express.logger({ format: ':method :url' }));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
});

app.configure('development', function(){
	app.use(express.static(__dirname + '/public'));
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
	var oneYear = 31557600000;
	app.use(express.static(__dirname + '/public', { maxAge: oneYear }));
	app.use(express.errorHandler());
});

app.post('/message', function(req, res) {
	bayeux.getClient().publish('/channel/' + req.body.ch, { text: req.body.text, timestamp: req.body.timestamp, ch: req.body.ch, clientid: req.body.clientid });
	res.send(200);
});

app.get('/', function(req, res){
	  res.send('hello world');
});

app.get('/message', function(req, res){
	  res.send('devi chiamare questa pagina con POST');
});

bayeux.attach(app);
app.listen(Number(port));

console.log('Listening on port ' + port );
bayeux.getClient().subscribe('/channel/*', function(message) {
				       console.log(message.timestamp + ' [' + message.ch + '] ' + message.clientid + ' ' + message.text);
				       });

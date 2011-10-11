var express = require('express'),
    faye = require('faye'),
    port = process.ARGV[2] || '8000';

var bayeux = new faye.NodeAdapter({
  mount:    '/faye',
  timeout:  45
});

var app = express.createServer();

app.configure(function(){
	app.use(express.methodOverride());
	app.use(express.bodyParser());
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
	bayeux.getClient().publish('/channel/1', { text1: req.body.inputfield, text2: req.body.timestamp });
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
				       console.log(new Date() + ' [' + message.text2 + ']: ' + message.text1);
				       });

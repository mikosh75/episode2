var express = require('express'),
    faye = require('faye'),
    port = process.ARGV[2] || '8000';

var bayeux = new faye.NodeAdapter({
  mount:    '/faye',
  timeout:  45
});

var app = express.createServer();

setHeaders = function (req,res,next) {
	res.header("X-Powered-By","nodejs");
	res.header("Access-Control-Allow-Origin",req.header('origin'));
	res.header("Access-Control-Allow-Headers", "X-Requested-With");	 
	next();
}

app.configure(function(){
	//app.use(express.logger({ format: ':method :url' }));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(setHeaders);
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
	bayeux.getClient().publish('/channel/' + req.body.ch, { text : 		req.body.text, 
															timestamp: 	req.body.timestamp, 
															ch: 		req.body.ch, 
															clientid: 	req.body.clientid 
															}
								);
	res.send(200);
});

app.post('/alert_tecnico', function(req, res) {
	bayeux.getClient().publish('/channel/' + req.body.ch, { id_chat : 	req.body.id_chat, 
															ch: 		req.body.ch 
															}
								);
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
						if (message.ch=="T3"){
							var ts = (new Date()).getTime();
							console.log(ts + ' [' + message.ch + '] ' + message.id_chat);
						} else {
							console.log(message.timestamp + ' [' + message.ch + '] ' + message.clientid + ' ' + message.text);
						}
				       });

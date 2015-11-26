var dataaccess = require('./dataaccess');
var MessageService = require('./services/messageservice');
var helper = require('./services/helperservice');
module.exports = function(app,io){

	app.get('/', function(req, res){
		// Render views/home.html
		res.render('login');
	});

	app.get('/login', function(req, res){
		res.render('login',{display: 'none'});
	});

	app.get('/execlogin', function(req, res){
		res.render('execlogin',{display: 'none'});
	});	

	app.get('/detailchat', function(req, res){
		res.render('detailchat');
	});

	app.get('/chatbar', function(req, res){
		res.render('chatbar');
	});

	app.get('/execchatbar', function(req, res){
		res.render('execchatbar');
	});

	app.get('/careservices/:id', function(req, res){
		dataaccess.getCareservices(responseJSONCallback,res,req.params.id);
	});

	function responseJSONCallback(res, data){
		res.json(data);
	}

	app.get('/careservices', function(req, res){
		dataaccess.getCareservices(responseJSONCallback,res);
	});

	app.get('/customer/:id',function(req, res){
		dataaccess.getCustomer(responseJSONCallback,res,req.params.id);
	});

	app.post('/loginAuth', function(req,res){
		var userObj = req.body;
		userObj.isCareExec = false;
		dataaccess.loginAuthentication(function(result){
			
			if(result == null || result.length == 0) {
				res.render('login',{display: 'inline'});
			}
			else{
				result = result[0];
				result.success = true;
			}
			res.render('chatbar');
		},userObj);
	});	
	app.post('/loginAuthAndroid', function(req,res){
		var userObj = req.body;
		userObj.isCareExec = false;
		dataaccess.loginAuthentication(function(result){
			
			if(result == null || result.length == 0) {
				result = {};
				result.success = false;
			}
			else{
				result = result[0];
				result.success = true;
			}
			res.json(result);
		},userObj);
	});

	app.post('/execLoginAuth', function(req,res){
		var userObj = req.body;
		userObj.isCareExec = true;
		dataaccess.loginAuthentication(function(result){
			if(result == null || result.length == 0) {
				res.render('execlogin',{display: 'inline'});
			}
			else{
				result = result[0];
				dataaccess.getExecservices(function(rs){
			var data = {
							userId:result.IndividualId, 
						    userName: result.IndividualName,
						    services: rs
						};
			res.render('execchatbar',{data: data});
				},result.IndividualId);
			}
			
		},userObj);
	});	

	app.post('/createUser', function(req,res){
		var userObj = req.body;
		dataaccess.registerUser(function(result){
			if(result == null || result.length == 0) {
				res.render('login',{display: 'inline'});
			}
			res.render('chatbar');
		}, userObj);
	});

	app.post('/createUserAndroid', function(req,res){
		var userObj = req.body;
		dataaccess.registerUser(function(result){
			if(result == null || result.length == 0) {
				result = {};
				result.success = false;
			}
			else{
				result = result[0];
				result.success = true;
			}
			res.json(result);
		}, userObj);
	});

    /*--------- Socket Related Configuration -----------------------------*/
	var mService =new MessageService();
	var chat = io.on('connection', function (socket) {
		console.dir(socket.id);
		socket.on('executive connect', function(data){
			try {
				data = helper.convertToObject(data);
				mService.registerExecutive(data.id, data.name, data.services, socket);
				var messages = mService.messagesExecCanServe(data.id);
				for (var index = 0; index < messages.length; index++) {
                    console.log("executive socket Id: "+mService.allSockets[messages[index].receiverId].id);
					mService.allSockets[messages[index].receiverId].emit('new message', messages[index]);
				}
			}catch(ex){
				console.error("Error in executive connect"+ex);
			}
		});
		socket.on('new message', function(data) {
			data = helper.convertToObject(data);
			if(mService.hasReceiver(data.receiverId)){ //If the message has receiver, simply send it to intended receiver
				mService.allSockets[data.receiverId].emit("new message", mService.createMessage(data.senderId, data.receiverId, data.serviceId, data.content));
				return;
			}
			var message = mService.connectMessageWithExecutive(data.senderId, data.serviceId, data.content); //get the message
            if(message != null){
                    var msg = {};
                    msg.executiveId = message.receiverId;
                    msg.executiveName = mService.executives[message.receiverId].name;
                    msg.serviceId = message.serviceId;
                    console.log("send executive ready to user socket: "+ mService.allSockets[message.senderId].id);
					mService.allSockets[message.senderId].emit("executive ready", msg);
                    console.log("send new message to executive socket: "+ mService.allSockets[message.receiverId].id);
					mService.allSockets[message.receiverId].emit("new message", message);
            }
		});
		socket.on('typing', function(data) {
            data = helper.convertToObject(data);
            if(!mService.hasReceiver(data.receiverId)){
                return;
            }
			mService.allSockets[data.receiverId].emit("typing",data);
			
		});

		socket.on('stop typing', function(data) {
            data = helper.convertToObject(data);
            if(!mService.hasReceiver(data.receiverId)){
                return;
            }
			mService.allSockets[data.receiverId].emit("stop typing",data);
		});

		socket.on('customer connect', function(data){
			console.log("android connected");
            data = helper.convertToObject(data);
			mService.registerCustomer(data.id, data.name, data.serviceRequestId, socket);
		});

		socket.on('disconnect', function() {
            console.log("disconnected socket");
		});
	});
};








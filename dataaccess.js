
var mysql = require('mysql');

var connection = mysql.createConnection({
	host: 'us-cdbr-iron-east-03.cleardb.net',
	user: 'bd53c82a9496dc',
	password: '306ae0d3',
	database: 'heroku_12294e4021e2b4d'
});

connection.connect(function(err){
if(!err){
	console.log("Database Connection Successful");
}
else{
	console.error("Error Occured in database connection:" + err);
}
});

var getCareservices = function(callback,res,id){
	try{
	selectServicesQuery = "SELECT * FROM  CareService";
	selectServicesQuery +=  (id != null) ? ' Where CareServiceId='+id : '';
	connection.query(selectServicesQuery,function(err,rows,fields){
		if(err){
			console.error(err);
		}
		else{
			callback(res,rows);
		}
	});
	}
	catch(exception){
		console.error("Exception in Database fetch:"+exception);
		connection.end();
	}
};

var getCustomer = function(callback,res,id){
	try{
		selectServicesQuery = "SELECT IndividualId as id, IndividualName as name, Email as email FROM  individual Where isCareExec=1 and individualid="+id;
		connection.query(selectServicesQuery,function(err,rows,fields){
			if(err){
				console.error(err);
			}
			else{
				callback(res,rows[0]);
			}
		});
	}
	catch(exception){
		console.error("Exception in Database fetch:"+exception);
		connection.end();
	}
};

var getExecservices = function(callback,id){
	try{
	selectServicesQuery = "SELECT DISTINCT cs.CareServiceId,cs.ServiceName FROM  ExecService es INNER JOIN CareService cs on es.careserviceid =cs.careserviceid ";
	selectServicesQuery +=  (id != null) ? ' Where CareExecId='+id : '';
	connection.query(selectServicesQuery,function(err,rows,fields){
		if(err){
			console.error(err);
		}
		else{
			callback(rows);
		}
	});
	}
	catch(exception){
		console.error("Exception in Database fetch:"+exception);
		connection.end();
	}
};

var loginAuthentication = function(callback,usernameObj){
	try{
	if(usernameObj == null) {
			callback();
			return;
	}
	loginQuery = "SELECT i.IndividualId, i.IndividualName,i.Email FROM  Individual i JOIN LoginCredentials c ON i.IndividualId = c.IndividualId";
	loginQuery += " Where email='"+usernameObj.email+ "' and password='"+usernameObj.password+"'";
	loginQuery += (usernameObj.isCareExec) ? ' and isCareExec = 1' : '';
	console.log(loginQuery);
	connection.query(loginQuery,function(err,rows,fields){
		if(err){
			console.error(err);
		}
		callback(rows);
	});
	}
	catch(exception){
		console.error("Exception in Database fetch:"+exception);
		connection.end();
	}
};

var registerUser = function(callback, userObj){
	var registerSproc = "CALL register_user('{0}','{1}','{2}',0)".format(userObj.username,userObj.email,userObj.password);
	connection.query(registerSproc,function(err,rows,fields){
		if(err){
			callback(rows);
			console.error(err);
		}
		else{
			callback(rows);
		}
	});
};

// First, checks if it isn't implemented yet.
if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

var dataaccess = {
	getCareservices : getCareservices,
	loginAuthentication : loginAuthentication,
	registerUser : registerUser,
	getExecservices : getExecservices,
	getCustomer : getCustomer
};

module.exports = dataaccess;
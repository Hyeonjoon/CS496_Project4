/*
 * server.js - Server for CS496 project4 which is coupon book mobile application service.
 *             Connected to MongoDB.
 */

// Assign http module to http variable for server.
var http = require('http');
var url = require('url');
var querystring = require('querystring');

// Use express.
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json({limit : '50mb'}));
app.use(bodyParser.urlencoded({limit : '50mb', extended : true}));

// Connect this node.js server with MongoDB.
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/p4');
var db = mongoose.connection;

db.on('error', function(){
	console.log('Connection Failed.');
});

db.once('open', function(){
	console.log('Connected.');
});

var Schema = mongoose.Schema;

// Server listen for port with port number 80.
app.listen(80, function(){
	console.log('Server is running...');
});


/*******************************
 * Membership handling routines.
 *******************************/

/*
 * GET - Deals with GET method,
 *       which checks whether the IDs entered by users are overlapped.
 *       Parameter : id(String) - User ID entered by user.
 *       Response : '0'/'1' (String) - '0' if there's a overlap, and
 *                                     '1' if there's no overlap.
 */
app.get('/getidvalidity', function(req, res){
	console.log('Get ID validity');
	// Parse parameters.
	var parsedUrl = url.parse(req.url);
	var parsedQuery = querystring.parse(parsedUrl.query, '&', '=');
	
	// Need only one parameter which is user identifier.
	if (Object.keys(parsedQuery).length != 1){
		res.write(' Error: Too many or less number of parameters.');
		res.end();
	}else{
		var id = parsedQuery.id;
		
		var Id = mongoose.model('Schema', new Schema({id : String, pssword : String, name : String, phone : String}), 'client');
		var condition = {'id' : id};
		var get = {'_id' : 0, 'id' : 1};
		
		Id.find(condition, get, function(error, data){
			console.log('Check if there exists overlapping for user ID.');
			if (error){
				console.log(error);
			}else{
				// If there's overlapping, send '0' as a response.
				if (data.toString() != ''){
					res.setHeader('Content-Type', 'text/plain');
					res.write(' 0');
					res.end();
				// If there's no overlapping, send '1' as a response.
				}else{
					res.setHeader('Content-Type', 'text/plain');
					res.write(' 1');
					res.end();
				}
			}
		});
		mongoose.deleteModel('Schema');
	}
});

/*
 * POST - Deals with POST method,
 *        which requests to save members' info.
 *        Parameter : None(Must be).
 *        Request body : id (String) - User ID entered by user.
 *                       password (String) - User Password entered by user.
 *                       name (String) - User name.
 *                       phone (String) - User phone number.
 *        Response : None.
 */
app.post('/postmember', function(req, res){
	console.log('Post member information.');
	// Parse parameters.
	var parsedUrl = url.parse(req.url);
	var parsedQuery = querystring.parse(parsedUrl.query, '&', '=');
	
	// Need no parameter.
	if (Object.keys(parsedQuery).length != 0){
		res.write(' Error: There should be no parameter.');
		res.end();
	}else{
		var id = req.body.id;
		var password = req.body.password;
		var name = req.body.name;
		var phone = req.body.phone;
		
		var Client = mongoose.model('Schema', new Schema({id : String, password : String, name : String, phone : String}), 'client');
		var newInfo = ({'id' : id, 'password' : password, 'name' : name});
		
		// If users do not check their id validity or do ignore the invalidity,
		// it is filterd at the application side.
		Client.create(newInfo, function(error){
			if (error){
				console.log(error);
			}else{
				console.log('New member joined');
				res.write(' success');
				res.end();
			}
		})
		mongoose.deleteModel('Schema');
	}
});

/*
 * POST - Deals with POST method,
 *        which manages the user LOGIN.
 *        Parameters : None(Must be).
 *        Request body : id (String) - User identifier.
 *                       password (String) - User password.
 *        Response : '-1'/'0'/'1' (String) - '-1' if there's no such ID,
 *                                           '0' if login fails because of password missmatch, and
 *                                           '1' if login successes.
 */
app.post('/postlogin', function(req, res){
	console.log('Post login information.');
	// Parse parameters.
	var parsedUrl = url.parse(req.url);
	var parsedQuery = querystring.parse(parsedUrl.query, '&', '=');
	
	// Need no parameter.
	if (Object.keys(parsedQuery).length != 0){
		res.wrtie(' Error: There should be no parameter.');
		res.end();
	}else{
		var id = req.body.id;
		var password = req.body.password;
		
		var Client = mongoose.model('Schema', new Schema({id : String, password : String, name : String, phone : String}), 'client');
		var condition1 = {'id' : id};
		var condition2 = {'id' : id, 'password' : password};
		var get = {'_id' : 0, 'name' : 1};
		
		// Check if there exists ID match.
		Client.find(condition1, get, function(error, data1){
			console.log('Check if there exists ID match.');
			if (error){
				console.log(error);
			}else{
				// There's no match.
				if (data1.toString() == ''){
					res.setHeader('Content-Type', 'text/plain');
					res.write(' -1');
					res.end();
				// There's ID match.
				}else{
					Client.find(condition2, get, function(error, data2){
						if (error){
							console.log(error);
						}else{
							// There's no ID - password match.
							if (data2.toString() == ''){
								res.setHeader('Content-Type', 'text/plain');
								res.write(' 0');
								res.end();
							// Login success.
							}else{
								res.setHeader('Content-Type', 'text/plain');
								res.write(' 1');
								res.end();
							}
						}
					});
				}
			}
		});
		mongoose.deleteModel('Schema');
	}
});


/**************************************
 * End of membership handling routines.
 **************************************/

/***************************
 * Coupon handling routines.
 ***************************/

/*
 * GET - Deals with GET method,
 *       which requests coupon info.
 *       Parameters : id (String) - User identifer.
 *       Response : Pairs of store name and number of coupons.
 */
app.get('/getcouponinfo', function(req, res){
	console.log('Get coupon information.');
	// Parse parameters.
	var parsedUrl = url.parse(req.url);
	var parsedQuery = querystring.parse(parsedUrl.query, '&', '=');
	
	// Need only one parameters.
	if (Object.keys(parsedQuery).length != 1){
		res.write(' Error: Too many or less number of parameters.');
		res.end();
	}else{
		var id = parsedQuery.id;
		
		var Coupon = mongoose.model('Schema', new Schema({store : String, id : String, num_coupon : String}), 'coupon');
		var condition = {"id" : id};
		var get = {"_id" : 0, "store" : 1, "num_coupon" : 1};
		
		Coupon.find(condition, get, function(error, data){
			if (error){
				console.log(error);
			}else{
				// User has no coupon at all.
				// Creating entity routine is in POST.
				if (data.toString() == ''){
					data = [];
					res.setHeader('Content-Type', 'text/json');
					res.write(' ' + data.toString());
					res.end();
				}else{
					res.setHeader('Content-Type', 'text/json');
					res.write(' ' + data.toString());
					res.end();
				}
			}
		});
		mongoose.deleteModel('Schema');
	}
});

/*
 * POST - Deals with POST method,
 *        which requests to save number of coupons of user.
 *        Parametes : None(Must be).
 *        Request body : store (String) - Store name.
 *                     : id (String) - User identifier.
 *                     : change (String) - Change of number of coupons.
 *                     : code (String) - '0' if 'change' is positive, and
 *                                       '1' if 'change' is negative.
 *        Response : None.
 */
app.post('/postcouponinfo', function(req, res){
	console.log('Post coupon information.');
	// Parse parameters.
	var parsedUrl = url.parse(req.url);
	var parsedQuery = querystring.parse(parsedUrl.query, '&', '=');
	
	// Need no parameter.
	if (Object.keys(parsedQuery).length != 0){
		res.write(' Error: There should be no parameter.');
		res.end();
	}else{
		var store = req.body.store;
		var id = req.body.id;
		var change = req.body.change;
		var code = req.body.code;
		
		var Coupon = mongoose.model('Schema', new Schema({store : String, id : String, num_coupon : String}), 'coupon');
		var condition = {"store" : store, "id" : id};
		var get = {"_id" : 0, "store" : 0, "id" : 0};
		var option = {upsert : true, new : true, useFindAndModify : false};
		
		Coupon.find(condition, get, function(error, data){
			if (error){
				console.log(error);
			}else{
				// code '0' - Change is positive.
				if (code == '0'){
					// This user is given first coupon for this store.
					// Create entity and save 'change' as num_coupon.
					if (data.toString() == ''){
						console.log('Create new coupon.');
						Coupon.create({"store" : store, "id" : id, "num_coupon" : change});
					// Thia user already has coupon for this store.
					// Find and update num_coupon.
					}else{
						console.log('Number of coupons increased.');
						var new_num = (Number(data[0].num_coupon) + Number(change)).toString();
						var update = {"$set" : {"num_coupon" : new_num}};
						Coupon.findOneAndUpdate(condition, update, option, function(error, doc){
							if (error){
								console.log(error);
							}else{
								res.setHeader('Content-Type', 'text/json');
								res.write(' ' + doc.toString());
								res.end();
							}
						});
					}
				// code '1' - Change is negative.
				// This user already has coupon for this store.
				// Find and update num_coupon.
				}else if (code == '1'){
					console.log('Number of coupons decreased.');
					var new_num = (Number(data[0].num_coupon) - Number(change)).toString();
					var update = {"$set" : {"num_coupon" : new_num}};
					Coupon.findOneAndUpdate(condition, update, option, function(error, doc){
						if (error){
							console.log(error);
						}else{
							res.setHeader('Content-Type', 'text/json');
							res.write(' ' + doc.toString());
							res.end();
						}
					});
				// Wrong code.
				}else{
					res.write(' Error: Wrong code.');
					res.end();
				}
			}
		});
		mongoose.deleteModel('Schema');
	}
});

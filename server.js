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
 *       Response : '0'/'1' (String) - '0' if there's a overlap,
 *                                     '1' if there's no overlap.
 */
app.get('/getidvalidity', function(req, res){
	console.log('Get ID validity');
	// Parse parameters.
	var parsedUrl = url.parse(req.url);
	var parsedQuery = querystring.parse(parsedUrl.query, '&', '=');
	
	// Need only one parameter which is user identifier.
	if (Object.keys(parsedQuery).length != 1){
		res.write('Error: Too many or less number of parameters.');
		res.end();
	}else{
		var user_id = parsedQuery.id;
		
		var Id = mongoose.model('Schema', new Schema({id : String, pswd : String, name : String}), 'client');
		var condition = {'id' : user_id};
		var get = {'_id' : 0, 'id' : 1};
		
		Id.find(condition, get, function(error, data){
			console.log('Check if there exists overlapping for user ID.');
			if (error){
				console.log(error);
			}else{
				// If there's overlapping, send '0' as a response.
				if (data.toString() != ''){
					res.setHeader('Content-Type', 'text/plain');
					res.write('0');
					res.end();
				// If there's no overlapping, send '1' as a response.
				}else{
					res.setHeader('Content-Type', 'text/plain');
					res.write('1');
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
 *                       pswd (String) - User Password entered by user.
 *                       name (String) - User name.
 *        Response : None.
 */
app.post('/postmember', function(req, res){
	console.log('Post member information.');
	// Parse parameters.
	var parsedUrl = url.parse(req.url);
	var parsedQuery = querystring.parse(parsedUrl.query, '&', '=');
	
	// Need no parameter.
	if (Object.keys(parsedQuery).length != 0){
		res.write('Error: There should be no parameter.');
		res.end();
	}else{
		var user_id = req.body.id;
		var pswd = req.body.pswd;
		var name = req.body.name;
		
		var Client = mongoose.model('Schema', new Schema({id : String, pswd : String, name : String}), 'client');
		var newInfo = ({'id' : user_id, 'pswd' : pswd, 'name' : name});
		
		// If users do not check their id validity or do ignore the invalidity,
		// it is filterd at the application side.
		Client.create(newInfo, function(error){
			if (error){
				console.log(error);
			}else{
				console.log('New member joined');
			}
		})
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
		res.write('Error: Too many or less number of parameters.');
		res.end();
	}else{
		var user_id = parsedQuery.id;
		var 
});

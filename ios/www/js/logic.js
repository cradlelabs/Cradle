//GLOBAL VARS
cradledomain = "198.74.53.232";
cradleurl = "http://"+cradledomain+":7777";
s3url = "http://cradlelabs.s3.amazonaws.com";
dirtybit = true;

//PHONEGAP INIT
var app = {
    initialize: function() 
	{
        document.addEventListener('deviceready', this.onDeviceReady, false);
	
    },

    onDeviceReady: function() 
	{
		//alert("ready");
		console.log("We in here. For 3 weeks straight!");
		document.addEventListener("online", app.onOnline, false);
		document.addEventListener("offline", app.onOffline, false);
		//document.addEventListener("backbutton", app.onBack, false);
		
		app.LoginChk();
    },
	
	onOnline: function() 
	{
		console.log("Online Detected!");
    },
	
	onOffline: function() 
	{
		console.log("Offline Detected!");
    },
	
	onBack: function()
	{
		navigator.app.backHistory();
		
	},
	
	
	LoginChk: function()
	{
	
		app.username = app.DB.getItem("username");
		app.userkey = app.DB.getItem("userkey");
		//console.log(app.username);
		//console.log(app.userkey);
		
		if((app.userkey && app.userkey.length != 0) && (app.username && app.username.length != 0))
		{
		
			API.getAll(function(){});
			
			$(".splashopen").fadeIn();
			setTimeout(function() 
			{
			   $('.slidename').html(app.username);
			   $.mobile.changePage("#page_home", {transition:"flip"});
			   $("#fixedheader").show().animate({top:'0'}, 200);
			   
			   setTimeout(function() {$(".splashopen").fadeOut();},1000);
			}, 150);
			
		}
		else
		{
		
			$(".swipetext").html("---- SWIPE TO BEGIN ----");
		}

	},
	
	//write vars to localstorage
	SaveData: function()
	{
	
		app.DB.setItem('username', app.username);
		app.DB.setItem('userkey', app.userkey);
		app.DB.setItem('filedata', app.filedata);
		app.DB.setItem('cradledata', app.cradledata);
		app.DB.setItem('queue', app.queue);
	},
	

	ProcessQueue: function(qdone, cb)
	{
		
		networkstate = navigator.connection.type;
		if(networkstate == Connection.NONE)
		{
			clearTimeout(app.qtime);
			app.qtime = setTimeOut(function(){ProcessQueue(qdone, cb);}, 15000);
		}
		
		tqo = app.DB.getItem("queue");
		
		
		if(qdone)
		{
			console.log(qdone);
			app.queue = tqo.replace('-'+qdone, "");
			tqo = app.queue;
			app.SaveData();
		}
		
		tq = tqo.split('-');
		tq.splice(0,1);
		

		if(tq.length <= 0)
		{
			app.queue = "";
			app.SaveData();
			cb();
			return;
		}
		
		qcode = tq[0];
		app.qcode = qcode;

		op = qcode[0];
		tcradle = qcode.substring(0, qcode.indexOf("F")).substring(1);
		

		
		tfile =  qcode.substring(qcode.indexOf("F"), qcode.indexOf("U")).substring(1);
		tfiled = qcode.substring(qcode.indexOf("F")).substring(1);
		tuser = qcode.substring(qcode.indexOf("U")).substring(1);
		
		cradles = JSON.parse(app.DB.getItem("cradledata"));
		dcradle = false;
		for(y in cradles)
			if(cradles[y].fields.cradlename == "Download")
				dcradle = cradles[y].pk;
		if(!dcradle)
			dcradle = cradles[y];
		
		
		dirtybit = true;
		
		if(op == "A")
			return API.addFile(tcradle,dcradle,tfile,function(r)
			{
				if(r)
					console.log(r);
					
				app.ProcessQueue(qcode, cb);
			});
		else if(op == "D")
			return API.dropFile(tcradle,tfiled,function(r)
			{
				if(r)
					console.log(r);
					
				app.ProcessQueue(qcode, cb);
			});
			
		
	},
	

	username: "",
	userkey: "",
	filedata: "",
	cradledata: "",
	queue:"",
	qcode:"",
	qtime:null,
	DB: window.localStorage
};



// JQM INIT
//EVENTS	

$(document).one('pageinit', function(event)
{

	$.mobile.defaultPageTransition = "slide";
	

	$(".biglogo").on("click", function() {
		
		document.location.href = 'index.html'
		/*
		$.mobile.changePage("#page_home");
		$("#fixedheader").show().animate({top:'0'}, 200);
		app.username = "test3";
		app.userkey = "199d95db609fd1882feb373c3b8d96bd";
		app.SaveData();
		*/
	});	



	$(".swipe").on("swipe", function() {
		$(".swipe").fadeOut();
		$(".signchoice").fadeIn();
	});	

	$("#sin").on("vmousedown", function(e) {
		e.preventDefault();
		$(".signchoice").fadeOut();
		$(".signin").fadeIn();
		$("#stextu").trigger( "create" );
		$("#stextp").trigger( "create" );
		//setTimeout(function(){$("#stextu").trigger('mouseup');}, 750);
		
	});	
	
	$("#nuser").on("vmousedown", function() {
		$(".signchoice").fadeOut();
		$(".signup").fadeIn();
		$(".nchoice").fadeIn();
	});	
	
	$(".nem").on("vmousedown", function(e) {
		e.preventDefault();
		$(".nchoice").fadeOut();
		$(".nregular").fadeIn();
		//setTimeout(function(){$("#ntextu").trigger('mouseup');}, 750);
	});	
	
	$(".sbck").unbind("vmousedown").on("vmousedown", function() {
		$(".signin").fadeOut();
		$(".signchoice").fadeIn();
	});
	
	$(".nbck").unbind("vmousedown").on("vmousedown", function() {
		$(".nregular").fadeOut();
		$(".signup").fadeOut();
		$(".signchoice").fadeIn();
	});
	
	$(".sidetoggle").unbind("vmousedown").on("vmousedown", function() {

		if($("#sidemenu").css("right") == "-75%")
			$("#sidemenu").stop().show().animate({right:'0%'}, 350);
		else
			$("#sidemenu").stop().animate({right:'-75%'}, 350, function(){$(this).hide()});
	});	
	
	

	$('.blogin').on("click",function() {
		API.login();
	});
	
	$('.bsignup').on("click",function() {
		API.register();
	});
	
	

	$('.blogout').unbind("vmousedown").on("vmousedown", function() {
		app.userkey = "";
		app.SaveData();
		$("#sidemenu").stop().animate({right:'-75%'}, 350, function(){$(this).hide()});
		$("#fixedheader").show().animate({top:'-10%'}, 200);

		$.mobile.changePage("logout.html", {transition:"flip"});
		
		setTimeout(function(){document.location.href = 'index.html';}, 2000);
		


	});
	
	$('.backbutton').unbind("vmousedown").on("vmousedown",function() {
		history.back();
	});
	
                

	$.ajaxSetup({cache:false});

});

$(document).unbind("pagebeforechange").on("pagebeforechange", function(e, ob) 
{
		
		if ((app.userkey && app.userkey.length != 0) && ob.toPage[0].id === "page_splash" && ob.options.fromPage) 
		{
			
			console.log("blocking the back");
			e.preventDefault();
			history.go(1);
		}
});

//API CALLS

var API ={
	register: function()
	{
		rusername = $("#ntextu").val();
		rpassword = $("#ntextp").val();
		if((rusername.length == 0) || (rpassword.length == 0))
		{
			API.err("Please enter a Username and Password");
			return 0;
		}
		
		$.ajax({
                type: "POST",
                url: cradleurl,
                data: {r_username:rusername, r_password:rpassword, register:true, mobile:true},
                crossDomain: true,
                cache: false,
				async: true,
                dataType: "json",
                success: API.loginSuccess,
                error: API.err
            }); 
			
	},
	
	login: function()
	{
		lusername = $("#stextu").val();
		lpassword = $("#stextp").val();
		if((lusername.length == 0) || (lpassword.length == 0))
		{
			API.err(null, null, "Please enter a Username and Password");
			return 0;
		}

		$.ajax({
                type: "POST",
                url: cradleurl,
                data: {username:lusername, password:lpassword, mobile:true},
                crossDomain: true,
                cache: false,
				async: true,
                dataType: "json",
                success: API.loginSuccess,
                error: API.err
            }); 
			
	},
	
	loginSuccess: function(data)
	{
		if(data[0].status == true)
		{
			app.username = data[0].username;
			app.userkey = data[0].apikey;
			app.SaveData();
			
			app.LoginChk();
		}
		else
			API.err(null, null, data[0].msg);
			
	},
	
	getAll: function(cb)
	{
		
		console.log("getall called");
		networkstate = navigator.connection.type;
		if(networkstate == Connection.NONE)
		{
			console.log("read it from localstorage");
			app.filedata = app.DB.getItem("filedata");
			app.cradledata = app.DB.getItem("cradledata");
			dirtybit = true;
			cb();
		}
		else
		{
			if(dirtybit)
				$.ajax({
						type: "GET",
						url: cradleurl+"/api/getAll",
						data: {t:app.userkey, mobile:true},
						crossDomain: true,
						cache: false,
						async: true,
						dataType: "json",
						success: function(data)
						{
							console.log("getall got all");
							app.filedata = JSON.stringify(data[0].files);
							app.cradledata = JSON.stringify(data[1].cradles);
							app.SaveData();
							dirtybit = false;
							cb();
						},
						error: function(er){API.err(er); cb();}
					}); 
			else
				cb();
		}
		
	},
	
	getCradles: function(cb)
	{
		$.ajax({
                type: "GET",
                url: cradleurl+"/api/listCradles",
                data: {t:app.userkey, mobile:true},
                crossDomain: true,
                cache: false,
				async: true,
                dataType: "json",
                success: cb,
                error: function(er){API.err(er); cb();}
            }); 
	},
	
	listFiles: function(cid, cb)
	{
		$.ajax({
                type: "GET",
                url: cradleurl+"/api/listFiles",
                data: {t:app.userkey, cradleid: cid, mobile:true},
                crossDomain: true,
                cache: false,
				async: true,
                dataType: "json",
                success: cb,
                error: function(er){API.err(er); cb();}
            }); 
	},
	
	addFile: function(scid, rcid, fid, cb)
	{
		
		$.ajax({
                type: "GET",
                url: cradleurl+"/api/syncFile",
                data: {t:app.userkey, s_cradleid: scid, r_cradleid: rcid, fileid : fid, mobile:true},
                crossDomain: true,
                cache: false,
				async: true,
                dataType: "json",
                success: cb,
               error: function(er){API.err(er); cb();}
        }); 
	},
	
	dropFile: function(cid, fid, cb)
	{

		$.ajax({
                type: "GET",
                url: cradleurl+"/api/removeFile",
                data: {t:app.userkey, cradleid: cid, fileid : fid, mobile:true},
                crossDomain: true,
                cache: false,
				async: true,
                dataType: "json",
                success: cb,
                error: function(er){API.err(er); cb();}
        }); 
	},
	
	err: function(e, s, t)
	{
		navigator.notification.alert(t, function(){}, "Error");
	}
	
};






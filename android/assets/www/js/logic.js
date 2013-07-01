//GLOBAL VARS
cradleurl = "http://198.74.53.232:7777";

//PHONEGAP INIT
var app = {
    initialize: function() 
	{
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    onDeviceReady: function() 
	{
		//alert("ready");
		console.log("We in here. For 2 weeks straight!");
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
		
		if(app.userkey != "")
		{
		
			$(".splashopen").fadeIn();
			setTimeout(function() 
			{
			   $.mobile.changePage("#page_home");
			   $("#fixedheader").show().animate({top:'0'}, 200);
			   
			   setTimeout(function() {$(".splashopen").fadeOut();},1000);
			}, 1750);
			
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
	},
	

	username: "",
	userkey: "",
	DB: window.localStorage
};



// JQM INIT
//EVENTS	

$(document).one('pageinit', function(event)
{

	$.mobile.defaultPageTransition = "flow";
	

	$(".biglogo").on("click", function() {
		$.mobile.changePage("#page_home");
		$("#fixedheader").show().animate({top:'0'}, 200);
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
	
	$(".sbck").on("vmousedown", function() {
		$(".signin").fadeOut();
		$(".signchoice").fadeIn();
	});
	
	$(".nbck").on("vmousedown", function() {
		$(".nregular").fadeOut();
		$(".signup").fadeOut();
		$(".signchoice").fadeIn();
	});
	
	$(".sidetoggle").on("vmousedown", function() {

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
	
	

	$('.blogout').on("vmousedown", function() {
		app.userkey = "";
		app.SaveData();
		$("#sidemenu").stop().animate({right:'-75%'}, 350, function(){$(this).hide()});
		$("#fixedheader").show().animate({top:'-10%'}, 200);

		$.mobile.changePage("logout.html", {transition:"flip"});
		
		setTimeout(function(){document.location.href = 'index.html';}, 2000);
		


	});

	$.ajaxSetup({cache:false});

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
	
	err: function(e, s, t)
	{
		navigator.notification.alert(t, function(){}, "Error");
	}
	
};






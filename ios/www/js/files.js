
var cradle = {
	id:null,
	name:null,
	fname:null,
	fid:null,
	fhash:null,
	ftype:null,


	showFiles: function()
	{

		
		

			API.getAll(cradle.displayFiles);
		
	},
	
	displayFiles: function()
	{
		cfiles = JSON.parse(app.DB.getItem("filedata")); 
		
		slam = '<ul data-role="none">';
		for(x in cfiles)
		{
			
			if(cfiles[x].fields.cradle.indexOf(parseInt(cradle.id)) != -1)
			{
				
				fname = cfiles[x].fields.filename;
				fhash = cfiles[x].fields.hash;
				ftype = cfiles[x].fields.mimetype;
				fid = cfiles[x].pk;
				
				slam += '<li class="cfile plist" hash="'+fhash+'" type="'+ftype+'"filename="'+fname+'" id="f'+fid+'" data-role="none">'+ fname + '</li>';
			}
		}
		slam += '</ul>'; 
		$('.cradlecontent').html(slam);
		//$('.cradlecontent').html(slam).trigger("create");
		
		$(".cfile").unbind("click").on("click", cradle.previewFile);	
		
	},
	
	previewFile : function(e)
	{
		currstate = history.state;
		console.log(currstate);
		cradle.fid = e.target.id.slice(1);
		cradle.fname = $(e.target).attr("filename");
		cradle.fhash = $(e.target).attr("hash");
		cradle.ftype = $(e.target).attr("type");
		
		
		$.mobile.changePage($("#page_preview")); 		//$.mobile.changePage("preview.html");
		$('.qrcontent').hide();
		$('.pcontent').show();
		
		$('.prevcontent').show();
		$('.foot').show();
		$('.scanprevcontent').hide();

		if(cradle.ftype.match(/.(?:jpe?g|png|gif)/))
		{
			slam = '<img src="'+s3url+"/"+cradle.fhash+'" class="prev_frame prev_image"></img>';
		}
		else
		{
			slam = '<iframe src="'+s3url+"/"+cradle.fhash+'" frameBorder="0" class="prev_frame" rel=external seamless></iframe>';
		}
		
		$(".prevcontent").html(slam);
		
		$(".sharebutton").unbind("click").on("click", function(){
			$('.qrcontent').show();
			$('.pcontent').hide();
			
			$(".qrfilename").html(cradle.fname);
			
			qrdata = "-A"+cradle.id +"F"+cradle.fid+"U"+ files.cuserid;

			$('#qrcode').html("").qrcode(qrdata);
			
		});
		
		$(".qrcancel").unbind("click").on("click", function(){
			$('.qrcontent').hide(); 
			$('.pcontent').show();
		});
		
		$(".qrdelete").unbind("click").on("click", function(){
			files.fdelete();
		});

		//history.replaceState(currstate,"XXX");
		//console.log(history.state);

	},
	
	init:function()
	{
		$('.cname').html(cradle.name);
		$('.pname').html(app.username);
		cradle.showFiles();
		
		$(".cadd").unbind("vmousedown").on("vmousedown", function() {
			files.afclick();
		});
		
		$("#uploadfile").unbind("change").on("change", function() {
			files.afdone();
		});
		
		$("#upload_go").unbind("click").on("click", function() {
			files.afs();
		});
		
		$("#upload_cancel").unbind("click").on("click", function() {
			$('.ui-dialog').dialog('close');
		});
		
		$("#page_upload_cn").html(cradle.name);

	}
};








var files = {
	afile:null,
	afilename:null,
	aftype:null,
	afhash:null,
	afsig:null,
	afkey:null,
	afpolicy:null,
	afredirect:null,
	cid:null,
	cuserid:null,
	
	afclick: function()
	{
		$("#uploadfile").click();
	},
	
	afdone: function()
	{	
		$.mobile.changePage($("#page_upload"),  {transition: 'pop', role: 'dialog'});
		

		files.afile = $("#uploadfile")[0].files[0]
		
		files.afilename = $("#uploadfile").val();
		if(files.afilename == "")
			return;
		files.afilename = files.afilename.split('\\').pop();
		files.aftype = files.afile.type;
		files.fhash(files.afile);
		
		$("#afndisplay").html(files.afilename);
	},
	
	fhash: function(tfile)
	{
		if (window.File && window.FileReader && window.FileList && window.Blob) 
		{
			freader = new FileReader();
			freader.onloadend = function(event)
			{
				files.afhash = CryptoJS.MD5( CryptoJS.lib.WordArray.create( event.target.result) ) + '';
				$(".alert").fadeIn();
				//10901f7d50ea7dea2bf1d9001b1e3580
			}
			freader.readAsArrayBuffer(tfile);

		} 
		else 
		{
		  alert('The File APIs are not fully supported on this platform.');
		}
	},
	
	fdelete: function()
	{
		
		
		$.ajax({
		  type: "GET",
		  dataType: "json",
		  url: cradleurl+"/api/removeFile/?mobile",
		  data: { t:app.userkey, cradleid: cradle.id, fileid: cradle.fid }
		}).done(function( data ) {
			if(data)
			{
				console.log(data);
			}
			
	
			dirtybit = true;
			history.back();
			
		});	
	},
	
	afs: function()
	{
		
		$.ajax({
		  type: "GET",
		  dataType: "json",
		  url: cradleurl+"/api/uploadFileS3/?step=1",
		  data: { t:app.userkey, cradleid: cradle.id, hash: files.afhash, filename: files.afilename, type: files.aftype }
		}).done(function( data ) {
		  //alert( "Data Saved- File Id: " + data[0].sig );
		  files.afsig = data[0].sig;
		  files.afkey = data[0].key;
		  files.afpolicy = data[0].policy;
		  files.afredirect = data[0].redirect;
		  //alert(afpolicy);
		  files.dumbupload(files.afile);
		  //afupload(data[0]);
		  //location.reload();
		});
	},

	dumbupload: function(tfile)
	{
		tform = $("#uploadform");
		
		tform.attr('action', s3url);
		$("#AWSAccessKeyId").val(files.afkey);
		$("#Signature").val(files.afsig);
		$("#Content-Type").val(files.aftype);
		$("#key").val(files.afhash);
		$("#policy").val(files.afpolicy);
		$("#success_action_redirect").val(files.afredirect);
		console.log(files.afredirect);
		//AWSAccessKeyId
		//Signature
		//Content-Type
		dirtybit = true;
		tform.submit();
		//
		
	},
	
	showCradles: function(status)
	{
		
		API.getAll(files.displayCradles);
		
	},
	
	displayCradles: function()
	{
		
		cradles = JSON.parse(app.DB.getItem("cradledata"));
		
		
		slam = '<ul data-role="none">';
		for(x in cradles)
		{
			
			cname = cradles[x].fields.cradlename;
			files.cuserid = cradles[x].fields.user;
			
			cid = cradles[x].pk;
			slam += '<li class="fcradle plist" cradlename="'+cname+'" id="c'+cid+'" data-role="none">'+ cname + '</li>';
		}
		slam += '</ul>'; 
		//$('.filescontent').html(slam).trigger("create");
		$('.filescontent').html(slam);
		$(".fcradle").unbind("click").on("click", function(e) {
			cradle.id = e.target.id.slice(1);
			cradle.name = $(e.target).attr("cradlename");
			$.mobile.changePage("cradle.html");
		});	
	},
	
	init: function()
	{
		$('.pname').html(app.username);
		files.showCradles();
	}
	

};




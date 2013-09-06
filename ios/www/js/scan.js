var scan = {
    
    init : function()
    {
        
       $("#scanbutton").on("vmousedown", function() {
                           
                window.plugins.barcodeScanner.scan(scan.scandone, scan.scandfail);
				//result = {	text:"-A3F15U5"	}; // [A,D]cradleid, [F]fileid, [U]userid -D2F15 

				//scan.scandone(result);
      });
	   
    },
    
    scandone : function(result)
    {

		if(result.text.length > 0)
		{
			app.queue += result.text;
			app.SaveData();
			app.ProcessQueue(false,scan.previewFile);
		}

		
    },
	
	previewFile : function(e)
	{

		$.mobile.changePage($("#page_preview")); 		//$.mobile.changePage("preview.html");
		$('.qrcontent').hide();
		$('.pcontent').show();
		
		$('.prevcontent').hide();
		$('.foot').hide();
		$('.scanprevcontent').show();

		
		$(".scangreat").unbind("click").on("click", function(){
			dirtybit = true;
			history.back();
		});
		
		
		$(".scanmove").unbind("click").on("click", function(){
			
		});
		
		$(".scandelete").unbind("click").on("click", function(){
		
			tfile =  app.qcode.substring(app.qcode.indexOf("F"), app.qcode.indexOf("U")).substring(1);
		
			cradles = JSON.parse(app.DB.getItem("cradledata"));
			dcradle = false;
			for(y in cradles)
				if(cradles[y].fields.cradlename == "Download")
					dcradle = cradles[y].pk;
			if(!dcradle)
				dcradle = cradles[y];

			newcode = "-D"+dcradle+"F"+tfile;
			app.queue += newcode;
			app.SaveData();
			app.ProcessQueue(false,function()
			{
				dirtybit = true;
				history.back();
			});
		});

		//history.replaceState(currstate,"XXX");
		//console.log(history.state);

	},
    

     scanfail : function(e)
    {
        alert("failed "+e);
    }

};


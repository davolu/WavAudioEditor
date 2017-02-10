 /***
 WaveEditor.js is a simple Javascript libary that allows manipulation of canonical wave file(s).
 Supports:  *Cutting/Splitting
            *Joining/Appending
			*Mixing/Merging (mix() and mixBuffers());
	        *Get header 
			
			
			
/****			
The resulting wave file can be downloaded or played.

 (c)Oluyale David 2015...
  
 ***/
 
 
 
   
  function WaveEditor(){}
  
  
     /**********************METHODS FOR GETTING THE HEADER************************/
	 
 WaveEditor.prototype.getChunkID       =   function(buffer)
 {
 
   var chunkID        =  new Uint8Array(buffer,0,4);
 return CharCodetoText(chunkID);
 
 }
  
 WaveEditor.prototype.getChunkSize     =   function(buffer)
 {
 
    var chunkSize      =  new Uint8Array(buffer,4,4);
 
    return EndianDecToDecimal(chunkSize);
 }
  
 WaveEditor.prototype.getFormat        =   function(buffer)
 {
 
 
    var Format         =  new Uint8Array(buffer,8,4);
    return CharCodetoText(Format);
 }
  
 WaveEditor.prototype.getChunkID2      =   function(buffer)
 {
 
 
    var chunkID2       =  new Uint8Array(buffer,12,4);
    return CharCodetoText(chunkID2);
}
  
 WaveEditor.prototype.getChunkSize2    =   function(buffer)
 {
 
 
    var chunkSize2     =  new Uint8Array(buffer,16,4);
   return EndianDecToDecimal(chunkSize2);
 }
  
 WaveEditor.prototype.getAudioFormat   =   function(buffer)
 { 
 
    var AudioFormat    =  new Uint8Array(buffer,20,2);
 
    return EndianDecToDecimal(AudioFormat);
 }
  
 WaveEditor.prototype.getNumChannels   =   function(buffer)
 { 
 
 
    var NumChannels    =  new Uint8Array(buffer,22,2);
    return EndianDecToDecimal(NumChannels); 
 }
  
 WaveEditor.prototype.getSampleRate    =   function(buffer)
 { 
 
    var SampleRate     =  new Uint8Array(buffer,24,4);
 
    return EndianDecToDecimal(SampleRate); 
 }
  
 WaveEditor.prototype.getByteRate      =   function(buffer)
 {
 
 
    var ByteRate       =  new Uint8Array(buffer,28,4);
   return EndianDecToDecimal(ByteRate);
 }
  
 WaveEditor.prototype.getBlockAlign    =   function(buffer)
 { 
 
 
    var BlockAlign     =  new Uint8Array(buffer,32,2);
    return EndianDecToDecimal(BlockAlign); 
 }
  
 WaveEditor.prototype.getBitsPerSample =   function(buffer)
 {

 
    var bps            =  new Uint8Array(buffer,34,2);
    return EndianDecToDecimal(bps); 
 }
  
 WaveEditor.prototype.getChunkID3      =   function(buffer)
 {
 
 
    var chunkID3       = new Uint8Array(buffer,36,4);
   return CharCodetoText(chunkID3); 
 }
  
 WaveEditor.prototype.getChunkSize3    =   function(buffer)
 {
 
    var chunkSize3     = new Uint8Array(buffer,40,4);
   
     return EndianDecToDecimal(chunkSize3);
	
 }
  
 WaveEditor.prototype.getRawData       =    function(buffer)
 {
    
    var chunkSize3     = new Uint8Array(buffer,40,4);
    var SAMPLES        =  new Uint8Array(buffer,44, EndianDecToDecimal(chunkSize3)); //Raw data
    
   return SAMPLES;
 }

WaveEditor.prototype.getDuration   = function(buffer)
{


return Math.floor(this.getRawData(buffer).byteLength/this.getByteRate(buffer));	

}
 
 
 WaveEditor.prototype.appendBuffers = function(arr,mode,filename)
 {
 
   var BufferHolder   = [];  //An empty array to hold the buffers.
   var headerBuf = new ArrayBuffer(44);
   var dv  =  new DataView(headerBuf);
   
                    wStr(dv,0,4,this.getChunkID(arr[0]));
					wStr(dv,8,4, this.getFormat(arr[0]));
					
					
					wStr(dv,12,4,this.getChunkID2(arr[0]));
					w32(dv,16,4,this.getChunkSize2(arr[0]));
					w16(dv,20,2,this.getAudioFormat(arr[0]));
					w16(dv,22,2,this.getNumChannels(arr[0]) );
					w32(dv,24,4,this.getSampleRate(arr[0]));
					w32(dv,28,4,this.getByteRate(arr[0]));
					w16(dv,32,2,this.getBlockAlign(arr[0]));
					w16(dv,34,2,this.getBitsPerSample(arr[0]));
					
					
					wStr(dv,36,4,this.getChunkID3(arr[0]));
					
   
   
   
   
   
   //Strip the header (44bytes) from the rest of the buffers.
   //So we are left with just the raw data.
   //The total gives the datasize.
       var dataLen=0;
       for(b=0; b<arr.length; b++)
	    {
		  BufferHolder.push(this.getRawData(arr[b]));
		  dataLen+= this.getRawData(arr[b]).byteLength;
		
		
		}
   
         //console.log(dataLen +'a '+ BufferHolder.length);
		 
		 			w32(dv,4,4,dataLen+36);
					w32(dv,40,4,dataLen);
					
					
					 if(mode ==='download')
					 {
					 
//.......................................DOWNLOAD..............................................///
						var blob  = new Blob([headerBuf].concat(BufferHolder),{type:'audio/wav'});
						
						downloadLink= document.createElement('a');
						downloadLink.download= filename;
						downloadLink.href= window.webkitURL.createObjectURL(blob);
						downloadLink.click();
					 }
					 else if(mode ==='play')
					 {
					  var blob  = new Blob([headerBuf].concat(BufferHolder),{type:'audio/wav'});
						var aud = new Audio();
						aud.src=window.webkitURL.createObjectURL(blob);
						aud.play();
					 
					 }
					 else if(mode ==='blob')
					 {
					  var blob  = new Blob([headerBuf].concat(BufferHolder),{type:'audio/wav'});
					
					 	return blob;
					 
					 }
					 else{}
					 
 }
 
 
 WaveEditor.prototype.mix = function(arrm,modem,filenamem)
 {
     
	
	  dataLen2=0;
	  
	  var headerBuf2 = new ArrayBuffer(44);
      var dv2  =  new DataView(headerBuf2);
   
                    wStr(dv2,0,4,this.getChunkID(arrm[0]));
					wStr(dv2,8,4, this.getFormat(arrm[0]));
					
					
					wStr(dv2,12,4,this.getChunkID2(arrm[0]));
					w32(dv2,16,4,this.getChunkSize2(arrm[0]));
					w16(dv2,20,2,this.getAudioFormat(arrm[0]));
					w16(dv2,22,2,this.getNumChannels(arrm[0]) );
					w32(dv2,24,4,this.getSampleRate(arrm[0]));
					w32(dv2,28,4,this.getByteRate(arrm[0]));
					w16(dv2,32,2,this.getBlockAlign(arrm[0]));
					w16(dv2,34,2,this.getBitsPerSample(arrm[0]));
					
					
 					wStr(dv2,36,4,this.getChunkID3(arrm[0]));
					
   var dataLen2=0;
       for(b=0; b<arrm.length; b++)
	    {
		  
		  dataLen2+= this.getRawData(arrm[b]).byteLength;
		
		
		}
		SAMPLES= this.getRawData(arrm[0]);
		SAMPLES2 = this.getRawData(arrm[1]);
		var bSAMPLES;
		var sSAMPLES;
		
		if(SAMPLES.byteLength > SAMPLES2.byteLength)
		{
		    bSAMPLES = SAMPLES;
			sSAMPLES = SAMPLES2;
		}
		else
		{
		    bSAMPLES = SAMPLES2;
			sSAMPLES = SAMPLES;
		}
		
					   for(m=0; m<sSAMPLES.length; m++)
			   {
			   
			            
				
				    bSAMPLES[m] +=  sSAMPLES[m];
				     
				 
				  
			   
			   }
		
		
		
		
		 			w32(dv2,4,4,dataLen2+36);
					w32(dv2,40,4,dataLen2);
					
					
					 if(modem ==='download')
					 {
					 
//.......................................DOWNLOAD..............................................///
						var blob  = new Blob([headerBuf2,bSAMPLES],{type:'audio/wav'});
						
						downloadLink= document.createElement('a');
						downloadLink.download= filenamem;
						downloadLink.href= window.webkitURL.createObjectURL(blob);
						downloadLink.click();
					 }
					 else if(modem ==='play')
					 {
					  var blob  = new Blob([headerBuf2, bSAMPLES],{type:'audio/wav'});
						var aud = new Audio();
						aud.src=window.webkitURL.createObjectURL(blob);
						aud.play();
					 
					 }
					 else if(modem ==='blob')
					 {
					 var blob  = new Blob([headerBuf2, bSAMPLES],{type:'audio/wav'});
						//return blob;
					  return bSAMPLES;
					 }
					 
					 else{}
					 
			  
 }
 
 WaveEditor.prototype.mixBuffers= function(arr,modem,filenamem)
 {
   
	  var headerBuf3 = new ArrayBuffer(44);
      var dv3  =  new DataView(headerBuf3);
   
   
     var DHolder =[];
	 var DD=[];
	 var Dlen    = 0;
	      
		  for(s=0; s<arr.length; s++)
		  {
		  
		     DHolder.push(this.getRawData(arr[s]));
			 Dlen+=this.getRawData(arr[s]).byteLength;
			 DD.push(this.getRawData(arr[s]).byteLength);
		  
		  }
		  
		  DD.sort(function(a,b){return a-b});
		  var max = DD[DD.length-1];
          var min = DD[0];
          var SAMPLES1,SAMPLES2;	
var x;		  
				  
				  for(dh=0; dh<DHolder.length; dh++)
			{
				  if(DHolder[dh].byteLength === max)
				 {
				    SAMPLES1= DHolder[dh];
					
				  x=dh;
				 }
				 else if(DHolder[dh].byteLength === min)
				 {
				 
				    SAMPLES2 = DHolder[dh];
				 }
				 
			}
				  
				  
				  
          
		  for(i=0; i<arr.length; i++)
		   {
		   
		   
		      for(f=0; f<SAMPLES2.byteLength; f++)
			  {
			    SAMPLES1[f]+= DHolder[i][f];
				 
			  }
		   
		   
		   }
                    wStr(dv3,0,4,this.getChunkID(arr[x]));
					wStr(dv3,8,4, this.getFormat(arr[x]));
					
					
					wStr(dv3,12,4,this.getChunkID2(arr[x]));
					w32(dv3,16,4,this.getChunkSize2(arr[x]));
					w16(dv3,20,2,this.getAudioFormat(arr[x]));
					w16(dv3,22,2,this.getNumChannels(arr[x]) );
					w32(dv3,24,4,this.getSampleRate(arr[x]));
					w32(dv3,28,4,this.getByteRate(arr[x]));
					w16(dv3,32,2,this.getBlockAlign(arr[x]));
					w16(dv3,34,2,this.getBitsPerSample(arr[x]));
					
					
					wStr(dv3,36,4,this.getChunkID3(arr[x]));
		
		 			w32(dv3,4,4,Dlen+36);
					w32(dv3,40,4,Dlen);
		   
		     
					 if(modem ==='download')
					 {
					 
//.......................................DOWNLOAD..............................................///
						var blob  = new Blob([headerBuf3,SAMPLES1],{type:'audio/wav'});
						
						downloadLink= document.createElement('a');
						downloadLink.download= filenamem;
						downloadLink.href= window.webkitURL.createObjectURL(blob);
						downloadLink.click();
					 }
					 else if(modem ==='play')
					 {
					  var blob  = new Blob([headerBuf3, SAMPLES1],{type:'audio/wav'});
						var aud = new Audio();
						aud.src=window.webkitURL.createObjectURL(blob);
						aud.play();
					 
					 }
					 else if(modem ==='blob')
					 {
					 var blob  = new Blob([headerBuf3, SAMPLES1],{type:'audio/wav'});
						return blob;
					 
					 }
					 
					 else{}
   
 //EOF
 }
 
 
 
 WaveEditor.prototype.cutBuffer = function(buffer,cutFactor,modem,filenamem)
 {
   
	  var headerBuf4 = new ArrayBuffer(44);
      var dv4  =  new DataView(headerBuf4);
	  
	  var cut = new Uint8Array(buffer,44,this.getChunkSize3(buffer)/cutFactor);
	  
	  
                   wStr(dv4,0,4,this.getChunkID(buffer));
					wStr(dv4,8,4, this.getFormat(buffer));
					
					
					wStr(dv4,12,4,this.getChunkID2(buffer));
					w32(dv4,16,4,this.getChunkSize2(buffer));
					w16(dv4,20,2,this.getAudioFormat(buffer));
					w16(dv4,22,2,this.getNumChannels(buffer) );
					w32(dv4,24,4,this.getSampleRate(buffer));
					w32(dv4,28,4,this.getByteRate(buffer));
					w16(dv4,32,2,this.getBlockAlign(buffer));
					w16(dv4,34,2,this.getBitsPerSample(buffer));
					
					
					wStr(dv4,36,4,this.getChunkID3(buffer));
		
		 			w32(dv4,4,4,cut.byteLength+36);
					w32(dv4,40,4,cut.byteLength);
					
					 if(modem ==='download')
					 {
					 
//.......................................DOWNLOAD..............................................///
						var blob  = new Blob([headerBuf4,cut],{type:'audio/wav'});
						
						downloadLink= document.createElement('a');
						downloadLink.download= filenamem;
						downloadLink.href= window.webkitURL.createObjectURL(blob);
						downloadLink.click();
					 }
					 else if(modem ==='play')
					 {
					  var blob  = new Blob([headerBuf4, cut],{type:'audio/wav'});
						var aud = new Audio();
						aud.src=window.webkitURL.createObjectURL(blob);
						aud.play();
					 
					 }
					 else if(modem ==='blob')
					 {
					 var blob  = new Blob([headerBuf4, cut],{type:'audio/wav'});
						return blob;
					 
					 }
					 
					 else{}
 
 }
 
 
  
  
 //////MISC////////////////
 
    function wStr(dataview,offset,size,Str)//4....4
      {
      
	   if(size> Str.length)
	     {
		     size = Str.length;
		 }
  
       for(i=0; i<size; i++)
	 {
           
		   
	     dataview.setUint8(offset+i,Str[i].charCodeAt(),false); //Big Endian
		 
	 }
 
 }
 
 
 function w32(dataview,offset,size,num)
 {  
        dataview.setUint32(offset,num,true);  //Little Endian...
		
 
 }
 
 function w16(dataview,offset,size,num)
 {
           dataview.setUint16(offset,num,true);  //Little Endian...
	 
}
 
 
 
 
 
 
 
 
 
	
 
  
  
  
  
  
  
  
 //----------------------------------SOME FUNCTIONS I BORROWED(MODIFIED) FROM wav.js --------// 
   /**** Function to Convert ASCII codes to their equivalent letter (char)  ****/
		function CharCodetoText(code){
			var str='';
			this.code=code;

			for(i=0; i<this.code.length; i++)

			str+=String.fromCharCode(this.code[i]);
										
			return str;
									}
									
 /**** Function to Convert Endian Decimal to Decimal ****/
	function  EndianDecToDecimal(EndianEncoding){
 
    this.e=EndianEncoding;
    var sum = 0;
    for(var i = 0; i < this.e.length; i++)
     sum |= this.e[i] << (i*8);
    return sum;
                                                }
												
									
	/****Function to Convert Decimal to Endian Decimal*****/
    function DecimalToEndianDec(a,d){
 
    this.d= d;
 
    for(var i=0; i<a.length; i++) {
      a[i] = d & 0xFF;
      d >>= 8;
                                   }
      return a;
 
                                   }
 
  
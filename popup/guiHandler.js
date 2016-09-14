function updateDiv(div, content){
  div=document.getElementById(div); 
  div.innerHTML=content;
}

function setView(default_, thanks, already){  
  if(document.getElementById('default').style.display!=default_)
    document.getElementById('default').style.display=default_;
  if(document.getElementById('thanks').style.display!=thanks)
    document.getElementById('thanks').style.display=thanks;
  if(document.getElementById('already').style.display!=already)
    document.getElementById('already').style.display=already;
}

function checkURL(msg){
  var done=false;

  if(document.getElementById('white').style.display!='none')
    document.getElementById('white').style.display='none';
  if(document.getElementById('black').style.display!='none')
    document.getElementById('black').style.display='none';
  if(document.getElementById('grey').style.display!='none')
    document.getElementById('grey').style.display='none';
  if(msg.msg=='white'){
    setView('none','none','none');
    if(document.getElementById('white').style.display!='block')
      document.getElementById('white').style.display='block';
    done = true;
  }
  else if(msg.msg=='black' || msg.msg=='ignored'){
    setView('none','none','none');
    if(document.getElementById('black').style.display!='block')
      document.getElementById('black').style.display='block';
    done = true;
  }
  else if(msg.msg=='grey'){
    //sanitize input
    nFraud=msg.nFraud;
    if(isNaN(nFraud))
      nFraud='error';
    nGood=msg.nGood;
    if(isNaN(nGood))
      nGood='error';

    setView('none','none','none');
    document.getElementById("nReports").innerHTML=nFraud;
    document.getElementById("nControReports").innerHTML=nGood;
    if(msg.local!=null){
      document.getElementById("fraudulent").style.borderColor='red';
      document.getElementById("non-fraudulent").style.borderColor='#060606';
      document.getElementById("dontknow").style.borderColor='#060606';
    }
    else if(msg.conLocal!=null){
      document.getElementById("fraudulent").style.borderColor='#0606060';
      document.getElementById("non-fraudulent").style.borderColor='red';
      document.getElementById("dontknow").style.borderColor='#060606';
    }
    else{
      document.getElementById("fraudulent").style.borderColor='#060606';
      document.getElementById("non-fraudulent").style.borderColor='#060606';
      document.getElementById("dontknow").style.borderColor='red';
    }
    if(document.getElementById('grey').style.display!='block')
      document.getElementById('grey').style.display='block';
    done = true;
  }
  else{
    if(document.getElementById('white').style.display!='none')
      document.getElementById('white').style.display='none';
    if(document.getElementById('black').style.display!='none')
      document.getElementById('black').style.display='none';
    if(document.getElementById('grey').style.display!='none')
      document.getElementById('grey').style.display='none'; 
    done = false;
  }

  if(done)
    setView('none','none','none');
  else if(msg.local!=null)
    setView('none','none','block');
  else
    setView('block','none','none');
}


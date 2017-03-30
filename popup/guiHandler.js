function checkDisplay(el, val){
  return document.getElementById(el).style.display!=val;
}

function setDisplay(el, val){
  document.getElementById(el).style.display=val;
}

function checkVisibility(el, val){
  return document.getElementById(el).style.visibility!=val;
}

function setVisibility(el, val){
  document.getElementById(el).style.visibility=val;
}

function checkSelected(el){
  return document.getElementById(el).style.borderColor=='red';
}

function setSelected(el){
  return document.getElementById(el).style.borderColor='red';
}

function setUnselected(el){
  return document.getElementById(el).style.borderColor='#060606';
}

function updateDiv(div, content){
  div=document.getElementById(div);
  div.innerHTML=content;
}

function showOffline(){
  setView('none','none','none');
  if(checkDisplay('offline','block'))
    setDisplay('offline','block');
}

function setView(default_, thanks, already){
  if(checkDisplay('default',default_))
    setDisplay('default',default_);
  if(checkDisplay('thanks',thanks))
    setDisplay('thanks',thanks);
  if(checkDisplay('already',already))
    setDisplay('already',already);
}

function checkURL(msg){
  var done=false;

  if(checkDisplay('white','none'))
    setDisplay('white','none');
  if(checkDisplay('black','none'))
    setDisplay('black','none');
  if(checkDisplay('grey','none'))
    setDisplay('grey','none');
  if(msg.msg=='white'){
    setView('none','none','none');
    if(checkDisplay('white','block'))
      setDisplay('white','block');
    done = true;
  }
  else if(msg.msg=='black' || msg.msg=='ignored'){
    setView('none','none','none');
    if(checkDisplay('black','block'))
      setDisplay('black','block');
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
      setSelected("fraudulent")
      setUnselected("non-fraudulent")
      setUnselected("dontknow")
    }
    else if(msg.conLocal!=null){
      setUnselected("fraudulent")
      setSelected("non-fraudulent")
      setUnselected("dontknow")
    }
    else{
      setUnselected("fraudulent")
      setUnselected("non-fraudulent")
      setSelected("dontknow")
    }
    if(checkDisplay('grey','block'))
      setDisplay('grey','block');
    done = true;
  }
  else{
    if(checkDisplay('white','none'))
      setDisplay('white','none');
    if(checkDisplay('black','none'))
      setDisplay('black','none');
    if(checkDisplay('grey','none'))
      setDisplay('grey','none');
    done = false;
  }

  if(done)
    setView('none','none','none');
  else if(msg.local!=null)
    setView('none','none','block');
  else
    setView('block','none','none');
}

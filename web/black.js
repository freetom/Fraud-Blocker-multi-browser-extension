var status = 0;
function show() {
    if (status == 0) {

        document.getElementsByClassName('more')[0].style.display = 'block';
        document.getElementsByClassName('btn')[0].innerHTML = 'LESS INFO';
        status = 1; 

    } else {
        
        document.getElementsByClassName('more')[0].style.display = 'none';
        document.getElementsByClassName('btn')[0].innerHTML = 'MORE INFO';
        status = 0;
    }
}

function init(){
    document.getElementsByClassName('btn')[0].onclick = show;
}

document.addEventListener("DOMContentLoaded",init);

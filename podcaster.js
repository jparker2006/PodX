"use strict";

onload = () => {
    Header();
    ControlBar();
    MainFrame();
}

const Header = () => {
    let sPage = "";
    sPage += "<div class='g_HeaderContainer center'>";
    sPage += "<div class='g_HeaderLinkContainer'>";
    sPage += "<div class='g_HeaderName' onClick='MainFrame()'>Podcaster</div>";
    sPage += "<div class='g_HeaderLink' style='width: 116px; left: 168px;'>Subscriptions</div>";
    sPage += "<div class='g_HeaderLink' style='width: 61px; left: 298px;'>History</div>";
    sPage += "<div class='g_HeaderLink' style='width: 98px; left: 373px;'>Bug Report</div>";
    sPage += "<div class='g_HeaderLink' style='width: 72px; left: 485px;'>Account</div>";
    sPage += "<div class='g_HeaderLink' style='width: 26px; left: 571px;'>";
    sPage += "<a href='https://github.com/jparker2006/Podcasts' class='g_headerLinkText'>Git</a>";
    sPage += "</div>";
    sPage += "</div>";
    sPage += "</div>";
    document.getElementById('g_Header').innerHTML = sPage;
}

const ControlBar = () => {
    let sPage = "";
    sPage += "<img id='g_currentPlaying' class='g_currentPlaying' src='https://jakehenryparker.com/Reststop/working.png' />";
    sPage += "<button class='g_audioButton'><img src='img/rewind.png' class='g_audioButtonIcon' style='margin-right: 4px;' /></button>";
    sPage += "<button class='g_audioButton'><img src='img/play.png' class='g_audioButtonIcon' /></button>";
    sPage += "<button class='g_audioButton'><img src='img/forward.png' class='g_audioButtonIcon' /></button>";
    sPage += "<img src='img/mute.png' class='g_volumeIcon' style='left: 379px;' />";
    sPage += "<input type='range' class='g_timeRange g_audioRange center' min=0 max=1 step=any value=0.5 onChange='dragAudio()'>";
    sPage += "<img src='img/fullvolume.png' class='g_volumeIcon' style='left: 557px;' />";
    sPage += "<div id='g_timeScroller' class='g_timeScroller'>";
    sPage += "<div class='g_timeStampContainer'>0:00:00</div>"; // change to x:00 if podcast < 60 minutes
    sPage += "<input type='range' class='g_timeRange center' min=0 max=1 step=any value=0>";
    sPage += "<div class='g_timeStampContainer g_rightTimeStampContainer'>0:00:00</div>";
    sPage += "</div>";
    sPage += "<div id='g_currentTitle' class='g_currentTitle'>Podcaster</div>";
    sPage += "<audio id='g_player'></audio>";
    document.getElementById('g_Audio').innerHTML = sPage;
}

const MainFrame = () => {
    let sPage = "";
    sPage += "<div>";

    sPage += "<div id='podcastsDisplay'>";
    sPage += "</div>";

    sPage += "</div>";
    document.getElementById('Main').innerHTML = sPage;
    pullPodcasts();
}

const pullPodcasts = (sSearch = 1) => {
    postFileFromServer("main.php", "pullPodcasts=" + encodeURIComponent(sSearch), pullPodcastsCallback);
    function pullPodcastsCallback(data) {
        displayPodcasts(data);
    }
}

const displayPodcasts = (jsonPodcasts) => {
    if (!jsonPodcasts) {
        document.getElementById('podcastsDisplay').innerHTML = "no podcasts within your search<br>insert this podcast?";
        return;
    }
    let objPodcasts = JSON.parse(jsonPodcasts);
    let sPage = "";
    for (let i=0; i<objPodcasts.length; i++) {
        sPage += objPodcasts[i].title + "<br>";
    }
    document.getElementById('podcastsDisplay').innerHTML = sPage;
}

const dragAudio = () => {
    alert();
}
















const HashThis = (sText, nRounds) => {
    for (let x = 0; x < nRounds; x++) {
        sText = sha3_256(sText);
    }
    return sText;
}

const setCookie = (c_name, value, exdays) => {
    var exdate=new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var c_value=escape(value) + ((exdays===null) ? '' : '; expires='+exdate.toUTCString());
    document.cookie=c_name + '=' + c_value;
}

const getCookie = (c_name) => {
    var i,x,y,ARRcookies = document.cookie.split(';');
    for (i=0;i<ARRcookies.length;i++) {
        x=ARRcookies[i].substr(0,ARRcookies[i].indexOf('='));
        y=ARRcookies[i].substr(ARRcookies[i].indexOf('=')+1);
        x=x.replace(/^\s+|\s+$/g,'');
        if (x===c_name)
            return unescape(y);
    }
}

const postFileFromServer = (url, sData, doneCallback) => {
    var xhr;
    xhr = new XMLHttpRequest();
    xhr.onreadystatechange = handleStateChange;
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send(sData);
    function handleStateChange() {
        if (xhr.readyState === 4) {
            doneCallback(xhr.status == 200 ? xhr.responseText : null);
        }
    }
}

const getRandomInt = (min, max) => {
    var rval = 0;
    var range = max - min;
    var bits_needed = Math.ceil(Math.log2(range));
    if (bits_needed > 53) {
        throw new Exception("We cannot generate numbers larger than 53 bits.")
    }
    var bytes_needed = Math.ceil(bits_needed / 8);
    var mask = Math.pow(2, bits_needed) - 1;
    var byteArray = new Uint8Array(bytes_needed);
    window.crypto.getRandomValues(byteArray);
    var p = (bytes_needed - 1) * 8;
    for (var i = 0; i < bytes_needed; i += 1) {
        rval += byteArray[i] * Math.pow(2, p);
        p -= 8
    }
    rval = rval & mask;
    if (rval >= range) {
        return getRandomInt(min, max);
    }
    return min + rval;
}

const GetRandomCharacter = () => {
    var sChar = ["a","b","c","d","e",
        "f","g","h","i","j","k","l","m",
        "n","o","p","q","r","s","t","u",
        "v","w","x","y","z",
        "A","B","C","D","E","F","G","H",
        "I","J","K","L","M","N","O","P",
        "Q","R","S","T","U","V","W","X",
        "Y","Z",
        "0","1","2","3","4","5","6","7",
        "8","9","-","~","@",".","*","(",
        ")","_","+","#","="];
    return sChar[getRandomInt(0, sChar.length - 1)]
}

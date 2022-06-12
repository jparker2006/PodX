"use strict";

/*
screen states:
- screen doesnt matter: -1,
- main frame: 0,
- bug frame: 1
*/

var g_objUserData = {};
g_objUserData.state = -1;

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
    sPage += "<div class='g_HeaderLink' style='width: 98px; left: 373px;' onClick='BugFrame()'>Bug Report</div>";
    sPage += "<div class='g_HeaderLink' style='width: 72px; left: 485px;'>Account</div>";
    sPage += "<div class='g_HeaderLink' style='width: 26px; left: 571px;'>";
    sPage += "<a href='https://github.com/jparker2006/Podcasts' class='g_headerLinkText' target='_blank'>Git</a>";
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
    if (0 == g_objUserData.state) return;
    let sPage = "";
    sPage += "<div class='leftContainer'>";
    sPage += "<div class='innerLeft'>";
    sPage += "<span style='font-size: 20px;'>Search for podcasts:</span><br>";
    sPage += "<input style='width: 90%;' onKeyUp='checkTypingDelay(this.value)' placeholder='Enter Search' />";
    sPage += "</div>";
    sPage += "</div>";
    sPage += "<div id='podcastsDisplay' class='podcastsDisplay'>";
    sPage += "</div>";
    document.getElementById('Main').innerHTML = sPage;
    pullPodcasts();
    g_objUserData.state = 0;
}

const BugFrame = () => {
    if (1 == g_objUserData.state) return;
    let sPage = "";
    sPage += "<div class='leftContainer'>";
    sPage += "<div class='innerLeft'>";
    sPage += "<span style='font-size: 20px; font-weight: 500;'>Current Bugs:</span><br>";
    sPage += "<div id='allBugs'></div>";
    sPage += "</div>";
    sPage += "</div>";
    sPage += "<div id='podcastsDisplay' class='podcastsDisplay'>";
    sPage += "<textarea id='bugData' class='bugInsertTextBox' maxlength=300 placeholder='What are you having problems with?'></textarea>";
    sPage += "<button class='bugInsertButton' onClick='submitBug()'>Submit!</button>";
    sPage += "<span id='feedback'></span>";
    sPage += "</div>";
    document.getElementById('Main').innerHTML = sPage;
    showMeTheBugs();
    g_objUserData.state = 1;
}

const PodcastOverviewFrame = (xmlDoc) => {
    let sTitle = xmlDoc.getElementsByTagName("title")[0].childNodes[0].nodeValue;
    let sDescription = xmlDoc.getElementsByTagName("description")[0].childNodes[0].nodeValue;
    let sImgURL = xmlDoc.getElementsByTagName("url")[0].childNodes[0].nodeValue;
    let aItems = xmlDoc.getElementsByTagName("item");
    let sPage = "";
    sPage += "<div class='leftContainer'>";
    sPage += "<div class='innerLeft'>";
    sPage += "<span style='font-size: 17px; font-weight: 500;'>" + sTitle + "</span><br>";
    sPage += "<img src='" + sImgURL + "' style='width: 120px; height: 120px;'</img><br>";
    sPage += "<input id='episodeSearch' style='width: 200px;' placeholder='Search for an Episode' /><br>";
    sPage += "<span style='font-size: 12px;'>" + sDescription + "</span><br>";
    sPage += "</div>";
    sPage += "</div>";
    sPage += "<div class='podcastsDisplay'>";
    sPage += "<span style='font-size: 20px;'>Episodes:</span><br>";
    sPage += "<div id='episodesDisplay'></div>";
    sPage += "</div>";
    document.getElementById('Main').innerHTML = sPage;
    g_objUserData.state = -1;
    document.getElementById('episodeSearch').onkeyup = function() { searchThroughEpisodes(aItems) };
    searchThroughEpisodes(aItems);
}

const searchThroughEpisodes = (aItems) => {
    let sPage = "";
    let sQuery = document.getElementById('episodeSearch').value;
    for (let i=0; i<aItems.length; i++) {
        let sCurrTitle = aItems[i].firstElementChild.textContent;
        if (-1 == sCurrTitle.toLowerCase().indexOf(sQuery.toLowerCase()))
            continue;
        sPage += "<div id='"+i+"' class='episodeTitleDisplay'>";
        sPage += sCurrTitle;
        sPage += "</div>";
    }
    document.getElementById('episodesDisplay').innerHTML = sPage;
    for (let i=0; i<aItems.length; i++) {
        document.getElementById(i).onclick = function() { playPodcast(aItems[i]) };
    }
}

const playPodcast = (objEpisode) => {
    console.log(objEpisode);
}

const showMeTheBugs = () => {
    postFileFromServer("podcaster.php", "pullBugs=" + encodeURIComponent(1), showMeTheBugsCallback);
    function showMeTheBugsCallback(data) {
        if (!data) {
            let sPage = "No current bugs, find some!<br>";
            sPage += "<div class='fixBugsContainer'>";
            sPage += "<a href='https://github.com/jparker2006/Podcasts' class='g_headerLinkText fixBugsLink' target='_blank'>Improve the platform</a>";
            sPage += "</div>";
            document.getElementById('allBugs').innerHTML = sPage;
            return;
        }
        let objBugs = JSON.parse(data);
        let sPage = "";
        for (let i=0; i<objBugs.length; i++) {
            sPage += "<div style='margin-bottom: 5px;'>" + objBugs[i].bug + "</div>";
        }
        sPage += "<div class='fixBugsContainer'>";
        sPage += "<a href='https://github.com/jparker2006/Podcasts' class='g_headerLinkText fixBugsLink' target='_blank'>Help fix some bugs</a>";
        sPage += "</div>";
        document.getElementById('allBugs').innerHTML = sPage;
    }
}

const submitBug = () => {
    let sBug = document.getElementById('bugData').value;
    if (!sBug) {
        document.getElementById('feedback').innerHTML = "<br>Bugs must have content";
        return;
    }
    postFileFromServer("podcaster.php", "insertBug=" + encodeURIComponent(sBug), insertBugCallback);
    function insertBugCallback(data) {
        document.getElementById('bugData').value = "";
        if (data) {
            document.getElementById('feedback').innerHTML = "<br>Thank you!<br>This will be resolved as soon as possible";
            return;
        }
        else
            document.getElementById('feedback').innerHTML = "<br>Possible network error";
    }
}

const checkTypingDelay = (sSearch) => {
    g_objUserData.ajaxing = sSearch.length;
    setTimeout(function() {
        if (sSearch.length == g_objUserData.ajaxing)
            pullPodcasts(sSearch);
    }, 500);
}

const parseRSSLink = (sLink, functionCall) => {
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (4 == this.readyState && 200 == this.status)
            functionCall(this.responseXML);
    };
    xmlhttp.open("GET", sLink, true);
    xmlhttp.send();
}

const pullPodcasts = (sSearch) => {
    let objPullData = {};
    if (!sSearch) {
        if (15 <= document.getElementById('podcastsDisplay').innerHTML.split("podcastResult").length) // so spamming del key doesnt overload the server
            return;
        objPullData.bSearching = false;
    }
    else {
        objPullData.bSearching = true;
        objPullData.search = sSearch;
    }
    let jsonPullData = JSON.stringify(objPullData);
    postFileFromServer("podcaster.php", "pullPodcasts=" + encodeURIComponent(jsonPullData), pullPodcastsCallback);
    function pullPodcastsCallback(data) {
        if (!data) {
            document.getElementById('podcastsDisplay').innerHTML = "<span style='font-size: 20px;'>no podcasts within your search<br>insert a podcast?</span>";
            return;
        }
        let objPodcasts = JSON.parse(data);
        let sPage = "<span style='font-size: 20px;'>Podcasts Within Search:</span><br>";
        for (let i=0; i<objPodcasts.length; i++) {
            sPage += "<div class='podcastResult' onClick='parseRSSLink(\"" + objPodcasts[i].link + "\", PodcastOverviewFrame)'>"; // fix this out of quote hell
            sPage += objPodcasts[i].title;
            sPage += "</div>";
        }
        document.getElementById('podcastsDisplay').innerHTML = sPage;
    }
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

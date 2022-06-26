"use strict";

/*
screen states:
- screen doesnt matter: -1
- main: 0
- bug: 1
- sign up: 2
- log in: 3
- account: 4
- subscriptions: 5
- add pod: 6
- the latest: 7
*/

var g_objUserData = {};
g_objUserData.state = -1;

onload = () => {
    let UN = getCookie('UN');
    let PW = getCookie('PW');
    if (UN && PW)
        Login(UN, PW);
    else
        g_objUserData.data = [];
    Header();
    ControlBar();
    MainFrame();
}

const Header = () => {
    let sPage = "";
    sPage += "<div class='g_HeaderContainer center'>";
    sPage += "<div class='g_HeaderLinkContainer'>";
    sPage += "<div class='g_HeaderName' onClick='MainFrame()'>Podcaster</div>";
    sPage += "<div class='g_HeaderLink' style='width: 116px; left: 160px;' onClick='GoToSubscriptions()'>Subscriptions</div>";
    sPage += "<div class='g_HeaderLink' style='width: 98px; left: 283px; text-align: center;' onClick='GoToTheLatest()'>The Latest</div>";
    sPage += "</div>";
    sPage += "</div>";
    document.getElementById('g_Header').innerHTML = sPage;
}

const ControlBar = () => {
    let sPage = "";
    sPage += "<img id='g_currentPlaying' class='g_currentPlaying' src='https://jakehenryparker.com/Reststop/working.png' />";
    sPage += "<button class='g_audioButton' onClick='moveAudioPosition(" + false + ")'><img src='img/rewind.png' class='g_audioButtonIcon' style='margin-right: 4px;' /></button>";
    sPage += "<button class='g_audioButton' onClick='updatePlayingStateButton()'><img src='img/play.png' id='playingState' class='g_audioButtonIcon' /></button>";
    sPage += "<button class='g_audioButton' onClick='moveAudioPosition(" + true + ")'><img src='img/forward.png' class='g_audioButtonIcon' /></button>";
    sPage += "<img src='img/mute.png' class='g_volumeIcon mute' onClick='dragAudio(0)' />";
    sPage += "<input id='volumeRange' type='range' class='g_timeRange g_audioRange center' min=0 max=1 step=any value=0.5 onChange='dragAudio()'>";
    sPage += "<img src='img/fullvolume.png' class='g_volumeIcon full' onClick='dragAudio(1)' />";
    sPage += "<div id='g_timeScroller' class='g_timeScroller'>";
    sPage += "<div id='beginTimeStamp' class='g_timeStampContainer'>0:00:00</div>"; // change to x:00 if podcast < 60 minutes
    sPage += "<input type='range' id='audioPosRange' class='g_timeRange center' min=0 max=1 step=any value=0 onChange='dragAudioPosition(" + true + ")'>";
    sPage += "<div id='endTimeStamp' class='g_timeStampContainer g_rightTimeStampContainer'>0:00:00</div>";
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
    sPage += "<input style='width: 90%;' onKeyUp='checkTypingDelay(this.value)' placeholder='Enter Search' /><br>";
    sPage += "<div class='subsection' onClick='AddPodFrame()'>Add a Podcast</div>";
    sPage += "<div class='subsection' onClick='BugFrame()'>Bug Report</div>";
    if (!getCookie('UN')) // not logged in
        sPage += "<div class='subsection' onClick='SignUpFrame()'>Make an Account</div>";
    sPage += "</div>";
    sPage += "</div>";
    sPage += "<div id='podcastsDisplay' class='podcastsDisplay'>";
    sPage += "</div>";
    document.getElementById('Main').innerHTML = sPage;
    pullPodcasts();
    g_objUserData.state = 0;
}

const AddPodFrame = () => {
    if (6 == g_objUserData.state) return;
    let sPage = "";
    sPage += "<div class='g_main addPodContainer'>";
    sPage += "<textarea id='podLink' class='addPodTA' placeholder='Insert RSS/Atom Link'></textarea>";
    sPage += "<button class='addPodButton' onClick='initPodcastToAdd()'>Add Podcast</button>";
    sPage += "<div id='feedback' style='width: 200px; text-align: center; margin-left: auto; margin-right: auto;'></div>";
    sPage += "</div>";
    document.getElementById('Main').innerHTML = sPage;
    g_objUserData.state = 6;
}

var t_checkIfDatasThere;
const TheLatestFrame = () => {
    if (7 == g_objUserData.state) return;
    let sPage = "";
    sPage += "<div id='latestEpisodes' class='g_main' style='overflow-y: auto;'>";
    if (0 == g_objUserData.data.length) {
        sPage += "<div class='findSubscriptions' style='padding: 7px;' onClick='MainFrame()'>Subscribe to Podcasts to See The Latest of Them</div>";
        sPage += "</div>";
        document.getElementById('Main').innerHTML = sPage;
        g_objUserData.state = 7;
        return;
    }
    sPage += "</div>";
    document.getElementById('Main').innerHTML = sPage;
    pullLatestOfSubscriptions();
}

const finishTheLatestFrame = (aEpisodes) => {
    let sPage = "";
    for (let i=0; i<aEpisodes.length; i++) {
        sPage += "<div id="+i+" class='latestEpisode'>";
        sPage += aEpisodes[i].podName;
        sPage += "<br><span style='font-weight: 500;'>";
        sPage += aEpisodes[i].title;
        sPage += "</span><br>";
        sPage += String(aEpisodes[i].date).substring(0, 15);
        sPage += "</div>";
        sPage += "<br>";
    }
    document.getElementById('latestEpisodes').innerHTML = sPage;
    for (let i=0; i<aEpisodes.length; i++) {
        document.getElementById(i).onclick = function() { playPodcast(aEpisodes[i].episode); };
    }
    g_objUserData.state = 7;
}

const pullLatestOfSubscriptions = () => {
    let aNewEpisodes = [];
    for (let i=0; i<g_objUserData.data.length; i++) {
        fetch(g_objUserData.data[i].link)
        .then(response => response.text())
        .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
        .then(data => {
            let aItems = data.querySelectorAll("item");
            for (let j=0; j<3; j++) {
                let objEpisode = {};
                objEpisode.episode = aItems[j];
                objEpisode.date = new Date(aItems[j].getElementsByTagName("pubDate")[0].textContent);
                objEpisode.title = aItems[j].getElementsByTagName("title")[0].childNodes[0].nodeValue;
                objEpisode.podName = aItems[j].ownerDocument.getElementsByTagName("title")[0].childNodes[0].nodeValue;
                aNewEpisodes.push(objEpisode);
            }
        });
    }
    t_checkIfDatasThere = setInterval(function() { checkData(aNewEpisodes); }, 500);
}

const checkData = (data) => {
    if (g_objUserData.data.length * 3 != data.length)
        return;
    clearInterval(t_checkIfDatasThere);
    data = data.sort((a, b) => a.date - b.date).reverse();
    finishTheLatestFrame(data);
}

const initPodcastToAdd = () => {
    let sLink = document.getElementById('podLink').value.trim();
    parseRSSLink(sLink, AddPodToDB, 0);
}

const AddPodToDB = (xmlDoc, nID) => { // bogus id
    let objNewPodcast = {};
    objNewPodcast.title = xmlDoc.getElementsByTagName("title")[0].childNodes[0].nodeValue;
    objNewPodcast.description = xmlDoc.getElementsByTagName("description")[0].childNodes[0].nodeValue;
    objNewPodcast.link = xmlDoc.URL;
    let jsonNewPodcast = JSON.stringify(objNewPodcast);
    postFileFromServer("podcaster.php", "addPodcastToDatabase=" + encodeURIComponent(jsonNewPodcast), addPodcastToDatabaseCallback);
    function addPodcastToDatabaseCallback(data) {
        if (data) {
            let objPodcast = JSON.parse(data);
            parseRSSLink(objPodcast.link, PodcastOverviewFrame, objPodcast.id);
        }
    }
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

const PodcastOverviewFrame = (xmlDoc, nID) => {
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
    let bSubscribed = false;
    for (let i=0; i<g_objUserData.data.length; i++) {
        if (nID == g_objUserData.data[i].id) {
            bSubscribed = true;
            break;
        }
    }
    if (bSubscribed)
        sPage += "<button id='subscribeButton' class='subscribeButton' onClick='Unsubscribe("+nID+")'>Unsubscribe</button><br>";
    else
        sPage += "<button id='subscribeButton' class='subscribeButton' onClick='preSubscribeToPodcast("+nID+", \""+xmlDoc.URL+"\", \""+sTitle+"\")'>Subscribe</button><br>";
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

const preSubscribeToPodcast = (nID, sLink, sTitle) => {
    if (g_objUserData.bLoggedIn)
        Subscribe(nID, sLink, sTitle);
    else
        SignUpFrame();
}

const Subscribe = (nID, sLink, sTitle) => {
    let objNewPod = {};
    objNewPod.id = nID;
    objNewPod.title = sTitle;
    objNewPod.link = sLink
    g_objUserData.data.push(objNewPod);
    let jsonSendDataOff = sendOffUserData(nID, null);
    postFileFromServer("podcaster.php", "updateData=" + encodeURIComponent(jsonSendDataOff), updateDataCallback);
    function updateDataCallback(data) {
        if (data) {
            document.getElementById('subscribeButton').innerHTML = "Unsubscribe";
            document.getElementById('subscribeButton').onclick = function() { Unsubscribe(data); };
        }
        else
            alert("Possible Network Error");
    }
}

const sendOffUserData = (nID, objPData) => {
    let jsonData = JSON.stringify(g_objUserData.data);
    let sEncryptedData = encodeURIComponent(AESEncrypt(jsonData, g_objUserData.password));
    let objSendDataOff = {};
    objSendDataOff.id = g_objUserData.id;
    objSendDataOff.data = sEncryptedData;
    if (nID)
        objSendDataOff.podID = nID;
    if (objPData)
        objSendDataOff.pData = objPData;
    return JSON.stringify(objSendDataOff);
}

const Unsubscribe = (nID) => {
    let objRemovedPod;
    for (let i=0; i<g_objUserData.data.length; i++) {
        if (g_objUserData.data[i].id == nID) {
            objRemovedPod = encodeURIComponent(AESEncrypt(JSON.stringify(g_objUserData.data.splice(i, 1)[0]), g_objUserData.password));
            break;
        }
    }
    let jsonSendDataOff = sendOffUserData(null, objRemovedPod);
    postFileFromServer("podcaster.php", "updateData=" + encodeURIComponent(jsonSendDataOff), removeDataCallback);
    function removeDataCallback(data) {
        if (data) {
            document.getElementById('subscribeButton').innerHTML = "Subscribe";
            let pData = JSON.parse(AESDecrypt(decodeURIComponent(data), g_objUserData.password));
            document.getElementById('subscribeButton').onclick = function() { Subscribe(pData.id, pData.link, pData.title); };
        }
        else
            alert("Possible Network Error");
    }
}

const searchThroughEpisodes = (aItems) => {
    let sPage = "";
    let sQuery = document.getElementById('episodeSearch').value;
    for (let i=0; i<aItems.length; i++) {
        let sCurrTitle = aItems[i].getElementsByTagName("title")[0].childNodes[0].nodeValue;
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
    document.getElementById('g_currentPlaying').src = objEpisode.parentElement.getElementsByTagName("url")[0].childNodes[0].nodeValue;
    document.getElementById('g_currentPlaying').onclick = function() { parseRSSLink(objEpisode.baseURI, PodcastOverviewFrame) };
    document.getElementById('g_currentTitle').innerHTML = objEpisode.getElementsByTagName("title")[0].childNodes[0].nodeValue.substring(0, 57);
    if (57 == document.getElementById('g_currentTitle').innerHTML.length)
        document.getElementById('g_currentTitle').innerHTML += "...";
    document.getElementById('g_player').pause();
    if (!objEpisode.lastElementChild.attributes.url) { // atom format
        let nEnclosureIndex = -1;
        for (let i=0; i<objEpisode.childNodes.length; i++) {
            if ("enclosure" == objEpisode.childNodes[i].localName) {
                nEnclosureIndex = i;
                break;
            }
        }
        document.getElementById('g_player').src = objEpisode.childNodes[nEnclosureIndex].attributes.url.nodeValue;
        document.getElementById('g_player').type = objEpisode.childNodes[nEnclosureIndex].attributes.type.nodeValue;
    }
    else { // rss format
        document.getElementById('g_player').src = objEpisode.lastElementChild.attributes.url.nodeValue;
        document.getElementById('g_player').type = objEpisode.lastElementChild.attributes.type.nodeValue;
    }
    setEndTimestamp();
    updatePlayingStateButton(true);
}

var t_updateAudioPos;
const updatePlayingStateButton = (bForceIt) => {
    if (g_objUserData.paused || bForceIt) {
        document.getElementById('playingState').src = 'img/pause.png';
        document.getElementById('g_player').play();
        g_objUserData.paused = false;
        t_updateAudioPos = setInterval(dragAudioPosition, 1000);
    }
    else {
        document.getElementById('playingState').src = 'img/play.png';
        document.getElementById('g_player').pause();
        g_objUserData.paused = true;
        clearInterval(t_updateAudioPos);
    }
}

const setEndTimestamp = () => {
    setTimeout(function() {
        if (!document.getElementById('g_player').duration)
            setEndTimestamp();
        else {
            let nSeconds = Math.round(document.getElementById('g_player').duration)
            document.getElementById('endTimeStamp').innerHTML = secondsToHms(nSeconds);
        }
    }, 200);
}

const secondsToHms = (d) => {
    let h = Math.floor(d / 3600);
    let m = Math.floor(d % 3600 / 60);
    let s = Math.floor(d % 3600 % 60);
    let hDisplay = h > 0 ? "0" + h + ":" : "00:";
    let mDisplay = m >= 10 ? "" : "0";
    mDisplay += m > 0 ? m + ":" : "0:";
    let sDisplay = s >= 10 ? "" : "0";
    sDisplay += s > 0 ? s : "0";
    return hDisplay + mDisplay + sDisplay;
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

const moveAudioPosition = (bFoward) => {
    if (bFoward)
        document.getElementById('g_player').currentTime += 30;
    else
        document.getElementById('g_player').currentTime -= 10;
}

const checkTypingDelay = (sSearch) => {
    g_objUserData.ajaxing = sSearch.length;
    setTimeout(function() {
        if (sSearch.length == g_objUserData.ajaxing)
            pullPodcasts(sSearch);
    }, 500);
}

const parseRSSLink = (sLink, functionCall, nID) => {
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (4 == this.readyState && 200 == this.status)
            functionCall(this.responseXML, nID);
        else if (this.status >= 400)
            document.getElementById('feedback').innerHTML = "Invalid RSS/Atom Link";
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
            sPage += "<div class='podcastResult' onClick='parseRSSLink(\"" + objPodcasts[i].link + "\", PodcastOverviewFrame, " + objPodcasts[i].id + ")'>"; // fix this out of quote hell
            sPage += objPodcasts[i].title;
            sPage += "</div>";
        }
        document.getElementById('podcastsDisplay').innerHTML = sPage;
    }
}

const dragAudio = (nHit) => {
    if (0 == nHit) {
        document.getElementById('g_player').volume = 0;
        document.getElementById('volumeRange').value = 0;
    }
    else if (1 == nHit) {
        document.getElementById('g_player').volume = 1;
        document.getElementById('volumeRange').value = 1;
    }
    else
        document.getElementById('g_player').volume = document.getElementById('volumeRange').value;
}

const dragAudioPosition = (bFromRange) => {
    if (bFromRange)
        document.getElementById('g_player').currentTime = document.getElementById('audioPosRange').value * document.getElementById('g_player').duration;
    else {
        document.getElementById('audioPosRange').value = document.getElementById('g_player').currentTime / document.getElementById('g_player').duration;
        let nSeconds = Math.round(document.getElementById('g_player').currentTime)
        document.getElementById('beginTimeStamp').innerHTML = secondsToHms(nSeconds);
    }
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

const GoToTheLatest = () => {
    if (g_objUserData.bLoggedIn)
        TheLatestFrame();
    else
        SignUpFrame();
}

const GoToSubscriptions = () => {
    if (g_objUserData.bLoggedIn)
        SubscriptionsFrame();
    else
        SignUpFrame();
}

const AccountFrame = () => {
    if (4 == g_objUserData.state) return;
    let sPage = "";
    sPage += "<div class='g_main' style='border: 1px solid;'>";
    sPage += "del account, change un | pw, stats we have bout u";
    sPage += "</div>";
    document.getElementById('Main').innerHTML = sPage;
    g_objUserData.state = 4;
}

const SubscriptionsFrame = () => {
    if (5 == g_objUserData.state) return;
    let sPage = "";
    for (let i=0; i<g_objUserData.data.length; i++) {
        sPage += "<div class='podcastResult subResult' onClick='parseRSSLink(\""+g_objUserData.data[i].link+"\",PodcastOverviewFrame,"+g_objUserData.data[i].id+")'>";
        sPage += g_objUserData.data[i].title;
        sPage += "</div>";
    }
    sPage += "<div class='findSubscriptions' onClick='MainFrame()'>Find Podcasts to Subscribe To</div>";
    document.getElementById('Main').innerHTML = sPage;
    g_objUserData.state = 5;
}

const SignUpFrame = () => {
    if (2 == g_objUserData.state) return;
    let sPage = "";
    sPage += "<div class='si'>";
    sPage += "<div class='si_LogoContainer'>";
    sPage += "<img src='img/bigp.png' class='si_logo'</img>";
    sPage += "</div>";
    sPage += "<div class='si_textContainer'>";
    sPage += "<div class='si_container'>";
    sPage += "<span class='si_text'>CREATE AN ACCOUNT</span>";
    sPage += "<a href=\"javascript:LoginFrame()\" class='si_text' style='float: right; font-size: 12px; margin-top: 4px;'>or login</a>";
    sPage += "<input id='username' type='input' class='si_text si_textBox' placeholder='Username' maxlength=20 title='username' /><br>";
    sPage += "<input id='password' type='password' class='si_text si_textBox' placeholder='Password' title='password' /><br>";
    sPage += "<input id='confirm' type='password' class='si_text si_textBox' placeholder='Confirm Password' title='confirm password' />";
    sPage += "<div class='si_checkContainer'>"
    sPage += "<input id='Memory' class='si_checkbox' type='checkbox' checked=true>";
    sPage += "<label class='si_text si_rememberMe' for='Memory'>Stay Logged In</label>"
    sPage += "</div>";
    sPage += "<button class='si_createButton' onClick='checkNewAccount()'>Create Account</button>";
    sPage += "</div>";
    sPage += "</div>";
    sPage += "</div>";
    document.getElementById('Main').innerHTML = sPage;
    g_objUserData.state = 2;
}

const LoginFrame = () => {
    if (3 == g_objUserData.state) return;
    let sPage = "";
    sPage += "<div class='si'>";
    sPage += "<div class='si_LogoContainer'>";
    sPage += "<img src='img/bigp.png' class='si_logo'</img>";
    sPage += "</div>";
    sPage += "<div class='si_textContainer'>";
    sPage += "<div class='si_container'>";
    sPage += "<span class='si_text'>LOGIN</span>";
    sPage += "<a href=\"javascript:SignUpFrame()\" class='si_text' style='float: right; font-size: 12px; margin-top: 4px;'>or sign up</a>"
    sPage += "<input id='username' type='input' class='si_text si_textBox' placeholder='Username' maxlength=20 title='username' /><br>";
    sPage += "<input id='password' type='password' class='si_text si_textBox' placeholder='Password' title='password' /><br>";
    sPage += "<div class='si_checkContainer'>"
    sPage += "<input id='Memory' class='si_checkbox si_loginButton si_loginCheckbox' type='checkbox' checked=true>";
    sPage += "<label class='si_text si_rememberMe si_loginRemember' for='Memory'>Stay Logged In</label>"
    sPage += "</div>";
    sPage += "<button class='si_createButton si_loginButton' onClick='checkLogin()'>Login</button>";
    sPage += "</div>";
    sPage += "</div>";
    sPage += "</div>";
    document.getElementById('Main').innerHTML = sPage;
    g_objUserData.state = 3;
}

const checkNewAccount = () => {
    let sUsername = document.getElementById('username').value.trim();
    let sPassword = document.getElementById('password').value.trim();
    let sConfirm = document.getElementById('confirm').value.trim();

    if (!sUsername) {
        document.getElementById('username').placeholder = "pick a username";
        return;
    }
    if (!sPassword) {
        document.getElementById('password').placeholder = "pick a password";
        return;
    }
    if (sPassword !== sConfirm) {
        document.getElementById('confirm').value = "";
        document.getElementById('confirm').placeholder = "password and confirm don't match";
        return;
    }
    g_objUserData.password = sPassword;

    postFileFromServer("podcaster.php", "uniqueUN=" + encodeURIComponent(sUsername), uniqueUNCallback);
    function uniqueUNCallback(data) {
        if (!data) {
            document.getElementById('username').value = "";
            document.getElementById('username').placeholder = "username taken, sorry";
            g_objUserData = {};
            g_objUserData.state = 2;
            return;
        }
        else
            createAccount(data);
    }
}

const createAccount = (sUsername) => {
    g_objUserData.username = sUsername;
    g_objUserData.password = HashThis(g_objUserData.password, 25000);

    if (document.getElementById('Memory').checked) {
        setCookie('UN', sUsername, 999);
        setCookie('PW', g_objUserData.password, 999);
    }

    let sPassToSend = g_objUserData.password;
    sPassToSend = HashThis(sPassToSend, 25000);

    let objUserData = {};
    objUserData.username = sUsername;
    objUserData.password = sPassToSend;
    let jsonUserData = JSON.stringify(objUserData);
    postFileFromServer("podcaster.php", "createAccount=" + encodeURIComponent(jsonUserData), createAccountCallback);
    function createAccountCallback(data) {
        if (data) {
            g_objUserData.id = data;
            Login(g_objUserData.username, g_objUserData.password);
        }
    }
}

const checkLogin = () => {
    let sUsername = document.getElementById('username').value;
    let sPassword = document.getElementById('password').value;
    if (!sUsername) {
        document.getElementById('username').placeholder = "fill out username";
        return;
    }
    if (!sPassword) {
        document.getElementById('password').placeholder = "fill out password";
        return;
    }
    sPassword = HashThis(sPassword, 25000);

    if (document.getElementById('Memory').checked)
        g_objUserData.rememberMe = true;

    Login(sUsername, sPassword);
}

const Login = (UN, PW) => {
    g_objUserData.username = UN;
    g_objUserData.password = PW;
    PW = HashThis(PW, 25000);

    let objCredentials = {};
    objCredentials.username = UN;
    objCredentials.password = PW;

    let jsonCredentials = JSON.stringify(objCredentials);
    postFileFromServer("podcaster.php", "login=" + encodeURIComponent(jsonCredentials), LogInCallback);
    function LogInCallback(data) {
        if (data) {
            let objUserData = JSON.parse(data);
            g_objUserData.id = objUserData.id;
            if (objUserData.data)
                g_objUserData.data = JSON.parse(AESDecrypt(decodeURIComponent(objUserData.data), g_objUserData.password));
            else
                g_objUserData.data = [];
            if (g_objUserData.rememberMe) {
                setCookie('UN', g_objUserData.username, 999);
                setCookie('PW', g_objUserData.password, 999);
                g_objUserData.rememberMe = null;
            }
            g_objUserData.bLoggedIn = true;
            MainFrame();
        }
        else {
            alert("Login Failed");
            g_objUserData = {};
            g_objUserData.state = 3;
        }
    }
}

const hex2a = (hex) => {
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}

const AESEncrypt = (sTextToEncrypt, sKey) => {
    return CryptoJS.AES.encrypt(sTextToEncrypt, sKey);
}

const AESDecrypt = (sEncryptedText, sKey) => {
    let decryptedText = CryptoJS.AES.decrypt(sEncryptedText, sKey);
    let sDecrypted = hex2a(decryptedText.toString());
    return sDecrypted;
}

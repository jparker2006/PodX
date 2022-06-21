"use strict";

/*
screen states:
- screen doesnt matter: -1
- main frame: 0
- bug frame: 1
- sign up frame: 2
- log in frame: 3
- account frame: 4
*/

var g_objUserData = {};
g_objUserData.state = -1;

onload = () => {
    let UN = getCookie('UN');
    let PW = getCookie('PW');
    if (UN && PW)
        Login(UN, PW);
    Header();
    ControlBar();
    MainFrame();
}

const Header = () => {
    let sPage = "";
    sPage += "<div class='g_HeaderContainer center'>";
    sPage += "<div class='g_HeaderLinkContainer'>";
    sPage += "<div class='g_HeaderName' onClick='MainFrame()'>Podcaster</div>";
    sPage += "<div class='g_HeaderLink' style='width: 116px; left: 160px;'>Subscriptions</div>";
    sPage += "<div class='g_HeaderLink' style='width: 98px; left: 283px;' onClick='BugFrame()'>Bug Report</div>";
    sPage += "<div class='g_HeaderLink' style='width: 72px; left: 388px;' onClick='GoToAccount()'>Account</div>";
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
    sPage += "<img src='img/mute.png' class='g_volumeIcon' style='left: 379px;' onClick='dragAudio(0)' />";
    sPage += "<input id='volumeRange' type='range' class='g_timeRange g_audioRange center' min=0 max=1 step=any value=0.5 onChange='dragAudio()'>";
    sPage += "<img src='img/fullvolume.png' class='g_volumeIcon' style='left: 557px;' onClick='dragAudio(1)' />";
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

const GoToAccount = () => {
    if (g_objUserData.bLoggedIn)
        AccountFrame();
    else
        SignUpFrame();
}

const AccountFrame = () => {
    if (4 == g_objUserData.state) return;
    let sPage = "";
    document.getElementById('Main').innerHTML = sPage;
    g_objUserData.state = 4;
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
    g_objUserData.password = HashThis(g_objUserData.password, 50000);

    if (document.getElementById('Memory').checked) {
        setCookie('UN', sUsername, 999);
        setCookie('PW', g_objUserData.password, 999);
    }

    g_objUserData.username = sUsername;

    let jsonUserData = JSON.stringify(g_objUserData);
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
    sPassword = HashThis(sPassword, 50000);

    if (document.getElementById('Memory').checked)
        g_objUserData.rememberMe = true;

    Login(sUsername, sPassword);
}

const Login = (UN, PW) => {
    g_objUserData.username = UN;
    g_objUserData.password = PW;
    let jsonCredentials = JSON.stringify(g_objUserData);
    postFileFromServer("podcaster.php", "login=" + encodeURIComponent(jsonCredentials), LogInCallback);
    function LogInCallback(data) {
        if (data) {
            let objUserData = JSON.parse(data);
            g_objUserData.id = objUserData.id;
            g_objUserData.data = objUserData.data;
            if (g_objUserData.rememberMe) {
                setCookie('UN', g_objUserData.username, 999);
                setCookie('PW', g_objUserData.password, 999);
                g_objUserData.rememberMe = null;
            }
            g_objUserData.bLoggedIn = true;
            MainFrame();
        }
        else {
            g_objUserData = {};
            g_objUserData.state = 3;
        }
    }
}

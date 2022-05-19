"use strict";

var g_objUserData = {};

onload = () => {
    ServiceWorkerReg();
    let UN = getCookie('UN');
    let PW = getCookie('PW');
    if (UN && PW) {
        Login(UN, PW);
        return;
    }
    SearchFrame();
    //SignUpFrame();
}

const ServiceWorkerReg = () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/Podcasts/sw.js')
        .then((reg) => console.log('service worker registered', reg))
        .catch((err) => console.log('service worker not registered', err));
    }
}

const SearchFrame = () => {
    let sPage = "";
    sPage += Header();

    sPage += "<button onClick='AddPodFrame()'>add some podcasts</button>";

    sPage += "<div class='SearchFrame'>";

    sPage += "<div class='Settings' onclick='SettingsFrame()'>&#9881;</div>";
    sPage += "<div class='HelpText' style='width: 180px;'>Find a Show...</div>";

    sPage += "<input type='textbox' class='Input' placeholder='Search' onKeyUp='ajaxPodcasts(this.value)' />";
    sPage += "<div id='SearchResults' class='SearchResults'></div>";

    sPage += "</div>"; // the SearchFrame

    sPage += "<div id='Toast' class='Toast'</div>";
    sPage += "<div id='DialogBox' class='DialogBox'></div>";
    document.getElementById('Main').innerHTML = sPage;
    pullPodcasts();
}

function pullPodcasts() {
    postFileFromServer("main.php", "pullPodcasts=" + encodeURIComponent(true), pullPodcastsCallback);
    function pullPodcastsCallback(data) {
        let objPodcasts = JSON.parse(data);
        displayPodcastsFromPHP(objPodcasts);
    }
}

function ajaxPodcasts(sSearch) {
    if (!sSearch) {
        pullPodcasts();
        return;
    }
    postFileFromServer("main.php", "ajaxPodcasts=" + encodeURIComponent(sSearch), ajaxCallback);
    function ajaxCallback(data) {
        let objPodcasts = JSON.parse(data);
        displayPodcastsFromPHP(objPodcasts);
    }
}

function displayPodcastsFromPHP(objPodcasts) {
    let sResults = "";
    for (let r=0; r<objPodcasts.length; r++) {
        sResults += "<div class='SearchResult' onclick='loadXMLDoc(\"";
        sResults += objPodcasts[r].slink;
        sResults += "\")' ";
        if (objPodcasts[r].title.length > 30)
            sResults += ">" + objPodcasts[r].title.substring(0, 30) + "...";
        else
            sResults += ">" + objPodcasts[r].title;
        sResults += "</div>";
    }
    document.getElementById('SearchResults').innerHTML = sResults;
}

const Header = () => {
    let sPage = "";
    sPage += "<div class='title'>";
    sPage += "<div class='HeaderBounds'>"
    sPage += "<div style='margin-top: 10px;' class='game_name_ani' onclick='window.location.reload()'><img src='img/EC24.png' height='20' alt=''>&nbsp;&nbsp; Podcaster &nbsp;&nbsp;<img src='img/EC24.png' height='20' alt=''></div>";
    sPage += "</div>"; // end inner header bounds
    sPage += "</div>";
    return sPage;
}

const SampleResults = () => {
    let aResults = [
    {"Title":"The Axe Files with David Axelrod", "URL": "https://www.omnycontent.com/d/playlist/d83f52e4-2455-47f4-982e-ab790120b954/a5445dcc-ae1f-488d-941b-ab850106d3b6/ffd283fe-1043-4829-a279-ab850106d3d2/podcast.rss"},
    {"Title":"Broken Record", "URL": "https://omnycontent.com/d/playlist/e73c998e-6e60-432f-8610-ae210140c5b1/FF0BA2F2-F33C-4193-ABA2-AE32006CD633/11C188A1-CB86-4869-9C57-AE32006CD63C/podcast.rss"},
    {"Title":"Decoder with Nilay Patel", "URL": "https://feeds.megaphone.fm/recodedecode"},
    {"Title":"FiveThirtyEight Politics", "URL": "https://feeds.megaphone.fm/ESP8794877317"},
    {"Title":"Into the Mix", "URL": "https://feeds.megaphone.fm/whoweare"},
    {"Title":"Pivot", "URL": "https://feeds.megaphone.fm/pivot"},
    {"Title":"The Powers That Be:  Daily", "URL": "https://feeds.megaphone.fm/powers-that-be"},
    {"Title":"The Prof G Pod with Scott Galloway", "URL": "https://feeds.megaphone.fm/WWO6655869236"},
    {"Title":"Recode Daily", "URL": "https://feeds.megaphone.fm/VMP9176219298"},
    {"Title":"Slate Money", "URL": "https://feeds.megaphone.fm/slatemoney"},
    {"Title":"Stay Tuned with Preet", "URL": "https://feeds.megaphone.fm/VMP5489734702"},
    {"Title":"The Vergecast", "URL": "https://feeds.megaphone.fm/vergecast"},
    {"Title":"Vox Conversations", "URL": "https://feeds.megaphone.fm/theezrakleinshow"},
    {"Title":"The WAN Show", "URL": "https://anchor.fm/s/3cbbb3b8/podcast/rss"},
    {"Title":"What Next | Daily News and Analysis", "URL": "https://feeds.megaphone.fm/whatnext"}];
    let sResults = "";
    for (let r=0; r<aResults.length; r++) {
        sResults += "<div class='SearchResult' onclick='loadXMLDoc(\"";
        sResults += aResults[r].URL;
        sResults += "\")' ";
        sResults += ">" + aResults[r].Title;
        sResults += "</div>";
    }
    return sResults;
}


function SignUpFrame() {
    let sPage = "";
    sPage += "<div class='si_topBar'>";
    sPage += "<span class='si_topBarName'>podcast</span> - Create a New Account";
    sPage += "</div>";
    sPage += "<div class='si'>";
    sPage += "<div class='si_LogoContainer'>";
    sPage += "<img src='img/windowicon.png' class='si_logo'</img>";
    sPage += "</div>";
    sPage += "<div class='si_textContainer'>";
    sPage += "<div class='si_container'>";
    sPage += "<span class='si_text'>CREATE AN ACCOUNT</span>";
    sPage += "<a href=\"javascript:LoginFrame()\" class='si_text' style='float: right; font-size: 12px; margin-top: 4px;'>or login</a>"
    sPage += "<input id='first' type='input' class='si_text si_textBox' placeholder='First Name' maxlength=20 title='first name' /><br>";
    sPage += "<input id='last' type='input' class='si_text si_textBox' placeholder='Last Name' maxlength=20 title='last name' /><br>";
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
}

function LoginFrame() {
    let sPage = "";
    sPage += "<div class='si_topBar'>";
    sPage += "<span class='si_topBarName'>podcast</span> - Login";
    sPage += "</div>";
    sPage += "<div class='si'>";
    sPage += "<div class='si_LogoContainer'>";
    sPage += "<img src='img/windowicon.png' class='si_logo'</img>";
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
}

function checkNewAccount() {
    let sFirst = document.getElementById('first').value.trim();
    let sLast = document.getElementById('last').value.trim();
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

    g_objUserData.first = sFirst;
    g_objUserData.last = sLast;
    g_objUserData.password = sPassword;

    postFileFromServer("main.php", "uniqueUN=" + encodeURIComponent(sUsername), uniqueUNCallback);
    function uniqueUNCallback(data) {
        if (!data) {
            document.getElementById('username').value = "";
            document.getElementById('username').placeholder = "username taken, sorry";
            g_objUserData = {};
            return;
        }
        else
            createAccount(data);
    }
}

function createAccount(sUsername) {
    g_objUserData.password = HashThis(g_objUserData.password, 10000);

    if (document.getElementById('Memory').checked) {
        setCookie('UN', sUsername, 999);
        setCookie('PW', g_objUserData.password, 999);
    }

    g_objUserData.username = sUsername.trim();

    let jsonUserData = JSON.stringify(g_objUserData);
    postFileFromServer("main.php", "createAccount=" + encodeURIComponent(jsonUserData), createAccountCallback);
    function createAccountCallback(data) {
        if (data) {
            g_objUserData.id = data;
            Login(g_objUserData.username, g_objUserData.password);
        }
    }
}

function checkLogin() {
    let sUsername = document.getElementById('username').value.trim();
    let sPassword = document.getElementById('password').value.trim();
    if (!sUsername) {
        document.getElementById('username').placeholder = "fill out username";
        return;
    }
    if (!sPassword) {
        document.getElementById('password').placeholder = "fill out password";
        return;
    }
    sPassword = HashThis(sPassword, 10000);

    if (document.getElementById('Memory').checked)
        g_objUserData.rememberMe = true;

    Login(sUsername, sPassword);
}

function Login(UN, PW) {
    g_objUserData.username = UN;
    g_objUserData.password = PW;

    let jsonCredentials = JSON.stringify(g_objUserData);
    postFileFromServer("main.php", "login=" + encodeURIComponent(jsonCredentials), LogInCallback);
    function LogInCallback(data) {
        if (data) {
            console.log(data);
            let objUserData = JSON.parse(data);
            g_objUserData.id = objUserData.id;
            g_objUserData.first = objUserData.first;
            g_objUserData.last = objUserData.last;

            if (g_objUserData.rememberMe) {
                setCookie('UN', g_objUserData.username, 999);
                setCookie('PW', g_objUserData.password, 999);
                g_objUserData.rememberMe = null;
            }
            MainFrame();
        }
        else
            g_objUserData = {};
    }
}



function AddPodFrame() {
    let sPage = "";
    sPage += "<input id='link' />";
    sPage += "<button onClick='parsePodToDBsXML()'>submit this!</button>";
    document.getElementById('Main').innerHTML = sPage;
}

function parsePodToDBsXML() {
    let sLink = document.getElementById("link").value;
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (4 == this.readyState && 200 == this.status)
            addPodToDatabase(this.responseXML, sLink);
    };
    xmlhttp.open("GET", sLink, true);
    xmlhttp.send();
}

function addPodToDatabase(xml, sLink) {
    let objPodcast = {};
    objPodcast.slink = sLink;
    objPodcast.title = xml.getElementsByTagName("title")[0].childNodes[0].nodeValue;
    objPodcast.description = xml.getElementsByTagName("description")[0].childNodes[0].nodeValue;
    let jsonPodcast = JSON.stringify(objPodcast);
    postFileFromServer("main.php", "addPodcast=" + encodeURIComponent(jsonPodcast), addPodcastCallback);
    function addPodcastCallback(data) {
        console.log("podcast added");
    }
}



function MainFrame() {
    let sPage = "";
    sPage += "<div>";
    sPage += "</div>";
    document.getElementById('Main').innerHTML = sPage;
    parse_rss();
}

function parse_rss(sRSSUrl = 'https://feeds.megaphone.fm/pivot') {
//     let RSS_URL = 'https://feeds.megaphone.fm/powers-that-be';
    loadXMLDoc(sRSSUrl);
}

function loadXMLDoc(sLink) {
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (4 == this.readyState && 200 == this.status)
            CardFrame(this.responseXML);
    };
    xmlhttp.open("GET", sLink, true);
    xmlhttp.send();
}

function CardFrame(xml) {
    let sPage = "";
    sPage += "<div id='card' class='card_container'>";
    sPage += "<a id='backButton' class='card_backButon' onClick='SearchFrame()'>Back</a>";
    let sTitle = xml.getElementsByTagName("title")[0].childNodes[0].nodeValue;
    if (sTitle.length <= 25)
        sPage += "<div class='card_title'><b>" + sTitle.trim() + "</b></div>";
    else
        sPage += "<div class='card_title'><b>" + sTitle.substring(0, 25).trim() + "...</b></div>";
    sPage += "<img class='card_image' src='" + xml.getElementsByTagName("url")[0].childNodes[0].nodeValue + "'</img>";
    sPage += "<button id='listEpisodesButton' class='card_button'>Episodes</button>";
    sPage += "<button class='card_button' style='top: 190px;'>Subscribe</button>";
    sPage += "<div class='card_description'>" + xml.getElementsByTagName("description")[0].childNodes[0].nodeValue + "</div>";
    sPage += "</div>";
    document.getElementById("Main").innerHTML = sPage;
    document.getElementById("listEpisodesButton").addEventListener("click", function() { ListEpisodesFrame(xml); });
}

function ListEpisodesFrame(xml) {
    let sPage = "";
    sPage += "<div id='card' style='text-align: left; padding-left: 7px; height: 700px; overflow-y: scroll; overflow-x: hidden;' class='card_container'>";
    let sTitle = xml.getElementsByTagName("title")[0].childNodes[0].nodeValue;
    if (sTitle.length <= 25)
        sPage += "<div class='card_title' id='header' style='cursor: pointer;'><b>" + sTitle.trim() + "</b></div>";
    else
        sPage += "<div class='card_title' id='header' style='cursor: pointer;'><b>" + sTitle.substring(0, 25).trim() + "...</b></div>";
    sPage += "<a id='backButton' class='card_backButon'>Back</a>";
    let aItems = xml.getElementsByTagName("item");
    for (let i=0; i<aItems.length; i++) {
        sPage += "<div id='"+i+"' style='margin-bottom 14px; width: 477px; height: 29px; position: relative;'>";
        sPage += "<div id='ep"+i+"' style='border-bottom: 1px dotted #68693F;'>";
        if (aItems[i].firstElementChild.textContent.length <= 40)
            sPage += aItems[i].firstElementChild.textContent;
        else
            sPage += aItems[i].firstElementChild.textContent.substring(0, 40).trim() + "...";
        sPage += "</div>";
        sPage += "<button id='play"+i+"' class='card_episodePlayButton'>play</button>";
        sPage += "</div>";
    }
    sPage += "</div>";
    sPage += "<audio id='audio_player'></audio>";
    document.getElementById("Main").innerHTML = sPage;
    document.getElementById("backButton").addEventListener("click", function() { CardFrame(xml); });
    document.getElementById("header").addEventListener("click", function() { CardFrame(xml); });
    for (let i=0; i<aItems.length; i++) {
        document.getElementById("ep" + i).addEventListener("click", function() { EpisodeFrame(xml, i); });
        document.getElementById("play" + i).addEventListener("click", function() { playAudio(aItems[i].lastElementChild, i); });
    }
}

function EpisodeFrame(xml, nEpisode) {
    let objEpisode = xml.getElementsByTagName("item")[nEpisode];
    let sPage = "";
    sPage += "<div id='card' class='card_container'>";
    let sTitle = xml.getElementsByTagName("title")[0].childNodes[0].nodeValue;
    if (sTitle.length <= 25)
        sPage += "<div class='card_title' id='header' style='cursor: pointer;'><b>" + sTitle.trim() + "</b></div>";
    else
        sPage += "<div class='card_title' id='header' style='cursor: pointer;'><b>" + sTitle.substring(0, 25).trim() + "...</b></div>";
    sPage += "<a id='backButton' class='card_backButon'>Back</a>";
    sPage += "<div style='width: 100%; text-align: center; padding-left: 7px; padding-right: 7px;'>";
    sPage += objEpisode.firstElementChild.textContent;
    sPage += "</div>";

    sPage += "<audio autoplay id='audioPlayer'>";
    sPage += "<source src='" + objEpisode.lastElementChild.attributes.url.nodeValue + "' type='" + objEpisode.lastElementChild.attributes.type.nodeValue + "'>";
    sPage += "</audio>";

    sPage += "<button id='playPauseButton' onClick='toggleAudio()'>Pause</button>";

    sPage += "<button onClick='moveAudioTime("+true+")'>Back 10s</button>";
    sPage += "<button onClick='moveAudioTime("+false+")'>Foward 30s</button>";
    sPage += "<button onClick='moveAudioVolume("+true+")'>Up Vol 0.1</button>";
    sPage += "<button onClick='moveAudioVolume("+false+")'>Down Vol 0.1</button>";


    sPage += "<div style='width: 100%; text-align: center; padding-left: 7px; padding-right: 7px;'>";
    sPage += objEpisode.childNodes[3].textContent;
    sPage += "</div>";
    sPage += "</div>";
    document.getElementById("Main").innerHTML = sPage;
    document.getElementById("header").addEventListener("click", function() { CardFrame(xml); });
    document.getElementById("backButton").addEventListener("click", function() { ListEpisodesFrame(xml); });
    document.getElementById('audioPlayer').volume = 0.2;

}

function toggleAudio() {
    let sState = document.getElementById('playPauseButton').innerHTML;
    if ("Play" == sState) {
        document.getElementById('playPauseButton').innerHTML = "Pause";
        document.getElementById('audioPlayer').play();
        return;
    }
    document.getElementById('playPauseButton').innerHTML = "Play";
    document.getElementById('audioPlayer').pause();
}

function moveAudioTime(bRewind) {
    document.getElementById('audioPlayer').currentTime += bRewind ? -10 : 30;
}

function moveAudioVolume(bUp) {
    document.getElementById('audioPlayer').volume += bUp ? 0.1 : -0.1;
}

function playAudio(aAttributes, nButtonIndice) {
    document.getElementById("play" + nButtonIndice).innerHTML = "stop";
    document.getElementById("play" + nButtonIndice).addEventListener("click", function() { pauseAudio(aAttributes, nButtonIndice); });
    document.getElementById('audio_player').src = aAttributes.attributes.url.nodeValue;
    document.getElementById('audio_player').type = aAttributes.attributes.type.nodeValue;
    document.getElementById('audio_player').play();
    const play_buttons = document.getElementsByTagName("button");
    for (let i=1; i<play_buttons.length; i++) {
        if (nButtonIndice == (i - 1))
            continue;
        play_buttons[i].innerHTML = "play";
    }
}

function pauseAudio(aAttributes, nButtonIndice) {
    document.getElementById('audio_player').pause();
    document.getElementById('audio_player').src = null;
    document.getElementById('audio_player').type = null;
    document.getElementById("play" + nButtonIndice).innerHTML = "play";
    document.getElementById("play" + nButtonIndice).addEventListener("click", function() { playAudio(aAttributes, nButtonIndice); });
}




var HashThis = (sText, nRounds) => {
    for (let x = 0; x < nRounds; x++) {
        sText = sha3_256(sText);
    }
    return sText;
}

function setCookie(c_name, value, exdays) {
  var exdate=new Date();
  exdate.setDate(exdate.getDate() + exdays);
  var c_value=escape(value) + ((exdays===null) ? '' : '; expires='+exdate.toUTCString());
  document.cookie=c_name + '=' + c_value;
}

function getCookie(c_name) {
  var i,x,y,ARRcookies = document.cookie.split(';');
  for (i=0;i<ARRcookies.length;i++) {
    x=ARRcookies[i].substr(0,ARRcookies[i].indexOf('='));
    y=ARRcookies[i].substr(ARRcookies[i].indexOf('=')+1);
    x=x.replace(/^\s+|\s+$/g,'');
    if (x===c_name)
      return unescape(y);
  }
}

function postFileFromServer(url, sData, doneCallback) {
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

function getRandomInt(min, max) {
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

function GetRandomCharacter() {
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


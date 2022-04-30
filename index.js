var g_XML = null; // find better way to do this lol

onload = () => {
    MainFrame();
}

function MainFrame() {
    let sPage = "";
    sPage += "<div>";
    sPage += "</div>";
    document.getElementById('Main').innerHTML = sPage;
    parse_rss();
}

function parse_rss() {
    let RSS_URL = 'https://feeds.megaphone.fm/powers-that-be';
    loadXMLDoc(RSS_URL);
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
    sPage += "<div class='card_title'>" + xml.getElementsByTagName("title")[0].childNodes[0].nodeValue + "</div>";
    sPage += "<img class='card_image' src='" + xml.getElementsByTagName("url")[0].childNodes[0].nodeValue + "'</img>";
    sPage += "<button id='listEpisodesButton' class='card_button'>List Episodes</button>";
    sPage += "<button class='card_button' style='top: 190px;'>Subscribe</button>";
    sPage += "<div class='card_description'>" + xml.getElementsByTagName("description")[0].childNodes[0].nodeValue + "</div>";
    sPage += "</div>";
    document.getElementById("Main").innerHTML = sPage;
    document.getElementById("listEpisodesButton").addEventListener("click", function() { ListEpisodesFrame(xml); });
}

function ListEpisodesFrame(xml) {
    let sPage = "";
    sPage += "<div id='card' style='text-align: center; height: 700px; overflow-y: scroll; overflow-x: hidden;' class='card_container'>";
    sPage += "<div class='card_title'>" + xml.getElementsByTagName("title")[0].childNodes[0].nodeValue + "</div>";
    sPage += "<button id='backButton' class='card_backButon'>Back</button>";
    let aTitles = xml.getElementsByTagName("title");
    for (let i=2; i<aTitles.length; i++) {
        sPage += "<div style='margin-bottom 9px;' onClick='playEpisode("+(i-2)+")'>";
        sPage += aTitles[i].childNodes[0].nodeValue;
        sPage += "</div>";
    }
    sPage += "</div>";
    document.getElementById("Main").innerHTML = sPage;
    document.getElementById("backButton").addEventListener("click", function() { CardFrame(xml); });
    g_XML = xml;
}

function playEpisode(nEpisode) {
    let aEpisodes = g_XML.getElementsByTagName("enclosure");
    let sPage = "";
    sPage += "<audio controls autoplay>";
    sPage += "<source src='" + aEpisodes[nEpisode].attributes.url.nodeValue + "' type='" + aEpisodes[nEpisode].attributes.type.nodeValue + "'>";
    sPage += "</audio>";
    document.getElementById("Main").innerHTML = sPage;
}





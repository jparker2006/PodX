<?php

if (isset($_POST['createAccount']))
    $jsonUserData = $_POST['createAccount'];
else if (isset($_POST['uniqueUN']))
    $sUsername = $_POST['uniqueUN'];
else if (isset($_POST['login']))
    $jsonCredentials = $_POST['login'];
else if (isset($_POST['addPodcast']))
    $jsonPodcast = $_POST['addPodcast'];
else if (isset($_POST['pullPodcasts']))
    $bSent = $_POST['pullPodcasts'];
else if (isset($_POST['ajaxPodcasts']))
    $sAjax = $_POST['ajaxPodcasts'];

if ($jsonUserData)
    $sFeedback = createAccount ($jsonUserData);
else if ($sUsername)
    $sFeedback = uniqueUN ($sUsername);
else if ($jsonCredentials)
    $sFeedback = login ($jsonCredentials);
else if ($jsonPodcast)
    $sFeedback = addPodcast ($jsonPodcast);
else if ($bSent)
    $sFeedback = pullPodcasts ();
else if ($sAjax)
    $sFeedback = ajaxPodcasts ($sAjax);

echo $sFeedback;

function createAccount ($jsonUserData) {
    $objUserData = json_decode($jsonUserData);

    $dbhost = 'localhost';
    $dbuser = 'podcasts_site';
    $dbpass = '0ShF3HctflFXwkhQSYte';
    $db = "podcaster";
    $dbconnect = new mysqli($dbhost, $dbuser, $dbpass, $db);

    $stmtI = $dbconnect->prepare("INSERT INTO Users (username, password, first, last) VALUES (?, ?, ?, ?)");
    $stmtI->bind_param("ssss", $objUserData->username, $objUserData->password, $objUserData->first, $objUserData->last);
    $stmtI->execute();
    $stmtI->close();

    $stmtS = $dbconnect->prepare("SELECT * FROM Users WHERE username=?");
    $stmtS->bind_param("s", $objUserData->username);
    $stmtS->execute();
    $tResult = $stmtS->get_result();
    $row = $tResult->fetch_assoc();
    $dbconnect->close();

    return $row["id"];
}

function uniqueUN ($sUsername) {
    $dbhost = 'localhost';
    $dbuser = 'podcasts_site';
    $dbpass = '0ShF3HctflFXwkhQSYte';
    $db = "podcaster";
    $dbconnect = new mysqli($dbhost, $dbuser, $dbpass, $db);

    $stmt = $dbconnect->prepare("SELECT * FROM Users WHERE username=?");
    $stmt->bind_param("s", $sUsername);
    $stmt->execute();
    $tResult = $stmt->get_result();
    $stmt->close();
    $dbconnect->close();

    return 0 == $tResult->num_rows ? $sUsername : null;
}

function login ($jsonCredentials) {
    $objCredentials = json_decode($jsonCredentials);
    $dbhost = 'localhost';
    $dbuser = 'podcasts_site';
    $dbpass = '0ShF3HctflFXwkhQSYte';
    $db = "podcaster";
    $dbconnect = new mysqli($dbhost, $dbuser, $dbpass, $db);

    $stmt = $dbconnect->prepare("SELECT * FROM Users WHERE username=? AND password=?");
    $stmt->bind_param("ss", $objCredentials->username, $objCredentials->password);
    $stmt->execute();
    $tResult = $stmt->get_result();
    $row = $tResult->fetch_assoc();
    $stmt->close();
    $dbconnect->close();

    if (1 != $tResult->num_rows)
        return false;

    $sSQL = "UPDATE Users SET lastlogin=CURRENT_TIMESTAMP WHERE id=" . $row["id"];
    QueryDB ($sSQL);

    $objUserData = new stdClass();
    $objUserData->id= $row["id"];
    $objUserData->first = $row["first"];
    $objUserData->last = $row["last"];
    $objUserData->lastlogin = $row["lastlogin"];
    $objUserData->created = $row["created"];

    return json_encode($objUserData);
}

function addPodcast ($jsonPodcast) {
    $objPodcast = json_decode($jsonPodcast);
    $dbhost = 'localhost';
    $dbuser = 'podcasts_site';
    $dbpass = '0ShF3HctflFXwkhQSYte';
    $db = "podcaster";
    $dbconnect = new mysqli($dbhost, $dbuser, $dbpass, $db);

    $stmt = $dbconnect->prepare("INSERT INTO Podcasts (title, description, link) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $objPodcast->title, $objPodcast->description, $objPodcast->slink);
    $stmt->execute();
    $stmt->close();
    $dbconnect->close();

    return true;
}

function pullPodcasts () {
    $sSQL = "SELECT COUNT(*) FROM Podcasts";
    $tResult = QueryDB($sSQL);
    $nPodcasts = $tResult->fetch_assoc()["COUNT(*)"];
    $aRandomPulls = [random_int(1, $nPodcasts)];
    for ($x=1; $x<10; $x++) {
        $randCurr = random_int(1, $nPodcasts);
        while (in_array($randCurr, $aRandomPulls)) {
            $randCurr = random_int(1, $nPodcasts);
        }
        $aRandomPulls[$x] = $randCurr;
    }

    $aPodcasts = [];
    for ($i=0; $i<10; $i++) {
        $sSQL = "SELECT * FROM Podcasts WHERE id=" . $aRandomPulls[$i];
        $tResult = QueryDB($sSQL);
        $row = $tResult->fetch_assoc();
        $aPodcasts[$i] = new stdClass();
        $aPodcasts[$i]->id = $row["id"];
        $aPodcasts[$i]->title = $row["title"];
        $aPodcasts[$i]->description = $row["description"];
        $aPodcasts[$i]->slink = $row["link"];
        $aPodcasts[$i]->created = $row["created"];
    }
    return json_encode ($aPodcasts);
}

function ajaxPodcasts ($sAjax) {
    $dbhost = 'localhost';
    $dbuser = 'podcasts_site';
    $dbpass = '0ShF3HctflFXwkhQSYte';
    $db = "podcaster";
    $dbconnect = new mysqli($dbhost, $dbuser, $dbpass, $db);

    $sSearch = "%" . $sAjax . "%";
    $stmt = $dbconnect->prepare("SELECT * FROM Podcasts WHERE title LIKE ?");
    $stmt->bind_param("s", $sSearch);
    $stmt->execute();
    $tResult = $stmt->get_result();
    $stmt->close();
    $dbconnect->close();

    $nRows = $tResult->num_rows;
    if ($nRows > 10)
        $nRows = 10;

    $aPodcasts = [];
    for ($i=0; $i<$nRows; $i++) {
        $row = $tResult->fetch_assoc();
        $aPodcasts[$i] = new stdClass();
        $aPodcasts[$i]->id = $row["id"];
        $aPodcasts[$i]->title = $row["title"];
        $aPodcasts[$i]->description = $row["description"];
        $aPodcasts[$i]->slink = $row["link"];
        $aPodcasts[$i]->created = $row["created"];
    }
    return json_encode ($aPodcasts);
}

function QueryDB ($sSQL) {
    $dbhost = 'localhost';
    $dbuser = 'podcasts_site';
    $dbpass = '0ShF3HctflFXwkhQSYte';
    $db = "podcaster";
    $dbconnect = new mysqli($dbhost, $dbuser, $dbpass, $db);
    $Result = $dbconnect->query($sSQL);
    $dbconnect->close();
    return $Result;
}

/*

mysql -u root -p
CREATE DATABASE podcaster;
USE podcaster;
CREATE USER 'podcasts_site'@'localhost' IDENTIFIED BY '0ShF3HctflFXwkhQSYte';
GRANT ALL PRIVILEGES ON podcaster.* TO 'podcasts_site'@'%' IDENTIFIED BY '0ShF3HctflFXwkhQSYte';

*/

?>


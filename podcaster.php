<?php

if (isset($_POST['pullPodcasts']))
    $jsonPullData = $_POST['pullPodcasts'];
else if (isset($_POST['insertBug']))
    $sBug = $_POST['insertBug'];
else if (isset($_POST['pullBugs']))
    $bPullTheBugs = $_POST['pullBugs'];


if ($jsonPullData)
    $sFeedback = pullPodcasts ($jsonPullData);
else if ($sBug)
    $sFeedback = insertBug ($sBug);
else if ($bPullTheBugs)
    $sFeedback = pullBugs ();

echo $sFeedback;

function pullPodcasts ($jsonPullData) {
    $objPullData = json_decode ($jsonPullData);

    $dbhost = 'localhost';
    $dbuser = 'podcasts_site';
    $dbpass = '0ShF3HctflFXwkhQSYte';
    $db = "podcaster";
    $dbconnect = new mysqli($dbhost, $dbuser, $dbpass, $db);
    $aPodcasts = [];

    if (!$objPullData->bSearching) {
        $sSQL = "SELECT COUNT(*) FROM podcasts";
        $tResult = QueryDB($sSQL);
        $nPodcasts = $tResult->fetch_assoc()["COUNT(*)"];
        $aRandomPulls = [random_int(1, $nPodcasts)];
        for ($x=1; $x<15; $x++) {
            $randCurr = random_int(1, $nPodcasts);
            while (in_array($randCurr, $aRandomPulls)) {
                $randCurr = random_int(1, $nPodcasts);
            }
            $aRandomPulls[$x] = $randCurr;
        }

        for ($i=0; $i<15; $i++) {
            $sSQL = "SELECT * FROM podcasts WHERE id=" . $aRandomPulls[$i];
            $tResult = QueryDB($sSQL);
            $row = $tResult->fetch_assoc();
            $aPodcasts[$i] = new stdClass();
            $aPodcasts[$i]->id = $row["id"];
            $aPodcasts[$i]->title = $row["title"];
            $aPodcasts[$i]->description = $row["description"];
            $aPodcasts[$i]->link = $row["link"];
            $aPodcasts[$i]->created = $row["created"];
        }
    }
    else {
        $objPullData->search = "%" . $objPullData->search . "%";
        $stmt = $dbconnect->prepare("SELECT * FROM podcasts WHERE title LIKE ? OR description LIKE ? ORDER BY id DESC LIMIT 15");
        $stmt->bind_param("ss", $objPullData->search, $objPullData->search);
        $stmt->execute();
        $tResult = $stmt->get_result();
        $stmt->close();
        $dbconnect->close();
        for ($i=0; $i<$tResult->num_rows; $i++) {
            $row = $tResult->fetch_assoc();
            $aPodcasts[$i] = new stdClass();
            $aPodcasts[$i]->id = $row["id"];
            $aPodcasts[$i]->title = $row["title"];
            $aPodcasts[$i]->description = $row["description"];
            $aPodcasts[$i]->link = $row["link"];
            $aPodcasts[$i]->created = $row["created"];
        }
    }
    if (0 == sizeof($aPodcasts))
        return null;
    return json_encode ($aPodcasts);
}

function insertBug ($sBug) {
    $dbhost = 'localhost';
    $dbuser = 'podcasts_site';
    $dbpass = '0ShF3HctflFXwkhQSYte';
    $db = "podcaster";
    $dbconnect = new mysqli($dbhost, $dbuser, $dbpass, $db);

    $stmt = $dbconnect->prepare("INSERT INTO bugs (issue) VALUES (?)");
    $stmt->bind_param("s", $sBug);
    $bStatus = $stmt->execute();
    $stmt->close();

    return $bStatus;
}

function pullBugs () {
    $sSQL = "SELECT * FROM bugs LIMIT 15";
    $tResult = QueryDB($sSQL);
    $aBugs = [];
    for ($i=0; $i<$tResult->num_rows; $i++) {
        $row = $tResult->fetch_assoc();
        $aBugs[$i] = new stdClass();
        $aBugs[$i]->bug = $row["issue"];
        $aBugs[$i]->fix_started = $row["created"];
        $aBugs[$i]->created = $row["created"];
    }
    if (0 == sizeof($aBugs))
        return null;
    return json_encode ($aBugs);
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

?>

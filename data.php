<?php
header("Content-Type: application/json");

function scanImages($dir) {
    $path = __DIR__ . "/" . $dir;
    if (!is_dir($path)) return [];
    $out = [];
    foreach (scandir($path) as $f) {
        if (preg_match('/\.(png|jpg|webp)$/i', $f)) {
            $out[] = $f;
        }
    }
    return $out;
}

function scanPerks($base) {
    $result = [];
    for ($i = 1; $i <= 4; $i++) {
        $result[$i] = scanImages("$base/$i");
    }
    return $result;
}

/* ===== PLAYERS ===== */
$players = [];
$csv = __DIR__ . "/players.csv";

if (file_exists($csv)) {
    $f = fopen($csv, "r");
    fgetcsv($f, 0, ",", '"', "\\"); // header
    while (($row = fgetcsv($f, 0, ",", '"', "\\")) !== false) {
        if (!empty($row[0])) $players[] = $row[0];
    }
    fclose($f);
}

echo json_encode([
    "players" => $players,
    "characters" => [
        "survivors" => scanImages("characters/survivors"),
        "killers"   => scanImages("characters/killers")
    ],
    "perks" => [
        "survivors" => scanPerks("perks/survivors"),
        "killers"   => scanPerks("perks/killers")
    ],
    "maps" => scanImages("maps")
]);

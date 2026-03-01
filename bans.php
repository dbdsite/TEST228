<?php
header("Content-Type: application/json; charset=utf-8");

$file = __DIR__ . "/bans.csv";
$result = [];

if (!file_exists($file)) {
    echo json_encode($result);
    exit;
}

$lines = file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
if (!$lines) {
    echo json_encode($result);
    exit;
}

/* первая строка — игроки */
$players = array_map("trim", explode(";", array_shift($lines)));

foreach ($players as $p) {
    if ($p !== "") $result[$p] = [];
}

/* остальные строки — персонажи */
foreach ($lines as $line) {
    $cells = explode(";", $line);
    foreach ($cells as $i => $val) {
        $val = trim($val);
        if ($val !== "" && isset($players[$i])) {
            $result[$players[$i]][] = $val;
        }
    }
}

echo json_encode($result, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

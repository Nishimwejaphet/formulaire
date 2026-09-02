<?php

header("Content-Type: application/json; charset=UTF-8");

$url = "https://raw.githubusercontent.com/Hipo/university-domains-list/master/world_universities_and_domains.json";

$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);

$response = curl_exec($ch);

if ($response === false) {

    echo json_encode([
        "success" => false,
        "error" => curl_error($ch),
        "code" => curl_errno($ch)
    ]);

    curl_close($ch);
    exit;
}

curl_close($ch);

$data = json_decode($response, true);

if (!is_array($data)) {

    echo json_encode([
        "success" => false,
        "error" => "Réponse JSON incorrecte."
    ]);

    exit;
}

echo json_encode([
    "success" => true,
    "nombre_universites" => count($data),
    "premiere_universite" => $data[0]
], JSON_UNESCAPED_UNICODE);
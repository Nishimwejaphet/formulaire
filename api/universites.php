<?php

header("Content-Type: application/json; charset=UTF-8");

if (!isset($_GET["country"]) || empty($_GET["country"])) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Le pays est obligatoire."
    ]);

    exit;
}

$pays = $_GET["country"];

$url = "https://raw.githubusercontent.com/Hipo/university-domains-list/master/world_universities_and_domains.json";

$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);

$response = curl_exec($ch);

if ($response === false) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Impossible de récupérer la liste des universités.",
        "curl_error" => curl_error($ch)
    ]);

    curl_close($ch);
    exit;
}

curl_close($ch);

$universites = json_decode($response, true);

if (!is_array($universites)) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Réponse JSON incorrecte."
    ]);

    exit;
}

/*
 * Garder uniquement les universités
 * du pays demandé.
 */

$resultats = [];

foreach ($universites as $universite) {

    if (
        isset($universite["country"]) &&
        strcasecmp(
            $universite["country"],
            $pays
        ) === 0
    ) {

        $resultats[] = $universite;
    }
}

echo json_encode([
    "success" => true,
    "country" => $pays,
    "data" => $resultats,
    "total" => count($resultats)
], JSON_UNESCAPED_UNICODE);
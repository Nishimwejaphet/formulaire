<?php

header("Content-Type: application/json; charset=UTF-8");

$url = "https://api.restcountries.com/countries/v5?limit=100";

$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 20);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer rc_live_a9f9c5bfb8b849528e5c00d5b3fefe7a"
]);

$response = curl_exec($ch);

if ($response === false) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Impossible de contacter l'API des pays."
    ]);

    curl_close($ch);
    exit;
}

$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

curl_close($ch);

if ($httpCode < 200 || $httpCode >= 300) {

    http_response_code($httpCode);

    echo json_encode([
        "success" => false,
        "message" => "L'API des pays a retourné une erreur.",
        "status" => $httpCode,
        "data" => $response
    ]);

    exit;
}

echo $response;
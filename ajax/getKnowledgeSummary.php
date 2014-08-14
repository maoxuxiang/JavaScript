<?php

$root = "../";

$src = $_GET['src'];
$dis = $_GET['dis'];

if (empty($src)) return;
if (empty($dis)) return;

$file = strtoupper($dis) . "_" . strtoupper($src) . ".xml";

if ($file == "") return;

$filePath = $root . "resources/" . $file;
if (!file_exists($filePath)) return;
echo file_get_contents($filePath);
?>

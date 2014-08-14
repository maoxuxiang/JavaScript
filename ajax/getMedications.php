<?php

$root = "../resources/";

$dis = $_GET['dis'];

$file = $root;
switch (strtolower($dis)) {
	case "ra":
		$file .= "RA_navigation.xml";
		break;
	case "dm":
		$file .= "DM_navigation.xml";
		break;
	case "chf-metformin":
		$file .= "CHF_metformin_navigation.xml";
		break;
	case "depression":
		$file .= "DEPRESSION_navigation.xml";
		break;
	case "afib":
		$file .= "AFIB_navigation.xml";
		break;
	case "vur":
		$file .= "VUR_navigation.xml";
		break;
	default:
		$file .= "not_available";
}
if (!file_exists($file)) {
	echo "";
} else echo file_get_contents($file);

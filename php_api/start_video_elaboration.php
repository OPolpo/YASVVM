<?php

header("Access-Control-Allow-Origin: *");
require_once 'utils.php';
$id = $_POST["id"];
//$id = 8;
$dir = $frames_base_dir.$id.'/';
exec("php ./do_job.php ".$dir." &");

?>
<?php
header("Access-Control-Allow-Origin: *");
ini_set("display_errors",1);
    //error_reporting(-1);
require_once 'utils.php';
$job = $_POST["data"];

$dir = $frames_base_dir.$job['id'].'/';

if(validate_id($job['id'])){
    if (!is_dir($dir)){
        mkdir($dir);
    }
    file_put_contents($dir.$job_file_name, json_encode($job));
    json_ok("Dati Aquisiti");
}
else{
    json_error("Qualche errore");
}

function validate_id($id){
    global $id_file;
    if(file_exists($id_file)){
        if(in_array($id,split("\n", substr(file_get_contents($id_file), 0, -1)))){
            return true;
        }
        else{
            return false;
        }
    }
    else{
        return false;
    }
}
?>
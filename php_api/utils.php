<?php

$apikey = "AIzaSyCpG0qR__DoPmoI0rer8IQuIRa0wwdDDdM";
$job_file_name = 'job.jb';
$frames_base_dir = 'frames/';
$yasvvm = './yasvvm';
$id_file = '.id';

function json_error($message){
    $result_array = array();
    $result_array["status"] = "false";
    $result_array["error"] = $message;
    echo json_encode($result_array);
    exit();
}

function json_ok($json_data = NULL){
    $result_array = array();
    $result_array["status"] = "true";
    if($json_data !== NULL){
        $result_array["data"] = $json_data;
    }
    echo json_encode($result_array);
}

function startsWith($haystack, $needle){
    return $needle === "" || strpos($haystack, $needle) === 0;
}

function endsWith($haystack, $needle){
    return $needle === "" || substr($haystack, -strlen($needle)) === $needle;
}


?>
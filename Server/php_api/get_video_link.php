<?php
    require_once 'utils.php';
    $id = $_POST["id"];

    $testfile = $output_dir.$id.$output_file_extension;
    $file = $abs_output_dir.$id.$output_file_extension;

    if(file_exists($testfile)){
        $link = $resource_url.$file;
        json_ok($link);
    }
    else
        json_error("Link doesn't exists");
?>
<?php
    require_once 'utils.php';
    $id = $_POST["id"];

    $file = $output_dir.$id.$output_file_extension;

    if(file_exists($file)){
        $link = $resource_url.$file;
        json_ok($link);
    }
    else
        json_ok("Link doesn't exists");
?>
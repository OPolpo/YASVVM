<?php
    require_once 'utils.php';
    $id = $_POST["id"];
    //$id = 8;
    if(check_id($id)){
        $dir = $frames_base_dir.$id.'/';
        exec("php ./do_job.php ".$dir." &");
    }
    else{
        echo json_error("id doesn't exists");
    }
?>
<?php
    require_once 'utils.php';
    $last_id_used = 0;
    if(file_exists($id_file)){
        $id = split("\n", substr(file_get_contents($id_file), 0, -1));
        if($id[0] != ""){
            json_ok(array("id" => $id));
        }
        else{
            echo json_ok(array("id" => ""));
        }
    }
    else{
        echo json_error("error retriving ids");
    }
?>

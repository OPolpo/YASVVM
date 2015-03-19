<?php
    require_once 'utils.php';
    $last_id_used = 0;
    if($id_array = get_all_id()){
        if($id_array[0] != ""){
            json_ok(array("id" => $id_array));
        }
        else{
            echo json_ok(array("id" => ""));
        }
    }
    else{
        echo json_error("error retriving ids");
    }
?>

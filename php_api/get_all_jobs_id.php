<?php
    //ini_set("display_errors",1);
    require_once 'utils.php';
    $last_id_used = 0;
    if(file_exists($id_file)){
    	echo json_encode(split("\n", substr(file_get_contents($id_file), 0, -1)));
    }
    else{
    	echo json_encode(false);
    }
?>
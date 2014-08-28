<?php
    //ini_set("display_errors",1);
    require_once 'utils.php';
    $last_id_used = 0;
    $id = 0;
    if(file_exists($id_file)){
    	$last_id_used = exec("tail -n 1 ".$id_file);
    	$id = 1 + $last_id_used;
    	file_put_contents($id_file, $id."\n", FILE_APPEND);
    }
    else{
    	file_put_contents($id_file, "0\n");
    }
    echo json_encode($id);
?>
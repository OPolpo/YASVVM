<?php
    require_once 'utils.php';
    $id = $_POST["id"];
    if(check_id($id)){
        @$file_check = unlink($output_dir.$id.$output_file_extension);
        @$frame_check = rrmdir($frames_base_dir.$id);
        remove_id($id);
    }
    else{
        echo json_error("id doesn't exists");
    }
    echo json_ok($id);
?>

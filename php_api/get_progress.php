<?php
    require_once 'utils.php';
    //header("Access-Control-Allow-Origin: *");
    $id = $_POST["id"];
    $i = 0; 
    $dir = $frames_base_dir.$id.'/';
    
    //we don't care about the existence of the id but the existence of the directory is mandatory otherwise will have an error
    if(!is_dir($dir)){
        json_ok(array("unused" => "true"));
        exit();
    }
    
    $job = json_decode(file_get_contents($dir.$job_file_name), true);
    $total = count($job['points']);
    
    if ($handle = opendir($dir)) {
        while (($file = readdir($handle)) !== false){
            if (endsWith($file, '.jpg') && !is_dir($dir.$file)) 
                $i++;
        }
    }
    
    $complete = file_exists($dir.'out.avi') ? "true" : "false";
    echo json_ok(array("executed" => $i,"total" => $total, "isComplete" => $complete));
?>

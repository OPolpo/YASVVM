<?php
    header("Access-Control-Allow-Origin: *");
    ini_set("display_errors",1);
    
    $url = "http://maps.googleapis.com/maps/api/streetview?size=640x640";
    $apikey = "AIzaSyCpG0qR__DoPmoI0rer8IQuIRa0wwdDDdM";
    $job_file_name = 'job.jb';
    $frames_base_dir = '../frames/';
    $yasvvm = '../yasvvm';
    $id_file = '../.id';
    $output_dir = '../video_out/';
    $abs_output_dir = 'YASVVM/video_out/';
    $output_file_extension = '.avi';
    $resource_url = "http://localhost:8888/";

    
    function check_id($id){
        global $id_file;
        if(file_exists($id_file)){
            $ids = file_get_contents($id_file); 
            $ids = explode("\n", $ids); 
            for ($line = 0; $line < count($ids); $line++) { 
                if($ids[$line] === $id){ 
                    return true;
                }
            }
        }
        else{
            return false;
        }
    }
    
    function get_all_id(){
        global $id_file;
        if(file_exists($id_file)){
            return split("\n", substr(file_get_contents($id_file), 0, -1));
        }
        else{
            return false;
        }
    }

    function remove_id($id){
        global $id_file;
        if(file_exists($id_file)){
            $ids = file_get_contents($id_file); 
            $ids = explode("\n", $ids);
            $new = array();
            $removed = false;
            for ($line = 0; $line < count($ids); $line++) { 
                if($ids[$line] !== $id){ 
                    $new[$line] = $ids[$line];
                }
                else{
                    $removed = true;
                }
            }
            if($removed){
                file_put_contents($id_file, implode ("\n", $new));
                return true;
            }
            return false;
        }
        return true;
    }
    
    function rrmdir($dir) {
        foreach(glob($dir . '/*') as $file) {
            if(is_dir($file))
                rrmdir($file);
            else
                unlink($file);
        }
        rmdir($dir);
    }
    
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

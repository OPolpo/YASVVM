<?php
    require_once 'utils.php';
    $id_array = get_all_id();
    $out_link = array();
    foreach ($id_array as $id){
    	$file = $output_dir.$id.$output_file_extension;
    	if(file_exists($file)){
    		array_push($out_link, $resource_url.$file);
    	}
    }
    json_ok($out_link);
?>
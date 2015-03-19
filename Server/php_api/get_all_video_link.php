<?php
    require_once 'utils.php';
    $id_array = get_all_id();
    $out_link = array();
    foreach ($id_array as $id){
    	$testfile = $output_dir.$id.$output_file_extension;
        $file = $abs_output_dir.$id.$output_file_extension;
    	if(file_exists($testfile)){
    		array_push($out_link, $resource_url.$file);
    	}
    }
    json_ok($out_link);
?>
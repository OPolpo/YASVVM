<?php

require_once 'utils.php';
$id = $_POST["id"];
$i = 0; 
$dir = $frame_base_dir.$id.'/';
$job = json_decode(file_get_contents($dir.$job_file_name), true);
$total = count($job['points']);

if ($handle = opendir($dir)) {
    while (($file = readdir($handle)) !== false){
        if (endsWith($file, '.jpg') && !is_dir($dir.$file)) 
            $i++;
    }
}
$complete = file_exists($dir.'out.avi');
echo json_encode([$i, $total, $complete]);

?>

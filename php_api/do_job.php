<?php
    require_once 'utils.php';
    $input = '';
    $i=0;
    $dir = $_SERVER["argv"][1];
    $job = json_decode(file_get_contents($dir.$job_file_name), true);
    $points = $job['points'];
    foreach ($points as $point){
        $input = $url.'&location='.$point['l'].','.$point['b'].'&heading='.($point['h']).'&pitch=0&key='.$apikey;
        $content = file_get_contents($input);
        file_put_contents($dir.str_pad($i, 8, '0', STR_PAD_LEFT).'-'.$point['l'].'-'.$point['b'].'.jpg', $content);
        $input='';
        $i+=1;
    }
    if(!is_dir($output_dir)){
        mkdir($output_dir);
    }
    exec($yasvvm." ".$dir." ".$output_dir.$job['id'].$output_file_extension);
?>
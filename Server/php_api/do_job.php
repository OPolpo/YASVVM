<?php
    require_once 'utils.php';
    $dir = $_SERVER["argv"][1];

    function detect_turn($point){
        if($point['t'] === 'r')
            return 'r';
        if ($point['t'] === 'l')
            return 'l';
        return 0;
    }

    $i=0;
    $job = json_decode(file_get_contents($dir.$job_file_name), true);
    $points = $job['points'];
    $input = '';
    foreach ($points as $point){
        $input = $url.'&location='.$point['l'].','.$point['b'].'&heading='.($point['h']).'&pitch=0&key='.$apikey;
        $content = file_get_contents($input);
        $filename = $dir.str_pad($i, 8, '0', STR_PAD_LEFT).'-'.$point['l'].'-'.$point['b'];
        $turn = detect_turn($point);
        if($turn === 'r'){
            $filename .= "[RIGHT]";
        }
        else if($turn === 'l'){
            $filename .= "[LEFT]";
        }
        $filename .= '.jpg';
        file_put_contents($filename, $content);
        $input = '';
        $i += 1;
    }
    if(!is_dir($output_dir)){
        mkdir($output_dir);
    }
    exec($yasvvm." ".$dir." ".$output_dir.$job['id'].$output_file_extension." "."24");
?>

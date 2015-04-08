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

    function intermediate_fov($point, $i){
        global $dir, $apikey, $url;
        $base = $url.'&location='.$point['l'].','.$point['b'].'&heading='.($point['h']).'&pitch=0&key='.$apikey.'&fov=';
        $filenamebase = $dir.str_pad($i, 8, '0', STR_PAD_LEFT).'-'.$point['l'].'-'.$point['b'];
       
        $_110 = $base.'110';
        $_110_fn = $filenamebase.'-1_110.jpg';

        // $_100 = $base.'116';
        // $_100_fn = $filenamebase.'-2_116.jpg';  
        
        // $_90 = $base.'114';
        // $_90_fn = $filenamebase.'-3_114.jpg';

        // $_80 = $base.'112';
        // $_80_fn = $filenamebase.'-4_112.jpg';

        // $_70 = $base.'110';
        // $_70_fn = $filenamebase.'-5_110.jpg';

        // $_60 = $base.'60';
        // $_60_fn = $filenamebase.'-6_60.jpg';

        // $_50 = $base.'50';
        // $_50_fn = $filenamebase.'-7_50.jpg';


        $content = file_get_contents($_110);
        file_put_contents($_110_fn, $content);

        // $content = file_get_contents($_100);
        // file_put_contents($_100_fn, $content);

        // $content = file_get_contents($_90);
        // file_put_contents($_90_fn, $content);

        // $content = file_get_contents($_80);
        // file_put_contents($_80_fn, $content);

        // $content = file_get_contents($_70);
        // file_put_contents($_70_fn, $content);

        // $content = file_get_contents($_60);
        // file_put_contents($_60_fn, $content);

        // $content = file_get_contents($_50);
        // file_put_contents($_50_fn, $content);
    }

    $i=0;
    $job = json_decode(file_get_contents($dir.$job_file_name), true);
    $points = $job['points'];
    $input = '';
    foreach ($points as $point){
        $input = $url.'&location='.$point['l'].','.$point['b'].'&heading='.($point['h']).'&pitch=0&key='.$apikey.'&fov=120';
        $content = file_get_contents($input);
        $filename = $dir.str_pad($i, 8, '0', STR_PAD_LEFT).'-'.$point['l'].'-'.$point['b'].'-0_120';
        $turn = detect_turn($point);
        if($turn === 'r'){
            $filename .= "[RIGHT]";
        }
        else if($turn === 'l'){
            $filename .= "[LEFT]";
        }
        $filename .= '.jpg';
        file_put_contents($filename, $content);
        if($turn !== 'r' && $turn !== 'l'){
            intermediate_fov($point, $i);
        }
        $input = '';
        $i += 1;
    }
    if(!is_dir($output_dir)){
        mkdir($output_dir);
    }
    exec($yasvvm." ".$dir." ".$output_dir.$job['id'].$output_file_extension." "."100 m");
?>

<?php
$json = $_POST["q"];
$apikey = "AIzaSyCpG0qR__DoPmoI0rer8IQuIRa0wwdDDdM";
$url = "http://maps.googleapis.com/maps/api/streetview?size=640x640";
$input = '';
$i=0;
foreach ( $json[punti] as $punto ){

	//SIX IMAGES
    // $input =$url.'&location='.$punto[l].','.$punto[b].'&heading='.$punto[h].'&pitch=-45';
    // file_put_contents($i.'-1l'.'-'.$punto[l].'-'.$punto[b].'.jpg', file_get_contents($input));
    // $input =$url.'&location='.$punto[l].','.$punto[b].'&heading='.$punto[h].'&pitch=45';
    // file_put_contents($i.'-1h'.'-'.$punto[l].'-'.$punto[b].'.jpg', file_get_contents($input));
    // $input =$url.'&location='.$punto[l].','.$punto[b].'&heading='.($punto[h] - 90).'&pitch=-45';
    // file_put_contents($i.'-2l'.'-'.$punto[l].'-'.$punto[b].'.jpg', file_get_contents($input));
    // $input =$url.'&location='.$punto[l].','.$punto[b].'&heading='.($punto[h] - 90).'&pitch=45';
    // file_put_contents($i.'-2h'.'-'.$punto[l].'-'.$punto[b].'.jpg', file_get_contents($input));
    // $input =$url.'&location='.$punto[l].','.$punto[b].'&heading='.($punto[h] + 90).'&pitch=-45';
    // file_put_contents($i.'-3l'.'-'.$punto[l].'-'.$punto[b].'.jpg', file_get_contents($input));
    // $input =$url.'&location='.$punto[l].','.$punto[b].'&heading='.($punto[h] + 90).'&pitch=45';
    // file_put_contents($i.'-3h'.'-'.$punto[l].'-'.$punto[b].'.jpg', file_get_contents($input));

	//TWO IMAGES
    // $input =$url.'&location='.$punto[l].','.$punto[b].'&heading='.($punto[h]-45).'&pitch=0&key='.$apikey;
    // file_put_contents($i.'-1'.'-'.$punto[l].'-'.$punto[b].'.jpg', file_get_contents($input));
    // $input =$url.'&location='.$punto[l].','.$punto[b].'&heading='.($punto[h]+45).'&pitch=0&key='.$apikey;
    // file_put_contents($i.'-2'.'-'.$punto[l].'-'.$punto[b].'.jpg', file_get_contents($input));

     $input =$url.'&location='.$punto[l].','.$punto[b].'&heading='.($punto[h]).'&pitch=0&key='.$apikey;
    file_put_contents($i.'-'.$punto[l].'-'.$punto[b].'.jpg', file_get_contents($input));

    $input='';
    $i+=1;
}
echo json_encode("something");
?>
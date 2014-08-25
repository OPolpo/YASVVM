<?php
$json = $_POST["q"];

$url = "http://maps.googleapis.com/maps/api/streetview?size=640x640";
$input = '';
$i=0;
foreach ( $json[punti] as $punto ){
    $input =$url.'&location='.$punto[l].','.$punto[b].'&heading=0';
    file_put_contents($i.'-1'.'.jpg', file_get_contents($input));
    $input =$url.'&location='.$punto[l].','.$punto[b].'&heading=90';
    file_put_contents($i.'-2'.'.jpg', file_get_contents($input));
    $input =$url.'&location='.$punto[l].','.$punto[b].'&heading=-90';
    file_put_contents($i.'-3'.'.jpg', file_get_contents($input));
    $input='';
    $i+=1;
}
echo json_encode("something");
?>
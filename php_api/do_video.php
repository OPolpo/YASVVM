<?php
    //ini_set("display_errors",1);
    require_once 'utils.php';
    $xml = '<?xml version="1.0"?><methodCall> <methodName>xmlrpc.do_video</methodName><params><param><value><string>”frames/”</string></value></param></params></methodCall>';
    $answer = send($xml);

    //var_dump($answer);
?>
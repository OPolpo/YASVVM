<?php
    ini_set("display_errors",1);
    function send( $data )
    {
        var_dump($data);
        $result = "";
        $contentlength = strlen($data);
        $ch = curl_init("localhost:8080/RPC2");
        curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
 
        $result = curl_exec($ch);
        curl_close($ch);

        return($result);
    }

        $xml = '<?xml version="1.0"'."?>\n<methodCall>\n<methodName>sample.add</methodName>\n<params>\n<param>\n<value><i4>5</i4></value>\n</param>\n<param>\n<value><i4>7</i4></value>\n</param>\n</params>\n</methodCall>";

    $answer = send($xml);

    var_dump($answer);

?>
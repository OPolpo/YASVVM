<?php
    ini_set("display_errors",1);
    function send( $data )
    {
        //var_dump($data);
        $result = "";
        $contentlength = strlen($data);
        $ch = curl_init("localhost:8080/RPC2");
        curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
 
        $result = curl_exec($ch);
        curl_close($ch);

        return($result);
    }
?>
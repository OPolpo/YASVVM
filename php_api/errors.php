<?php

require_once 'utils.php';

class Errors
{
    static public $ERROR_00 = "Error 00: user not logged";
    static public $ERROR_01 = "Error 01: user insufficient privileges";
    static public $ERROR_02 = "Error 02: wrong username or password";
    static public $ERROR_10 = "Error 10: impossible to update document";
    static public $ERROR_11 = "Error 11: document already exist";
    static public $ERROR_12 = "Error 12: document not exist";
    static public $ERROR_13 = "Error 13: cannot insert category, category already exist?";
    static public $ERROR_14 = "Error 14: cannot update category, category not exist?";
    static public $ERROR_15 = "Error 14: cannot remove category, category not exist or non empty?";
    static public $ERROR_20 = "Error 20: file not exist";
    static public $ERROR_21 = "Error 21: file not owned by user or user is not admin";
    static public $ERROR_22 = "Error 22: file not exist, already erased?";
    static public $ERROR_23 = "Error 23: file error on server";
    static public $ERROR_30 = "Error 30: error erasing tags";
    static public $ERROR_40 = "Error 40: error erasing categories";
    static public $ERROR_41 = "Error 41: at least one category needed";
    static public $ERROR_50 = "Error 50: temp key wrong, expired or already used";
    static public $ERROR_80 = "Error 80: database error ";
    static public $ERROR_81 = "Error 81: query error ";
    static public $ERROR_90 = "Error 90: missing variabile";
}

?>
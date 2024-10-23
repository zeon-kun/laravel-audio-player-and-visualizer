<?php

namespace App\Helpers;

class Result
{
    public $success;
    public $data;
    public $error;

    private function __construct($success, $data = null, $error = null)
    {
        $this->success = $success;
        $this->data = $data;
        $this->error = $error;
    }

    public static function success($data)
    {
        return new self(true, $data);
    }

    public static function fail($error)
    {
        return new self(false, null, $error);
    }
}

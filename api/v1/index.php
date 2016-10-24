<?php
require '.././libs/Slim/Slim.php';
require_once 'dbHelper.php';

\Slim\Slim::registerAutoloader();
$app = new \Slim\Slim(array('debug' => true));
$app = \Slim\Slim::getInstance();
$db = new dbHelper();

/**
 * Database Helper Function templates
 */
/*
select(table name, where clause as associative array)
insert(table name, data as associative array, mandatory column names as array)
update(table name, column names as associative array, where clause as associative array, required columns as array)
delete(table name, where clause as array)
*/


// Devices
$app->get('/devices', function() { 
    global $db;
    $rows = $db->select("devices","brand,model,os,caseid,refid,status",array());
    echoResponse(200, $rows);
});

$app->get('/checkdevices/:id', function($id) { 
    
    global $db;
    // Check if the device exists
    $rows = $db->select("devices","refid",array('refid'=>$id));
    if($rows["status"]=="warning"){
        echoResponse(200, $rows);
        return;
    }

    //modify device
    $data = array('status'=>'Available', 'badgeid'=>'');
    $condition = array('refid'=>$id);
    $mandatory = array();
    $rows = $db->update("devices", $data, $condition, $mandatory);
    if($rows["status"]=="success")
        $rows["message"] = "Device information updated successfully.";
    if($rows["status"]=="warning")
        $rows["message"] = "The device is already Available";
    echoResponse(200, $rows);
});

$app->get('/adddevices/:id', function($id) { 
    $data = array('refid'=>$id, 'status'=>'Available');
    $mandatory = array();
    global $db;
    $rows = $db->insert("devices", $data, $mandatory);
    if($rows["status"]=="success")
        $rows["message"] = "Device added successfully.";
    echoResponse(200, $rows);
});

$app->post('/devices', function() use ($app) { 
    $data = json_decode($app->request->getBody());
    $mandatory = array();
    global $db;
    $rows = $db->insert("devices", $data, $mandatory);
    if($rows["status"]=="success")
        $rows["message"] = "Device added successfully.";
    echoResponse(200, $rows);
});

$app->put('/devices/:id', function($id) use ($app) { 
    $data = json_decode($app->request->getBody());
    $condition = array('refid'=>$id);
    $mandatory = array();
    global $db;
    $rows = $db->update("devices", $data, $condition, $mandatory);
    if($rows["status"]=="success")
        $rows["message"] = "Device information updated successfully.";
    echoResponse(200, $rows);
});

$app->delete('/devices/:id', function($id) { 
    global $db;
    $rows = $db->delete("devices", array('refid'=>$id));
    if($rows["status"]=="success")
        $rows["message"] = "Device removed successfully.";
    echoResponse(200, $rows);
});


// Users
$app->get('/users', function() { 
    global $db;
    $rows = $db->select("users","name,badgeid, lastlogged",array());
    echoResponse(200, $rows);
});

$app->get('/userexist/:id', function($id) { 
    global $db;
    $rows = $db->exists("users", array('badgeid'=>$id));
    echoResponse(200, $rows);
});

$app->get('/adduser/:badgeid', function($badgeid) { 
    $data = array('badgeid'=>$badgeid, 'lastlogged'=> date('d/m/Y h:i:s a', time()));
    $mandatory = array();
    global $db;
    $rows = $db->insert("users", $data, $mandatory);
    if($rows["status"]=="success")
        $rows["message"] = "User added successfully.";
    echoResponse(200, $rows);
});

$app->post('/users', function() use ($app) { 
    $data = json_decode($app->request->getBody());
    $mandatory = array();
    global $db;
    $rows = $db->insert("users", $data, $mandatory);
    if($rows["status"]=="success")
        $rows["message"] = "User added successfully.";
    echoResponse(200, $rows);
});

$app->put('/users/:id', function($id) use ($app) { 
    $data = json_decode($app->request->getBody());
    $condition = array('badgeid'=>$id);
    $mandatory = array();
    global $db;
    $rows = $db->update("users", $data, $condition, $mandatory);
    if($rows["status"]=="success")
        $rows["message"] = "User information updated successfully.";
    echoResponse(200, $rows);
});

$app->put('/userseasy/:id/:ide', function($id, $ide) use ($app) { 
    $data = array('badgeid'=>$ide);
    $condition = array('badgeid'=>$id);
    $mandatory = array();
    global $db;
    $rows = $db->update("users", $data, $condition, $mandatory);
    if($rows["status"]=="success")
        $rows["message"] = "User information updated successfully.";
    echoResponse(200, $rows);
});

$app->delete('/users/:id', function($id) { 
    global $db;
    $rows = $db->delete("users", array('badgeid'=>$id));
    if($rows["status"]=="success")
        $rows["message"] = "User removed successfully.";
    echoResponse(200, $rows);
});


// UserDevice
$app->get('/userdevice', function() { 
    global $db;
    $rows = $db->selectJoin("devices", "users", "brand,model,os,caseid,refid,status,name","users.badgeid = devices.badgeid ");
    echoResponse(200, $rows);
});

$app->get('/userdevice/:rid/:bid', function($rid, $bid) { 
    global $db;

    //$rows = $db->select("users","name",array('badgeid'=>$bid));

    //if($rows["status"]=="error"){
     //   echoResponse(200, array('status'=>'error', 'message'=>'unexpected'));
      //  return;
    //}
    // if the user does not exist, we create it
    // if($rows["message"]=="No data found."){
    //     $data = array('badgeid'=>$bid, 'lastlogged'=> date('d/m/Y h:i:s a', time()));
    //     $mandatory = array();
    //     $rows = $db->insert("users", $data, $mandatory);

    //     if($rows["status"]=="error"){
    //         echoResponse(200, array('status'=>'error', 'message'=>'unexpected'));
    //         return;
    //     }
    //     $newUser = 1;
    // }

    // Check if the device exists
    $rows = $db->select("devices","refid",array('refid'=>$rid));
    if($rows["message"]=="No data found."){
        $rows["message"] = "The refid does not exist.";
        echoResponse(200, $rows);
        return;
    }

    // Add the user to the device
    $data = array('badgeid'=>$bid, 'status'=>'Unavailable');
    $condition = array('refid'=>$rid);
    $mandatory = array();
    $rows = $db->update("devices", $data, $condition, $mandatory);
    if($rows["status"]=="success")
        $rows["message"] = "Device information updated successfully.";

    echoResponse(200, $rows);
    
});

$app->get('/checkFirstScan/:id', function($id) { 
    
    global $db;
    // Check if the device exists
    $rows = $db->select("devices","refid",array('refid'=>$id));

    if($rows["message"]=="Data selected from database"){
        // modify device and set unavailable
        $data = array('status'=>'Available', 'badgeid'=>'');
        $condition = array('refid'=>$id);
        $mandatory = array();
        $rows = $db->update("devices", $data, $condition, $mandatory);
        if($rows["status"]=="success")
            $rows["message"] = "Device information updated successfully.";
        if($rows["status"]=="warning")
            $rows["message"] = "The device is already Available.";
        echoResponse(200, $rows);
        return;
    }

    if($rows["message"]=="No data found."){
        // The id is not a device id, thus it is considered as a user
        $rows = $db->select("users","name",array('badgeid'=>$id));

        if($rows["message"]=="Data selected from database")
            $rows["message"] = "The user already exists.";
        if($rows["message"]=="No data found.")
            $rows["message"] = "The user does not exist.";
        echoResponse(200, $rows);
        return;
    }

    
});

function echoResponse($status_code, $response) {
    global $app;
    $app->status($status_code);
    $app->contentType('application/json');
    echo json_encode($response,JSON_NUMERIC_CHECK);
}

$app->run();
?>
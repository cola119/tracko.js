<?php
try {
	$pdo = new PDO('mysql:host=localhost;dbname=tracko;charset=utf8','root','root');
} catch(PDOException $e) {
	exit('error'.$e->getMessage());
}

mb_language("uni");
mb_internal_encoding("utf-8"); //内部文字コードを変更
mb_http_input("auto");
mb_http_output("utf-8");

$stmt = $pdo->prepare("SELECT * FROM test");
$stmt->execute();

$userData = array();

while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $userData[] = array(
    	'date' => $row['date'],
    	'longitude' => $row['longitude'],
    	'latitude' => $row['latitude'],
    );
}

//jsonとして出力
header('Content-type: application/json; charset=UTF-8');
$json = json_encode($userData);
echo($json);
?>
<?php
if (isset($_POST['streamers'])) {
    file_put_contents('data.txt', $_POST['streamers']);
    echo 'OK';
}
?>
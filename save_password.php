<?php
if (isset($_POST['password'])) {
    file_put_contents('password.txt', $_POST['password']);
    echo 'OK';
}
?>
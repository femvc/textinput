asyque
======

A simple asynchronous framework. There is an example.

```
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>asyque - A simple asynchronous framework</title>
<script type="text/javascript" src="asyque.js"></script>
<script type="text/javascript">
<!--
function doit() {
    var que1 = new bui.asyque();
    que1.push(a);
    que1.push(d); 
    window.setTimeout(function(){
        que1.next();
    },400);
}

function a(callback) {
    alert('a');
    
    //异步嵌套示例
    var que2 = new bui.asyque();
    que2.push(b);
    que2.push(c);
    
    que2.push(callback); 

    window.setTimeout(function(){
        que2.next();
    },400);
}
function b(callback) {
    alert('b');
    callback&&callback();
}
function c(callback) {
    alert('c');
    callback&&callback();
}
function d(callback) {
    alert('d');
    callback&&callback();
}

//-->
</script>
</head>

<body><button type="button" onclick="doit()">doit</button>

</body>

</html>

TextInput
======

A common input control. There is an example.

```
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>TextInput - A common input control</title>
<script type="text/javascript" src="bui.js"></script>
<script type="text/javascript" src="control.js"></script>
<script type="text/javascript" src="textinput.js"></script>
<script type="text/javascript">
<!--
var haiyang = {controlMap:{}};
function doit() {
    
    bui.Control.init(document.getElementById('aa'),{},haiyang);
}

//-->
</script>
</head>

<body><button type="button" onclick="doit()">doit</button>
<div id="aa">
<input type="text" ui="type:TextInput;id:gg" />
</div>
</body>

</html>


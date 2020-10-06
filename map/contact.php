<?php	
	session_start();
	$mysqli = new mysqli('localhost', 'okunslpw_mapuser', 'Pb)$-c@c?Wp$ZvZLR+', 'okunslpw_map');
	if ($mysqli->connect_errno) {
    printf("Connect failed: %s\n", $mysqli->connect_error);
    exit();
	}

	if (isset($_POST["comment"])) {
		$comment = mysqli_real_escape_string($mysqli, $_POST["comment"]);
		$ip = $_SERVER['REMOTE_ADDR'];
		$result = $mysqli->query("SELECT FROM comments WHERE ip = $ip ORDER BY time DESC");
		$row = mysqli_fetch_assoc($result);
		
		$mysqli->query("INSERT INTO comments (comment, ip) VALUES('$comment', '$ip')");
	}
	
?>
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
    
    <style>
	    .card-columns {
  @include media-breakpoint-only(lg) {
    column-count: 4;
  }
  @include media-breakpoint-only(xl) {
    column-count: 5;
  }
}
    </style>
    <title>Hello!</title>
  </head>
  <body>
	  <div class = "container">
		  <h1>Leave a comment!</h1>
			<p>		  
				<form method="post">
			  <div class = "form-group">
				  <textarea class = "form-control" name = "comment"></textarea>
					 </div>
				  <input type = "submit" class = "btn btn-primary"></input>
			  </form>
			</p>		  
		  <div class="card-columns">

		  
		  <?php
			  $result = $mysqli->query("SELECT * FROM comments");
			  while ($row = mysqli_fetch_assoc($result)) {
				  $comment = $row["comment"];
				  $time = $row["time"];
				  echo "<div class='card'><div class='card-body'>";
				  echo "<p class='card-text'>$comment</p>";
				  echo "</div><div class='card-footer'>$time</div>";
				  echo "</div>";
			  }
			?>
		  </div>
		</div>
    

    <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js" integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q" crossorigin="anonymous"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js" integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl" crossorigin="anonymous"></script>
  </body>
</html>
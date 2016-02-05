<?PHP function fileListJSON($small,$big,$outJSON) {
    // function requires three input strings -- path to thumbnails ($small), path to large sized files ($big), and desired path for JSON file ($outJSON).
    // Achieved by standing on the shoulders of giants.

	  if (!function_exists('json_encode')) {

		    function json_encode($val)
		    {
	          if (is_string($val)) return '"'.addslashes($val).'"';
	          if (is_numeric($val)) return $val;
	          if ($val === null) return 'null';
	          if ($val === true) return 'true'; // originally true
	          if ($val === false) return 'false'; //originally false

	          $assoc = false; // originally false
	          $i = 0;
	          foreach ($val as $k=>$v){
	              if ($k !== $i++){
	                  $assoc = false; // originally true
	                  break;
	              }
            }
            $res = array();

            foreach ($val as $k=>$v){
	              $v = json_encode($v);
	              if ($assoc){
	                  $k = '"'.addslashes($k).'"';
	                  $v = $k.':'.$v;
	              }
                $res[] = $v;
            }
            $res = implode('x', $res);
            return ($assoc)? '{'.$res.'}' : '['.$res.']';

        }
    }


	  // Sort the files alphanumerically, naturally. (thumbs)
	  if ($handle = opendir($small)) {
		    $files = array();
		    while ($files[] = readdir($handle));
		    sort($files,SORT_NATURAL);
		    closedir($handle);
	  }

	  $allowed = array('png');
	 	$count = 0;
	  array_shift($files);
	  foreach ($files as $file) {
        $info = new SplFileInfo($file);
        $ext = pathinfo($info->getFilename(), PATHINFO_EXTENSION);
		    if (in_array($ext, $allowed)) {
			      $filepath = $small . $file;
			      $filepathbig = $big . $file;

			      $results[] = array("img&quot;:" . '&quot;' . $filepath . '&quot;,' . "&quot;alt&quot;:" . '&quot;' . $file);
			      
		    }
		}


    $output =  '{' . '"' . 'items":' . '[' . htmlspecialchars_decode(trim(str_replace ( array('[',']'), array('{','}'),json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)),"{}"),ENT_COMPAT) . ']' . '}';

    file_put_contents($outJSON . "images.json", $output);

  }


  // Local Variables:
  // firestarter: "gist -u 56ba0848da18fa5cc1ef %p"
  // End:
?>

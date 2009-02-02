module LessonsHelper

  ENCODINGS = {
  	'ß' => '&szlig',
  	'à' => '&agrave',
  	'á' => '&aacute',
  	'â' => '&acirc',
  	'ã' => '&atilde',
  	'ä' => '&auml',
  	'å' => '&aring',
  	'æ' => '&aelig',
  	'ç' => '&ccedil',
  	'è' => '&egrave',
  	'é' => '&eacute',
  	'ê' => '&ecirc',
  	'ë' => '&euml',
  	'ì' => '&igrave',
  	'í' => '&iacute',
  	'î' => '&icirc',
  	'ï' => '&iuml',
  	'ð' => '&eth',
  	'ñ' => '&ntilde',
  	'ò' => '&ograve',
  	'ó' => '&oacute',
  	'ô' => '&ocirc',
  	'õ' => '&otilde',
  	'ö' => '&ouml',
  	'÷' => '&divide',
  	'ø' => '&oslash',
  	'ù' => '&ugrave',
  	'ú' => '&uacute',
  	'û' => '&ucirc',
  	'ü' => '&uuml',
  	'ý' => '&yacute',
  	'þ' => '&thorn'
  }

  def escape(char)
    return ENCODINGS[char]
  end
  
  def palette(str)
    pal = ''
    0.upto(str.length) do |i|
      ch = str.slice(i,1)
      pal += "#{ch}, "
#      pal += "#{ch}, "
    end
    return str.length, ' : ', str
  end
  
end

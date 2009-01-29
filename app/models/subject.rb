class Subject < ActiveRecord::Base

  has_many :topics, :order => :position
  has_many :exercises, :through => :topics
  has_many :courses
  has_many :authorships
  has_many :users, :through => :authorships
  
  # little hack to get areas in memory. See Advanced Rails Recipes, p.206
  AREAS_FOR_FORM = Area.find(:all).map do |a|
    [a.name, a.id]
  end

  #and another hack that is probably completely unnecessary. Never mind.
  AREAS = {}
  Area.find(:all).each do |a|
    AREAS[a.id] = a.name
  end

  def exercise_count
    count = 0
    for topic in topics
      count += topic.exercises.count
    end
    return count
  end
  
  def days_since_last_update
    if exercises.last
      return ((Time.now.to_i - exercises.last.updated_at.to_i) / (60 * 60 * 24))
    else
      return 0
    end
  end

  def extended_chars
    pattern = /À|Á|Â|Ã|Ä|Å|à|á|â|ã|ä|åÒ|Ó|Ô|Õ|Ö|Ø|ò|ó|ô|õ|ö|øÈ|É|Ê|Ë|è|é|ê|ë|Ç|ç|Ì|Í|Î|Ï|ì|í|î|ï|Ù|Ú|Û|Ü|ù|ú|û|ü|ÿ|Ñ|ñ/;
    matches = { }
    for exercise in exercises
      if pattern =~ exercise.response
        first = $&
        matches[first] = first
      end
    end
    str = ''
    matches.each_key do |key|
      str += key
    end
    return str
  end

end

class Subject < ActiveRecord::Base

  has_many :topics, :order => :position
  has_many :courses
  has_many :authorships
  has_many :users, :through => :authorships
  
  def exercise_count
    count = 0
    for topic in topics
      count += topic.exercises.count
    end
    return count
  end

end

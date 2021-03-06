class Subject < ActiveRecord::Base

  belongs_to :areas
  has_many :topics, :order => :position
  has_many :exercises, :through => :topics
  has_many :courses
  has_many :authorships
  has_many :users, :through => :authorships
  has_many :amendments

  named_scope :active, :conditions => {:archived => false}, :order => 'public DESC, area_id'
  named_scope :inactive, :conditions => {:archived => true}
  named_scope :public, :conditions => { :public => true }
  named_scope :private, :conditions => { :public => false }
  
  before_create :set_status
  
  validates_presence_of :name
  validates_presence_of :area_id
  
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
      count += topic.exercises.size
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

  
  # there may be a more sensible way of doing this
  # perhaps SELECT response FROM exercise WHERE response LIKE...
  # or SELECT response FROM exercise. then collapse response into a single string.
  def search_extended_chars
    pattern = /[^!-~\s]/
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
  
  def last_update
    last_exercise = exercises.find(:last)
    if last_exercise
      return last_exercise.updated_at
    else
      return self.updated_at
    end
  end
  
private

  def set_status
    self.archived = false
    return true
  end

end

class Topic < ActiveRecord::Base
  
  belongs_to :subject
  has_many :exercises, :dependent => :destroy

  named_scope :recent, :conditions => [ 'created_at > ?', 3.hours.ago ]
  named_scope :current, :conditions => { :removed => false }

  # slightly hacked to get 'updated_at' working in course.add_new_material
  named_scope :updated_since, lambda { |time|
   { :conditions => [ 'topics.updated_at > ? or topics.created_at > ?', time, time ] } 
  }

  acts_as_list :scope => :subject
  
  after_update :save_exercises

  validates_presence_of :name
  validates_presence_of :subject_id
  validates_associated :exercises

  # temp
  def show_data
    true
  end
  
  def show_code
    true
  end
  
  def remove_exercises
    for exercise in exercises
      exercise.update_attribute( :removed, true )
    end
  end
  
  # for an explanation of what's going on here, see 
  # Advanced Rails Recipes #14: "Handling Multiple Models In One Form"
  def new_exercise_attributes=(exercise_attributes)
    exercise_attributes.each do |attributes|
      unless attributes['phrase'].empty?
        exercises.build(attributes)
      end
    end
  end

  def existing_exercise_attributes=(exercise_attributes)
    exercises.reject(&:new_record?).each do |exercise|
      attributes = exercise_attributes[exercise.id.to_s]
      if attributes
        if attributes['phrase'].empty?
          exercises.delete(exercise)
        else
          exercise.attributes = attributes
        end
      end
    end
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

  def save_exercises
    exercises.each do |exercise|
      exercise.save(false)
    end
  end
  
end

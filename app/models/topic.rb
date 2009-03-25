class Topic < ActiveRecord::Base
  
  belongs_to :subject
  has_many :exercises, :dependent => :destroy

  named_scope :recent, :conditions => [ 'created_at > ?', 3.hours.ago ]

  acts_as_list :scope => :subject
  
  after_update :save_exercises

  validates_presence_of :name

  # temp
  def show_data
    true
  end
  def show_code
    true
  end

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
      if attributes['phrase'].empty?
        exercises.delete(exercise)
      else
        exercise.attributes = attributes
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

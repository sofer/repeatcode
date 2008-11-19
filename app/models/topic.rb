class Topic < ActiveRecord::Base
  belongs_to :subject
  acts_as_list :scope => :subject
  has_many :exercises, :dependent => :destroy
  
  after_update :save_exercises

  validates_presence_of :name

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

private

  def save_exercises
    exercises.each do |exercise|
      exercise.save(false)
    end
  end


end

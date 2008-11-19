class Lesson < ActiveRecord::Base

  belongs_to :course
  
  before_create :set_progress

  # set default value of 0
  def correct_responses
    self[:correct_responses] or 0
  end

  def elapsed_time
    ((Time.now - self.created_at) / 60).to_i
  end

  def increment_correct
    self.correct_responses += 1
    save!
  end

  def next_question(exclude_question=0)
    self.course.questions.find( :first,
                                :conditions => ['next_datetime <= ? and id != ?', Time.now, exclude_question], 
                                :order => 'current_interval'
                              ) or new_question
  end

  def new_question    
    if self.course.questions.empty?
      
      # get first question
      if course.subject.topics.first
        return new_topic(course.subject.topics.first)
      end
    else
    
      # get the last question added to the course
      last_question = course.questions.find(:first, :order => 'id DESC')    
    
      # get the next exercise within the current topic
      next_exercise = last_question.exercise.lower_item
        
      if next_exercise
        return add_question(next_exercise)
      else
        next_topic = last_question.exercise.topic.lower_item
        if next_topic
          return new_topic(next_topic)
        end
      end

    end
  end
  
private

  def add_question(exercise)
    new_question = course.questions.new( :exercise_id => exercise.id)
    if new_question.save
      update_attribute(:total_questions_started, course.questions.count)
      return new_question
    end
  end

  def new_topic(topic)
    next_exercise = topic.exercises.first
    if next_exercise
      next_question = add_question(next_exercise)
      if topic.add_together
        next_exercise = next_exercise.lower_item
        while next_exercise
          add_question(next_exercise)
          next_exercise = next_exercise.lower_item
        end
      end
      return next_question
    end
  end

  def set_progress
    self.total_questions_started = course.questions.count
  end
  
end

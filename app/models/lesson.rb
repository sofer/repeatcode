class Lesson < ActiveRecord::Base

  belongs_to :course
  
  named_scope :recent, lambda { |days|
    days_ago = Time.now - days * 24 * 60 * 60
   { :conditions => [ 'created_at > ?', days_ago ] } 
  }
  
  before_create :set_progress

  def days_ago(days)
    day = 60 * 60 * 24
    now = Time.now
    return now - days * day
  end

  # set default value of 0
  def correct_responses
    self[:correct_responses] or 0
  end

  def elapsed_time
    ((Time.now - self.created_at) / 60).to_i
  end

  def increment_correct
    # change to update_attribute?
    self.correct_responses += 1
    save!
  end
  
  def backlog
    self.course.questions.count( :conditions => ['next_datetime <= ?', Time.now])
  end
  
  def days_until_next
    time = Time.now
    day_count = 0
    maxcount = self.course.questions.count
    if maxcount > 20 then maxcount = 20 end
    while self.course.questions.count( :conditions => ['next_datetime <= ?', time]) < maxcount and day_count < 30
      day_count += 1
      time += 60 * 60 * 24
    end
    return day_count
  end

  def next_question(exclude_question=0)
    self.course.questions.find( :first,
                                :conditions => ['next_datetime <= ? and id != ?', Time.now, exclude_question], 
                                :order => 'current_interval'
                              ) or new_question
  end

private

  def new_question

    if self.course.questions.empty?
            
      # get first question
      if course.subject.topics.first
        return new_topic(course.subject.topics.first)
      end

    else
    
      # get the next exercise within the current topic
      next_exercise = course.last_question.exercise.lower_item
      if next_exercise
        return add_question(next_exercise)
      else

        # get the next topic
        next_topic = course.last_question.exercise.topic.lower_item
        if next_topic
          return new_topic(next_topic)
        end
      end

    end
  end
  
  def add_question(exercise)
    #new_question = course.questions.new(:exercise_id => exercise.id)
    new_question = Question.new(:exercise_id => exercise.id, :course_id => course.id )
    if new_question.save
      course.update_attribute :last_question, new_question.id
      update_attribute :total_questions_started, course.questions.count
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

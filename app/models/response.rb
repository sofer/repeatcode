class Response < ActiveRecord::Base
  
  belongs_to :question
  
  before_create :reset_question
  
  RESULTS = {
    :correct => 'correct',
    :incorrect => 'incorrect'
  }

private

  def reset_question
    if self.result == RESULTS[:correct]
      question.course.current_lesson.increment_correct
      question.reset_interval_and_datetime(self.interval)
    else
      question.reset_interval_and_datetime(0)
    end
    question.save!
  end
end

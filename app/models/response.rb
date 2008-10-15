class Response < ActiveRecord::Base
  
  belongs_to :question
  
  before_create :reset_question
  
  RESULTS = {
    'correct' => 'correct',
    'incorrect' => 'incorrect',
  }

private

  def check
    self.question.course.current_lesson.increment_correct
  end

  def reset_question
    if self.result = RESULTS['correct']
      self.question.course.current_lesson.increment_correct
    end
    question.reset_interval_and_datetime(self.interval)
    question.save!
  end
end

class Interval < ActiveRecord::Base
  belongs_to :course

  def last_reset_date
    self.updated_at
  end

  # f = actual failure rate (= 100 * (incorrect)/(correct+incorrect)
  # t = target failure rate (= 100 - course.target)
  # t1 = current period
  # t2 = new period
  # t2 = t1 * (1 + (t-f)/(2*f) where f > t
  # t2 = t1 * (1 + (t-f)/(2*t) where f < t
  def reset(correct, incorrect)
    return false if self.index_no < 2
    
    correct = correct.to_i
    incorrect = incorrect.to_i
    f = 100 * (incorrect) / (correct + incorrect)
    t = 100 - course.target.target # a rather strange bug. should be course.target
    
    case
    when f > t
      self.minutes = self.minutes * (100 + 100 * (t-f)/(2*f)) / 100
      return true
    when f < t
      self.minutes = self.minutes * (100 + 100 * (t-f)/(2*t)) / 100
      return true
    else
      return false
    end
  end
  
end

class Course < ActiveRecord::Base
  belongs_to :subject
  has_many :lessons
  has_many :subscriptions
  has_many :users, :through => :subscriptions
  has_many :intervals
  has_many :questions

  after_create :set_intervals
  
  validates_numericality_of :target
  validates_inclusion_of :target, :in => 0..100, :message => "must between 0 and 100"

  DEFAULT_TARGET = 90

  MAX_INDEX = 8

  DAY = 60 * 24
  
  DEFAULT_INTERVALS = {
    0 => 0,
    1 => 1,
    2 => 5,
    3 => DAY / 2,
    4 => DAY * 6,
    5 => DAY * 15,
    6 => DAY * 35,
    7 => DAY * 85,
    8 => DAY * 224
  }
  
  def target
    self[:target] or DEFAULT_TARGET
  end

  def current_lesson
    self.lessons.last
  end
  
  def responses
    results = {}
    for interval in self.intervals
      results[interval.index_no] = { 'correct' => 0, 'incorrect' => 0, 'last_reset' => interval.last_reset_date }
    end
    for question in self.questions
      for response in question.responses.find(:all)
        if response.updated_at > results[response.interval]['last_reset']
          if response.result == Response::RESULTS['correct']
            results[response.interval]['correct'] += 1
          elsif response.result == Response::RESULTS['incorrect']
            results[response.interval]['incorrect'] += 1
          end
        end
      end
    end
    return results
  end

private

  def set_intervals
    self.target = DEFAULT_TARGET
    DEFAULT_INTERVALS.each do |index, mins|
      new_interval = intervals.new( :index_no => index, :minutes => mins)
      new_interval.save
    end
  end

end

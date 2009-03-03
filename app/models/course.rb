class Course < ActiveRecord::Base
  belongs_to :subject
  has_many :lessons
  has_many :subscriptions
  has_many :users, :through => :subscriptions
  has_many :intervals
  has_many :questions
  
  named_scope :active, :conditions => {:archived => false}
  named_scope :archived, :conditions => {:archived => true}

  before_create :set_status
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
  
  def responses_in_last_days(days)
    recent_lessons = lessons.last_days(days)
    return response_count(recent_lessons)
  end
  
  def response_count(recent_lessons)
    count = 0
    for lesson in recent_lessons
      count += lesson.correct_responses
    end
    return count
  end
  
  def last_question
    @last_question ||= self[:last_question] ? Question.find(self[:last_question]) : false
  end
  
  def clear_all
    questions = Question.find(:all)
    count = 0
    for question in questions
      if not question.exercise or not question.exercise.topic
        if question.exercise
          question.exercise.destroy
        end
        question.destroy
        count += 1
      end
    end
    return count
  end
  
  def add_new_material
    question_count = 0
    if last_question
      if subject.exercises.last.created_at > last_question.created_at
        for topic in subject.topics
          for exercise in topic.exercises
            return question_count if exercise.id == last_question.exercise.id
            if not questions.find(:first, :conditions => ['exercise_id = ?', exercise.id])
              question_count += 1
              new_question = questions.new( :exercise_id => exercise.id )
              new_question.first_interval
              new_question.save!
            end
          end
        end
      end
    end
    return 0
  end
  
  def target
    self[:target] or DEFAULT_TARGET
  end

  def current_lesson
    self.lessons.last
  end
  
  def responses
    results = {}
    for interval in self.intervals
      results[interval.index_no] = { :correct => 0, :incorrect => 0, :last_reset => interval.last_reset_date }
    end
    for question in self.questions
      for response in question.responses.find(:all)
        if response.updated_at > results[response.interval][:last_reset]
          if response.result == Response::RESULTS[:correct]
            results[response.interval][:correct] += 1
          elsif response.result == Response::RESULTS[:incorrect]
            results[response.interval][:incorrect] += 1
          end
        end
      end
    end
    return results
  end

  def set_intervals
    self.target = DEFAULT_TARGET
    DEFAULT_INTERVALS.each do |index, mins|
      new_interval = intervals.new( :index_no => index, :minutes => mins)
      new_interval.save
    end
  end
  
  def set_status
    self.archived = false
    return true
  end

end

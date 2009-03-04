class Course < ActiveRecord::Base
  belongs_to :subject
  has_many :lessons
  has_many :subscriptions
  has_many :users, :through => :subscriptions
  has_many :intervals
  has_many :questions
  
  named_scope :active, :conditions => {:archived => false }
  named_scope :archived, :conditions => {:archived => true }

  before_validation_on_create :set_status_and_targets
  after_create :set_intervals
  
  validates_numericality_of :accuracy_target
  validates_numericality_of :lesson_target
  validates_numericality_of :weekly_target
  validates_inclusion_of :accuracy_target, :in => 0..100, :message => "must between 0 and 100"

  DEFAULT_TARGETS = { 
    'ACCURACY'  => 90, # accuracy rate of responses
    'LESSON' => 50, # number of correct responses per lesson
    'WEEKLY'    => 5   # number of lessons per week
  }

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
  
  def backlog_count
    questions.count(:conditions => ['next_datetime < ?', Time.now])
  end
  
  def all_time_responses
    so_far = response_count(lessons)
    total = self.subject.exercises.count * DEFAULT_INTERVALS.size * 100 / self.accuracy_target 
    return so_far if total == 0
    percent = 100 * so_far / total
    return "#{so_far} (#{percent}%)"
  end
  
  def responses_in_last_days(days)
    recent_lessons = lessons.last_days(days)
    count = response_count(recent_lessons)
    return 0 if count == 0
    if days == 1
      percent = 100 * count / self.lesson_target
    else
      daily_target = self.lesson_target * self.weekly_target / 7
      percent = 100 * count / (daily_target * days)
    end
    return "#{count} (#{percent}%)"
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
  
  # remove these
  def accuracy_target
    self[:accuracy_target] or DEFAULT_TARGETS['ACCURACY']
  end
  def lesson_target
    self[:lesson_target] or DEFAULT_TARGETS['LESSON']
  end
  def weekly_target
    self[:weekly_target] or DEFAULT_TARGETS['WEEKLY']
  end # END REMOVE

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
    #self.accuracy_target = DEFAULT_TARGETS['ACCURACY']
    DEFAULT_INTERVALS.each do |index, mins|
      new_interval = intervals.new( :index_no => index, :minutes => mins)
      new_interval.save
    end
  end
  
  def set_status_and_targets
    self.archived = false
    self.accuracy_target = DEFAULT_TARGETS['ACCURACY']
    self.lesson_target = DEFAULT_TARGETS['LESSON']
    self.weekly_target = DEFAULT_TARGETS['WEEKLY']
  end

end

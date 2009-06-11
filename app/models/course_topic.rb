class CourseTopic < ActiveRecord::Base

  belongs_to :course
  belongs_to :topic
  has_many :questions

  named_scope :current, :conditions => { :removed => false }

  validates_presence_of :name
  validates_presence_of :course_id
  validates_presence_of :topic_id

  def update_from_topic(topic_id)
    topic = Topic.find(topic_id)
    begin
      self.update_attributes!({ :topic_id => topic.id,
                                :name => topic.name,
                                :code => topic.code,
                                :data => topic.data,
                                :ignore_punctuation => topic.ignore_punctuation,
                                :add_together => topic.add_together,
                                :rtl => topic.rtl })
    rescue RecordInvalid => error
        logger.error invalid.record.errors
    end
  end
  
  def send_to_top
    for question in questions.current.reverse
      question.initial_state
    end
  end

end

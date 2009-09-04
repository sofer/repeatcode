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
																:unordered => topic.unordered,
																:case_sensitive => topic.case_sensitive,
                                :ignore_punctuation => topic.ignore_punctuation,
                                :add_together => topic.add_together,
                                :removed => topic.removed,
                                :rtl => topic.rtl })
    rescue
        logger.error invalid.record.errors
    end
  end
  
  def send_to_top
    for question in questions.current.reverse
      question.initial_state
    end
  end

  def remove_questions
	  self.update_attribute(:removed, true)
    for question in questions
			question.update_attributes!({:ignore =>true, :next_datetime => NIL })
    end
  end
  


end

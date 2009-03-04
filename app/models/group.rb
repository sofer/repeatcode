class Group < ActiveRecord::Base
  belongs_to :organization
  has_many :tuitions
  has_many :tutors, :through => :tuitions, :source => :user
  has_many :enrolments
  has_many :students, :through => :enrolments, :source => :user
  
  def student_id=(student_id)
    student = User.find(student_id)
    if students.include? student
      students.delete student
    else
      students << student
    end
  end

  def tutor_id=(tutor_id)
    tutor = User.find(tutor_id)
    if tutors.include? tutor
      tutors.delete tutor
    else
      tutors << tutor
    end
  end
  
end

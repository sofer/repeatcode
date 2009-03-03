class Group < ActiveRecord::Base
  belongs_to :organization
  has_many :tuitions
  has_many :tutors, :through => :tuitions, :source => :user
  has_many :enrolments
  has_many :students, :through => :enrolments, :source => :user
  
  def user_id=(user_id)
    student = User.find(user_id)
    if students.include? student
      students.delete student
    else
      students << student
    end
  end
  
end

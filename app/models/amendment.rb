class Amendment < ActiveRecord::Base
  belongs_to :exercise
  belongs_to :subject

end

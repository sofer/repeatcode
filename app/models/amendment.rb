class Amendment < ActiveRecord::Base
	belongs_to :question
	belongs_to :subject

end

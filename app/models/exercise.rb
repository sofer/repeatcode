class Exercise < ActiveRecord::Base
  
  belongs_to :topic
  has_many :questions, :dependent => :destroy
  has_one :subject, :through => :topic
  acts_as_list :scope => :topic
  
  named_scope :current, :conditions => { :removed => false }
  named_scope :recently_updated, :order => 'updated_at DESC'

  # A HACK TO GET THE SQL WORKING in course.add_new_material
  named_scope :since, lambda { |time|
   { :conditions => [ 'exercises.created_at > ?', time ] } 
  }
  
  validates_presence_of :topic_id
  
  # if a topic has code associated with it then build the code up one exercise at a time
  def code(response=false)
    output = self.topic.code
    unless output == ""
      next_exercise = topic.exercises.first
      while next_exercise != self
        snippet = next_exercise.simplified(next_exercise.response)
        output = insert_code(snippet, next_exercise.insert, output)
        next_exercise = next_exercise.lower_item
      end
      if response
        output = insert_code(response,self.insert,output)
      end
    end
    return output
  end

  def insert_code(snippet,insert_type,block)
    location, range = insert_type.split(' ')
    case range
    
    # XML/HTML
    when /<(\w+)>/
      block.sub!(/<\/#{$1}>/, "#{snippet}\n</#{$1}>")
    
    # CSS
    when /\.(\w+)/
      block.sub!(/#{range}\s*\{\s*/, "#{range} \{ #{snippet} ")
    
    end
    return block
  end
  
  def simplified(phrase=self.phrase)
    if phrase =~ /(.*)\s*\(([^)]*)\)\s*\|\s*\(([^)]*)\)\s*(.*)/
      top = $1==''? '':$1+' '
      tail = $4==''? '':' '+$4
      expr1 = top + $2 + tail
      expr2 = top + $3 + tail
      choose = rand(2)
      if choose == 0
        return expr1
      else
        return expr2
      end
    else
      return phrase
    end
  end
  
  def expected_response
    if self.response =~ /(.*)\s*\(([^)]*)\)\s*\|\s*\(([^)]*)\)\s*(.*)/
      top = $1==''? '':$1+' '
      tail = $4==''? '':' '+$4
      expr1 = top + $2 + tail
      expr2 = top + $3 + tail
      return "\"#{expr1}\" or \"#{expr2}\""
    else
      return self.response
    end
  end
  

end

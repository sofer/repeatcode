class Responses < ActiveRecord::Migration
  def self.up
    say_with_time "Updating subject responses..." do
      exercises = Exercise.find(:all)
      exercises.each do |ex|
        if ex.response =~ /\([^)]*\)\s*\|\s*\([^)]*\)/
          resp = ex.response.sub(/\(([^)]*)\)\s*\|\s*\(([^)]*)\)/, '(\1|\2)')
          puts "#{ex.id} #{ex.response} CHANGED TO #{resp}"
          ex.update_attribute :response, resp
        end
      end
    end

    say_with_time "Updating course responses..." do
      questions = Question.find(:all)
      questions.each do |q|
        if q.response
          if q.response =~ /\([^)]*\)\s*\|\s*\([^)]*\)/
            resp = q.response.sub(/\(([^)]*)\)\s*\|\s*\(([^)]*)\)/, '(\1|\2)')
            puts "#{q.id} #{q.response} CHANGED TO #{resp}"
            q.update_attribute :response, resp
          end

        end
      end
    end

    puts "Done."
    
  end

  def self.down
  end
end

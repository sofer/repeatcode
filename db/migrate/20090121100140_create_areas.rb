class CreateAreas < ActiveRecord::Migration
  def self.up
        
    add_column :courses, :last_question, :integer
    add_column :courses, :archived, :boolean
    add_column :subjects, :archived, :boolean
    add_column :subjects, :area, :integer

    create_table :areas do |t|
      t.string :name

      t.timestamps
    end
    Area.create :name => "Programming"
    Area.create :name => "Languages"
    Area.create :name => "Knowledge"
    Area.create :name => "Mathematics"
    Area.create :name => "Exams"

    say_with_time "adding last questions..." do
      Course.reset_column_information
      Course.find(:all).each do |c|
        last_question = c.questions.find(:last)
        if last_question
          say "adding last question: #{last_question.id} to course #{c.id}"
          c.update_attribute :last_question, last_question.id
        else
          say "last_question.id: course #{c.id} has no questions"
        end
      end
    end
    
  end

  def self.down
    drop_table :areas
    remove_column :courses, :last_question
    remove_column :courses, :archived
    remove_column :subjects, :archived
    remove_column :subjects, :area
  end
end

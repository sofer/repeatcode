class CreateCourseTopics < ActiveRecord::Migration
  def self.up

    create_table :course_topics do |t|
      t.integer :course_id
      t.integer :topic_id
      t.string :name
      t.text :code
      t.text :data
      t.boolean :ignore_punctuation
      t.boolean :add_together
      t.boolean :rtl

      t.timestamps
    end
    
    add_column :courses, :name, :string
    add_column :courses, :extended_chars, :string
    add_column :courses, :phrase_speech, :boolean
    add_column :courses, :response_speech, :boolean

    add_column :questions, :course_topic_id, :integer
    add_column :questions, :phrase, :string
    add_column :questions, :response, :string
    add_column :questions, :pattern, :string
    add_column :questions, :notes, :text
    add_column :questions, :hint, :string
    add_column :questions, :insert, :string
    add_column :questions, :ignore, :boolean, :default => false

    say_with_time "Updating courses..." do
      courses = Course.find(:all)
      say "Updating #{courses.count} courses"
      courses.each do |course|
        unless course.user and course.subject
          say "No user or subject for course #{course.id}"
          next
        end
        say "Populating new columns for #{course.id}: #{course.subject.name} (#{course.user.id}: #{course.user.login})..."
        course.name = course.subject.name
        course.extended_chars = course.subject.extended_chars
        course.phrase_speech = course.subject.phrase_speech
        course.response_speech = course.subject.response_speech
        course.save!

        say "Creating new course_topics for #{course.subject.name}..."
        course_topic_count = 0
        edit_question_count = 0
        new_question_count = 0
        course.subject.topics.each do |topic|
          course_topic = CourseTopic.new
          course_topic.course_id = course.id
          course_topic.topic_id = topic.id
          course_topic.name = topic.name
          course_topic.code = topic.code
          course_topic.data = topic.data
          course_topic.ignore_punctuation = topic.ignore_punctuation
          course_topic.add_together = topic.add_together
          course_topic.rtl = topic.rtl
          course_topic.save!
          course_topic_count += 1
          
          topic.exercises.each do |exercise|
            question = course.questions.find(:first, :conditions => ['exercise_id=?', exercise.id])
            if question
              edit_question_count += 1
            else
              new_question_count += 1
              question = Question.new
              question.course_id = course.id
              question.exercise_id = exercise.id
            end
            question.course_topic_id = course_topic.id
            question.phrase = exercise.phrase
            question.response = exercise.response
            question.pattern = exercise.pattern
            question.notes = exercise.notes
            question.hint = exercise.hint
            question.insert = exercise.insert
            question.ignore = false
            question.save!
          end
        end
        say "#{course_topic_count} topics added to #{course.name}. #{edit_question_count} questions edited, #{new_question_count} questions added."
      end
    end
    
  end

  def self.down
    drop_table :course_topics

    remove_column :courses, :name
    remove_column :courses, :extended_chars
    remove_column :courses, :phrase_speech
    remove_column :courses, :response_speech

    remove_column :questions, :course_topic
    remove_column :questions, :phrase
    remove_column :questions, :response
    remove_column :questions, :pattern
    remove_column :questions, :notes
    remove_column :questions, :hint
    remove_column :questions, :insert
    remove_column :questions, :ignore

  end
end

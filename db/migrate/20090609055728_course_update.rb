class CourseUpdate < ActiveRecord::Migration
  def self.up
    add_column :courses, :synched_at, :datetime
    
    say_with_time "Updating courses..." do
      courses = Course.active
      courses.each do |course|
        course.synched_at = course.created_at
        course.copy_subject_details if course.subject_id and course.name == nil
        begin
          course.save!
        rescue RecordInvalid => error
          puts "Course ID: #{course.id}:"
          puts invalid.record.errors
        end
      end
    end
    
  end

  def self.down
    remove_column :courses, :synched_at
  end
end

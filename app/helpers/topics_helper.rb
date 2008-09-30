module TopicsHelper

  def fields_for_exercise(exercise, &block)
    prefix = exercise.new_record? ? 'new' : 'existing'
    fields_for("topic[#{prefix}_exercise_attributes][]", exercise, &block)
  end

end

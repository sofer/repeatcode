class CourseTopicsController < ApplicationController

  before_filter :login_required

  # Used for for sending a topic to the top
  def update
    course_topic = CourseTopic.find(params[:id])
    course_topic.send_to_top

    respond_to do |format|
        format.html { redirect_to(:back) }
        format.xml  { head :ok }
    end
  end

end

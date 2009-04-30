class LessonsController < ApplicationController

  before_filter :authorize

  # GET /courses/1/lessons
  # GET /courses/1/lessons.xml
  def index
    @course = Course.find(params[:course_id])
    @lessons =  @course.lessons.paginate(
                  :per_page => 15, 
                  :page => params[:page], 
                  :order => "id DESC",
                  :conditions => "updated_at > created_at"
                )

    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @course }
    end
  end

  def show
    @lesson = Lesson.find(params[:id])
    
    respond_to do |format|
      format.html {

      }# show.html.erb
      format.xml  { render :xml => @question.exercise }
      format.json  { 
        if params[:ignore]
          question = @lesson.next_question(params[:ignore])
        else
          question = @lesson.next_question
        end
        if question
          if question.exercise.topic
            topic = question.exercise.topic
          else
            topic = "question removed from course"
          end
          render :json => { 'ignored' => params[:ignore], 'status' => 'ok', 'exercise' => question.exercise, 'question' => question, 'topic' => topic, 'correct' => @lesson.correct_responses, 'backlog' => @lesson.backlog }
        else
          render :json => { 'status' => 'end', 'days_until_next' => @lesson.days_until_next }
        end
      }
    end
  end

  # POST /courses/i/lessons
  # POST /courses/i/lessons.xml
  # if the most recent lesson has been updated in the last 10 minutes then reload it
  def create
    @course = Course.find(params[:course_id])
    @lesson = @course.lessons.last
    unless @lesson and Time.now.to_i - @lesson.updated_at.to_i < 600 # 10 minutes rule for creating new lessons
      @lesson = @course.lessons.new(params[:lesson]) 
    else
      flash[:notice] = "Returned to current lesson." 
    end
    new_material_count = @course.add_new_material
    if new_material_count > 0
      if new_material_count == 1
        flash[:notice] = "Course updated with one recently added exercise in a topic that you have already covered"
      else
        flash[:notice] = "Course updated with #{new_material_count} recently added exercises in topics that you have already covered"
      end
    end
    
    respond_to do |format|
      if @lesson.save
        format.html { redirect_to(@lesson) }
        format.xml  { render :xml => @lesson, :status => :created, :location => @lesson }
      else
        format.html { render :action => "new" }
        format.xml  { render :xml => @lesson.errors, :status => :unprocessable_entity }
      end
    end
  end

  # PUT /lessons/1
  # PUT /lessons/1.xml
  def update
    @lesson = Lesson.find(params[:id])

    respond_to do |format|
      if @lesson.update_attributes(params[:lesson])
        format.html { redirect_to(@lesson) }
        format.xml  { head :ok }
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml => @lesson.errors, :status => :unprocessable_entity }
      end
    end
  end

  # DELETE /lessons/1
  # DELETE /lessons/1.xml
  def destroy
    @lesson = Lesson.find(params[:id])
    @lesson.destroy

    respond_to do |format|
      format.html { redirect_to(lessons_url) }
      format.xml  { head :ok }
    end
  end
end

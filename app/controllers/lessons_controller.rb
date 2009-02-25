class LessonsController < ApplicationController

  before_filter :authorize

  # GET /lessons
  # GET /lessons.xml
  # use as a report
  def index
    @lessons = Lesson.all

    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @lessons }
    end
  end

  # GET /lessons/1
  # GET /lessons/1.xml
  
  # NOT SURE WHAT show2 IS FOR
  def show2
    @lesson = Lesson.find(params[:id])
    
    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @question.exercise }
      format.json  { 
        if params[:ignore]
          question = @lesson.next_question(params[:ignore])
        else
          question = @lesson.next_question
        end
        if question
          if question.exercise.topic
            topic = question.exercise.topic.name
          else
            topic = "question removed from course"
          end
          render :json => { 'ignored' => params[:ignore], 'status' => 'ok', 'exercise' => question.exercise, 'question' => question, 'topic' => topic }
        else
          render :json => { 'status' => 'end' }
        end
      }
    end
  end

  def show
    @lesson = Lesson.find(params[:id])
    
    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @question.exercise }
      format.json  { 
        if params[:ignore]
          question = @lesson.next_question(params[:ignore])
        else
          question = @lesson.next_question
        end
        if question
          if question.exercise.topic
            topic = question.exercise.topic.name
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

  # GET /lessons/new
  # GET /lessons/new.xml
  def new
    @lesson = Lesson.new

    respond_to do |format|
      format.html # new.html.erb
      format.xml  { render :xml => @lesson }
    end
  end

  # GET /lessons/1/edit
  def edit
    @lesson = Lesson.find(params[:id])
  end

  # POST /courses/i/lessons
  # POST /courses/i/lessons.xml
  # if the most recent lesson has been updated in the last 10 minutes then reload it
  def create
    @course = Course.find(params[:course_id])
    @lesson = @course.lessons.last
    @lesson = @course.lessons.new(params[:lesson]) unless @lesson and Time.now.to_i - @lesson.updated_at.to_i < 600
    flash[:notice] = "Returned to current lesson." 
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

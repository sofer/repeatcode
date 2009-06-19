class ExercisesController < ApplicationController

  before_filter :authorize

  # GET /exercises
  # GET /exercises.xml
  def index
    @subject = Subject.find(params[:subject_id])
    @courses = @subject.courses
    @amends = Question.amended.find(  :all, 
                                      :order => :exercise_id,
                                      :conditions => { :course_id => @courses })
    @ignored = Question.ignored.find( :all, 
                                      :order => :exercise_id,
                                      :conditions => { :course_id => @courses } )
    @user_edits = @ignored + @amends
    
    
        #+ Question.amended
    
    
    #@amends = Question.amended(:conditions => { :course_id => @courses })
    
    #+ Question.ignored
    
    
    #.questions.amended + @subject.courses.questions.removed

    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @exercises }
    end
  end

  # PUT /exercises/1
  # PUT /exercises/1.xml
  def update
    @exercise = Exercise.find(params[:id])

    respond_to do |format|
      if @exercise.update_attributes(params[:exercise])
        flash[:notice] = 'Exercise was successfully updated.'
        format.html { redirect_to(:back) }
        format.xml  { head :ok }
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml => @exercise.errors, :status => :unprocessable_entity }
      end
    end
  end

end

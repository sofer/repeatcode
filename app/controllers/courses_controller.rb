class CoursesController < ApplicationController

  before_filter :login_required, :except => :new

  # over-ride login_required in AuthenticatedSystem to allow new users to be created ad hoc
  def login_required
     if params[:create_user] # hidden field in posted form. Create the user.
       user = User.new
       user.last_login = request.remote_ip
       if user.save && user.errors.empty?
         self.current_user = user # !! now logged in
       else
         flash[:error]  = "I am sorry. the system could not create a new account for you."
         access_denied
       end
    elsif authorized?
      return true
    else
      access_denied
    end
  end

  # GET /courses
  # GET /courses.xml
  def index
    
    @courses = current_user.courses.active
    
    respond_to do |format|
			if current_user and current_user.login.blank?
				format.html { redirect_to '/account' }
			else
      	format.html # index.html.erb
      	format.xml  { render :xml => @courses }
			end
    end
  end

  # GET /courses/1
  # GET /courses/1.xml
  def show
    @course = Course.find(params[:id])

    respond_to do |format|
			format.html # show.html.erb
			format.xml  { render :xml => @course }
    end
  end

  # GET /courses/1/edit
  def edit
    @course = Course.find(params[:id])

    flash[:notice] = "#{@course.fix} questions will now be ignored."

    respond_to do |format|
      format.html # edit.html.erb
      format.xml  { render :xml => @course }
    end
  end

  # GET /courses/new
  # GET /courses/new.xml
  def new
    @course = Course.new()
    @areas = Area.find(:all)
  
    respond_to do |format|
      format.html # new.html.erb
      format.xml  { render :xml => @course }
    end
  end

  # POST /courses
  # POST /courses.xml
  def create
    @course = Course.new( { :subject_id => params[:subject_id] } )

    respond_to do |format|
      if @course.save
        current_user.courses << @course
        lesson = @course.lessons.new
        @course.lessons << lesson
        flash[:notice] = 'Start learning'
        format.html { redirect_to :controller => 'lessons', :action => 'show', :id => lesson.id }
        format.xml  { render :xml => @course, :status => :created, :location => @course }
      else
        flash[:error] = 'Problem encountered.'
        format.html { redirect_to(:back) }
        format.xml  { render :xml => @course.errors, :status => :unprocessable_entity }
      end
    end
  end

  # PUT /courses/1
  # PUT /courses/1.xml
  # Used for archiving and updating defaults and for updating questions
  def update
    @course = Course.find(params[:id])

    if params[:course][:update_required]
      flash[:notice] = @course.subject_update
      redirect_to(courses_path)
    elsif params[:course][:archived]
      @course.toggle!(:archived)
      flash[:notice] = "'#{@course.name}' was successfully archived."
      redirect_to(courses_path)
    else
    
      respond_to do |format|
        if @course.update_attributes(params[:course])
          flash[:notice] = 'Course was updated.' unless flash[:notice]
          format.html { redirect_to(:back) }
          format.xml  { head :ok }
          format.json { render :json => "Voices updated OK" }
        else
          flash[:error] = 'Course was NOT updated. '
          @course.errors.each_full { |message| flash[:error] += "#{message}. " }
          format.html { redirect_to(:back) }
          format.xml  { render :xml => @course.errors, :status => :unprocessable_entity }
          format.json { render :json => @course.errors }
        end
      end
      
    end
  end

  # DELETE /courses/1
  # DELETE /courses/1.xml
  def destroy
    @course = Course.find(params[:id])
    @course.destroy

    respond_to do |format|
      format.html { redirect_to(:back) }
      format.xml  { head :ok }
    end
  end
  
end
